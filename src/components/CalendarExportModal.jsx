import { useState } from 'react'
import {
  Bell,
  Calendar,
  Check,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  X,
} from 'lucide-react'
import { downloadICSFile, generateGoogleCalendarUrl, pujoCalendarEvents } from '../data/calendarEvents'

export default function CalendarExportModal({ isOpen, onClose, onToast }) {
  const [downloadedAll, setDownloadedAll] = useState(false)
  const [downloadedSingle, setDownloadedSingle] = useState({})

  if (!isOpen) return null

  const handleDownloadAll = () => {
    downloadICSFile('uma-boron-durga-puja-2026-complete.ics', pujoCalendarEvents)
    setDownloadedAll(true)
    setTimeout(() => setDownloadedAll(false), 4000)
    if (onToast) onToast('Calendar downloaded! Open the file to add all Pujo events to your calendar.')
  }

  const handleDownloadSingle = (event) => {
    downloadICSFile(`${event.id}.ics`, [event])
    setDownloadedSingle((prev) => ({ ...prev, [event.id]: true }))
    setTimeout(() => {
      setDownloadedSingle((prev) => ({ ...prev, [event.id]: false }))
    }, 4000)
    if (onToast) onToast(`Downloaded "${event.title}" calendar reminder.`)
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="cal-modal-title">
      <div className="app-modal-dialog calendar-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="badge-row">
              <span className="gold-chip"><Calendar size={13} /> Festival Reminders</span>
              <span className="subtle-chip">RFC 5545 iCalendar Standard</span>
            </div>
            <h2 id="cal-modal-title">Add Pujo to Your Calendar</h2>
            <p>
              Add individual rituals directly to Google Calendar, or download the complete .ics schedule for Google Calendar, Apple Calendar, and Outlook.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close calendar export modal">
            <X size={20} />
          </button>
        </div>

        {/* Global Download Bar */}
        <div className="calendar-bulk-banner">
          <div>
            <strong>Complete Festival Schedule ({pujoCalendarEvents.length} Events)</strong>
            <p>Includes alarm reminders 30 minutes before every ritual & dawn broadcast.</p>
          </div>
          <button
            type="button"
            className="primary-action bulk-download-btn"
            onClick={handleDownloadAll}
          >
            {downloadedAll ? <Check size={16} /> : <Download size={16} />}
            <span>{downloadedAll ? 'Downloaded All .ICS!' : 'Download All (.ics)'}</span>
          </button>
        </div>

        {/* Event List */}
        <div className="calendar-events-list">
          {pujoCalendarEvents.map((ev) => (
            <div key={ev.id} className="calendar-event-row">
              <div className="event-details">
                <span className="event-category-badge">{ev.category}</span>
                <h3 className="event-title">{ev.title}</h3>
                <h4 className="event-bengali-title" lang="bn">{ev.bengali}</h4>
                <div className="event-time-meta">
                  <span><Clock size={14} className="text-gold" /> {ev.localDisplay}</span>
                  <span><MapPin size={14} /> {ev.location}</span>
                </div>
                <p className="event-desc">{ev.description}</p>
              </div>

              <div className="event-action-side">
                <a
                  className="primary-action google-calendar-btn"
                  href={generateGoogleCalendarUrl(ev)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Add ${ev.title} to Google Calendar`}
                >
                  <Calendar size={15} />
                  <span>Google Calendar</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  className="secondary-action single-download-btn"
                  onClick={() => handleDownloadSingle(ev)}
                >
                  {downloadedSingle[ev.id] ? <Check size={15} /> : <Download size={15} />}
                  <span>{downloadedSingle[ev.id] ? 'Downloaded' : 'Download .ics'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <small>
            <Bell size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Google Calendar links open a pre-filled event for your confirmation. Full automatic two-way sync is intentionally not enabled because it requires additional Google Calendar permissions.
          </small>
        </div>
      </div>
    </div>
  )
}
