export const ADMIN_EMAILS = Object.freeze([
  'sohamroy.kt@gmail.com',
  'sohamroy.pkt@gmail.com',
])

export function normalizeEmail(email = '') {
  return String(email).trim().toLocaleLowerCase()
}

export function isEditorEmail(email) {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}

export function isAdminSession(session) {
  return Boolean(session?.user?.id) && session?.user?.app_metadata?.role === 'admin'
}

export function isEditorSession(session) {
  return isAdminSession(session)
}

export function checkAuthRateLimit(attempts, now = Date.now(), limit = 5, windowMs = 60_000) {
  const recent = attempts.filter((time) => now - time < windowMs)
  return { allowed: recent.length < limit, recent }
}
