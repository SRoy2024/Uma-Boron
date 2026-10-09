// Live Automated Weather Service using Open-Meteo API (Free, Real-time, No API Keys needed)

export const WMO_WEATHER_MAP = {
  0: { label: 'Clear Autumn Sky', condition: 'clear' },
  1: { label: 'Mainly Clear Sky', condition: 'clear' },
  2: { label: 'Partly Cloudy', condition: 'cloudy' },
  3: { label: 'Overcast Skies', condition: 'cloudy' },
  45: { label: 'Misty Autumn Fog', condition: 'cloudy' },
  48: { label: 'Depositing Rime Fog', condition: 'cloudy' },
  51: { label: 'Light Festive Drizzle', condition: 'rain' },
  53: { label: 'Moderate Drizzle', condition: 'rain' },
  55: { label: 'Dense Drizzle', condition: 'rain' },
  61: { label: 'Slight Rain Showers', condition: 'rain' },
  63: { label: 'Moderate Autumn Rain', condition: 'rain' },
  65: { label: 'Heavy Rain', condition: 'rain' },
  80: { label: 'Brief Passing Showers', condition: 'rain' },
  95: { label: 'Kalbaishakhi Thunderstorm', condition: 'rain' },
}

const weatherCache = new Map()
const geocodeCache = new Map()
const CACHE_TTL = 10 * 60 * 1000

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchLiveWeather(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '' || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null
  const cacheKey = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`
  const cached = weatherCache.get(cacheKey)
  if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached.data

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`)
    const data = await res.json()
    const current = data?.current
    if (!current || !Number.isFinite(Number(current.temperature_2m)) || !Number.isFinite(Number(current.weather_code))) {
      throw new Error('Weather response was incomplete')
    }
    const code = current.weather_code ?? 0
    const meta = WMO_WEATHER_MAP[code] || { label: 'Pleasant Autumn Breeze', condition: 'clear' }

    const weather = {
      temp: Math.round(Number(current.temperature_2m)),
      humidity: Number.isFinite(Number(current.relative_humidity_2m)) ? Number(current.relative_humidity_2m) : null,
      windSpeed: Number.isFinite(Number(current.wind_speed_10m)) ? Number(current.wind_speed_10m) : null,
      weather: meta.label,
      condition: meta.condition,
      timezone: typeof data.timezone === 'string' ? data.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone,
      isLiveApi: true,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    weatherCache.set(cacheKey, { savedAt: Date.now(), data: weather })
    return weather
  } catch (err) {
    console.warn('Live weather API error:', err)
    return {
      temp: null,
      humidity: null,
      windSpeed: null,
      weather: 'Weather temporarily unavailable',
      condition: 'unavailable',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time',
      isLiveApi: false,
    }
  }
}

export async function reverseGeocodeCity(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '' || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return { city: 'Your Location', country: '' }
  try {
    // OpenStreetMap Nominatim reverse geocoder
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`
    const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en' } })
    if (!res.ok) throw new Error('Geocode failed')
    const data = await res.json()
    const addr = data.address || {}
    const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Your Location'
    const country = addr.country || 'India'
    return { city, country }
  } catch (err) {
    console.warn('Reverse geocoding error:', err)
    return { city: 'Your Location', country: '' }
  }
}

export async function geocodePlace(query) {
  const normalized = query.trim().toLowerCase()
  if (normalized.length < 2) throw new Error('Enter at least two characters.')

  const cached = geocodeCache.get(normalized)
  if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached.data

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&addressdetails=1&limit=1`
  const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Location search is temporarily unavailable.')
  const results = await res.json()
  const match = Array.isArray(results) ? results[0] : null
  if (!match) throw new Error('No matching location found. Try a nearby city or postcode.')

  const address = match.address || {}
  const name = address.city || address.town || address.village || address.municipality || address.county || match.name || query.trim()
  const result = {
    id: `manual-${match.place_id}`,
    name,
    country: address.country || '',
    lat: Number(match.lat),
    lng: Number(match.lon),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    displayName: match.display_name,
    isManual: true,
  }
  if (!Number.isFinite(result.lat) || result.lat < -90 || result.lat > 90 || !Number.isFinite(result.lng) || result.lng < -180 || result.lng > 180) {
    throw new Error('The location service returned invalid coordinates.')
  }
  const weather = await fetchLiveWeather(result.lat, result.lng)
  if (weather?.timezone) result.timezone = weather.timezone
  geocodeCache.set(normalized, { savedAt: Date.now(), data: result })
  return result
}
