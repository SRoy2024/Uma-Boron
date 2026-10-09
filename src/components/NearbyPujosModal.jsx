import { useMemo, useState } from 'react'
import {
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { pujosData } from '../data/pujos'

export default function NearbyPujosModal({ isOpen, onClose, selectedCity = 'All' }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const cities = ['All', 'Kolkata', 'Bengaluru', 'Delhi NCR', 'Worldwide']

  const filteredPujos = useMemo(() => {
    return pujosData.filter((item) => {
      const matchCity =
        activeFilter === 'All'
          ? true
          : activeFilter === 'Worldwide'
          ? item.city === 'London' || item.city === 'San Francisco Bay Area'
          : item.city === activeFilter

      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.bengali.toLowerCase().includes(q) ||
        item.landmark.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.highlights.toLowerCase().includes(q)

      return matchCity && matchQuery
    })
  }, [activeFilter, searchQuery])

  if (!isOpen) return null

  return (
    <div className="app-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="pujos-modal-title">
      <div className="app-modal-dialog directory-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="badge-row">
              <span className="gold-chip"><Compass size={13} /> Sourced & Verified Pujo Directory</span>
              <span className="subtle-chip">Durga Puja 2026</span>
            </div>
            <h2 id="pujos-modal-title">Nearby Pujos & Pandals</h2>
            <p>
              Direct Google Maps navigation to heritage pandals and diaspora community celebrations.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close directory modal">
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="directory-controls">
          <div className="city-filter-tabs" role="tablist">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                className={`filter-tab ${activeFilter === city ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(city)}
                role="tab"
                aria-selected={activeFilter === city}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="directory-search-input">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by pandal name, landmark, or area..."
              maxLength={120}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search pandals"
            />
            {searchQuery && (
              <button type="button" className="clear-search" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Pujo Cards List */}
        <div className="pujo-cards-scroll-area">
          {filteredPujos.length === 0 ? (
            <div className="directory-empty-state">
              <Compass size={36} className="text-gold" />
              <h3>No pandals found matching "{searchQuery}"</h3>
              <p>Try searching for a different neighborhood, or select "All" to browse all verified cities.</p>
              <button
                type="button"
                className="secondary-action"
                onClick={() => { setActiveFilter('All'); setSearchQuery('') }}
              >
                Show All Pandals
              </button>
            </div>
          ) : (
            <div className="pujo-cards-grid">
              {filteredPujos.map((pujo) => (
                <article key={pujo.id} className="pujo-card-item">
                  <div className="card-top">
                    <div className="pujo-title-lockup">
                      <span className="pujo-zone-badge">{pujo.city} · {pujo.zone}</span>
                      <h3 className="pujo-english-name">{pujo.name}</h3>
                      <h4 className="pujo-bengali-name" lang="bn">{pujo.bengali}</h4>
                    </div>
                    <span className="pujo-type-tag">{pujo.type}</span>
                  </div>

                  <p className="pujo-highlight-text">{pujo.highlights}</p>

                  <div className="pujo-address-box">
                    <MapPin size={15} className="pin-icon" />
                    <div>
                      <strong>{pujo.landmark}</strong>
                      <small>{pujo.address}</small>
                    </div>
                  </div>

                  <div className="pujo-card-actions">
                    <a
                      href={pujo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-action maps-direct-btn"
                    >
                      <Navigation size={16} />
                      <span>Directions in Google Maps</span>
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </a>
                    <span className="verification-status-pill">
                      <Sparkles size={12} className="text-gold" />
                      {pujo.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer directory-footer">
          <small>
            Organiser schedules and society timings operate independently from astronomical Panjika observances. No fabricated opening hours are shown.
          </small>
        </div>
      </div>
    </div>
  )
}
