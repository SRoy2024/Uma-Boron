// Calendar Events & RFC 5545 ICS Generator
// Supports offline one-click calendar download for Apple Calendar, Google Calendar, Outlook.

export const pujoCalendarEvents = [
  {
    id: 'mahalaya-dawn-2026',
    title: 'Mahalaya Dawn Radio · Birendra Krishna Bhadra (Uma Boron)',
    bengali: 'মহালয়া আগমনী প্রভাত',
    description: 'Listen to the timeless Mahishasuramardini broadcast at dawn. Chapter 01 of Uma Boron Durga Puja 2026.',
    startUTC: '20261009T223000Z',
    endUTC: '20261010T003000Z',
    localDisplay: 'Saturday, 10 Oct 2026 · 4:00 AM – 6:00 AM IST',
    location: 'Home Verandah / Uma Boron Station',
    category: 'Listening & Invocation',
  },
  {
    id: 'panchami-arrival-2026',
    title: 'Maha Panchami · Devi Arrives (Uma Boron)',
    bengali: 'মহাপঞ্চমী · দেবীর আগমন',
    description: 'Begin the Puja journey and explore the ten sacred weapons of Devi Durga in Chapter 02 of Uma Boron.',
    startUTC: '20261015T123000Z',
    endUTC: '20261015T133000Z',
    localDisplay: 'Thursday, 15 Oct 2026 · 6:00 PM – 7:00 PM IST',
    location: 'Uma Boron Festival Experience',
    category: 'Festival Arrival',
  },
  {
    id: 'shashthi-bodhon-2026',
    title: 'Maha Shashthi Bodhon & Mandap Reveal (Uma Boron)',
    bengali: 'মহাষষ্ঠী বোধন ও মণ্ডপ দ্বারোদঘাটন',
    description: 'Awakening of the Goddess and unveiling of the Durga Puja pandals. Chapter 03 of Uma Boron.',
    startUTC: '20261016T130000Z',
    endUTC: '20261016T150000Z',
    localDisplay: 'Friday, 16 Oct 2026 · 6:30 PM – 8:30 PM IST',
    location: 'Local Pandal & Uma Boron Mandap',
    category: 'Ritual & Gathering',
  },
  {
    id: 'saptami-navapatrika-2026',
    title: 'Maha Saptami Navapatrika Snan (Uma Boron)',
    bengali: 'মহাসপ্তমী নবপত্রিকা স্নান',
    description: 'A morning reminder for Kola Bou Snan and the Navapatrika ritual in Chapter 04 of Uma Boron.',
    startUTC: '20261017T003000Z',
    endUTC: '20261017T020000Z',
    localDisplay: 'Saturday, 17 Oct 2026 · 6:00 AM – 7:30 AM IST',
    location: 'Nearby River Ghat / Puja Pandal',
    category: 'Morning Ritual',
  },
  {
    id: 'ashtami-pushpanjali-2026',
    title: 'Maha Ashtami Pushpanjali (Uma Boron)',
    bengali: 'মহাষ্টমীর পুষ্পাঞ্জলি',
    description: 'Offer morning lotus and bel patra Pushpanjali with loved ones in traditional white and red attire. Chapter 05 of Uma Boron.',
    startUTC: '20261018T040000Z',
    endUTC: '20261018T060000Z',
    localDisplay: 'Sunday, 18 Oct 2026 · 9:30 AM – 11:30 AM IST',
    location: 'Nearby Puja Pandal',
    category: 'Sacred Anjali Offering',
  },
  {
    id: 'sandhi-puja-2026',
    title: 'Sandhi Puja Sacred Window · 108 Lamps & Lotus (Uma Boron)',
    bengali: 'সন্ধিপূজা ও ১০৮ প্রদীপ প্রজ্বলন',
    description: 'The sacred 48-minute junction between Ashtami and Navami with 108 earthen lamps, Kaanshor, and Dhak rhythm.',
    startUTC: '20261018T154200Z',
    endUTC: '20261018T163000Z',
    localDisplay: 'Sunday, 18 Oct 2026 · 9:12 PM – 10:00 PM IST',
    location: 'Puja Sanctum',
    category: 'Astrological Sandhi Window',
  },
  {
    id: 'navami-dhunuchi-2026',
    title: 'Maha Navami Dhunuchi Aarti & Evening Dhaak (Uma Boron)',
    bengali: 'মহানবমী ধুনুচি আরতি ও ধুনুচি নাচ',
    description: 'Fragrant dhuno incense, blazing clay pots, and rhythmic Dhunuchi Naach celebrations. Chapter 06 of Uma Boron.',
    startUTC: '20261019T133000Z',
    endUTC: '20261019T153000Z',
    localDisplay: 'Monday, 19 Oct 2026 · 7:00 PM – 9:00 PM IST',
    location: 'Festival Pandals',
    category: 'Cultural Evening Celebration',
  },
  {
    id: 'dashami-visarjan-2026',
    title: 'Bijoya Dashami Sindoor Khela & Visarjan (Uma Boron)',
    bengali: 'বিজয়া দশমী সিঁদুর খেলা ও বিসর্জন',
    description: 'Sindoor Khela, tender farewell to Maa Durga, and Subho Bijoya greetings with mishti. Chapter 07 of Uma Boron.',
    startUTC: '20261020T103000Z',
    endUTC: '20261020T133000Z',
    localDisplay: 'Tuesday, 20 Oct 2026 · 4:00 PM – 7:00 PM IST',
    location: 'River Ghat & Immersion Procession',
    category: 'Farewell & Bijoya',
  },
]

export function generateICSContent(events = pujoCalendarEvents) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Uma Boron//Durga Puja 2026 Festival Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Uma Boron · Durga Puja 2026',
    'X-WR-TIMEZONE:Asia/Kolkata',
  ]

  events.forEach((ev) => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@umaboron.app`)
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`)
    lines.push(`DTSTART:${ev.startUTC}`)
    lines.push(`DTEND:${ev.endUTC}`)
    lines.push(`SUMMARY:${ev.title}`)
    lines.push(`DESCRIPTION:${ev.description}`)
    lines.push(`LOCATION:${ev.location}`)
    lines.push('STATUS:CONFIRMED')
    lines.push('BEGIN:VALARM')
    lines.push('TRIGGER:-PT30M')
    lines.push('ACTION:DISPLAY')
    lines.push(`DESCRIPTION:Reminder: ${ev.title} starts in 30 minutes`)
    lines.push('END:VALARM')
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function generateGoogleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.startUTC}/${event.endUTC}`,
    details: event.description,
    location: event.location,
    ctz: 'Asia/Kolkata',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadICSFile(filename = 'uma-boron-durga-puja-2026.ics', events = pujoCalendarEvents) {
  const icsData = generateICSContent(events)
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
