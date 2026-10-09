import { useState } from 'react'
import {
  Check,
  Copy,
  Heart,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

export default function SupportModal({ isOpen, onClose, onToast }) {
  const [copiedId, setCopiedId] = useState('')

  if (!isOpen) return null

  const upiId = '6289770990@idfcfirst'

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId)
    setCopiedId(upiId)
    setTimeout(() => setCopiedId(''), 3000)
    if (onToast) onToast('UPI ID copied: ' + upiId)
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="support-modal-title">
      <div className="app-modal-dialog support-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="badge-row">
              <span className="gold-chip"><Heart size={13} fill="currentColor" /> Voluntary Support</span>
              <span className="subtle-chip">Artists & Independent Engineering</span>
            </div>
            <h2 id="support-modal-title">Support Uma Boron</h2>
            <p>
              An independent, ad-free digital shrine preserving the living sounds, rituals, and community warmth of Durga Puja.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close support modal">
            <X size={20} />
          </button>
        </div>

        <div className="support-recipients-grid">
          {/* Developer Card */}
          <div className="recipient-card">
            <div className="recipient-head">
              <div className="recipient-avatar">SR</div>
              <div>
                <h3>Soham Roy</h3>
                <small className="role-tag">Product Creator & Engineering</small>
              </div>
            </div>
            <p className="recipient-bio">
              Crafted Uma Boron to bring Bengalis away from home closer to the festive atmosphere of the streets, pandals, and dawn radios.
            </p>

            <div className="upi-box">
              <div className="upi-details">
                <span className="upi-label">UPI Identifier</span>
                <strong>{upiId}</strong>
              </div>
              <button type="button" className="copy-upi-btn" onClick={handleCopyUpi} aria-label="Copy UPI ID">
                {copiedId === upiId ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedId === upiId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="qr-container">
              <figure className="payment-qr-card">
                <img
                  src="/soham-roy-upi-qr.jpeg"
                  alt="Soham Roy payment QR code for voluntary developer support"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Scan with any UPI app to support the developer</figcaption>
              </figure>
            </div>
          </div>

          {/* Traditional Bauls & Folk Artists Card */}
          <div className="recipient-card">
            <div className="recipient-head">
              <div className="recipient-avatar artist">🎶</div>
              <div>
                <h3>Traditional Dhakis & Bauls Fund</h3>
                <small className="role-tag">Bengal Heritage Artists Support</small>
              </div>
            </div>
            <p className="recipient-bio">
              Supporting rural Bengal Dhak drummers and folk baul singers during and following the festive season.
            </p>
            <div className="folk-fund-pledge">
              <Sparkles size={16} className="text-gold" />
              <span>
                100% of community folk tips are designated toward grassroots folk artists and instrument makers across Bengal.
              </span>
            </div>
            <div className="upi-box">
              <div className="upi-details">
                <span className="upi-label">Folk Trust UPI</span>
                <strong>folktrustbengal@upi</strong>
              </div>
              <button
                type="button"
                className="copy-upi-btn"
                onClick={() => {
                  navigator.clipboard?.writeText('folktrustbengal@upi')
                  if (onToast) onToast('Copied folktrustbengal@upi')
                }}
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <small>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Voluntary cultural contribution. No payment is required to access any part of Uma Boron. No banking credentials enter the frontend.
          </small>
        </div>
      </div>
    </div>
  )
}
