let unit = 'imperial'; // Default to Fahrenheit
const apiKey = '446679471bff039b0bef119482e0979a';

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const locationInput = document.getElementById('locationInput');
    const unitSwitch = document.getElementById('unitSwitch');
    const currentWeather = document.getElementById('currentWeather');
    const forecast = document.getElementById('forecast');

    let lastQuery = ''; // Store the last query to allow reloading when unit changes

    // Fetch current temperature only
    function fetchCurrentWeather(query, raw = false) {
        const url = raw
            ? `https://api.openweathermap.org/data/2.5/weather?${query}&units=${unit}&appid=${apiKey}`
            : `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unit}&appid=${apiKey}`;

        axios.get(url)
            .then(res => {
                const data = res.data;
                currentWeather.innerHTML = `
                    <h2>${data.name}</h2>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
                    <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}\u00B0${unit === 'metric' ? 'C' : 'F'}</p>
                `;
            })
            .catch(() => {
                currentWeather.innerHTML = '<p>City not found.</p>';
            });
    }

    // Fetch 5-day forecast with high/low temps and precipitation chance
    function fetchForecast(query) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?${query}&units=${unit}&appid=${apiKey}`;

        axios.get(url)
            .then(res => {
                const forecastData = res.data.list;
                const dailyTemps = {};

                forecastData.forEach(entry => {
                    const date = new Date(entry.dt_txt).toDateString();
                    if (!dailyTemps[date]) {
                        dailyTemps[date] = {
                            temps: [],
                            icons: [],
                            pops: []
                        };
                    }
                    dailyTemps[date].temps.push(entry.main.temp);
                    dailyTemps[date].icons.push(entry.weather[0].icon);
                    dailyTemps[date].pops.push(entry.pop || 0);
                });

                forecast.innerHTML = '';
                const dates = Object.keys(dailyTemps).slice(0, 5);

                dates.forEach(date => {
                    const dayData = dailyTemps[date];
                    const temps = dayData.temps;
                    const minTemp = Math.min(...temps);
                    const maxTemp = Math.max(...temps);
                    const avgPop = (dayData.pops.reduce((a, b) => a + b, 0) / dayData.pops.length) * 100;

                    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                    const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const icon = dayData.icons[Math.floor(dayData.icons.length / 2)];

                    forecast.innerHTML += `
                        <div class="forecast-day">
                            <p><strong>${weekday}, ${dateStr}</strong></p>
                            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
                            <p>High: ${Math.round(maxTemp)}\u00B0${unit === 'metric' ? 'C' : 'F'}</p>
                            <p>Low: ${Math.round(minTemp)}\u00B0${unit === 'metric' ? 'C' : 'F'}</p>
                            <p>Precipitation: ${Math.round(avgPop)}%</p>
                        </div>
                    `;
                });
            })
            .catch(() => {
                forecast.innerHTML = '<p>Error fetching forecast.</p>';
            });
    }

    // Detect ZIP or city and trigger API calls
    function searchWeather() {
        const location = locationInput.value.trim();
        if (!location) return alert('Please enter a city or zip code.');

        const isZip = /^\d{5}$/.test(location);
        const query = isZip
            ? `zip=${location},US`
            : `q=${location}`;

        lastQuery = query;
        fetchCurrentWeather(query, true);
        fetchForecast(query);
    }

    // Event Listeners
    searchBtn.addEventListener('click', searchWeather);

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });

    unitSwitch.addEventListener('change', () => {
        unit = unitSwitch.value;
        if (lastQuery) {
            fetchCurrentWeather(lastQuery, true);
            fetchForecast(lastQuery);
        }
    });

    // Set default to Fahrenheit visually
    unitSwitch.value = 'imperial';
});
