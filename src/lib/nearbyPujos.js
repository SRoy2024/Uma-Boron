const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const SEARCH_TERMS = ['Durga Puja', 'Bengali Association', 'Durga Temple']
const RELEVANT_NAME = /durga|durgotsav|puja|pujo|bengali association|bengalee association/i
const RELEVANT_TYPES = new Set(['place_of_worship', 'community_centre', 'events_venue', 'recreation_ground', 'theatre'])

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const values = [lat1, lng1, lat2, lng2].map(Number)
  if (!values.every(Number.isFinite)) return null
  const [aLat, aLng, bLat, bLng] = values
  const radius = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function mapResult(item, origin, city) {
  const lat = Number(item.lat)
  const lng = Number(item.lon)
  const name = String(item.name || item.namedetails?.name || '').trim()
  const address = String(item.display_name || '').trim()
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !name || !address) return null
  if (!RELEVANT_NAME.test(name) && !RELEVANT_TYPES.has(item.type)) return null
  const distance = calculateDistance(origin.lat, origin.lng, lat, lng)
  if (distance == null || distance > 80) return null
  const area = item.address?.suburb || item.address?.neighbourhood || item.address?.city_district || item.address?.city || city
  return {
    id: `osm-${item.osm_type || 'place'}-${item.osm_id || item.place_id}`,
    name,
    bengali: 'লাইভ ম্যাপ রেজিস্ট্রি',
    city: item.address?.city || item.address?.town || city,
    zone: area,
    type: item.type === 'place_of_worship' ? 'Durga worship venue' : 'Community festival venue',
    landmark: area,
    address,
    lat,
    lng,
    distNum: distance,
    distDisplay: distance < 10 ? `${distance.toFixed(1)} km away` : `${Math.round(distance)} km away`,
    googleMapsUrl: buildGoogleDirectionsUrl(origin.lat, origin.lng, lat, lng),
    highlights: 'Live venue data from OpenStreetMap. Open Google Maps to confirm the current Puja programme and entrance.',
    status: 'Live map result',
    isLiveOsm: true,
  }
}

export async function fetchNearbyPujos({ lat, lng, city, signal }) {
  const origin = { lat: Number(lat), lng: Number(lng) }
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return []
  const results = []
  const seen = new Set()
  const span = 0.7

  for (let index = 0; index < SEARCH_TERMS.length; index += 1) {
    if (index > 0) await wait(1050, signal)
    const params = new URLSearchParams({
      q: `${SEARCH_TERMS[index]} ${city || ''}`.trim(), format: 'jsonv2', addressdetails: '1', namedetails: '1', limit: '12',
      viewbox: `${origin.lng - span},${origin.lat + span},${origin.lng + span},${origin.lat - span}`, bounded: '1',
    })
    const response = await fetch(`${NOMINATIM_URL}?${params}`, { headers: { 'Accept-Language': 'en' }, signal })
    if (!response.ok) throw new Error(`Map registry returned ${response.status}`)
    const data = await response.json()
    for (const item of Array.isArray(data) ? data : []) {
      const mapped = mapResult(item, origin, city)
      if (!mapped || seen.has(mapped.id)) continue
      seen.add(mapped.id)
      results.push(mapped)
    }
    if (results.length >= 8) break
  }

  return results.sort((a, b) => a.distNum - b.distNum).slice(0, 12)
}

export function buildGoogleMapsSearchUrl(lat, lng, query = 'Durga Puja pandal') {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${Number(lat)},${Number(lng)},12z`
}

export function buildGoogleMapsEmbedUrl(lat, lng, city, query = 'Durga Puja pandal') {
  const search = `${query} near ${city || `${lat},${lng}`}`
  return `https://maps.google.com/maps?q=${encodeURIComponent(search)}&ll=${Number(lat)},${Number(lng)}&z=12&output=embed`
}

export function buildGoogleDirectionsUrl(originLat, originLng, destinationLat, destinationLng) {
  return `https://www.google.com/maps/dir/?api=1&origin=${Number(originLat)},${Number(originLng)}&destination=${Number(destinationLat)},${Number(destinationLng)}`
}
