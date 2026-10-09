export const EDITOR_EMAIL = 'sohamroy.pkt@gmail.com'

export function normalizeEmail(email = '') {
  return String(email).trim().toLocaleLowerCase()
}

export function isEditorEmail(email) {
  return normalizeEmail(email) === EDITOR_EMAIL
}

export function checkAuthRateLimit(attempts, now = Date.now(), limit = 5, windowMs = 60_000) {
  const recent = attempts.filter((time) => now - time < windowMs)
  return { allowed: recent.length < limit, recent }
}
