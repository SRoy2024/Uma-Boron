import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, LockKeyhole } from 'lucide-react'
import { FESTIVAL_TIME_ZONE, festivalSchedule, getCountdownParts } from '../lib/festivalSchedule'

const pad = (value) => String(value).padStart(2, '0')

export default function FestivalGate({ chapter, onCalendar }) {
  const schedule = festivalSchedule[chapter.id]
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdown = useMemo(() => getCountdownParts(schedule.unlockAt, now), [schedule.unlockAt, now])
  const remainingHours = countdown.days * 24 + countdown.hours
  const hourAngle = ((remainingHours % 12) + countdown.minutes / 60) * 30
  const minuteAngle = (countdown.minutes + countdown.seconds / 60) * 6
  const secondAngle = countdown.seconds * 6

  return (
    <section className="festival-gate" aria-labelledby="festival-gate-title">
      <div className="festival-clock" aria-hidden="true">
        <span className="clock-mark mark-12">12</span>
        <span className="clock-mark mark-3">3</span>
        <span className="clock-mark mark-6">6</span>
        <span className="clock-mark mark-9">9</span>
        <span className="clock-hand hour-hand" style={{ '--clock-angle': `${hourAngle}deg` }} />
        <span className="clock-hand minute-hand" style={{ '--clock-angle': `${minuteAngle}deg` }} />
        <span className="clock-hand second-hand" style={{ '--clock-angle': `${secondAngle}deg` }} />
        <span className="clock-pin" />
      </div>

      <div className="festival-gate-copy">
        <span className="gate-kicker"><LockKeyhole size={15} /> Festival chapter locked</span>
        <h2 id="festival-gate-title">{chapter.name} opens on {schedule.dateLabel}</h2>
        <p>
          This experience follows the Durga Puja calendar in {FESTIVAL_TIME_ZONE}. Come back when the chapter begins.
        </p>
        <div className="countdown-readout" role="timer" aria-live="polite">
          <span><strong>{pad(countdown.days)}</strong><small>days</small></span>
          <span><strong>{pad(countdown.hours)}</strong><small>hours</small></span>
          <span><strong>{pad(countdown.minutes)}</strong><small>minutes</small></span>
          <span><strong>{pad(countdown.seconds)}</strong><small>seconds</small></span>
        </div>
        <div className="festival-gate-actions">
          <button type="button" className="primary-action" onClick={onCalendar}><CalendarDays size={16} />Add Puja reminders</button>
        </div>
        <span className="gate-note"><Clock3 size={14} /> Unlocks at 12:00 AM in Kolkata on {schedule.dateLabel}.</span>
      </div>
    </section>
  )
}
