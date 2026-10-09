import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Copy,
  Flame,
  Hand,
  Heart,
  Leaf,
  Lightbulb,
  Maximize2,
  Minimize2,
  Music2,
  Radio,
  RotateCcw,
  Share2,
  Shield,
  Sparkles,
  Swords,
  Truck,
  Waves,
  Wind,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import durgaMandap from '../assets/generated/durga-mandap.webp'
import durgaPratimaReal from '../assets/generated/durga-pratima-real.jpg'
import pandalRevealReal from '../assets/generated/pandal-reveal-real.jpg'
import dhunuchiAartiReal from '../assets/generated/dhunuchi-aarti-real.jpg'
import dashamiGhatReal from '../assets/generated/dashami-ghat-real.jpg'
import dhunuchiReal from '../assets/generated/dhunuchi-real-v2.webp'
import durgaPratimaCutoutReal from '../assets/generated/durga-pratima-cutout-real-v2.webp'
import immersionLorryReal from '../assets/generated/immersion-lorry-real-v2.webp'
import dashamiBoronThali from '../assets/generated/dashami-boron-thali.webp'

// The 10 Sacred Weapons gifted by the Gods to Devi Durga
const weaponSet = [
  // Left 5 Hands
  {
    id: 'trident',
    label: 'Trishula (ত্রিশূল)',
    icon: Swords,
    slot: 'hand-l1',
    side: 'Left Hand 1 (Top)',
    giftedBy: 'Lord Shiva',
    trivia: 'Lord Shiva bestowed his three-pointed trident. The prongs embody the three cosmic Gunas (Sattva / purity, Rajas / passion, Tamas / lethargy). Maa Durga pierced the heart of Mahishasura with this Trishula, vanquishing demonic arrogance.',
  },
  {
    id: 'sword',
    label: 'Khadga (খড়্গ)',
    icon: Swords,
    slot: 'hand-l2',
    side: 'Left Hand 2',
    giftedBy: 'Lord Yama / Kala',
    trivia: 'Yama, god of cosmic justice, gave the gleaming sword representing discriminative intellect (Viveka). It severs the bonds of ignorance, ego, and worldly delusion.',
  },
  {
    id: 'vajra',
    label: 'Vajra (বজ্র)',
    icon: Sparkles,
    slot: 'hand-l3',
    side: 'Left Hand 3',
    giftedBy: 'Lord Indra',
    trivia: 'Indra presented his thunderbolt, forged from the self-sacrificing bones of Sage Dadhichi. It bestows unbreakable spiritual resolve and unwavering endurance against adversity.',
  },
  {
    id: 'nagpasha',
    label: 'Nagpasha (নাগপাশ)',
    icon: Shield,
    slot: 'hand-l4',
    side: 'Left Hand 4',
    giftedBy: 'Lord Varuna & Sheshanaga',
    trivia: 'Varuna presented the celestial serpent lasso. It ensnares wild pride and subdues the deceitful, shape-shifting forms assumed by Mahishasura.',
  },
  {
    id: 'conch',
    label: 'Shankha (শঙ্খ)',
    icon: Wind,
    slot: 'hand-l5',
    side: 'Left Hand 5 (Bottom)',
    giftedBy: 'Lord Varuna',
    trivia: 'Varuna gifted the sacred sea conch. When blown by the Mother, the primordial vibration "OM" resonated across all realms, shattering terror in the hearts of the righteous.',
  },
  // Right 5 Hands
  {
    id: 'discus',
    label: 'Sudarshana Chakra (সুদর্শন চক্র)',
    icon: CircleDot,
    slot: 'hand-r1',
    side: 'Right Hand 1 (Top)',
    giftedBy: 'Lord Vishnu',
    trivia: 'Lord Vishnu produced a replica of his Sudarshana Chakra. Spinning ceaselessly on Devi’s finger, the solar wheel symbolizes Dharma and inescapable cosmic time.',
  },
  {
    id: 'bow-arrow',
    label: 'Dhanush & Bana (তীর-ধনুক)',
    icon: Swords,
    slot: 'hand-r2',
    side: 'Right Hand 2',
    giftedBy: 'Lord Vayu & Surya',
    trivia: 'Vayu gave the arched bow and Surya filled the celestial quiver with glowing arrows. They signify concentrated focus and righteous intentions swiftly finding their mark.',
  },
  {
    id: 'gada',
    label: 'Gada (গদা)',
    icon: Shield,
    slot: 'hand-r3',
    side: 'Right Hand 3',
    giftedBy: 'Lord Kubera',
    trivia: 'Kubera, guardian of treasures, presented the heavy mace. It represents steadfast loyalty, moral stamina, and the crushing of oppressive malice.',
  },
  {
    id: 'axe',
    label: 'Kulhara (কুঠার)',
    icon: Swords,
    slot: 'hand-r4',
    side: 'Right Hand 4',
    giftedBy: 'Lord Vishwakarma',
    trivia: 'Vishwakarma, divine craftsman of the gods, forged the invincible battle axe and war armor. It strikes down wickedness without dread of ruin.',
  },
  {
    id: 'lotus',
    label: 'Padma (পদ্ম)',
    icon: Leaf,
    slot: 'hand-r5',
    side: 'Right Hand 5 (Bottom)',
    giftedBy: 'Lord Brahma',
    trivia: 'Lord Brahma offered the pristine red-pink lotus. Blossoming pure above murky waters, it signifies divine knowledge, detachment, and spiritual liberation.',
  },
]

// The 9 Botanical Forms of Navapatrika (নয়টি উদ্ভিদ ও অধিষ্ঠাত্রী দেবী)
const plants = [
  {
    name: 'Banana Tree',
    bn: 'কদলী (কলাগাছ)',
    devi: 'দেবী ব্রাহ্মণী (Goddess Brahmani)',
    ayurveda: 'Rich in potassium, cooling energy, digestive wellness',
    significance: 'The core trunk of Kola Bou. Represents supreme fertility and domestic nourishment; every part of the plant gives life.',
  },
  {
    name: 'Colocasia',
    bn: 'কচু গাছ',
    devi: 'দেবী কালিকা (Goddess Kalika)',
    ayurveda: 'Mineral-rich wild green, antioxidant protection',
    significance: 'Water beads roll off colocasia leaves without staining, symbolizing spiritual detachment while living in a material world.',
  },
  {
    name: 'Turmeric',
    bn: 'হরিদ্রা (হলুদ গাছ)',
    devi: 'দেবী উমা / দুর্গা (Goddess Uma)',
    ayurveda: 'Potent antimicrobial, wound healer, sacred golden dye',
    significance: 'The golden rhizome of divine auspiciousness and purification, warding off darkness and physical ailments.',
  },
  {
    name: 'Jayanti',
    bn: 'জয়ন্তী গাছ',
    devi: 'দেবী কার্তিকী (Goddess Kartiki)',
    ayurveda: 'Restorative herb for stamina and fevers',
    significance: 'Literally meaning "Victorious." Traditionally carried by ancient Bengal warriors to invoke invincibility.',
  },
  {
    name: 'Wood Apple / Bel',
    bn: 'বিল্ব (বেল গাছ)',
    devi: 'দেবী শিবা (Goddess Shiva)',
    ayurveda: 'Digestive nectar, sacred cooling fruit',
    significance: 'The three leaflets represent Shiva’s Trishula (creation, preservation, dissolution). Essential for Puja Pushpanjali.',
  },
  {
    name: 'Pomegranate',
    bn: 'দাড়িম্ব (বেদানা)',
    devi: 'দেবী রক্তদন্তিকা (Goddess Raktadantika)',
    ayurveda: 'Blood purifier, heart tonic, antioxidant seeds',
    significance: 'Jewel-like ruby seeds symbolize the infinite continuity of life and Mother Nature’s overflowing harvest.',
  },
  {
    name: 'Ashoka Tree',
    bn: 'অশোক গাছ',
    devi: 'দেবী শোকরহিতা (Remover of Grief)',
    ayurveda: 'Hormonal balance, tree of tranquility',
    significance: 'Literally "without grief." Sitting beneath the blossoming Ashoka tree dissolves sorrow and calms the troubled heart.',
  },
  {
    name: 'Giant Taro / Arum',
    bn: 'মানকচু',
    devi: 'দেবী চামুণ্ডা (Goddess Chamunda)',
    ayurveda: 'Hardy subsistence root, wild nutrition',
    significance: 'Thrives wild along riverbanks without human cultivation, demonstrating nature’s resilient protection.',
  },
  {
    name: 'Rice Paddy',
    bn: 'ধান গাছ',
    devi: 'দেবী লক্ষ্মী (Goddess Lakshmi)',
    ayurveda: 'Wholesome carbohydrate lifeblood of Bengal',
    significance: 'The golden sheaves of the autumn harvest. Maa Annapurna’s blessing that no home in the land shall know hunger.',
  },
]

function MahalayaExperience({ onListen }) {
  const [powered, setPowered] = useState(false)
  const [frequency, setFrequency] = useState(94.6)
  const [volume, setVolume] = useState(80)

  return (
    <section className="experience-card radio-experience" aria-label="Interactive Murphy valve radio">
      {/* Authentic Vintage Woodgrain Murphy Valve Radio */}
      <div className={`vintage-radio-chassis ${powered ? 'is-powered' : ''}`}>
        <div className="radio-wooden-trim" />
        
        {/* Dial Glass Tuning Window */}
        <div className="radio-glass-display">
          <div className="dial-scale-background">
            <span className="scale-band band-mw">MW 550 · 700 · 900 · 1200 · 1600 kHz</span>
            <span className="scale-band band-sw">SW 19m · 25m · 31m · 41m · 49m</span>
            <span className="scale-band band-air">ALL INDIA RADIO · আকাশবাণী কলকাতা</span>
          </div>
          
          {/* Moving illuminated red tuning needle */}
          <div
            className="tuning-needle-indicator"
            style={{ left: `${((frequency - 88) / 20) * 100}%` }}
          />

          <div className="dial-status-readout">
            <span className="station-callsign">{powered ? 'আকাশবাণী কলকাতা' : 'OFFLINE'}</span>
            <strong className="freq-digital">{frequency.toFixed(1)} MHz</strong>
          </div>
        </div>

        {/* Vintage Woven Grille Cloth with Valve Tube Indicator */}
        <div className="radio-grille-section">
          <div className="grille-woven-mesh" />
          <div className={`valve-tube-glow ${powered ? 'glowing' : ''}`}>
            <span className="tube-filament" />
          </div>
        </div>

        {/* Authentic Fluted Knobs Controls */}
        <div className="radio-knobs-panel">
          <div className="knob-group">
            <button
              type="button"
              className={`vintage-rotary-knob ${powered ? 'knob-on' : ''}`}
              onClick={() => { setPowered(!powered); if (!powered && onListen) onListen('mahalaya-broadcast') }}
              aria-pressed={powered}
            >
              <div className="knob-notch" />
            </button>
            <span className="knob-label">{powered ? 'Power: ON' : 'Power: OFF'}</span>
          </div>

          <div className="tuning-slider-wrapper">
            <label htmlFor="radioTuneRange" className="knob-label">
              <span>📻 Tuning Dial: {frequency.toFixed(1)} MHz</span>
            </label>
            <input
              id="radioTuneRange"
              type="range"
              min="88"
              max="108"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>

          <div className="knob-group">
            <div className="knob-label">Volume: {volume}%</div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="vol-mini-slider"
            />
          </div>
        </div>
      </div>

      <div className="experience-actions">
        <button
          className="primary-action radio-listen-btn"
          type="button"
          onClick={() => { setPowered(true); if (onListen) onListen('mahalaya-broadcast') }}
        >
          <Music2 size={18} />
          <span>Open Mahishasura Mardini Broadcast</span>
        </button>
        <p className="radio-provenance-note">
          Tuning into Birendra Krishna Bhadra's immortal dawn invocation. Official verified YouTube archive stream.
        </p>
      </div>
    </section>
  )
}

function WeaponPuzzle() {
  const [selected, setSelected] = useState(null)
  const [placed, setPlaced] = useState({})
  const [activeTrivia, setActiveTrivia] = useState(null)
  const [message, setMessage] = useState('Select a weapon from the tray below, then click its matching hand on Maa Durga.')

  const place = (slot, weaponId = selected) => {
    if (!weaponId) {
      setMessage('Choose a weapon from the tray first.')
      return
    }
    const weapon = weaponSet.find((item) => item.id === weaponId)
    if (weapon.slot !== slot) {
      setMessage(`Not quite! ${weapon.label} belongs to the ${weapon.side}. Try that hand!`)
      return
    }

    setPlaced((prev) => ({ ...prev, [slot]: weaponId }))
    setSelected(null)
    setActiveTrivia(weapon)
    const newCount = Object.keys(placed).length + 1
    if (newCount === 10) {
      setMessage('দশভুজা রূপ পূর্ণ হলো! Maa Durga is now armed with all 10 divine weapons!')
    } else {
      setMessage(`Placed ${weapon.label}! (${newCount}/10 Divine Weapons)`)
    }
  }

  const placedCount = Object.keys(placed).length

  return (
    <section className="experience-card weapon-experience" aria-label="Panchami: 10 Divine Weapons of Durga">
      <div className="weapon-puzzle-header">
        <div>
          <h3>দশভুজা রূপ ও ১০ দৈব আয়ুধ · The 10 Weapons of Devi</h3>
          <p>Arm all 10 hands of Maa Durga with weapons gifted by the devas to battle Mahishasura.</p>
        </div>
        <div className="weapon-score-pill">
          <strong>{placedCount} / 10</strong>
          <span>Weapons Placed</span>
        </div>
      </div>

      {/* Pratima Canvas with 10 Target Hand Nodes */}
      <div className="puzzle-canvas ten-hands-canvas" style={{ '--puzzle-image': `url(${durgaPratimaReal || durgaMandap})` }}>
        {weaponSet.map((weapon) => {
          const Icon = weapon.icon
          const isPlaced = placed[weapon.slot] === weapon.id
          return (
            <button
              key={weapon.slot}
              type="button"
              className={`weapon-slot slot-${weapon.slot} ${isPlaced ? 'is-filled' : ''} ${selected === weapon.id ? 'is-expecting' : ''}`}
              onClick={() => place(weapon.slot)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); place(weapon.slot, e.dataTransfer.getData('text/plain')) }}
              aria-label={`${weapon.label} target on ${weapon.side}`}
              title={`${weapon.side} (${isPlaced ? weapon.label : 'Empty hand'})`}
            >
              {isPlaced ? (
                <div className="placed-weapon-badge" onClick={() => setActiveTrivia(weapon)}>
                  <Icon size={18} />
                  <span className="weapon-mini-label">{weapon.label.split(' ')[0]}</span>
                </div>
              ) : (
                <div className="empty-hand-target">
                  <span className="hand-target-dot" />
                  <small>{weapon.slot.replace('hand-', '').toUpperCase()}</small>
                </div>
              )}
            </button>
          )
        })}
        <span className="puzzle-review-label">Authentic Daker Saaj Pratima · 10 Sacred Hands</span>
      </div>

      {/* Trivia Popover / Modal when a weapon is placed */}
      {activeTrivia && (
        <div className="weapon-trivia-card" role="dialog" aria-label="Weapon trivia">
          <div className="trivia-badge">
            <Sparkles size={14} className="text-gold" />
            <span>Mythological Significance · রামায়ণ ও শ্রীশ্রীচণ্ডী</span>
          </div>
          <h4>{activeTrivia.label}</h4>
          <p className="trivia-gift">
            <strong>Gifted by:</strong> <span className="god-name">{activeTrivia.giftedBy}</span>
          </p>
          <p className="trivia-text">{activeTrivia.trivia}</p>
          <button type="button" className="close-trivia-btn" onClick={() => setActiveTrivia(null)}>
            Continue Arming Maa (Got it)
          </button>
        </div>
      )}

      {/* Weapon Tray with All 10 Weapons */}
      <div className="weapon-tray ten-weapons-tray" aria-label="10 Weapons Tray">
        <div className="tray-top-bar">
          <span>Choose a weapon to place on Maa Durga's hands:</span>
          <button
            className="text-action"
            type="button"
            onClick={() => { setPlaced({}); setSelected(null); setActiveTrivia(null); setMessage('Puzzle reset.') }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="weapon-buttons-grid">
          {weaponSet.map((weapon) => {
            const Icon = weapon.icon
            const isUsed = placed[weapon.slot] === weapon.id
            const isSelected = selected === weapon.id
            return (
              <button
                key={weapon.id}
                type="button"
                draggable={!isUsed}
                disabled={isUsed}
                className={`weapon-select-btn ${isSelected ? 'is-selected' : ''} ${isUsed ? 'is-used' : ''}`}
                onClick={() => { setSelected(weapon.id); setActiveTrivia(weapon) }}
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', weapon.id); setSelected(weapon.id) }}
                aria-pressed={isSelected}
              >
                <Icon size={16} />
                <span>{weapon.label}</span>
                {isUsed && <span className="checkmark-placed">✓</span>}
              </button>
            )
          })}
        </div>
        <p className="interaction-message" aria-live="polite">{message}</p>
      </div>
    </section>
  )
}

/* =========================================================================
   SHASHTHI: Direct On-Screen Velvet Curtain Swiping
   ========================================================================= */
function ShashthiExperience({ onListen }) {
  const [open, setOpen] = useState(15)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [lightsActive, setLightsActive] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const stageRef = useRef(null)

  const handlePointerDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    if (stageRef.current) stageRef.current.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    // Calculate swipe distance from center
    const currentX = e.clientX
    const delta = Math.abs(currentX - (rect.left + rect.width / 2))
    const pct = Math.min(100, Math.max(0, (delta / (rect.width / 2)) * 100))
    setOpen(Math.round(pct))
    if (pct >= 85) setRevealed(true)
    else setRevealed(false)
  }

  const handlePointerUp = (e) => {
    setIsDragging(false)
    if (stageRef.current && e.pointerId) {
      try { stageRef.current.releasePointerCapture(e.pointerId) } catch {}
    }
  }

  const handleRevealAll = () => {
    let current = open
    const target = 100
    const step = () => {
      current = Math.min(target, current + 4)
      setOpen(current)
      if (current < target) {
        requestAnimationFrame(step)
      } else {
        setRevealed(true)
        if (onListen) onListen()
      }
    }
    requestAnimationFrame(step)
  }

  return (
    <section className={`experience-card curtain-experience ${isFullScreen ? 'fullscreen-pandal-active' : ''}`} aria-label="Reveal the Shashthi mandap">
      <div className={`pandal-stage-wrapper ${isFullScreen ? 'is-fullscreen' : ''}`}>
        {/* Directly Swipable Velvet Pandal Canvas */}
        <div
          className="pandal-facade-bg swipe-sensitive-area"
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ backgroundImage: `url(${pandalRevealReal})`, cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Sanctum Sanctorum Behind Curtains */}
          <div
            className="pandal-sanctum-bg"
            style={{
              backgroundImage: `url(${durgaPratimaReal})`,
              opacity: Math.max(0.08, open / 100),
              transition: isDragging ? 'none' : 'opacity 0.25s ease',
            }}
          >
            {/* Chandelier & Golden Glow Lights */}
            <div className={`pandal-chandeliers ${lightsActive ? 'glowing' : ''}`}>
              <div className="fairy-lights-string fairy-1" />
              <div className="fairy-lights-string fairy-2" />
              <div className="chandelier chandelier-center" />
              <div className="light-sparkle-field" />
            </div>

            {revealed && (
              <div className="pandal-blessing-toast" style={{ animation: 'modalFadeIn 0.5s ease' }}>
                <Sparkles size={22} className="text-gold" />
                <strong>বোধন সম্পন্ন · জয় মা দুর্গা 🙏</strong>
                <span>Maa Durga has been revealed! Welcome to the Grand Mandap.</span>
              </div>
            )}
          </div>

          {/* Royal Crimson Velvet Curtains — Dragged directly on screen */}
          <div
            className="grand-curtain curtain-left"
            style={{
              transform: `translateX(-${open}%)`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div className="curtain-pleat-lines" />
            <div className="curtain-golden-tassel" />
            <span className="curtain-drag-hint">👈 Swipe Left</span>
          </div>

          <div
            className="grand-curtain curtain-right"
            style={{
              transform: `translateX(${open}%)`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div className="curtain-pleat-lines" />
            <div className="curtain-golden-tassel" />
            <span className="curtain-drag-hint">Swipe Right 👉</span>
          </div>

          {/* Golden Toran Header Banner */}
          <div className="pandal-arch-banner">
            <span>✨ মহাষষ্ঠী বোধন · শারদোৎসব মণ্ডপ প্রবেশ ✨</span>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            className="pandal-fullscreen-toggle"
            onClick={() => setIsFullScreen(!isFullScreen)}
            aria-label={isFullScreen ? 'Exit Full Screen Pandal' : 'Enter Full Screen Pandal'}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span>{isFullScreen ? 'Exit Full Screen' : 'Full Screen Pandal'}</span>
          </button>
        </div>

        {/* Interaction Controls */}
        <div className="pandal-reveal-controls">
          <div className="swipe-instruction-text">
            <span>👆 Swipe or drag across the velvet curtains to part them ({open}% open)</span>
          </div>

          <div className="pandal-actions-bar">
            <button
              className="primary-action pandal-reveal-btn"
              type="button"
              onClick={handleRevealAll}
              disabled={revealed}
            >
              <Sparkles size={18} />
              <span>{revealed ? 'Mandap Revealed!' : 'Reveal Grand Pandal'}</span>
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setLightsActive(!lightsActive)}
            >
              <Lightbulb size={16} />
              <span>{lightsActive ? 'Fairy Lights ON' : 'Lights Dim'}</span>
            </button>
            <button
              type="button"
              className="text-action"
              onClick={() => { setOpen(15); setRevealed(false) }}
            >
              <RotateCcw size={14} />
              <span>Close Curtains</span>
            </button>
          </div>
        </div>
      </div>
      <p className="symbolic-note">
        Touch or click directly on the velvet curtains to swipe them open on Mahashashthi Bodhan.
      </p>
    </section>
  )
}

function SaptamiExperience() {
  const [active, setActive] = useState(0)
  const current = plants[active]

  return (
    <section className="experience-card plant-experience" aria-label="Navapatrika 9 botanical forms">
      <div className="navapatrika-header">
        <div>
          <h3>নবপত্রিকা · ৯টি ওষধি ও দেবীর রূপ</h3>
          <p>Kola Bou is not just an idol, but the Nine Sacred Botanical Forms of Mother Nature.</p>
        </div>
        <span className="plant-counter-tag">{String(active + 1).padStart(2, '0')} / 09</span>
      </div>

      <div className="plant-orbit">
        {plants.map((plant, index) => (
          <button
            key={plant.name}
            type="button"
            className={active === index ? 'is-active' : ''}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
          >
            <Leaf size={16} />
            <span>{plant.name}</span>
          </button>
        ))}
      </div>

      <div className="plant-detail-deep" aria-live="polite">
        <div className="detail-top-lockup">
          <span className="devi-badge">{current.devi}</span>
          <h2>{current.name} <small lang="bn">{current.bn}</small></h2>
        </div>

        <div className="plant-attributes-grid">
          <div className="attr-block">
            <strong>🌿 Ritual & Cultural Role</strong>
            <p>{current.significance}</p>
          </div>
          <div className="attr-block">
            <strong>💊 Ayurvedic & Health Benefits</strong>
            <p>{current.ayurveda}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =========================================================================
   ASHTAMI: Real Handshake in the Crowd with Dual-View Invite System
   ========================================================================= */
function TogetherExperience({ session, onRequireAuth, onToast }) {
  const [relation, setRelation] = useState('partner')
  const [userRole, setUserRole] = useState('sender') // 'sender' | 'companion'
  const [handClasped, setHandClasped] = useState(false)
  const [isReaching, setIsReaching] = useState(false)
  const [inviteToken] = useState('ashtami-rendezvous-2026')
  const [copied, setCopied] = useState(false)

  // Check URL query params for ?invite= or ?view=companion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('invite') || params.get('view') === 'companion') {
      setUserRole('companion')
    }
  }, [])

  const inviteLink = `${window.location.origin}/?invite=${encodeURIComponent(inviteToken)}&view=companion#chapter-experience`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      if (onToast) onToast('Invitation link copied! Share it with your companion for Ashtami.')
    } catch {
      if (onToast) onToast('Could not copy. Link: ' + inviteLink)
    }
  }

  const handleClaspHands = () => {
    setIsReaching(true)
    setTimeout(() => {
      setHandClasped(true)
      setIsReaching(false)
    }, 800)
  }

  const crowdPhoto = durgaPratimaReal

  return (
    <section className="experience-card together-experience" aria-label="Ashtami Handshake in the Crowd">
      {/* Perspective / Role Switcher */}
      <div className="ashtami-role-banner">
        <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Viewing as:</span>
        <div className="role-switch-pill">
          <button
            type="button"
            className={userRole === 'sender' ? 'active' : ''}
            onClick={() => { setUserRole('sender'); setHandClasped(false); setIsReaching(false) }}
          >
            👤 You (Host)
          </button>
          <button
            type="button"
            className={userRole === 'companion' ? 'active' : ''}
            onClick={() => setUserRole('companion')}
          >
            🤝 Companion
          </button>
        </div>
      </div>

      <div className="relation-picker" role="group" aria-label="Invitation relationship">
        {['partner', 'friend', 'sibling', 'family'].map((item) => (
          <button
            key={item}
            type="button"
            className={relation === item ? 'is-active' : ''}
            onClick={() => setRelation(item)}
            aria-pressed={relation === item}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Handshake Arena */}
      <div className={`handshake-arena ${handClasped ? 'is-clasped' : ''} ${isReaching ? 'is-reaching' : ''}`}>
        <div className="crowd-ambient-blur" style={{ backgroundImage: `url(${crowdPhoto})` }} />

        {/* Animated Hands — SVG based with proper finger rendering */}
        <div className="handshake-stage-visual">

          {/* Left Hand (Host / You) */}
          <div className={`hand-actor hand-host ${handClasped ? 'clasp-left' : ''} ${isReaching && userRole === 'companion' ? 'pre-clasp-left' : ''}`}>
            <div className="hand-sleeve-cuff host-cuff" />
            <div className="hand-palm">
              <svg viewBox="0 0 80 90" width="80" height="90" className="hand-svg-render" aria-hidden>
                {/* Palm */}
                <path d="M 15 55 Q 10 35 20 25 Q 22 15 30 15 Q 35 12 35 22 L 35 38" fill="#c8846a" stroke="#a86040" strokeWidth="1" />
                {/* Index finger */}
                <rect x="22" y="12" width="11" height="28" rx="5" fill="#d4907a" stroke="#a86040" strokeWidth="1" />
                {/* Middle finger */}
                <rect x="34" y="8" width="11" height="30" rx="5" fill="#d4907a" stroke="#a86040" strokeWidth="1" />
                {/* Ring finger */}
                <rect x="46" y="12" width="10" height="27" rx="5" fill="#d4907a" stroke="#a86040" strokeWidth="1" />
                {/* Pinky */}
                <rect x="57" y="18" width="9" height="22" rx="4" fill="#d4907a" stroke="#a86040" strokeWidth="1" />
                {/* Thumb */}
                <path d="M 12 45 Q 6 38 10 30 Q 14 24 20 28 L 18 48" fill="#d4907a" stroke="#a86040" strokeWidth="1" />
                {/* Palm base */}
                <path d="M 14 55 Q 14 70 38 72 Q 62 72 64 55 L 64 38 Q 64 48 38 50 Q 14 50 14 55 Z" fill="#c8846a" stroke="#a86040" strokeWidth="1" />
                {/* Kurti sleeve — red gold trimmed */}
                <rect x="10" y="70" width="58" height="20" rx="4" fill="#a73322" />
                <rect x="10" y="70" width="58" height="4" rx="2" fill="#e0b64c" />
              </svg>
              <span className="hand-tag">You</span>
            </div>
          </div>

          {/* Center Bridge */}
          <div className="handshake-bridge">
            {handClasped ? (
              <div className="clasp-sparkle-burst">
                <Sparkles size={36} style={{ color: 'var(--gold)', animation: 'float 1s ease-in-out infinite' }} />
                <div className="flower-petals-falling">
                  <span className="petal petal-1">🌸</span>
                  <span className="petal petal-2">🌼</span>
                  <span className="petal petal-3">🌺</span>
                </div>
              </div>
            ) : (
              <div className="reach-indicator">
                <span className="pulse-dot" />
                <span className="reach-label">
                  {userRole === 'sender' ? '⏳ Awaiting companion...' : 'Reach out!'}
                </span>
              </div>
            )}
          </div>

          {/* Right Hand (Companion) */}
          <div className={`hand-actor hand-guest ${handClasped ? 'clasp-right' : ''} ${isReaching ? 'pre-clasp-right' : ''}`}>
            <div className="hand-sleeve-cuff guest-cuff" />
            <div className="hand-palm">
              <svg viewBox="0 0 80 90" width="80" height="90" className="hand-svg-render flip-h" aria-hidden>
                <path d="M 15 55 Q 10 35 20 25 Q 22 15 30 15 Q 35 12 35 22 L 35 38" fill="#d4b896" stroke="#a88060" strokeWidth="1" />
                <rect x="22" y="12" width="11" height="28" rx="5" fill="#e0c4a8" stroke="#b89070" strokeWidth="1" />
                <rect x="34" y="8" width="11" height="30" rx="5" fill="#e0c4a8" stroke="#b89070" strokeWidth="1" />
                <rect x="46" y="12" width="10" height="27" rx="5" fill="#e0c4a8" stroke="#b89070" strokeWidth="1" />
                <rect x="57" y="18" width="9" height="22" rx="4" fill="#e0c4a8" stroke="#b89070" strokeWidth="1" />
                <path d="M 12 45 Q 6 38 10 30 Q 14 24 20 28 L 18 48" fill="#e0c4a8" stroke="#b89070" strokeWidth="1" />
                <path d="M 14 55 Q 14 70 38 72 Q 62 72 64 55 L 64 38 Q 64 48 38 50 Q 14 50 14 55 Z" fill="#d4b896" stroke="#a88060" strokeWidth="1" />
                {/* White cream saree sleeve */}
                <rect x="10" y="70" width="58" height="20" rx="4" fill="#f7ecd4" />
                <rect x="10" y="70" width="58" height="4" rx="2" fill="#a73322" />
              </svg>
              <span className="hand-tag">Companion</span>
            </div>
          </div>
        </div>

        {/* Clasped Success Banner */}
        {handClasped && (
          <div className="handshake-celebration-toast" role="status">
            <Heart size={20} style={{ color: 'var(--gold)' }} />
            <strong>অষ্টমীর ভিড়ে হাত ধরা হলো 🙌</strong>
          </div>
        )}
      </div>

      {/* Role-Specific Actions */}
      <div className="ashtami-actions-panel">
        {userRole === 'sender' ? (
          <div className="sender-invite-box">
            <div className="invite-desc">
              <Share2 size={16} style={{ color: 'var(--gold)' }} />
              <span>
                Send this link to your <strong>{relation}</strong>. When they open it, <em>they</em> clasp your hand:
              </span>
            </div>
            <div className="invite-link-row">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="invite-link-input"
                onClick={(e) => e.target.select()}
              />
              <button type="button" className="primary-action copy-link-btn" onClick={handleCopyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', padding: '8px 10px', background: 'rgba(255,222,70,0.08)', border: '1px solid rgba(255,222,70,0.2)', borderRadius: '10px' }}>
              <Sparkles size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <small style={{ color: '#c9b87d', fontSize: '11px' }}>Your companion will see both hands and a button to clasp yours. You see this waiting view.</small>
            </div>
          </div>
        ) : (
          <div className="companion-clasp-box">
            <p className="companion-invite-text">
              ✨ Your {relation} is waiting for you in the Ashtami crowd!
            </p>
            <button
              type="button"
              className={`primary-action clasp-trigger-btn ${handClasped ? 'is-complete' : ''}`}
              onClick={handleClaspHands}
              disabled={handClasped || isReaching}
            >
              <Hand size={20} />
              <span>{handClasped ? '🤝 Clasped! অঞ্জলির আনন্দ' : isReaching ? 'Reaching...' : 'হাত ধরুন · Take Their Hand'}</span>
            </button>
            {handClasped && (
              <button type="button" className="text-action" onClick={() => { setHandClasped(false); setIsReaching(false) }}>
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}
      </div>
      <p className="symbolic-note">
        A genuine two-person handshake ritual. The sender sees the invite waiting view; the companion receives the link and clasps hands, which both see as the connection animation.
      </p>
    </section>
  )
}

/* =========================================================================
   NABAMI: Authentic Dhunuchi & Sandhi Aarti Ritual
   ========================================================================= */
function SandhiExperience({ onListen }) {
  const [aartiType, setAartiType] = useState('dhunuchi') // 'dhunuchi' | 'panchapradeep'
  const [aartiCount, setAartiCount] = useState(12)
  const [isWaving, setIsWaving] = useState(false)
  const [aartiPos, setAartiPos] = useState({ x: 50, y: 65 })
  const [autoDance, setAutoDance] = useState(false)
  const containerRef = useRef(null)

  // Auto dance motion
  useEffect(() => {
    let animId
    let angle = 0
    if (autoDance) {
      const step = () => {
        angle += 0.05
        const newX = 50 + Math.cos(angle) * 25
        const newY = 60 + Math.sin(angle) * 15
        setAartiPos({ x: newX, y: newY })
        setAartiCount((c) => Math.min(108, c + 1))
        animId = requestAnimationFrame(step)
      }
      animId = requestAnimationFrame(step)
    }
    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [autoDance])

  // Mouse / Touch Aarti Waving
  const handlePointerMove = (e) => {
    if (!containerRef.current || autoDance) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100))
    setAartiPos({ x, y })
    setIsWaving(true)
    setAartiCount((c) => Math.min(108, c + 1))
  }

  const isComplete = aartiCount >= 108

  return (
    <section className="experience-card sandhi-experience dhunuchi-aarti-card" aria-label="Authentic Dhunuchi and Sandhi Aarti Ritual">
      {/* Aarti Ritual Header */}
      <div className="aarti-type-toggle">
        <button
          type="button"
          className={aartiType === 'dhunuchi' ? 'active' : ''}
          onClick={() => setAartiType('dhunuchi')}
        >
          <Flame size={16} />
          <span>Dhunuchi Aarti (ধুনুচি আরতি)</span>
        </button>
        <button
          type="button"
          className={aartiType === 'panchapradeep' ? 'active' : ''}
          onClick={() => setAartiType('panchapradeep')}
        >
          <Sparkles size={16} />
          <span>Pancha Pradeep (পঞ্চপ্রদীপ)</span>
        </button>
      </div>

      {/* Atmospheric Aarti Mandap Canvas */}
      <div
        className="aarti-mandap-canvas"
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setIsWaving(false)}
        style={{ backgroundImage: `url(${dhunuchiAartiReal})` }}
      >
        <div className="aarti-dark-scrim" />

        {/* Rising Fragrant Incense / Dhuno Smoke Field */}
        <div className="dhuno-smoke-field">
          <div className="smoke-plume smoke-1" />
          <div className="smoke-plume smoke-2" />
          <div className="smoke-plume smoke-3" />
        </div>

        {/* Interactive Aarti Lamp / Dhunuchi that tracks movement */}
        <div
          className={`interactive-aarti-implement ${aartiType} ${isWaving || autoDance ? 'waving' : ''}`}
          style={{
            left: `${aartiPos.x}%`,
            top: `${aartiPos.y}%`,
          }}
        >
          {aartiType === 'dhunuchi' ? (
            <img className="real-dhunuchi-implement" src={dhunuchiReal} alt="Traditional terracotta dhunuchi with glowing dhuno incense" draggable="false" />
          ) : (
            /* Multi-tiered Brass Pancha Pradeep */
            <div className="panchapradeep-vessel">
              <div className="pradeep-flames-row">
                <i className="flame-wick f-1" />
                <i className="flame-wick f-2" />
                <i className="flame-wick f-3" />
                <i className="flame-wick f-4" />
                <i className="flame-wick f-5" />
              </div>
              <div className="brass-stand" />
            </div>
          )}

          {/* Circular Aarti Aura Halo */}
          <div className="aarti-halo-glow" />
        </div>

        {/* Dynamic Dhak Rhythm Pulse Visualizer */}
        <div className="dhak-rhythm-strip">
          <Bell size={15} className="text-gold" />
          <span className="dhak-label">সন্ধিপূজার কাঁসর-ঘণ্টা ও ঢাকের তাল</span>
          <div className="rhythm-bars">
            <span style={{ height: '70%' }} />
            <span style={{ height: '100%' }} />
            <span style={{ height: '40%' }} />
            <span style={{ height: '85%' }} />
            <span style={{ height: '60%' }} />
          </div>
        </div>

        {isComplete && (
          <div className="aarti-blessing-overlay">
            <Sparkles size={24} className="text-gold" />
            <strong>১০৮ প্রদীপ ও ধুনুচি আরতি সমাপন</strong>
            <span>Maha Navami Sandhi Aarti completed with devotion and sacred light.</span>
          </div>
        )}
      </div>

      {/* Aarti Action Controls */}
      <div className="aarti-footer-controls">
        <div className="aarti-progress-counter">
          <strong>{aartiCount} / 108</strong>
          <span>Aarti Pranam Offerings</span>
          <div className="aarti-mini-bar">
            <div style={{ width: `${(aartiCount / 108) * 100}%` }} />
          </div>
        </div>

        <div className="aarti-buttons">
          <button
            type="button"
            className={`primary-action ${autoDance ? 'active-pulse' : ''}`}
            onClick={() => setAutoDance(!autoDance)}
          >
            <Flame size={16} />
            <span>{autoDance ? 'Stop Aarti Dance' : 'Dhunuchi Naach / আরতি নৃত্য'}</span>
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => { setAartiCount(0); setAutoDance(false) }}
          >
            <RotateCcw size={14} />
            <span>Reset Ritual</span>
          </button>
        </div>
      </div>
      <p className="symbolic-note">
        Traditional Dhunuchi incense smoke and Pancha Pradeep fire ritual for Sandhi Pujo and Maha Navami.
      </p>
    </section>
  )
}

/* =========================================================================
   DASHAMI: Multi-Step Immersion Workflow (Truck -> Bamboo Ramp -> Holy River)
   ========================================================================= */
function DashamiExperience({ onListen }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [fedNames, setFedNames] = useState([])
  const [boronTurns, setBoronTurns] = useState(0)
  const [prayer, setPrayer] = useState('')
  const [sindoorMoments, setSindoorMoments] = useState([])
  const [rampPosition, setRampPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const rampTrackRef = useRef(null)
  const family = ['Maa Durga', 'Lakshmi', 'Saraswati', 'Kartik', 'Ganesha', 'Mahishasura']
  const sindoorSteps = [
    { id: 'forehead', label: 'Offer sindoor at Maa’s forehead' },
    { id: 'feet', label: 'Offer sindoor at Maa’s feet' },
    { id: 'community', label: 'Share the colour with the community' },
  ]

  const handleUnloadFromTruck = () => {
    setCurrentStep(5)
    window.setTimeout(() => setCurrentStep(6), 1800)
  }

  const handleRampPointerMove = (clientX) => {
    if (!rampTrackRef.current) return
    const rect = rampTrackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setRampPosition(pct)
    if (pct >= 90) {
      setCurrentStep(7)
      if (onListen) onListen()
    }
  }

  const handleCompleteSlide = () => {
    let pos = rampPosition
    const animate = () => {
      pos = Math.min(100, pos + 3)
      setRampPosition(pos)
      if (pos < 100) requestAnimationFrame(animate)
      else {
        setCurrentStep(7)
        if (onListen) onListen()
      }
    }
    requestAnimationFrame(animate)
  }

  const handleResetWorkflow = () => {
    setCurrentStep(1)
    setFedNames([])
    setBoronTurns(0)
    setPrayer('')
    setSindoorMoments([])
    setRampPosition(0)
  }

  const ritualStage = currentStep === 1 ? 1 : currentStep === 2 ? 2 : currentStep === 3 ? 3 : 4

  return (
    <section className="experience-card immersion-experience dashami-workflow-card" aria-label="Dashami farewell and immersion experience">
      <div className="dashami-stepper-header">
        <div className={`step-badge ${ritualStage === 1 ? 'active' : ritualStage > 1 ? 'done' : ''}`}>
          <span>{ritualStage > 1 ? '✓' : '1'}</span><strong>Mishti</strong>
        </div>
        <div className="stepper-connector" />
        <div className={`step-badge ${ritualStage === 2 ? 'active' : ritualStage > 2 ? 'done' : ''}`}>
          <span>{ritualStage > 2 ? '✓' : '2'}</span><strong>Devi Boron</strong>
        </div>
        <div className="stepper-connector" />
        <div className={`step-badge ${ritualStage === 3 ? 'active' : ritualStage > 3 ? 'done' : ''}`}>
          <span>{ritualStage > 3 ? '✓' : '3'}</span><strong>Sindoor Khela</strong>
        </div>
        <div className="stepper-connector" />
        <div className={`step-badge ${ritualStage === 4 ? 'active' : ''}`}>
          <span>4</span><strong>Visarjan</strong>
        </div>
      </div>

      <div
        className={`dashami-ghat-arena step-${currentStep}`}
        style={{ backgroundImage: `url(${dashamiGhatReal})` }}
      >
        <div className="ghat-twilight-overlay" />

        {currentStep === 1 && (
          <div className="dashami-ritual-stage sandesh-stage">
            <div className="ritual-photo-panel">
              <img className="ritual-pratima" src={durgaPratimaReal} alt="Traditional Durga pratima with her family" />
              <div className="ritual-photo-vignette" />
              <div className="ritual-stage-copy">
                <span>মিষ্টিমুখ · The farewell begins</span>
                <h2>Offer sandesh to the whole family</h2>
                <p>Choose each name to offer one sweet. Mahishasura is included in this tender Bengali farewell tradition.</p>
              </div>
            </div>
            <div className="ritual-control-card">
              <img className="boron-thali-asset" src={dashamiBoronThali} alt="Brass thali with sandesh, betel leaves, sindoor and a diya" />
              <div className="sandesh-recipient-grid">
                {family.map((person) => {
                  const fed = fedNames.includes(person)
                  return (
                    <button
                      type="button"
                      key={person}
                      className={fed ? 'is-complete' : ''}
                      onClick={() => setFedNames((items) => items.includes(person) ? items : [...items, person])}
                    >
                      {fed ? <Check size={15} /> : <Heart size={15} />}{person}
                    </button>
                  )
                })}
              </div>
              <div className="ritual-progress-line"><span style={{ width: `${(fedNames.length / family.length) * 100}%` }} /></div>
              <button type="button" className="primary-action" disabled={fedNames.length !== family.length} onClick={() => setCurrentStep(2)}>
                Continue to Devi Boron
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="dashami-ritual-stage boron-stage">
            <div className="ritual-photo-panel">
              <img className="ritual-pratima" src={durgaPratimaReal} alt="Durga pratima during the Dashami farewell" />
              <div className="ritual-photo-vignette" />
              <img
                className={`boron-thali-asset floating-thali turns-${boronTurns}`}
                src={dashamiBoronThali}
                alt="Boron thali moving in aarti circles"
              />
            </div>
            <div className="ritual-control-card">
              <span className="ritual-eyebrow">দেবী বরণ · A daughter’s farewell</span>
              <h2>Circle the boron thali three times</h2>
              <p>Move the aarti anticlockwise, then leave a private prayer for Maa. Your prayer stays only in this browser session.</p>
              <button type="button" className="secondary-action boron-turn-button" onClick={() => setBoronTurns((value) => Math.min(3, value + 1))} disabled={boronTurns >= 3}>
                <RotateCcw size={17} /> Anticlockwise aarti · {boronTurns}/3
              </button>
              <label className="dashami-prayer-label" htmlFor="dashamiPrayer">Your prayer to Maa</label>
              <textarea id="dashamiPrayer" value={prayer} onChange={(event) => setPrayer(event.target.value)} maxLength={320} placeholder="Write what you want Maa to carry away, and what you hope she brings next year…" />
              <small>{prayer.length}/320 · stored on this screen only</small>
              <button type="button" className="primary-action" disabled={boronTurns < 3} onClick={() => setCurrentStep(3)}>Continue to Sindoor Khela</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="dashami-ritual-stage sindoor-stage">
            <div className="ritual-photo-panel sindoor-canvas">
              <img className="ritual-pratima" src={durgaPratimaReal} alt="Durga pratima prepared for Sindoor Khela" />
              <div className="ritual-photo-vignette" />
              {sindoorMoments.map((moment, index) => <span key={moment} className={`sindoor-mark mark-${index + 1}`} />)}
            </div>
            <div className="ritual-control-card">
              <span className="ritual-eyebrow">সিঁদুর খেলা · Farewell in vermilion</span>
              <h2>Complete the three Sindoor moments</h2>
              <p>Traditionally observed by married Bengali women; this symbolic digital experience welcomes every visitor to honour the farewell with care.</p>
              <div className="sindoor-actions">
                {sindoorSteps.map((item) => {
                  const complete = sindoorMoments.includes(item.id)
                  return <button type="button" key={item.id} className={complete ? 'is-complete' : ''} onClick={() => setSindoorMoments((items) => items.includes(item.id) ? items : [...items, item.id])}>{complete ? <Check size={15} /> : <Sparkles size={15} />}{item.label}</button>
                })}
              </div>
              <button type="button" className="primary-action" disabled={sindoorMoments.length !== sindoorSteps.length} onClick={() => setCurrentStep(4)}>Begin the Visarjan procession</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="truck-stage-container">
            <div className="decorated-truck-frame" style={{ animation: 'truckRoll 1.2s cubic-bezier(0.16,1,0.3,1) both' }}>
              <img className="real-immersion-lorry" src={immersionLorryReal} alt="Marigold-decorated Kolkata immersion lorry" />
              <div className="idol-on-truck">
                <img src={durgaPratimaCutoutReal} alt="Durga Pratima on the procession truck" />
              </div>
            </div>

            <div className="truck-action-overlay">
              <p>Maa Durga has arrived at Babughat on the decorated procession lorry.</p>
              <button
                type="button"
                className="primary-action truck-unload-btn"
                onClick={handleUnloadFromTruck}
              >
                <Truck size={18} />
                <span>লরি থেকে নামানো · Unload from Truck</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="truck-stage-container">
            <div className="decorated-truck-frame">
              <img className="real-immersion-lorry" src={immersionLorryReal} alt="Marigold-decorated Kolkata immersion lorry" />
              <div className="idol-on-truck" style={{ animation: 'idolLift 1.8s ease-in-out forwards' }}>
                <img src={durgaPratimaCutoutReal} alt="Durga Maa being lowered from the truck" />
              </div>
            </div>
            <div className="truck-action-overlay">
              <p style={{ color: 'var(--gold-soft)', fontWeight: 600 }}>🙏 Devotees carefully lowering Maa Durga from the lorry...</p>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="ramp-interactive-stage">
            <div className="ramp-instruction-banner">
              <span>🎋 বাঁশের মাচা — গঙ্গায় ভাসান · Slide Maa Durga down the bamboo ramp</span>
            </div>

            <div
              className="bamboo-slipway-track"
              ref={rampTrackRef}
              onPointerMove={(e) => { if (isDragging) handleRampPointerMove(e.clientX) }}
              onPointerUp={() => setIsDragging(false)}
              onPointerLeave={() => setIsDragging(false)}
            >
              <div className="bamboo-ramp-diagonal" />
              <div className="bamboo-poles-structure">
                <span className="bamboo-pole p-1" />
                <span className="bamboo-pole p-2" />
                <span className="bamboo-pole p-3" />
                <span className="bamboo-pole p-4" />
                <span className="bamboo-pole p-5" />
              </div>

              <div
                className="slidable-idol-carriage"
                style={{
                  left: `${rampPosition}%`,
                  top: `${15 + rampPosition * 0.45}%`,
                }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  setIsDragging(true)
                }}
              >
                <img src={durgaPratimaCutoutReal} alt="Durga Maa on the bamboo ramp" draggable="false" />
                <div className="carriage-roller-base" />
              </div>

              <div className="river-water-basin">
                <div className="water-ripples" />
                <div className="water-ripples" style={{ animationDelay: '0.8s', opacity: 0.6 }} />
                <span className="river-marker">🌊 পবিত্র গঙ্গা · Hooghly River</span>
              </div>
            </div>

            <div className="ramp-control-bar">
              <label htmlFor="bambooRampRange" style={{ color: '#e5d8be', fontSize: '11px' }}>
                👆 Drag Maa on the ramp or slide ({Math.round(rampPosition)}%)
              </label>
              <input
                id="bambooRampRange"
                type="range"
                min="0"
                max="100"
                value={rampPosition}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setRampPosition(val)
                  if (val >= 90) setCurrentStep(7)
                }}
              />
              <button type="button" className="primary-action" onClick={handleCompleteSlide}>
                <Waves size={16} />
                <span>Complete Visarjan</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="immersion-complete-stage">
            <div className="immersion-ripple-rings">
              <span className="ripple-ring r1" />
              <span className="ripple-ring r2" />
              <span className="ripple-ring r3" />
            </div>

            <div className="water-immersion-scene">
              <div className="submerged-idol-glow">
                <img src={durgaPratimaCutoutReal} alt="Maa Durga merging with the Ganga" className="submerged-idol-img" />
              </div>
              <div className="floating-diyas-group">
                <span className="diya d-1" /><span className="diya d-2" /><span className="diya d-3" /><span className="diya d-4" /><span className="diya d-5" />
              </div>
            </div>

            <div className="bijoya-farewell-card">
              <Sparkles size={28} style={{ color: 'var(--gold)' }} />
              <h2>আবার এসো মা</h2>
              <strong style={{ color: 'var(--gold)', fontFamily: 'var(--font-bengali)', fontSize: '1.1rem' }}>শুভ বিজয়া দশমী · আসছে বছর আবার হবে!</strong>
              <p>
                Maa Durga returns to Kailash taking all sorrow with her. She will be back next autumn — আবার এসো, মা।
              </p>
              <div className="bijoya-sweet-actions">
                <button type="button" className="primary-action" onClick={handleResetWorkflow}>
                  <RotateCcw size={16} />
                  <span>Replay the full farewell</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="symbolic-note">
        Dashami journey: sandesh for the divine family → Devi Boron and a private prayer → Sindoor Khela → procession and Visarjan in the Hooghly.
      </p>
    </section>
  )
}

export default function ChapterExperience({ chapter, onListen, session, onRequireAuth, onToast }) {
  const experience = useMemo(() => {
    switch (chapter.id) {
      case 'mahalaya': return <MahalayaExperience onListen={onListen} />
      case 'panchami': return <WeaponPuzzle />
      case 'shashthi': return <ShashthiExperience onListen={onListen} />
      case 'saptami': return <SaptamiExperience />
      case 'ashtami': return <TogetherExperience session={session} onRequireAuth={onRequireAuth} onToast={onToast} />
      case 'navami': return <SandhiExperience onListen={onListen} />
      case 'dashami': return <DashamiExperience onListen={onListen} />
      default: return <div><Lightbulb />Experience coming soon.</div>
    }
  }, [chapter.id, onListen, onRequireAuth, onToast, session])

  return <div className="experience-column">{experience}</div>
}
