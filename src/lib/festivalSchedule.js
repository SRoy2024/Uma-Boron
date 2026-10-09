export const FESTIVAL_TIME_ZONE = 'Asia/Kolkata'

export const festivalSchedule = {
  mahalaya: {
    unlockAt: '2026-10-09T18:30:00.000Z',
    dateLabel: '10 October 2026',
    ritualLabel: 'Mahalaya dawn',
  },
  panchami: {
    unlockAt: '2026-10-14T18:30:00.000Z',
    dateLabel: '15 October 2026',
    ritualLabel: 'Maha Panchami',
  },
  shashthi: {
    unlockAt: '2026-10-15T18:30:00.000Z',
    dateLabel: '16 October 2026',
    ritualLabel: 'Maha Shashthi',
  },
  saptami: {
    unlockAt: '2026-10-16T18:30:00.000Z',
    dateLabel: '17 October 2026',
    ritualLabel: 'Maha Saptami',
  },
  ashtami: {
    unlockAt: '2026-10-17T18:30:00.000Z',
    dateLabel: '18 October 2026',
    ritualLabel: 'Maha Ashtami',
  },
  navami: {
    unlockAt: '2026-10-18T18:30:00.000Z',
    dateLabel: '19 October 2026',
    ritualLabel: 'Maha Navami',
  },
  dashami: {
    unlockAt: '2026-10-19T18:30:00.000Z',
    dateLabel: '20 October 2026',
    ritualLabel: 'Bijoya Dashami',
  },
}

export function isChapterUnlocked(chapterId, now = new Date(), editorOverride = false) {
  if (editorOverride) return true
  const entry = festivalSchedule[chapterId]
  return !entry || now.getTime() >= new Date(entry.unlockAt).getTime()
}

export function getCountdownParts(unlockAt, now = new Date()) {
  const remaining = Math.max(0, new Date(unlockAt).getTime() - now.getTime())
  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { remaining, days, hours, minutes, seconds }
}

export function getFestivalDateLabel(chapterId) {
  return festivalSchedule[chapterId]?.dateLabel || ''
}
