import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronDown,
  Compass,
  Eye,
  Film,
  Heart,
  Languages,
  LockKeyhole,
  LogIn,
  MapPin,
  Menu,
  Music2,
  Navigation,
  UserRound,
  UserPlus,
  X,
} from 'lucide-react'
import { chapters, getChapterCopy, languages } from './data/chapters'
import ChapterExperience from './components/ChapterExperience'
import MemoryPanel from './components/MemoryPanel'
import PersistentPlayer from './components/PersistentPlayer'
import AuthDialog from './components/AuthDialog'
import LocationWeatherBar, { popularCities } from './components/LocationWeatherBar'
import NearbyPujosModal from './components/NearbyPujosModal'
import ReelsModal from './components/ReelsModal'
import CalendarExportModal from './components/CalendarExportModal'
import SupportModal from './components/SupportModal'
import PandalMapSection from './components/PandalMapSection'
import ReelsStreamSection from './components/ReelsStreamSection'
import FestivalGate from './components/FestivalGate'
import { isAdminSession, isEditorSession } from './lib/authAccess'
import FestivalReminderPrompt from './components/FestivalReminderPrompt'
import { hasSupabaseConfig, supabase } from './lib/supabase'
import { isChapterUnlocked } from './lib/festivalSchedule'
import mahalayaBackground from './assets/generated/mahalaya-dawn.webp'
import durgaPratimaReal from './assets/generated/durga-pratima-real.jpg'
import pandalRevealReal from './assets/generated/pandal-reveal-real.jpg'
import dhunuchiAartiReal from './assets/generated/dhunuchi-aarti-real.jpg'
import dashamiGhatReal from './assets/generated/dashami-ghat-real.jpg'
import './App.css'

const backgroundByChapter = {
  mahalaya: mahalayaBackground,
  panchami: durgaPratimaReal,
  shashthi: pandalRevealReal,
  saptami: durgaPratimaReal,
  ashtami: durgaPratimaReal,
  navami: dhunuchiAartiReal,
  dashami: dashamiGhatReal,
}

const radioSourceByChapter = {
  mahalaya: 'mahalaya-broadcast',
  panchami: 'jago-tumi-jago',
  shashthi: 'dhaaker-taale',
  saptami: 'dhaaker-taale',
  ashtami: 'jago-tumi-jago',
  navami: 'dhak-shankho',
  dashami: 'bolo-dugga',
}

const unresolvedLocation = {
  id: 'location-not-set',
  name: 'Choose your location',
  country: '',
  lat: null,
  lng: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time',
  isPending: true,
}

function readSavedHometown() {
  try {
    const saved = window.localStorage.getItem('uma_boron_hometown')
    if (!saved) return popularCities[0]
    const candidate = JSON.parse(saved)
    const lat = Number(candidate?.lat)
    const lng = Number(candidate?.lng)
    if (
      typeof candidate?.name !== 'string' || candidate.name.trim().length === 0 || candidate.name.length > 120 ||
      !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lng) || lng < -180 || lng > 180
    ) return popularCities[0]
    return { ...candidate, name: candidate.name.trim(), lat, lng }
  } catch {
    return popularCities[0]
  }
}

function App() {
  const [activeChapter, setActiveChapter] = useState('mahalaya')
  const [language, setLanguage] = useState('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState('signin')
  const [session, setSession] = useState(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerSourceId, setPlayerSourceId] = useState('mahalaya-broadcast')
  const [toast, setToast] = useState('')
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  // Modals
  const [pujosModalOpen, setPujosModalOpen] = useState(false)
  const [reelsModalOpen, setReelsModalOpen] = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)

  // Location & Hometown Context (Default hometown = Kolkata)
  const [currentLocation, setCurrentLocation] = useState(unresolvedLocation)
  const [hometown, setHometown] = useState(readSavedHometown)
  const [activeContext, setActiveContext] = useState('around_me') // 'around_me' | 'back_home'

  const chapter = useMemo(
    () => chapters.find((item) => item.id === activeChapter) ?? chapters[0],
    [activeChapter],
  )
  const copy = getChapterCopy(chapter, language)
  const isAdmin = isAdminSession(session)
  const isEditor = isEditorSession(session)
  const chapterUnlocked = isChapterUnlocked(activeChapter, now, isEditor)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (
        event === 'SIGNED_IN' &&
        nextSession?.user?.app_metadata?.provider === 'google' &&
        !nextSession?.user?.user_metadata?.password_enabled
      ) {
        setAuthInitialMode('password')
        setAuthOpen(true)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try { window.localStorage.setItem('uma_boron_hometown', JSON.stringify(hometown)) } catch {}
  }, [hometown])

  useEffect(() => {
    if (session || window.sessionStorage.getItem('uma_reminder_prompt_seen')) return undefined
    const timer = window.setTimeout(() => {
      setReminderOpen(true)
      window.sessionStorage.setItem('uma_reminder_prompt_seen', 'true')
    }, 6500)
    return () => window.clearTimeout(timer)
  }, [session])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const chooseChapter = (id) => {
    setActiveChapter(id)
    setMenuOpen(false)
  }

  const startListening = (sourceId) => {
    setPlayerSourceId(sourceId || radioSourceByChapter[activeChapter] || 'mahalaya-broadcast')
    setPlayerOpen(true)
  }

  const openAuth = (mode = 'signin') => {
    setAuthInitialMode(mode)
    setAuthOpen(true)
  }

  return (
    <div className={`app-shell chapter-${activeChapter}`} style={{ '--chapter-image': `url(${backgroundByChapter[activeChapter]})` }}>
      <a className="skip-link" href="#chapter-experience">Skip to chapter experience</a>

      <header className="site-header">
        <button className="brand" type="button" onClick={() => chooseChapter('mahalaya')} aria-label="Uma Boron home">
          <span className="brand-bengali" aria-hidden="true">উমা</span>
          <span className="brand-lockup"><strong>Uma Boron</strong><small>Durga Puja 2026 · v1.0</small></span>
        </button>

        {/* Quick Discovery Navigation Chips */}
        <div className="header-quick-links">
          <a
            href="#nearby-pujos-map"
            className="quick-chip"
            aria-label="Jump to Nearby Pandals and Google Maps Directions"
          >
            <Navigation size={14} className="text-gold" />
            <span>Nearby Pandals & Maps</span>
          </a>
          <a
            href="#festival-reels-stream"
            className="quick-chip"
            aria-label="Jump to Curated Festival Reels"
          >
            <Film size={14} className="text-gold" />
            <span>Moments & Reels</span>
          </a>
          <button
            type="button"
            className="quick-chip"
            onClick={() => setCalendarModalOpen(true)}
            aria-label="Add to Calendar"
          >
            <CalendarDays size={14} className="text-gold" />
            <span>Calendar</span>
          </button>
        </div>

        <div className="header-actions">
          {isEditor && <span className="preview-chip is-on editor-access-chip"><Eye size={16} /><span>{isAdmin ? 'Admin' : 'Editor'} access · All open</span></span>}
          <label className="language-select">
            <Languages size={16} aria-hidden="true" />
            <span className="sr-only">Interface language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
          {session ? (
            <button className="account-button" type="button" onClick={() => openAuth('signin')} aria-label="Open your Uma Boron account">
              <UserRound size={17} />
              <span>{session?.user?.user_metadata?.full_name || session?.user?.email}</span>
            </button>
          ) : (
            <div className="auth-entry-actions">
              <button className="account-button" type="button" onClick={() => openAuth('signin')} aria-label="Sign in to Uma Boron"><LogIn size={17} /><span>Sign in</span></button>
              <button className="signup-button" type="button" onClick={() => openAuth('signup')} aria-label="Create an Uma Boron account"><UserPlus size={16} /><span>Sign up</span></button>
            </div>
          )}
          <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="explore-menu">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
            <span>Explore</span>
          </button>
        </div>
      </header>

      {isEditor && (
        <div className="preview-banner editor-banner" role="status">
          <Eye size={15} aria-hidden="true" />
          Administrator access active for {session?.user?.email} — every festival chapter is available for developer review.
        </div>
      )}

      {/* Location, Hometown & Real Weather Context Bar */}
      <LocationWeatherBar
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        hometown={hometown}
        onHometownChange={setHometown}
        activeContext={activeContext}
        onContextChange={setActiveContext}
        onToast={setToast}
        modalOpen={locationModalOpen}
        onModalOpenChange={setLocationModalOpen}
      />

      <nav className="chapter-nav" aria-label="Festival chapters">
        {chapters.map((item, index) => {
          const unlocked = isChapterUnlocked(item.id, now, isEditor)
          return (
            <button
              key={item.id}
              className={`${activeChapter === item.id ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}`}
              type="button"
              onClick={() => chooseChapter(item.id)}
              aria-current={activeChapter === item.id ? 'page' : undefined}
              aria-label={`${item.name}${unlocked ? '' : ' — locked until its festival date'}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.name}</strong>
              <small>{item.bn}</small>
              {!unlocked && <LockKeyhole className="chapter-lock-icon" size={13} aria-hidden="true" />}
            </button>
          )
        })}
      </nav>

      {/* Widescreen Interactive Ritual Center Console */}
      <main className="chapter-stage widescreen-console-stage" id="chapter-experience">
        <div className="stage-scrim" aria-hidden="true" />
        <section className="chapter-intro" aria-labelledby="chapter-title">
          <p className="chapter-eyebrow">{copy.eyebrow}</p>
          <p className="chapter-bengali" lang="bn">{chapter.bn}</p>
          <h1 id="chapter-title">{copy.title}</h1>
          <p className="chapter-description">{copy.description}</p>
          <div className="chapter-meta">
            <span><CalendarDays size={15} />Editorial date verified · Oct 2026</span>
            <span><MapPin size={15} />{activeContext === 'back_home' ? hometown.name : (currentLocation.isPending ? 'Location not set' : currentLocation.name)} · {(activeContext === 'back_home' ? hometown.timezone : currentLocation.timezone)}</span>
          </div>
        </section>

        {/* Center Console Full-Width Stage */}
        <div className="grand-center-console">
          {chapterUnlocked ? (
            <ChapterExperience
              chapter={chapter}
              language={language}
              onListen={startListening}
              session={session}
              onRequireAuth={() => openAuth('signin')}
              onToast={setToast}
            />
          ) : (
            <FestivalGate chapter={chapter} onCalendar={() => setCalendarModalOpen(true)} />
          )}
        </div>
      </main>

      {/* Section 1: Who Are You Missing? (Memory & Nostalgia Console) */}
      <section className="nostalgia-console-wrap" id="nostalgia-console">
        <div className="console-inner-constraint">
          <MemoryPanel
            chapter={chapter}
            language={language}
            session={session}
            onRequireAuth={() => openAuth('signin')}
            onToast={setToast}
          />
        </div>
      </section>

      {/* Section 2: On-Screen Living Moments & Curated Reels Stream */}
      <ReelsStreamSection />

      {/* Section 3: On-Screen Nearby Pujo Pandals & Interactive Radar Map */}
      <PandalMapSection
        userLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        onRequestLocation={() => setLocationModalOpen(true)}
        onToast={setToast}
      />

      {/* Explore Drawer */}
      <aside className={`explore-drawer ${menuOpen ? 'is-open' : ''}`} id="explore-menu" aria-hidden={!menuOpen}>
        <div className="drawer-header"><span>Beyond this chapter</span><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close explore menu"><X size={19} /></button></div>
        <div className="drawer-grid">
          <a href="#nearby-pujos-map" onClick={() => setMenuOpen(false)}>
            <Compass size={20} />
            <span><strong>Nearby Pujos & Pandals</strong><small>Kolkata, Bengaluru, Delhi & Maps directions</small></span>
          </a>
          <button type="button" onClick={() => { setCalendarModalOpen(true); setMenuOpen(false) }}>
            <CalendarDays size={20} />
            <span><strong>Calendar & Reminders (.ics)</strong><small>Instant offline export for Google/Apple Calendar</small></span>
          </button>
          <a href="#festival-reels-stream" onClick={() => setMenuOpen(false)}>
            <Film size={20} />
            <span><strong>Curated Festival Reels</strong><small>Explore 7 chapters of authentic moments</small></span>
          </a>
          <button type="button" onClick={() => { setPlayerOpen(true); setMenuOpen(false) }}>
            <Music2 size={20} />
            <span><strong>Uma Boron Radio</strong><small>Deluxe continuous YouTube-powered Pujo station</small></span>
          </button>
          <button type="button" onClick={() => { setSupportModalOpen(true); setMenuOpen(false) }}>
            <Heart size={20} />
            <span><strong>Support Artists & Engineering</strong><small>Independent digital preservation of Durga Puja</small></span>
          </button>
        </div>
        <p className="drawer-note">
          Verified directory records link directly to Google Maps navigation. Organiser schedules are independent of Panjika astronomical observances.
        </p>
      </aside>

      {/* Additional Modals for Deep Direct Actions */}
      <NearbyPujosModal
        isOpen={pujosModalOpen}
        onClose={() => setPujosModalOpen(false)}
      />

      <ReelsModal
        isOpen={reelsModalOpen}
        onClose={() => setReelsModalOpen(false)}
        initialChapter={activeChapter}
      />

      <CalendarExportModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        onToast={setToast}
      />

      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        onToast={setToast}
      />

      <PersistentPlayer
        chapter={chapter}
        requestedSourceId={playerSourceId}
        isOpen={playerOpen}
        onOpen={() => setPlayerOpen(true)}
        onClose={() => setPlayerOpen(false)}
      />

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        session={session}
        configured={hasSupabaseConfig}
        initialMode={authInitialMode}
        onToast={setToast}
      />

      <FestivalReminderPrompt
        open={reminderOpen}
        signedIn={Boolean(session)}
        onClose={() => setReminderOpen(false)}
        onSignUp={() => { setReminderOpen(false); openAuth('signup') }}
        onCalendar={() => { setReminderOpen(false); setCalendarModalOpen(true) }}
      />

      {toast && <div className="toast" role="status">{toast}</div>}
      
      <footer className="site-credit">
        <span>Created by Soham Roy · Uma Boron, Durga Puja 2026</span>
        <button type="button" className="footer-support-link" onClick={() => setSupportModalOpen(true)}>
          <Heart size={13} fill="currentColor" /> Support the project
        </button>
      </footer>
    </div>
  )
}

export default App
