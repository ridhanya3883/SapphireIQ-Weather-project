
import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [unit, setUnit] = useState('C')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function convertTemperature(celsius) {
    return unit === 'F'
      ? Math.round((celsius * 9) / 5 + 32)
      : Math.round(celsius)
  }

  async function handleSearch(e) {
    e.preventDefault()

    if (!city.trim()) {
      setError('Please enter a city name.')
      return
    }

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    if (!apiKey) {
      setError('API key not found. Please check your .env file.')
      return
    }

    setLoading(true)
    setError('')
    setWeather(null)
    setForecast([])

    try {
      const query = encodeURIComponent(city.trim())
      const currentUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`

      const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric`

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ])

      const currentData = await currentResponse.json()
      const forecastData = await forecastResponse.json()

      if (!currentResponse.ok) {
        throw new Error(
          currentData.message || 'Unable to get current weather.'
        )
      }

      if (!forecastResponse.ok) {
        throw new Error(
          forecastData.message || 'Unable to get the forecast.'
        )
      }

      setWeather(currentData)

      const dailyForecast = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      )

      setForecast(dailyForecast.slice(0, 5))
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Connection failed. Please check your internet.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <section className="weather-card">
        <header className="app-header">
          <div className="brand-mark">S</div>
          <div>
            <p className="brand">SapphireIQ</p>
            <p className="brand-subtitle">WEATHER INTELLIGENCE</p>
          </div>
        </header>

        <div className="page-heading">
          <p className="eyebrow">WEATHER DASHBOARD</p>
          <h1>Discover your weather</h1>
          <p className="subtitle">
            Real-time conditions and a five-day outlook.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Enter a city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="City name"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {weather && (
          <>
            <section className="current-weather">
              <div className="current-top">
                <div>
                  <p className="eyebrow">CURRENT WEATHER</p>
                  <h2>
                    {weather.name}, {weather.sys.country}
                  </h2>
                  <p className="weather-description">
                    {weather.weather[0].description}
                  </p>
                </div>

                <img
                  className="main-weather-icon"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                />
              </div>

              <div className="temperature-row">
                <h3 className="main-temperature">
                  {convertTemperature(weather.main.temp)}°
                  {unit}
                </h3>

                <div className="feels-block">
                  <span>FEELS LIKE</span>
                  <strong>
                    {convertTemperature(weather.main.feels_like)}°
                    {unit}
                  </strong>
                </div>
              </div>

              <div className="temperature-range">
                <div>
                  <span className="high-arrow">↑</span>
                  <span className="range-label">High</span>
                  <strong>
                    {convertTemperature(weather.main.temp_max)}°{unit}
                  </strong>
                </div>

                <div>
                  <span className="low-arrow">↓</span>
                  <span className="range-label">Low</span>
                  <strong>
                    {convertTemperature(weather.main.temp_min)}°{unit}
                  </strong>
                </div>

                <div className="unit-switch">
                  <button
                    type="button"
                    onClick={() => setUnit('C')}
                    disabled={unit === 'C'}
                    aria-label="Display Celsius"
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('F')}
                    disabled={unit === 'F'}
                    aria-label="Display Fahrenheit"
                  >
                    °F
                  </button>
                </div>
              </div>
            </section>

            <section className="details-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">WEATHER CONDITIONS</p>
                  <h2>Today's highlights</h2>
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <div className="detail-icon humidity-icon">💧</div>
                  <div className="detail-content">
                    <p>Humidity</p>
                    <h4>{weather.main.humidity}%</h4>
                    <span>Moisture in air</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon wind-icon">≋</div>
                  <div className="detail-content">
                    <p>Wind speed</p>
                    <h4>
                      {(weather.wind.speed * 3.6).toFixed(1)}
                      <small> km/h</small>
                    </h4>
                    <span>Current wind</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon pressure-icon">◉</div>
                  <div className="detail-content">
                    <p>Pressure</p>
                    <h4>
                      {weather.main.pressure}
                      <small> hPa</small>
                    </h4>
                    <span>Atmospheric pressure</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon visibility-icon">◎</div>
                  <div className="detail-content">
                    <p>Visibility</p>
                    <h4>
                      {weather.visibility != null
                        ? (weather.visibility / 1000).toFixed(1)
                        : 'N/A'}
                      {weather.visibility != null && (
                        <small> km</small>
                      )}
                    </h4>
                    <span>Viewing distance</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {forecast.length > 0 && (
          <section className="forecast-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PLAN AHEAD</p>
                <h2>5-day forecast</h2>
              </div>
              <span className="forecast-badge">5 DAYS</span>
            </div>

            <div className="forecast-grid">
              {forecast.map((day) => (
                <article className="forecast-item" key={day.dt}>
                  <p className="forecast-date">
                    {new Date(day.dt * 1000).toLocaleDateString(
                      'en-IN',
                      {
                        weekday: 'short',
                        day: 'numeric',
                      }
                    )}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />

                  <h3>
                    {convertTemperature(day.main.temp)}°{unit}
                  </h3>

                  <p className="forecast-description">
                    {day.weather[0].description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="footer">
          <span className="footer-dot" />
          SapphireIQ Weather Intelligence
          <span>Powered by OpenWeatherMap</span>
        </footer>
      </section>
    </main>
  )
}

export default App
