import { BellRing, CalendarDays, UserPlus, X } from 'lucide-react'

export default function FestivalReminderPrompt({ open, signedIn, onClose, onSignUp, onCalendar }) {
  if (!open) return null

  return (
    <aside className="festival-reminder-prompt" role="dialog" aria-label="Durga Puja reminders">
      <button type="button" className="reminder-dismiss" onClick={onClose} aria-label="Dismiss reminder invitation"><X size={16} /></button>
      <span className="reminder-icon"><BellRing size={20} /></span>
      <div>
        <span className="reminder-eyebrow">Never miss the sacred hour</span>
        <h2>Get reminders for Anjali, Sandhi Puja and Visarjan.</h2>
        <p>Keep the verified Uma Boron festival calendar close, and receive account-ready event updates.</p>
      </div>
      <div className="reminder-actions">
        {!signedIn && <button type="button" className="primary-action" onClick={onSignUp}><UserPlus size={15} />Sign up</button>}
        <button type="button" className="secondary-action" onClick={onCalendar}><CalendarDays size={15} />Open calendar</button>
      </div>
    </aside>
  )
}
