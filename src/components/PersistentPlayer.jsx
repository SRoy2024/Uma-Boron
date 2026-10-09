import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Disc3,
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'

export const radioSources = [
  {
    id: 'mahalaya-broadcast',
    kind: 'broadcast',
    title: 'Mahishasura Mardini · Full Mahalaya',
    curator: 'Birendra Krishna Bhadra',
    detail: 'Heritage dawn broadcast',
    firstVideoId: 'D6KKRpGUsOQ',
    externalUrl: 'https://www.youtube.com/watch?v=D6KKRpGUsOQ',
  },
  {
    id: 'jago-tumi-jago',
    kind: 'heritage',
    title: 'Jago Tumi Jago',
    curator: 'Dwijen Mukhopadhyay',
    detail: 'Agomoni classic',
    firstVideoId: 'Iuz50A66-_4',
    externalUrl: 'https://www.youtube.com/watch?v=Iuz50A66-_4',
  },
  {
    id: 'dhaaker-taale',
    kind: 'heritage',
    title: 'Dhaaker Taale Komor Dole',
    curator: 'Abhijeet & Shreya Ghoshal',
    detail: 'Festive Pujo classic',
    firstVideoId: 'hbXuXt7gkFY',
    externalUrl: 'https://www.youtube.com/watch?v=hbXuXt7gkFY',
  },
  {
    id: 'dhak-shankho',
    kind: 'heritage',
    title: 'Kolkata Pujo Dhak & Shankho',
    curator: 'Traditional Bengal',
    detail: 'Sandhi aarti ambience',
    firstVideoId: 'Uv_X0jVf2sE',
    externalUrl: 'https://www.youtube.com/watch?v=Uv_X0jVf2sE',
  },
  {
    id: 'bolo-dugga',
    kind: 'heritage',
    title: 'Bolo Dugga Maiki',
    curator: 'Arijit Singh & Jeet Gannguli',
    detail: 'Dashami farewell',
    firstVideoId: 'mH_z5L-3r3w',
    externalUrl: 'https://www.youtube.com/watch?v=mH_z5L-3r3w',
  },
  {
    id: 'svf-hits',
    kind: 'playlist',
    title: 'Durga Pujo All Time Hits',
    curator: 'SVF Music',
    detail: '49 tracks · 11+ hours',
    firstVideoId: '2U416kTo0as',
    playlistId: 'PLzxTmXYDR-xXsGG4aFvMTzOgtcMDbG4xc',
    externalUrl: 'https://music.youtube.com/playlist?list=PLzxTmXYDR-xXsGG4aFvMTzOgtcMDbG4xc',
  },
  {
    id: 'bangla-special',
    kind: 'playlist',
    title: 'Bengali Durga Puja Special Songs',
    curator: 'The Super Bangla',
    detail: '21 tracks · 2+ hours',
    firstVideoId: 'E2zfQEo7Q_M',
    playlistId: 'PLEWEj5NdvUqJeYfSDC4jJQXGgw92vNb6k',
    externalUrl: 'https://music.youtube.com/playlist?list=PLEWEj5NdvUqJeYfSDC4jJQXGgw92vNb6k',
  },
]

export default function PersistentPlayer({ isOpen, onOpen, onClose, requestedSourceId }) {
  const [activeSourceId, setActiveSourceId] = useState('mahalaya-broadcast')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [embedStatus, setEmbedStatus] = useState('loading')
  const [autoplay, setAutoplay] = useState(false)
  const iframeRef = useRef(null)

  const activeSource = radioSources.find((item) => item.id === activeSourceId) ?? radioSources[0]
  const listParameter = activeSource.playlistId ? `&list=${activeSource.playlistId}` : ''
  const embedUrl = `https://www.youtube.com/embed/${activeSource.firstVideoId}?autoplay=${autoplay ? 1 : 0}&controls=1&playsinline=1&enablejsapi=1&rel=0${listParameter}&origin=${encodeURIComponent(window.location.origin)}&widget_referrer=${encodeURIComponent(window.location.href)}`

  const commandPlayer = (func, args = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube.com',
    )
  }

  useEffect(() => {
    if (!requestedSourceId) return
    const requested = radioSources.find((source) => source.id === requestedSourceId)
    if (!requested) return
    setActiveSourceId(requested.id)
    setAutoplay(true)
    setIsPlaying(false)
    setEmbedStatus('loading')
  }, [requestedSourceId])

  useEffect(() => {
    const handleMessage = (event) => {
      if (!['https://www.youtube.com', 'https://www.youtube-nocookie.com'].includes(event.origin)) return
      if (event.source !== iframeRef.current?.contentWindow) return
      let payload = event.data
      try {
        if (typeof payload === 'string') payload = JSON.parse(payload)
      } catch {
        return
      }
      if (payload?.event === 'onReady') setEmbedStatus('ready')
      if (payload?.event === 'onError') setEmbedStatus('blocked')
      if (payload?.event === 'onStateChange') setIsPlaying(payload.info === 1)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (embedStatus !== 'loading') return undefined
    const fallbackTimer = window.setTimeout(() => setEmbedStatus('blocked'), 3200)
    return () => window.clearTimeout(fallbackTimer)
  }, [activeSourceId, embedStatus])

  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'uma-boron-pujo-radio' }),
      'https://www.youtube.com',
    )
    commandPlayer('addEventListener', ['onReady'])
    commandPlayer('addEventListener', ['onStateChange'])
    commandPlayer('addEventListener', ['onError'])
  }

  const loadSource = (source) => {
    setActiveSourceId(source.id)
    setAutoplay(true)
    setIsPlaying(false)
    setEmbedStatus('loading')
    onOpen()
  }

  const openExternalSource = () => {
    window.open(activeSource.externalUrl, '_blank', 'noopener,noreferrer')
  }

  const togglePlay = () => {
    onOpen()
    if (embedStatus !== 'ready') {
      openExternalSource()
      return
    }
    if (isPlaying) commandPlayer('pauseVideo')
    else commandPlayer('playVideo')
    setIsPlaying((value) => !value)
  }

  const toggleMute = () => {
    if (embedStatus !== 'ready') return
    if (isMuted) commandPlayer('unMute')
    else commandPlayer('mute')
    setIsMuted((value) => !value)
  }

  return (
    <>
      {!isOpen && (
        <button type="button" className="deluxe-mini-bubble" onClick={onOpen} aria-label="Open Uma Boron Pujo Radio">
          <span className={`mini-disc ${isPlaying ? 'is-spinning' : ''}`}><Disc3 size={21} /></span>
          <span className="mini-text-stack">
            <strong className="mini-title">Uma Boron Radio</strong>
            <small className="mini-status">{isPlaying ? `Playing · ${activeSource.curator}` : 'Heritage radio + 2 added playlists'}</small>
          </span>
          <ChevronUp size={17} className="mini-arrow" />
        </button>
      )}

      <aside className={`deluxe-bottom-bar ${isOpen ? 'is-visible' : 'is-hidden'}`} aria-label="Uma Boron Pujo Radio">
        <div className="deluxe-radio-heading">
          <div className="deluxe-radio-brand">
            <span className={`deluxe-vinyl-disc ${isPlaying ? 'is-spinning' : ''}`}><Radio size={16} /></span>
            <div><small>HERITAGE RADIO · ADDED PLAYLISTS</small><strong>Uma Boron Pujo Player</strong></div>
          </div>
          <button type="button" className="deluxe-collapse-btn" onClick={onClose} aria-label="Minimize player"><ChevronDown size={19} /></button>
        </div>

        <div className="deluxe-player-grid">
          <div className="deluxe-youtube-viewport" aria-label="YouTube player">
            <iframe
              key={embedUrl}
              ref={iframeRef}
              src={embedUrl}
              title={`${activeSource.title} player`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="origin"
              allowFullScreen
              loading="lazy"
              onLoad={handleIframeLoad}
            />
            {embedStatus === 'loading' && <div className="deluxe-player-loading"><Disc3 size={28} /> Connecting to the broadcast…</div>}
            {embedStatus === 'blocked' && (
              <div className="deluxe-player-fallback">
                <Radio size={31} />
                <strong>Playback is blocked inside this preview browser.</strong>
                <span>The recording itself is available—open the verified source to play it.</span>
                <button type="button" onClick={openExternalSource}><Play size={15} fill="currentColor" /> Play this source</button>
              </div>
            )}
          </div>

          <div className="deluxe-track-display">
            <span className="deluxe-track-badge">{activeSource.kind === 'playlist' ? 'ADDED PLAYLIST' : 'HERITAGE RADIO'} · {activeSource.detail}</span>
            <h2>{activeSource.title}</h2>
            <p>{activeSource.curator}</p>
            <div className="deluxe-native-controls-note">
              <Volume2 size={15} />
              <span>{embedStatus === 'blocked' ? 'Use the source button for reliable playback in this browser.' : 'Queue, timeline and volume remain available in the video controls.'}</span>
            </div>
            <div className="deluxe-player-actions">
              <button type="button" onClick={() => commandPlayer('previousVideo')} aria-label="Previous song" disabled={activeSource.kind !== 'playlist' || embedStatus !== 'ready'}><SkipBack size={17} /></button>
              <button type="button" className="deluxe-play-btn" onClick={togglePlay} aria-label={embedStatus === 'blocked' ? 'Play on source' : isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              </button>
              <button type="button" onClick={() => commandPlayer('nextVideo')} aria-label="Next song" disabled={activeSource.kind !== 'playlist' || embedStatus !== 'ready'}><SkipForward size={17} /></button>
              <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'} disabled={embedStatus !== 'ready'}>{isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
            </div>
          </div>
        </div>

        <div className="deluxe-playlist-drawer">
          <div className="deluxe-playlist-header"><ListMusic size={15} /><strong>Heritage broadcasts and added playlists</strong></div>
          <div className="deluxe-playlist-cards">
            {radioSources.map((source) => (
              <button type="button" key={source.id} className={source.id === activeSource.id ? 'is-active' : ''} onClick={() => loadSource(source)}>
                <span className="playlist-card-play"><Play size={14} fill="currentColor" /></span>
                <span><strong>{source.title}</strong><small>{source.curator} · {source.detail}</small></span>
              </button>
            ))}
          </div>
          <a href={activeSource.externalUrl} target="_blank" rel="noreferrer">Open the current source <ExternalLink size={13} /></a>
        </div>
      </aside>
    </>
  )
}
