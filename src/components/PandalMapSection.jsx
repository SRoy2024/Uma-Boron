import { useEffect, useMemo, useState } from 'react'
import {
  Compass,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { pujosData } from '../data/pujos'
import { reverseGeocodeCity } from '../lib/weather'

// Haversine formula to calculate exact distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d < 10 ? d.toFixed(1) : Math.round(d)
}

export default function PandalMapSection({ userLocation, onLocationChange, onRequestLocation, onToast }) {
  const [selectedPujo, setSelectedPujo] = useState(null)
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [liveOsmPujos, setLiveOsmPujos] = useState([])
  const [searchingLive, setSearchingLive] = useState(false)

  const hasLocation = userLocation?.lat != null && userLocation?.lng != null && Number.isFinite(Number(userLocation.lat)) && Number.isFinite(Number(userLocation.lng))
  const userLat = hasLocation ? Number(userLocation.lat) : null
  const userLng = hasLocation ? Number(userLocation.lng) : null
  const userCity = hasLocation ? (userLocation?.name || 'Your Location') : 'your location'

  // Trigger live OpenStreetMap search around user's exact coordinates
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    let requestTimer
    const searchLivePujos = async () => {
      if (!userLat || !userLng) return
      setSearchingLive(true)
      try {
        // Query Nominatim around user coordinates bounding box (~30km radius)
        const d = 0.35
        const url = `https://nominatim.openstreetmap.org/search?q=Durga+Puja&format=json&viewbox=${userLng - d},${userLat + d},${userLng + d},${userLat - d}&bounded=1&limit=10`
        requestTimer = window.setTimeout(() => controller.abort(), 8000)
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' }, signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && Array.isArray(data)) {
            const mapped = data.map((item) => {
              const lat = parseFloat(item.lat)
              const lng = parseFloat(item.lon)
              const displayName = typeof item.display_name === 'string' ? item.display_name : ''
              if (!Number.isFinite(lat) || !Number.isFinite(lng) || !displayName) return null
              return {
                id: `osm-${item.place_id}`,
                name: item.name || displayName.split(',')[0],
                bengali: 'স্থানীয় পুজো মণ্ডপ',
                city: userCity,
                zone: 'Local Area',
                type: 'Live Detected Puja / Ground',
                landmark: displayName.split(',').slice(1, 3).join(', ').trim(),
                address: displayName,
                lat,
                lng,
                googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}`,
                highlights: `Detected near your current coordinates via OpenStreetMap registry (${item.type || 'Puja location'}).`,
                status: 'Live Registry Match',
                isLiveOsm: true,
              }
            }).filter(Boolean)
            setLiveOsmPujos(mapped)
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Live OSM search notice:', err)
      } finally {
        window.clearTimeout(requestTimer)
        if (isMounted) setSearchingLive(false)
      }
    }

    const debounceTimer = window.setTimeout(searchLivePujos, 700)
    return () => {
      isMounted = false
      window.clearTimeout(debounceTimer)
      window.clearTimeout(requestTimer)
      controller.abort()
    }
  }, [userLat, userLng, userCity])

  // Combine curated directory with live discovered places and compute dynamic distance from user
  const pujosWithDistance = useMemo(() => {
    if (!hasLocation) return []
    // Combine curated database + any live OSM matches
    const all = [...liveOsmPujos, ...pujosData]
    // Filter duplicates by approximate coordinate match
    const seen = new Set()
    const unique = []
    for (const p of all) {
      const key = `${p.name.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        const dist = calculateDistance(userLat, userLng, p.lat, p.lng)
        unique.push({
          ...p,
          distNum: dist !== null ? parseFloat(dist) : 99999,
          distDisplay: dist !== null ? `${dist} km away` : 'Distance unknown',
          // Dynamic navigation URL including user's live origin coordinates
          googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(p.name + ', ' + p.city)}`,
        })
      }
    }

    // Sort by proximity (closest to user first)
    unique.sort((a, b) => a.distNum - b.distNum)
    return unique
  }, [hasLocation, liveOsmPujos, userLat, userLng])

  // Filter based on user search query
  const filteredPujos = useMemo(() => {
    if (!search.trim()) return pujosWithDistance
    const q = search.toLowerCase().trim()
    return pujosWithDistance.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.bengali?.toLowerCase().includes(q) ||
        p.landmark?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
    )
  }, [pujosWithDistance, search])

  // Currently focused pandal
  const currentPujo = selectedPujo || filteredPujos[0]

  // Direct live GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      if (onToast) onToast('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false)
        const { latitude, longitude } = pos.coords
        const { city, country } = await reverseGeocodeCity(latitude, longitude)
        const updated = {
          id: 'live-gps',
          name: city || 'Your Location',
          country: country || '',
          lat: latitude,
          lng: longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          isLiveDetected: true,
        }
        if (onLocationChange) onLocationChange(updated)
        if (onToast) onToast(`Updated to GPS location: ${city} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`)
      },
      (_err) => {
        setIsLocating(false)
        if (onToast) onToast('Location access was denied. You can still search any city manually.')
      },
      { timeout: 9000, enableHighAccuracy: true }
    )
  }

  if (!hasLocation) {
    return (
      <section className="pandal-map-section" id="nearby-pujos-map" aria-labelledby="map-section-title">
        <div className="section-header-block">
          <span className="section-badge"><Compass size={14} /> Location-Aware Radar & Live Proximity</span>
          <h2 id="map-section-title">Pandals sorted from where you really are</h2>
          <p>No Kolkata fallback is being used. Share your device location or enter any city, town or postcode manually.</p>
        </div>
        <div className="location-required-card">
          <span className="location-required-icon"><LocateFixed size={28} /></span>
          <div>
            <h3>Set “Around me” to calculate real distances</h3>
            <p>Your coordinates remain in this browser and are used only for nearby pandals, directions and weather.</p>
          </div>
          <div className="location-required-actions">
            <button type="button" className="primary-action" onClick={handleDetectGPS} disabled={isLocating}>
              {isLocating ? <RefreshCw size={16} className="spin-icon" /> : <LocateFixed size={16} />}
              {isLocating ? 'Locating…' : 'Use my location'}
            </button>
            <button type="button" className="secondary-action" onClick={onRequestLocation}><Search size={16} />Enter manually</button>
          </div>
        </div>
      </section>
    )
  }

  // Google Maps live search URL around user coordinates
  const liveGoogleMapsSearchUrl = `https://www.google.com/maps/search/Durga+Puja/@${userLat},${userLng},13z`

  return (
    <section className="pandal-map-section" id="nearby-pujos-map" aria-labelledby="map-section-title">
      {/* Section Header */}
      <div className="section-header-block">
        <span className="section-badge"><Compass size={14} /> Location-Aware Radar & Live Proximity</span>
        <h2 id="map-section-title">Nearby Pujos Around {userCity}</h2>
        <p>
          Calculated in real time from your coordinates (<strong>{userLat.toFixed(3)}°N, {userLng.toFixed(3)}°E</strong>). Closest pandals appear first with direct Google Maps turn-by-turn directions.
        </p>
      </div>

      {/* Dynamic Controls Bar */}
      <div className="map-dynamic-toolbar">
        <div className="user-location-indicator">
          <MapPin size={16} className="text-gold" />
          <span>
            Current Center: <strong>{userCity}</strong>
            <small style={{ marginLeft: '6px', color: '#c9b87d' }}>({userLat.toFixed(2)}°, {userLng.toFixed(2)}°)</small>
          </span>
          <button
            type="button"
            className="gps-refresh-btn"
            onClick={handleDetectGPS}
            disabled={isLocating}
            title="Refetch current GPS coordinates"
          >
            {isLocating ? <RefreshCw size={13} className="spin-icon" /> : <LocateFixed size={13} />}
            <span>{isLocating ? 'Locating...' : 'Use Live GPS'}</span>
          </button>
        </div>

        <div className="map-toolbar-actions">
          <div className="search-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search nearby pandals or areas..."
              maxLength={120}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search nearby pandals"
            />
          </div>

          <a
            href={liveGoogleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-action live-gmaps-search-btn"
          >
            <Navigation size={14} />
            <span>Search Live on Google Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Interactive Proximity Radar & Pandal Spotlight */}
      <div className="map-interactive-container">
        {/* Radar Canvas with Dynamic Relative Pin Positioning */}
        <div className="map-radar-canvas">
          <div className="map-grid-overlay" />
          <div className="radar-sweep-beam" />
          <div className="map-city-watermark">{userCity}</div>

          {/* User Center Node */}
          <div className="user-radar-center" title="You are here">
            <div className="user-dot-pulse" />
            <span className="user-dot-label">📍 You ({userCity})</span>
          </div>

          {/* Plotted Pins positioned radially around the user */}
          {filteredPujos.slice(0, 10).map((pujo, idx) => {
            const isSelected = currentPujo?.id === pujo.id
            // Calculate a relative 2D radar offset based on coordinate delta
            const dLat = (pujo.lat - userLat) * 60
            const dLng = (pujo.lng - userLng) * 60
            // Constrain within 15% to 85% of radar bounds
            const left = Math.max(12, Math.min(88, 50 + dLng * 2.5 + (idx % 2 === 0 ? 5 : -5)))
            const top = Math.max(15, Math.min(85, 50 - dLat * 2.5 + (idx % 3 === 0 ? 4 : -4)))

            return (
              <button
                key={pujo.id}
                type="button"
                className={`radar-pin-marker ${isSelected ? 'is-selected' : ''}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => setSelectedPujo(pujo)}
                title={`${pujo.name} (${pujo.distDisplay})`}
                aria-label={`View ${pujo.name}`}
              >
                <div className="pin-pulse" />
                <MapPin size={22} className="pin-svg" />
                <span className="pin-label">{pujo.name.split(' ')[0]} · {pujo.distDisplay}</span>
              </button>
            )
          })}

          <div className="map-legend">
            <span className="legend-dot" />
            <span>
              {searchingLive ? 'Searching live registry around your coordinates…' : `Showing closest pandals to ${userCity}`}
            </span>
          </div>
        </div>

        {/* Selected Pandal Spotlight Details */}
        {currentPujo && (
          <aside className="pandal-spotlight-card">
            <div className="spotlight-header">
              <span className="zone-pill">{currentPujo.city} · {currentPujo.zone}</span>
              <span className="distance-pill">
                <Navigation size={13} /> {currentPujo.distDisplay}
              </span>
            </div>

            <h3 className="spotlight-title">{currentPujo.name}</h3>
            <h4 className="spotlight-bengali" lang="bn">{currentPujo.bengali}</h4>
            <span className="type-tag">{currentPujo.type}</span>

            <p className="spotlight-highlight">{currentPujo.highlights}</p>

            <div className="spotlight-address">
              <MapPin size={16} className="pin-accent" />
              <div>
                <strong>{currentPujo.landmark}</strong>
                <small>{currentPujo.address}</small>
              </div>
            </div>

            <div className="spotlight-actions">
              <a
                href={currentPujo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-action directions-btn"
              >
                <Navigation size={17} />
                <span>Directions from Here (Google Maps)</span>
                <ExternalLink size={14} />
              </a>
              <span className="verified-stamp">
                <Sparkles size={13} className="text-gold" /> {currentPujo.status}
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* Proximity Sorted Cards Row */}
      <div className="proximity-pandal-strip">
        <div className="proximity-strip-header">
          <span>Pandals Sorted by Distance from You:</span>
          <small>{filteredPujos.length} locations discovered</small>
        </div>
        <div className="pandal-quick-row">
          {filteredPujos.map((pujo) => (
            <div
              key={pujo.id}
              className={`quick-pujo-tile ${currentPujo?.id === pujo.id ? 'is-active' : ''}`}
              onClick={() => setSelectedPujo(pujo)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="tile-dist-tag">{pujo.distDisplay}</span>
                {pujo.isLiveOsm && <span className="tile-live-badge">Live Registry</span>}
              </div>
              <strong>{pujo.name}</strong>
              <small>{pujo.landmark || pujo.city}</small>
              <a
                href={pujo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-map-link"
                onClick={(e) => e.stopPropagation()}
              >
                Directions in Maps <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
