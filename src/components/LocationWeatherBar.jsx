import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudRain,
  Compass,
  Globe2,
  Home,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Volume2,
  X,
} from 'lucide-react'
import { fetchLiveWeather, geocodePlace, reverseGeocodeCity } from '../lib/weather'

export const popularCities = [
  { id: 'kolkata', name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', isDefaultHome: true },
  { id: 'bengaluru', name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'delhi', name: 'Delhi NCR', country: 'India', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { id: 'sanfrancisco', name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
]

export default function LocationWeatherBar({
  currentLocation,
  onLocationChange,
  hometown,
  onHometownChange,
  activeContext,
  onContextChange,
  onToast,
  modalOpen,
  onModalOpenChange,
}) {
  const [locating, setLocating] = useState(false)
  const [ambienceUnlocked, setAmbienceUnlocked] = useState(false)
  const [manualQuery, setManualQuery] = useState('')
  const [manualResult, setManualResult] = useState(null)
  const [manualError, setManualError] = useState('')
  const [manualSearching, setManualSearching] = useState(false)
  const [searchAttempts, setSearchAttempts] = useState([])
  const [currentWeather, setCurrentWeather] = useState(null)
  const [homeWeather, setHomeWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const activePlace = activeContext === 'back_home' ? hometown : currentLocation
  const activeWeather = activeContext === 'back_home' ? homeWeather : currentWeather

  // Fetch real automated live weather for current location
  useEffect(() => {
    if (currentLocation?.lat == null || currentLocation?.lng == null || !Number.isFinite(Number(currentLocation.lat)) || !Number.isFinite(Number(currentLocation.lng))) {
      setCurrentWeather(null)
      setWeatherLoading(false)
      return undefined
    }
    let isMounted = true
    const loadCurrentWeather = async () => {
      setWeatherLoading(true)
      const data = await fetchLiveWeather(currentLocation.lat, currentLocation.lng)
      if (isMounted) {
        setCurrentWeather(data)
        setWeatherLoading(false)
      }
    }
    loadCurrentWeather()
    return () => { isMounted = false }
  }, [currentLocation?.lat, currentLocation?.lng])

  // Fetch real live weather for hometown
  useEffect(() => {
    if (hometown?.lat == null || hometown?.lng == null || !Number.isFinite(Number(hometown.lat)) || !Number.isFinite(Number(hometown.lng))) return undefined
    let isMounted = true
    const loadHomeWeather = async () => {
      const data = await fetchLiveWeather(hometown.lat, hometown.lng)
      if (isMounted) setHomeWeather(data)
    }
    loadHomeWeather()
    return () => { isMounted = false }
  }, [hometown?.lat, hometown?.lng])

  useEffect(() => {
    const unlock = () => setAmbienceUnlocked(true)
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Ambient sound follows the live weather at the active location.
  useEffect(() => {
    let audioCtx
    let noiseNode
    let gainNode
    let filterNode

    if (ambienceUnlocked && activeWeather && activeWeather.condition !== 'unavailable' && !activePlace?.isPending) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        audioCtx = new AudioContext()
        const bufferSize = audioCtx.sampleRate * 2
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
        const output = buffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          output[i] = activeWeather.condition === 'rain'
            ? white * 0.32 + (b0 + b1 + b2) * 0.015
            : (b0 + b1 + b2) * 0.018
        }

        noiseNode = audioCtx.createBufferSource()
        noiseNode.buffer = buffer
        noiseNode.loop = true
        filterNode = audioCtx.createBiquadFilter()
        filterNode.type = activeWeather.condition === 'rain' ? 'highpass' : 'lowpass'
        filterNode.frequency.setValueAtTime(activeWeather.condition === 'rain' ? 520 : activeWeather.condition === 'cloudy' ? 440 : 820, audioCtx.currentTime)
        gainNode = audioCtx.createGain()
        const level = activeWeather.condition === 'rain' ? 0.045 : activeWeather.condition === 'cloudy' ? 0.012 : 0.006
        gainNode.gain.setValueAtTime(level, audioCtx.currentTime)
        noiseNode.connect(filterNode)
        filterNode.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        noiseNode.start()
      } catch (err) {
        console.warn('AudioContext failed:', err)
      }
    }

    return () => {
      if (noiseNode) { try { noiseNode.stop(); noiseNode.disconnect() } catch {} }
      if (audioCtx) { try { audioCtx.close() } catch {} }
    }
  }, [activePlace?.isPending, activeWeather, ambienceUnlocked])

  const handleDetectLocation = (isInitial = false) => {
    if (!navigator.geolocation) {
      if (!isInitial && onToast) onToast('Geolocation is not supported by your browser.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false)
        const { latitude, longitude } = pos.coords
        const { city, country } = await reverseGeocodeCity(latitude, longitude)
        const weather = await fetchLiveWeather(latitude, longitude)

        const resolved = {
          id: 'live-device-location',
          name: city || 'Your Location',
          country: country || 'Detected',
          lat: latitude,
          lng: longitude,
          timezone: weather?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time',
          isLiveDetected: true,
        }

        onLocationChange(resolved)
        setCurrentWeather(weather)
        onModalOpenChange(false)
        if (onToast) onToast(weather?.isLiveApi ? `Live location detected: ${resolved.name} (${weather.temp}°C, ${weather.weather})` : `Location detected: ${resolved.name}. Weather is temporarily unavailable.`)
      },
      (_error) => {
        setLocating(false)
        if (!isInitial && onToast) {
          onToast('Location access was not shared. Search for your city, town or postcode instead.')
          onModalOpenChange(true)
        }
      },
      { timeout: 9000, enableHighAccuracy: false }
    )
  }

  const handleSelectCity = async (city) => {
    onLocationChange(city)
    onModalOpenChange(false)
    const weather = await fetchLiveWeather(city.lat, city.lng)
    setCurrentWeather(weather)
    if (onToast) onToast(weather?.isLiveApi ? `Location updated: ${city.name} (${weather.temp}°C, ${weather.weather})` : `Location updated: ${city.name}. Weather is temporarily unavailable.`)
  }

  const handleSelectHometown = async (city) => {
    onHometownChange(city)
    const weather = await fetchLiveWeather(city.lat, city.lng)
    setHomeWeather(weather)
    if (onToast) onToast(`Hometown updated to ${city.name}.`)
  }

  const handleManualSearch = async (event) => {
    event.preventDefault()
    const now = Date.now()
    const recentAttempts = searchAttempts.filter((time) => now - time < 60_000)
    if (recentAttempts.length >= 6) {
      setManualError('Please wait a minute before searching again.')
      return
    }
    setSearchAttempts([...recentAttempts, now])
    setManualSearching(true)
    setManualError('')
    setManualResult(null)
    try {
      setManualResult(await geocodePlace(manualQuery))
    } catch (error) {
      setManualError(error.message || 'Location search failed.')
    } finally {
      setManualSearching(false)
    }
  }

  return (
    <>
      <div className="location-weather-strip" role="region" aria-label="Location and automated weather context">
        <div className="location-context-buttons">
          <button
            type="button"
            className={`context-tab ${activeContext === 'around_me' ? 'is-active' : ''}`}
            onClick={() => {
              onContextChange('around_me')
              if (currentLocation?.isPending) onModalOpenChange(true)
            }}
            aria-pressed={activeContext === 'around_me'}
          >
            <Compass size={14} />
            <span>Around me: <strong>{currentLocation?.isPending ? 'Choose location' : currentLocation.name}</strong></span>
          </button>
          <button
            type="button"
            className={`context-tab ${activeContext === 'back_home' ? 'is-active' : ''}`}
            onClick={() => onContextChange('back_home')}
            aria-pressed={activeContext === 'back_home'}
          >
            <Home size={14} />
            <span>Back home: <strong>{hometown.name}</strong></span>
          </button>
        </div>

        <div className="weather-readout">
          <button
            type="button"
            className="location-pill-btn"
            onClick={() => onModalOpenChange(true)}
            aria-label="Change location or view live weather"
          >
            <MapPin size={14} className="text-gold" />
            <span>{activePlace?.isPending ? 'Set your current location' : `${activePlace.name} · ${activePlace.timezone || 'Local time'}`}</span>
            <span className="weather-temp-badge">
              {activePlace?.isPending ? (
                <><MapPin size={13} />GPS or manual search</>
              ) : (
                <>
                  {weatherLoading ? (
                    <RefreshCw size={13} className="spin-icon" />
                  ) : activeWeather?.condition === 'rain' ? (
                    <CloudRain size={13} />
                  ) : activeWeather?.condition === 'cloudy' ? (
                    <Cloud size={13} />
                  ) : (
                    <Sun size={13} />
                  )}
                  {activeWeather ? `${activeWeather.temp == null ? '' : `${activeWeather.temp}°C · `}${activeWeather.weather}` : 'Fetching live weather…'}
                </>
              )}
            </span>
            {!activePlace?.isPending && activeWeather?.isLiveApi && <span className="live-api-pulse" title="Live weather fetched from Open-Meteo API">● Live</span>}
          </button>

          {!activePlace?.isPending && activeWeather && (
            <span className="weather-ambience-status" title="Ambience changes automatically with live local weather">
              <Volume2 size={13} />
              <span>Auto ambience · {activeWeather.condition === 'rain' ? 'Rain' : activeWeather.condition === 'cloudy' ? 'Soft wind' : 'Clear breeze'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Location Modal */}
      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => onModalOpenChange(false)}>
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Your Celebration Location & Weather</h2>
                <p>Location-aware Panjika and chapter releases respect your exact coordinates. Automated live weather via Open-Meteo.</p>
              </div>
              <button type="button" className="close-btn" onClick={() => onModalOpenChange(false)} aria-label="Close location selector">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <button
                type="button"
                className="detect-btn primary-action"
                onClick={() => handleDetectLocation(false)}
                disabled={locating}
              >
                <Compass size={18} />
                <span>{locating ? 'Resolving live GPS location...' : 'Use my current device location'}</span>
              </button>
              <small className="honest-privacy-note">
                With permission, your browser sends coordinates to Open-Meteo and OpenStreetMap to resolve weather and nearby places. Uma Boron does not store them.
              </small>

              <div className="divider-label"><span>Or enter any location manually</span></div>

              <form className="manual-location-search" onSubmit={handleManualSearch}>
                <input
                  type="text"
                  placeholder="City, town, postcode or neighbourhood"
                  maxLength={120}
                  autoComplete="address-level2"
                  value={manualQuery}
                  onChange={(e) => { setManualQuery(e.target.value); setManualResult(null); setManualError('') }}
                  aria-label="Search for any location"
                />
                <button className="secondary-action" type="submit" disabled={manualSearching || manualQuery.trim().length < 2}>
                  {manualSearching ? <RefreshCw size={15} className="spin-icon" /> : <Search size={15} />}
                  {manualSearching ? 'Searching…' : 'Find location'}
                </button>
              </form>
              {manualError && <p className="manual-location-error" role="alert">{manualError}</p>}
              {manualResult && (
                <div className="manual-location-result">
                  <div className="city-info">
                    <strong>{manualResult.name}</strong>
                    <small>{manualResult.displayName}</small>
                  </div>
                  <div className="city-actions">
                    <button type="button" className="action-pill" onClick={() => handleSelectCity(manualResult)}>Set Around me</button>
                    <button type="button" className="action-pill" onClick={() => handleSelectHometown(manualResult)}>Set Back home</button>
                  </div>
                </div>
              )}

              <div className="divider-label"><span>Quick choices</span></div>

              <div className="city-selection-grid">
                {popularCities
                  .map((city) => {
                    const isCurrent = currentLocation?.name === city.name
                    const isHome = hometown.name === city.name
                    return (
                      <div key={city.id} className={`city-card ${isCurrent ? 'is-selected' : ''}`}>
                        <div className="city-info">
                          <strong>{city.name}</strong>
                          <small>{city.country} · {city.timezone}</small>
                        </div>
                        <div className="city-actions">
                          <button
                            type="button"
                            className={`action-pill ${isCurrent ? 'active' : ''}`}
                            onClick={() => handleSelectCity(city)}
                          >
                            {isCurrent ? '✓ Current' : 'Set Current'}
                          </button>
                          <button
                            type="button"
                            className={`action-pill ${isHome ? 'active' : ''}`}
                            onClick={() => handleSelectHometown(city)}
                          >
                            {isHome ? '❤️ Hometown' : 'Set Hometown'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="modal-footer">
              <p>
                <Globe2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Around me is never assumed. Hometown defaults to <strong>Kolkata</strong> and can be changed independently at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
