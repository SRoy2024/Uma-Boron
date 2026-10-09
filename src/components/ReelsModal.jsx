import { useMemo, useState } from 'react'
import {
  Camera,
  ExternalLink,
  Film,
  MapPin,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import { useFestivalReels } from '../hooks/useFestivalReels'

export default function ReelsModal({ isOpen, onClose, initialChapter = 'all' }) {
  const [selectedChapter, setSelectedChapter] = useState(initialChapter)
  const { reels, source } = useFestivalReels()

  const chapterFilters = [
    { id: 'all', label: 'All Days' },
    { id: 'mahalaya', label: 'Mahalaya' },
    { id: 'panchami', label: 'Panchami' },
    { id: 'shashthi', label: 'Shashthi' },
    { id: 'saptami', label: 'Saptami' },
    { id: 'ashtami', label: 'Ashtami' },
    { id: 'navami', label: 'Navami' },
    { id: 'dashami', label: 'Dashami' },
  ]

  const filteredReels = useMemo(() => {
    if (selectedChapter === 'all') return reels
    return reels.filter((r) => r.chapterId === selectedChapter)
  }, [selectedChapter, reels])

  if (!isOpen) return null

  return (
    <div className="app-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reels-modal-title">
      <div className="app-modal-dialog reels-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="badge-row">
              <span className="gold-chip"><Film size={13} /> Curated Festival Moments</span>
              <span className="subtle-chip">{source === 'live' ? 'Live moderated feed' : 'Verified fallback feed'}</span>
            </div>
            <h2 id="reels-modal-title">Festival Reels & Visual Moments</h2>
            <p>
              Hand-picked reels capturing the sounds, morning light, and devotion across Bengal and diaspora celebrations.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close reels modal">
            <X size={20} />
          </button>
        </div>

        {/* Chapter Filter Pills */}
        <div className="reels-filter-tabs" role="tablist">
          {chapterFilters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab ${selectedChapter === tab.id ? 'is-active' : ''}`}
              onClick={() => setSelectedChapter(tab.id)}
              role="tab"
              aria-selected={selectedChapter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reels Grid */}
        <div className="reels-cards-scroll-area">
          <div className="reels-card-grid">
            {filteredReels.map((reel) => (
              <article key={reel.id} className="reel-card-item">
                <div
                  className="reel-poster-canvas"
                  style={{
                    backgroundColor: '#2b1d16',
                    backgroundImage: reel.thumbnailUrl ? `linear-gradient(180deg, rgba(16, 9, 5, .08), rgba(16, 9, 5, .88)), url(${reel.thumbnailUrl})` : reel.thumbnailGradient,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                >
                  <div className="poster-overlay-top">
                    <span className="reel-day-pill">{reel.dayName}</span>
                    <span className="creator-credit-pill">
                      <Camera size={12} /> {reel.creator}
                    </span>
                  </div>

                  <div className="poster-content-center">
                    <span className="reel-bengali-kicker" lang="bn">{reel.bengaliTitle}</span>
                    <h3 className="reel-title-text">{reel.title}</h3>
                  </div>

                  <div className="poster-overlay-bottom">
                    <div className="location-tag">
                      <MapPin size={13} />
                      <span>{reel.location}</span>
                    </div>

                    <a
                      href={reel.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-action watch-on-ig-btn"
                    >
                      <Play size={15} fill="currentColor" />
                      <span>Watch on {reel.platform}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <div className="reel-meta-footer">
                  <p className="reel-summary-text">{reel.summary}</p>
                  <div className="reel-tag-chips">
                    {reel.tags.map((t) => (
                      <span key={t} className="tag-chip">{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="modal-footer reels-modal-footer">
          <div className="reels-footer-note">
            <Sparkles size={14} className="text-gold" />
            <span>
              All video moments attribute original photographers and creators. No artificial view counts or fabricated popularity metrics are displayed.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
