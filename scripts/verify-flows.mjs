import assert from 'node:assert/strict'
import { contactInferenceTestCases, inferRelationshipFromContactName } from '../src/lib/contactInference.js'
import { pujoCalendarEvents, generateGoogleCalendarUrl, generateICSContent } from '../src/data/calendarEvents.js'
import { festivalSchedule, isChapterUnlocked } from '../src/lib/festivalSchedule.js'
import { WMO_WEATHER_MAP } from '../src/lib/weather.js'
import { ADMIN_EMAILS, checkAuthRateLimit, isAdminSession, isEditorEmail, isEditorSession } from '../src/lib/authAccess.js'
import { reelsData } from '../src/data/reels.js'
import { buildGoogleDirectionsUrl, buildGoogleMapsEmbedUrl, buildGoogleMapsSearchUrl, calculateDistance } from '../src/lib/nearbyPujos.js'

for (const [name, expected] of contactInferenceTestCases) {
  assert.equal(inferRelationshipFromContactName(name).id, expected, `contact inference failed for ${name}`)
}

assert.equal(pujoCalendarEvents.length, 8, 'calendar must contain eight reminders')
const calendar = generateICSContent(pujoCalendarEvents)
assert.ok(calendar.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0'), 'calendar header is invalid')
assert.ok(calendar.endsWith('END:VCALENDAR'), 'calendar footer is invalid')
assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, pujoCalendarEvents.length, 'event count mismatch')
assert.equal((calendar.match(/BEGIN:VALARM/g) || []).length, pujoCalendarEvents.length, 'alarm count mismatch')
for (const event of pujoCalendarEvents) {
  assert.match(event.startUTC, /^2026\d{4}T\d{6}Z$/, `${event.id} start must be UTC`) 
  assert.match(event.endUTC, /^2026\d{4}T\d{6}Z$/, `${event.id} end must be UTC`)
  assert.ok(calendar.includes(`UID:${event.id}@umaboron.app`), `${event.id} UID missing`)
  const googleUrl = new URL(generateGoogleCalendarUrl(event))
  assert.equal(googleUrl.origin, 'https://calendar.google.com')
  assert.equal(googleUrl.searchParams.get('action'), 'TEMPLATE')
  assert.equal(googleUrl.searchParams.get('text'), event.title)
  assert.equal(googleUrl.searchParams.get('dates'), `${event.startUTC}/${event.endUTC}`)
  assert.ok(new Date(`${event.startUTC.slice(0, 4)}-${event.startUTC.slice(4, 6)}-${event.startUTC.slice(6, 8)}T${event.startUTC.slice(9, 11)}:${event.startUTC.slice(11, 13)}:${event.startUTC.slice(13, 15)}Z`) < new Date(`${event.endUTC.slice(0, 4)}-${event.endUTC.slice(4, 6)}-${event.endUTC.slice(6, 8)}T${event.endUTC.slice(9, 11)}:${event.endUTC.slice(11, 13)}:${event.endUTC.slice(13, 15)}Z`), `${event.id} must end after it starts`)
}

assert.equal(isEditorEmail('sohamroy.pkt@gmail.com'), true)
assert.equal(isEditorEmail(' SOHAMROY.PKT@GMAIL.COM '), true)
assert.equal(isEditorEmail('sohamroy.kt@gmail.com'), false)
assert.equal(isEditorEmail('visitor@example.com'), false)
const adminSession = { user: { id: 'admin-user', email: ADMIN_EMAILS[0], app_metadata: { role: 'admin' } } }
assert.equal(isAdminSession(adminSession), true)
assert.equal(isEditorSession(adminSession), true)
assert.equal(isAdminSession({ user: { id: 'admin-user', email: ADMIN_EMAILS[0], app_metadata: {} } }), false)
assert.equal(isAdminSession({ user: { id: 'invited-admin', email: 'invited@example.com', app_metadata: { role: 'admin' } } }), true)
assert.equal(isAdminSession({ user: { email: 'visitor@example.com', app_metadata: { role: 'admin' } } }), false)
assert.equal(isEditorSession({ user: { id: 'owner', email: 'sohamroy.pkt@gmail.com', app_metadata: {} } }), false)
assert.equal(checkAuthRateLimit([1, 2, 3, 4], 60_000).allowed, true)
assert.equal(checkAuthRateLimit([59_995, 59_996, 59_997, 59_998, 59_999], 60_000).allowed, false)

for (const [chapterId, schedule] of Object.entries(festivalSchedule)) {
  const unlock = new Date(schedule.unlockAt)
  assert.equal(isChapterUnlocked(chapterId, new Date(unlock.getTime() - 1)), false, `${chapterId} unlocked early`)
  assert.equal(isChapterUnlocked(chapterId, unlock), true, `${chapterId} did not unlock on time`)
  assert.equal(isChapterUnlocked(chapterId, new Date(0), true), true, `${chapterId} editor override failed`)
}

assert.equal(WMO_WEATHER_MAP[0].condition, 'clear')
assert.equal(WMO_WEATHER_MAP[3].condition, 'cloudy')
assert.equal(WMO_WEATHER_MAP[63].condition, 'rain')

assert.equal(reelsData.length, 7, 'festival feed must contain one verified fallback per chapter')
assert.equal(new Set(reelsData.map((reel) => reel.chapterId)).size, 7, 'festival feed chapter ids must be unique')
for (const reel of reelsData) {
  const video = new URL(reel.reelUrl)
  const thumbnail = new URL(reel.thumbnailUrl)
  assert.equal(video.protocol, 'https:', `${reel.id} video must use HTTPS`)
  assert.ok(['www.youtube.com', 'youtube.com', 'youtu.be'].includes(video.hostname), `${reel.id} has an untrusted video host`)
  assert.equal(thumbnail.hostname, 'i.ytimg.com', `${reel.id} has an untrusted thumbnail host`)
  assert.equal(reel.platform, 'YouTube', `${reel.id} platform does not match its URL`)
}

assert.ok(calculateDistance(12.9716, 77.5946, 12.9716, 77.5946) < 0.001, 'same-coordinate map distance must be zero')
assert.ok(calculateDistance(12.9716, 77.5946, 19.076, 72.8777) > 800, 'map distance must use real coordinates')
const mapsSearch = buildGoogleMapsSearchUrl(19.076, 72.8777, 'Durga Puja pandal')
assert.match(mapsSearch, /^https:\/\/www\.google\.com\/maps\/search\//, 'Google Maps search URL is invalid')
assert.ok(mapsSearch.includes('@19.076,72.8777,12z'), 'Google Maps search is not centred on the selected location')
assert.match(buildGoogleMapsEmbedUrl(19.076, 72.8777, 'Mumbai'), /^https:\/\/maps\.google\.com\/maps\?/, 'Google map embed URL is invalid')
assert.match(buildGoogleDirectionsUrl(19.076, 72.8777, 19.1257, 72.9194), /origin=19\.076,72\.8777&destination=19\.1257,72\.9194/, 'Google directions coordinates are invalid')

console.log(`Verified ${contactInferenceTestCases.length} contact cases, ${pujoCalendarEvents.length} calendar/Google links, ${Object.keys(festivalSchedule).length} release gates, ${reelsData.length} trusted festival videos, live coordinate maps, editor auth/rate limits, and weather ambience mapping.`)
