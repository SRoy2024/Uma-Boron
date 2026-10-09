import { useEffect, useMemo, useState } from 'react'
import { Compass, ExternalLink, LocateFixed, MapPin, Navigation, RefreshCw, Search, Sparkles } from 'lucide-react'
import { reverseGeocodeCity } from '../lib/weather'
import { buildGoogleMapsEmbedUrl, buildGoogleMapsSearchUrl, fetchNearbyPujos } from '../lib/nearbyPujos'

export default function PandalMapSection({ userLocation, onLocationChange, onRequestLocation, onToast }) {
  const [selectedPujoId, setSelectedPujoId] = useState(null)
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [livePujos, setLivePujos] = useState([])
  const [searchingLive, setSearchingLive] = useState(false)
  const [registryError, setRegistryError] = useState('')

  const hasLocation = userLocation?.lat != null && userLocation?.lng != null && Number.isFinite(Number(userLocation.lat)) && Number.isFinite(Number(userLocation.lng))
  const userLat = hasLocation ? Number(userLocation.lat) : null
  const userLng = hasLocation ? Number(userLocation.lng) : null
  const userCity = hasLocation ? (userLocation?.name || 'Your Location') : 'your location'

  useEffect(() => {
    setSelectedPujoId(null)
    setLivePujos([])
    setRegistryError('')
    if (!hasLocation) return undefined
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchingLive(true)
      try {
        const results = await fetchNearbyPujos({ lat: userLat, lng: userLng, city: userCity, signal: controller.signal })
        setLivePujos(results)
      } catch (error) {
        if (error.name !== 'AbortError') setRegistryError('The public venue registry is temporarily unavailable. The live Google map still works below.')
      } finally {
        if (!controller.signal.aborted) setSearchingLive(false)
      }
    }, 500)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [hasLocation, userLat, userLng, userCity])

  const filteredPujos = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return livePujos
    return livePujos.filter((pujo) => [pujo.name, pujo.landmark, pujo.address, pujo.city].some((value) => value?.toLowerCase().includes(query)))
  }, [livePujos, search])

  const currentPujo = filteredPujos.find((pujo) => pujo.id === selectedPujoId) || filteredPujos[0] || null
  const googleQuery = search.trim() || 'Durga Puja pandal'
  const googleSearchUrl = hasLocation ? buildGoogleMapsSearchUrl(userLat, userLng, googleQuery) : ''
  const googleEmbedUrl = hasLocation ? buildGoogleMapsEmbedUrl(userLat, userLng, userCity, googleQuery) : ''

  const handleDetectGPS = () => {
    if (!navigator.geolocation) { onToast?.('Geolocation is not supported by your browser.'); return }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setIsLocating(false)
        const { city, country } = await reverseGeocodeCity(coords.latitude, coords.longitude)
        onLocationChange?.({
          id: 'live-gps', name: city || 'Your Location', country: country || '', lat: coords.latitude, lng: coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata', isLiveDetected: true,
        })
        onToast?.(`Nearby Puja search moved to ${city || 'your live location'}.`)
      },
      () => { setIsLocating(false); onToast?.('Location access was not shared. Enter a city, town or postcode instead.') },
      { timeout: 9000, enableHighAccuracy: true },
    )
  }

  if (!hasLocation) {
    return (
      <section className="pandal-map-section" id="nearby-pujos-map" aria-labelledby="map-section-title">
        <div className="section-header-block">
          <span className="section-badge"><Compass size={14} /> Live Location Discovery</span>
          <h2 id="map-section-title">Pandals around your real location</h2>
          <p>No default city is used. Share your location or enter any city, town or postcode.</p>
        </div>
        <div className="location-required-card">
          <span className="location-required-icon"><LocateFixed size={28} /></span>
          <div><h3>Choose “Around me”</h3><p>Your coordinates stay in this browser and drive the venue search, Google map and weather.</p></div>
          <div className="location-required-actions">
            <button type="button" className="primary-action" onClick={handleDetectGPS} disabled={isLocating}>{isLocating ? <RefreshCw size={16} className="spin-icon" /> : <LocateFixed size={16} />}{isLocating ? 'Locating…' : 'Use my location'}</button>
            <button type="button" className="secondary-action" onClick={onRequestLocation}><Search size={16} />Enter manually</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pandal-map-section" id="nearby-pujos-map" aria-labelledby="map-section-title">
      <div className="section-header-block">
        <span className="section-badge"><Compass size={14} /> Live Google Map & Open Venue Registry</span>
        <h2 id="map-section-title">Nearby Pujos Around {userCity}</h2>
        <p>Searches refresh from <strong>{userLat.toFixed(3)}°, {userLng.toFixed(3)}°</strong> whenever “Around me” changes. Nothing defaults back to Bengaluru or Kolkata.</p>
      </div>

      <div className="map-dynamic-toolbar">
        <div className="user-location-indicator">
          <MapPin size={16} className="text-gold" />
          <span>Search centre: <strong>{userCity}</strong><small>({userLat.toFixed(2)}°, {userLng.toFixed(2)}°)</small></span>
          <button type="button" className="gps-refresh-btn" onClick={handleDetectGPS} disabled={isLocating}>
            {isLocating ? <RefreshCw size={13} className="spin-icon" /> : <LocateFixed size={13} />}{isLocating ? 'Locating…' : 'Use Live GPS'}
          </button>
        </div>
        <div className="map-toolbar-actions">
          <div className="search-wrap"><Search size={15} /><input type="search" placeholder="Search Durga Puja, association or area…" maxLength={120} value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search live map venues" /></div>
          <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="primary-action live-gmaps-search-btn"><Navigation size={14} /><span>Open in Google Maps</span><ExternalLink size={12} /></a>
        </div>
      </div>

      <div className="map-interactive-container live-map-layout">
        <div className="google-live-map">
          <iframe key={googleEmbedUrl} title={`Google Maps search for Durga Puja near ${userCity}`} src={googleEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          <div className="map-legend"><span className="legend-dot" /><span>Google Maps · centred on {userCity}</span></div>
        </div>

        {currentPujo ? (
          <aside className="pandal-spotlight-card">
            <div className="spotlight-header"><span className="zone-pill">{currentPujo.city} · {currentPujo.zone}</span><span className="distance-pill"><Navigation size={13} />{currentPujo.distDisplay}</span></div>
            <h3 className="spotlight-title">{currentPujo.name}</h3>
            <h4 className="spotlight-bengali" lang="bn">{currentPujo.bengali}</h4>
            <span className="type-tag">{currentPujo.type}</span>
            <p className="spotlight-highlight">{currentPujo.highlights}</p>
            <div className="spotlight-address"><MapPin size={16} className="pin-accent" /><div><strong>{currentPujo.landmark}</strong><small>{currentPujo.address}</small></div></div>
            <div className="spotlight-actions"><a href={currentPujo.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="primary-action directions-btn"><Navigation size={17} /><span>Directions from here</span><ExternalLink size={14} /></a><span className="verified-stamp"><Sparkles size={13} className="text-gold" />{currentPujo.status}</span></div>
          </aside>
        ) : (
          <aside className="pandal-spotlight-card map-empty-live" aria-live="polite">
            {searchingLive ? <RefreshCw size={28} className="spin-icon text-gold" /> : <Compass size={30} className="text-gold" />}
            <h3>{searchingLive ? `Discovering venues around ${userCity}…` : 'No matching registry card yet'}</h3>
            <p>{registryError || 'Seasonal pandals are often absent from public registries. Use the live Google map to see current results and organisers.'}</p>
            <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="primary-action directions-btn"><Navigation size={16} />Search this area on Google Maps</a>
          </aside>
        )}
      </div>

      <div className="proximity-pandal-strip">
        <div className="proximity-strip-header"><span>Live venues sorted by distance</span><small>{searchingLive ? 'Refreshing…' : `${filteredPujos.length} public registry matches`}</small></div>
        {filteredPujos.length ? (
          <div className="pandal-quick-row">{filteredPujos.map((pujo) => (
            <button key={pujo.id} type="button" className={`quick-pujo-tile ${currentPujo?.id === pujo.id ? 'is-active' : ''}`} onClick={() => setSelectedPujoId(pujo.id)}>
              <span className="quick-tile-top"><span className="tile-dist-tag">{pujo.distDisplay}</span><span className="tile-live-badge">Live registry</span></span>
              <strong>{pujo.name}</strong><small>{pujo.landmark || pujo.city}</small><span className="quick-map-link">View details <Navigation size={11} /></span>
            </button>
          ))}</div>
        ) : <p className="registry-empty-note">The Google map above remains live even when OpenStreetMap has no structured venue record for this city.</p>}
      </div>
      <p className="map-data-note">Google Maps supplies the live visual search. Structured cards use OpenStreetMap contributor data and never invent schedules or opening hours.</p>
    </section>
  )
}
