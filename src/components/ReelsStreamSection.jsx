import { useMemo, useState } from 'react'
import {
  Camera,
  ExternalLink,
  Film,
  MapPin,
  Play,
  Sparkles,
} from 'lucide-react'
import { reelsData } from '../data/reels'

export default function ReelsStreamSection() {
  const [activeDay, setActiveDay] = useState('all')

  const filterTabs = [
    { id: 'all', label: 'All 7 Chapters' },
    { id: 'mahalaya', label: 'Mahalaya' },
    { id: 'panchami', label: 'Panchami' },
    { id: 'shashthi', label: 'Shashthi' },
    { id: 'saptami', label: 'Saptami' },
    { id: 'ashtami', label: 'Ashtami' },
    { id: 'navami', label: 'Navami' },
    { id: 'dashami', label: 'Dashami' },
  ]

  const visibleReels = useMemo(() => {
    if (activeDay === 'all') return reelsData
    return reelsData.filter((r) => r.chapterId === activeDay)
  }, [activeDay])

  return (
    <section className="reels-stream-section" id="festival-reels-stream" aria-labelledby="reels-stream-title">
      <div className="section-header-block">
        <span className="section-badge"><Film size={14} /> Authentic Festival Moments</span>
        <h2 id="reels-stream-title">Living Moments & Curated Reels</h2>
        <p>
          Real video reels capturing the morning fog of Mahalaya, artisan hands at Kumartuli, glowing Bodhon pandals, and the Dhunuchi frenzy.
        </p>
      </div>

      <div className="reels-filter-row">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`stream-filter-btn ${activeDay === tab.id ? 'active' : ''}`}
            onClick={() => setActiveDay(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reels-stream-grid">
        {visibleReels.map((reel) => (
          <article key={reel.id} className="stream-reel-card">
            <div
              className="stream-reel-poster"
              style={{ background: reel.thumbnailGradient }}
            >
              <div className="poster-top-bar">
                <span className="day-badge">{reel.dayName}</span>
                <span className="creator-badge">
                  <Camera size={12} /> {reel.creator}
                </span>
              </div>

              <div className="poster-center-content">
                <span className="bengali-kicker" lang="bn">{reel.bengaliTitle}</span>
                <h3 className="reel-headline">{reel.title}</h3>
              </div>

              <div className="poster-bottom-bar">
                <div className="location-pin">
                  <MapPin size={13} />
                  <span>{reel.location}</span>
                </div>

                <a
                  href={reel.reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-ig-pill"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Watch on Instagram</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="stream-reel-caption">
              <p>{reel.summary}</p>
              <div className="reel-tags">
                {reel.tags.map((t) => (
                  <span key={t} className="stream-tag">{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="reels-disclaimer-bar">
        <Sparkles size={14} className="text-gold" />
        <span>
          Reels attribute original creators and photographers. Connected to public Instagram archives without algorithmic manipulation.
        </span>
      </div>
    </section>
  )
}
