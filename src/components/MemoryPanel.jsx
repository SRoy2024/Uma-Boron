import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Contact,
  Copy,
  Download,
  Heart,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { downloadICSFile } from '../data/calendarEvents'
import { inferRelationshipFromContactName } from '../lib/contactInference'

export const relationshipCatalogue = [
  {
    id: 'mom',
    label: 'Mother · মা',
    bengali: 'মা',
    aliases: [
      { term: 'Ma', lang: 'bn', script: 'মা' },
      { term: 'Maa', lang: 'hi', script: 'माँ' },
      { term: 'Mom', lang: 'en', script: 'Mom' },
      { term: 'Mummy', lang: 'hi/en', script: 'मम्मी' },
      { term: 'Amma', lang: 'bn/ta', script: 'আম্মা / அம்மா' },
      { term: 'Mamoni', lang: 'bn', script: 'মামণি' },
      { term: 'Mataji', lang: 'hi', script: 'माताजी' },
      { term: 'Aai', lang: 'mr', script: 'आई' },
      { term: 'Ammi', lang: 'ur', script: 'अम्मी' },
    ],
    prompts: [
      'The first dawn notes of Mahishasura Mardini played and I thought of you, Ma. Pujo is here.',
      'মা, ঢাকের আওয়াজ আর শিউলি ফুলের গন্ধে তোমার হাতের পুজোর রান্না খুব মনে পড়ছে।',
      'माँ, इस पूजा पर घर की और आपके बनाए भोग की बहुत याद आ रही है। आपका आशीर्वाद साथ रहे।',
      'Watching the pandal lights glow from away, all I want is to stand with you for Pushpanjali, Ma.',
    ],
  },
  {
    id: 'dad',
    label: 'Father · বাবা',
    bengali: 'বাবা',
    aliases: [
      { term: 'Baba', lang: 'bn', script: 'বাবা' },
      { term: 'Papa', lang: 'hi', script: 'पापा' },
      { term: 'Dad', lang: 'en', script: 'Dad' },
      { term: 'Bapi', lang: 'bn', script: 'বাপি' },
      { term: 'Pitaji', lang: 'hi', script: 'पिताजी' },
      { term: 'Abba', lang: 'bn/ur', script: 'আব্বা / अब्बा' },
      { term: 'Babamoni', lang: 'bn', script: 'বাবামণি' },
      { term: 'Bauji', lang: 'hi', script: 'बाउजी' },
      { term: 'Appa', lang: 'ta', script: 'அப்பா' },
    ],
    prompts: [
      'Baba, the dhaak beats started and I remembered holding your hand to see the tallest idols.',
      'বাবা, পুজোর বাজারে সেই ভোরবেলা বেরিয়ে পদ্ম ফুল আর নতুন জামা কেনার স্মৃতিটা আজ খুব মনে পড়ছে।',
      'पापा, ढोल की गूंज सुनते ही बचपन की वो उंगली पकड़कर पंडाल घूमने वाली यादें ताजा हो गईं।',
      'Thinking of our early morning walks to the pandal. Happy Durga Puja, Dad.',
    ],
  },
  {
    id: 'love',
    label: 'My Love · প্রিয়',
    bengali: 'আমার প্রিয়',
    aliases: [
      { term: 'Priyo', lang: 'bn', script: 'প্রিয়' },
      { term: 'Jaan', lang: 'hi', script: 'जान' },
      { term: 'My Love', lang: 'en', script: 'My Love' },
      { term: 'Bhalobasha', lang: 'bn', script: 'ভালোবাসা' },
      { term: 'Sona', lang: 'bn', script: 'সোনা' },
      { term: 'Meri Jaan', lang: 'hi', script: 'मेरी जान' },
      { term: 'Sweetheart', lang: 'en', script: 'Sweetheart' },
      { term: 'Jaanu', lang: 'hi', script: 'जानू' },
      { term: 'Shona', lang: 'bn', script: 'শোনা' },
    ],
    prompts: [
      'The evening pandal lamps are glowing, and all I wish is to walk through the crowd holding your hand.',
      'অষ্টমীর অঞ্জলির লাল-সাদা ভিড়ের মাঝে আমার চোখ শুধু তোমাকেই খুঁজছিল।',
      'रोशनी से सजे इस भव्य मंडप में बस तुम्हारा हाथ थामकर ये पल जीने की ख्वाहिश है।',
      'Between every rhythm of the dhaak and the autumn breeze, my heart stays with you.',
    ],
  },
  {
    id: 'sibling',
    label: 'Sibling · ভাই / বোন',
    bengali: 'ভাই / বোন',
    aliases: [
      { term: 'Bhai', lang: 'bn/hi', script: 'ভাই / भाई' },
      { term: 'Dada', lang: 'bn', script: 'দাদা' },
      { term: 'Didi', lang: 'bn/hi', script: 'দিদি / दीदी' },
      { term: 'Bon', lang: 'bn', script: 'বোন' },
      { term: 'Bhaiya', lang: 'hi', script: 'भैया' },
      { term: 'Behna', lang: 'hi', script: 'बहনা' },
      { term: 'Bro', lang: 'en', script: 'Bro' },
      { term: 'Sis', lang: 'en', script: 'Sis' },
      { term: 'Chhotu', lang: 'bn/hi', script: 'ছোটু / छोटू' },
      { term: 'Anna', lang: 'ta', script: 'அண்ணா' },
    ],
    prompts: [
      'Remember fighting over the last spoonful of Ashtami bhog? Missing our chaos this Pujo!',
      'দাদা/দিদি, ছোটবেলার সেই সারা রাত জেগে দল বেঁধে ঠাকুর দেখার দিনগুলোর কথা খুব মনে পড়ছে।',
      'भाई, इस बार भी तेरे बिना रात भर पंडाल घूमने और स्ट्रीट फूड खाने में वो मज़ा नहीं आ रहा।',
      'Pandal hopping until 3 AM isn’t the same without you teasing me.',
    ],
  },
  {
    id: 'friend',
    label: 'Friend · বন্ধু',
    bengali: 'বন্ধু',
    aliases: [
      { term: 'Bondhu', lang: 'bn', script: 'বন্ধু' },
      { term: 'Dost', lang: 'hi', script: 'दोस्त' },
      { term: 'Yaar', lang: 'hi', script: 'यार' },
      { term: 'Bestie', lang: 'en', script: 'Bestie' },
      { term: 'Sakha', lang: 'bn/hi', script: 'সখা / सखा' },
      { term: 'Mitr', lang: 'hi', script: 'मित्र' },
      { term: 'Buddy', lang: 'en', script: 'Buddy' },
    ],
    prompts: [
      'Maddox Square adda, tea in clay bhars, and laughing till midnight — missing our crew so much!',
      'দোস্ত, পুজোর সেই চিরচেনা আড্ডা আর ঢাকের তালের ধুনুচি নাচ তোকে ছাড়া জমছে না।',
      'यार, पंडाल की रौनक और रात की चाय की चुस्कियां तेरे बिना अधूरी हैं। शुभ दुर्गा पूजा!',
      'Every time the dhaak rolls crescendo, I look around for our usual gang.',
    ],
  },
]

export default function MemoryPanel({ chapter, session, onRequireAuth, onToast }) {
  const [relationshipId, setRelationshipId] = useState('friend')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const hasContactsApi = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window
  const [contactSelected, setContactSelected] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  const currentCat = useMemo(
    () => relationshipCatalogue.find((c) => c.id === relationshipId) || relationshipCatalogue[0],
    [relationshipId],
  )

  const activePrompt = useMemo(() => {
    const list = currentCat.prompts
    return list[promptIndex % list.length]
  }, [currentCat, promptIndex])

  const message = useMemo(() => {
    const trimmed = name.trim()
    if (!trimmed) return activePrompt
    if (activePrompt.startsWith(trimmed)) return activePrompt
    return `${trimmed}, ${activePrompt.charAt(0).toLowerCase()}${activePrompt.slice(1)}`
  }, [activePrompt, name])

  const handleNameChange = (val) => {
    setName(val)
    if (val.trim()) setRelationshipId(inferRelationshipFromContactName(val).id)
  }

  // Select contact from phone address book using Web Contacts Picker API
  const handlePickPhoneContact = async () => {
    if (hasContactsApi) {
      try {
        const props = ['name', 'tel']
        const contacts = await navigator.contacts.select(props, { multiple: false })
        if (contacts && contacts.length > 0) {
          const c = contacts[0]
          const pickedName = (c.name && c.name[0]) || ''
          const pickedTel = (c.tel && c.tel[0]) || ''
          if (pickedName) handleNameChange(pickedName)
          if (pickedTel) setPhone(pickedTel)
          setContactSelected(true)
          setManualMode(false)
          if (onToast) onToast(`Connected contact: ${pickedName || pickedTel}`)
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.warn('Contacts select error:', err)
          setManualMode(true)
          if (onToast) onToast('The contact could not be read. You can enter it manually instead.')
        }
      }
    } else {
      setManualMode(true)
      if (onToast) onToast('Contact picking is not supported by this browser. Manual entry is ready below.')
    }
  }

  const copyMessage = async () => {
    await navigator.clipboard?.writeText(message)
    if (onToast) onToast('Message copied to clipboard!')
  }

  const shareMessage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A ${chapter.name} Pujo Note from Uma Boron`,
          text: message,
        })
      } catch {
        copyMessage()
      }
    } else {
      copyMessage()
    }
  }

  const saveMemory = async () => {
    if (!session) {
      onRequireAuth()
      return
    }
    if (!supabase) {
      if (onToast) onToast('Cloud saving requires Supabase configuration.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('memories').insert({
      user_id: session.user.id,
      chapter: chapter.id,
      title: `${name.trim() || currentCat.label} · ${chapter.name}`,
      body: message,
    })
    setSaving(false)
    if (onToast) {
      onToast(error ? 'Could not save memory. Verified policy required.' : 'Saved privately to your Uma Boron memories.')
    }
  }

  const downloadCalendarIcs = () => {
    downloadICSFile('Durga-Puja-2026-Uma-Boron.ics')
    if (onToast) onToast('Durga Puja 2026 Calendar (.ics) downloaded! Open to import into your calendar.')
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  const whatsappUrl = phone.trim()
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`

  return (
    <aside className="memory-panel" aria-label="Nostalgia, contacts, and calling">
      {/* Header */}
      <div className="memory-header-lockup">
        <span className="panel-kicker"><Heart size={15} fill="currentColor" /> Connecting Loved Ones</span>
        <h2>Who Are You Missing This Pujo?</h2>
        <p className="memory-subhead">
          Choose someone from your phone first. Uma Boron fills their details and suggests the closest relationship automatically.
        </p>
      </div>

      <div className="contact-first-card">
        <div>
          <Contact size={22} />
          <strong>{contactSelected ? `${name || 'Contact'} connected` : 'Start with your phone contacts'}</strong>
          <p>{contactSelected ? `Suggested relationship: ${currentCat.label}` : 'Your browser asks permission and shares only the one person you choose.'}</p>
        </div>
        <div className="contact-first-actions">
          <button type="button" className="primary-action" onClick={handlePickPhoneContact}>
            <Contact size={16} />
            <span>{contactSelected ? 'Choose another contact' : 'Choose a contact'}</span>
          </button>
          {!contactSelected && !manualMode && (
            <button type="button" className="secondary-action" onClick={() => setManualMode(true)}>Enter manually instead</button>
          )}
        </div>
      </div>

      {(contactSelected || manualMode) && <>
        <div className="relationship-options" role="group" aria-label="Confirm relationship">
          {relationshipCatalogue.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={relationshipId === cat.id ? 'is-active' : ''}
              onClick={() => setRelationshipId(cat.id)}
              aria-pressed={relationshipId === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="contact-form-grid">
        <div className="input-group">
          <label htmlFor="contactNameInput">Name or Nickname</label>
          <input
            id="contactNameInput"
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Contact name"
          />
        </div>

        <div className="input-group">
          <label htmlFor="contactPhoneInput">Phone Number (stays private on device)</label>
          <input
            id="contactPhoneInput"
            inputMode="tel"
            autoComplete="tel"
            maxLength={32}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98300 XXXXX"
          />
        </div>
        </div>
      </>}

      {/* Rendered Emotional Wish Note */}
      <div className="memory-note-box">
        <div className="note-text-body">
          <MessageSquare size={16} className="text-gold" />
          <p>{message}</p>
        </div>
        <div className="note-controls">
          <button type="button" onClick={copyMessage} aria-label="Copy wish message" title="Copy message">
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="another-prompt-btn"
            onClick={() => setPromptIndex((i) => i + 1)}
            title="Get another emotional prompt"
          >
            <RefreshCw size={14} />
            <span>Another Message</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Call, WhatsApp, Share, Save */}
      <div className="memory-actions-row">
        <a
          className={`primary-action call-action-btn ${phone.trim() ? '' : 'is-disabled'}`}
          href={cleanPhone ? `tel:${cleanPhone}` : undefined}
          aria-disabled={!phone.trim()}
          title={phone.trim() ? `Direct dial ${name || 'contact'}` : 'Enter phone number to dial'}
        >
          <Phone size={17} />
          <span>{phone.trim() ? `Call ${name || 'Now'}` : 'Enter Number to Call'}</span>
        </a>

        <a
          className="secondary-action whatsapp-action-btn"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          title="Send wish on WhatsApp"
        >
          <MessageCircle size={17} />
          <span>WhatsApp Wish</span>
        </a>

        <button type="button" className="secondary-action" onClick={shareMessage} title="Share wish note">
          <Share2 size={17} />
          <span>Share</span>
        </button>

        <button type="button" className="secondary-action" onClick={saveMemory} disabled={saving} title="Save to memories">
          <Save size={17} />
          <span>{saving ? 'Saving…' : 'Save'}</span>
        </button>
      </div>

      {/* Calendar Auto-Sync Sign Up Call-To-Action Banner */}
      <div className="calendar-sync-signup-banner">
        <div className="banner-text-left">
          <CalendarDays size={22} className="text-gold" />
          <div>
            <strong>Want the verified Pujo dates in your calendar?</strong>
            <p>
              Download all ritual reminders, then open the .ics file in Google Calendar, Apple Calendar, or Outlook. Sign in to keep notification preferences with your account.
            </p>
          </div>
        </div>
        <div className="banner-buttons-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="secondary-action calendar-download-btn"
            onClick={downloadCalendarIcs}
            title="Download .ics Calendar file for iPhone, Google Calendar, and Outlook"
          >
            <Download size={14} />
            <span>Download .ics</span>
          </button>
          <button
            type="button"
            className="primary-action sync-signup-btn"
            onClick={() => {
              if (session) {
                if (onToast) onToast('Your account is connected. Download the .ics file to add the verified reminders to your calendar.')
              } else {
                onRequireAuth()
              }
            }}
          >
            {session ? (
              <>
                <UserCheck size={16} />
                <span>Account Connected</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Sign Up for Reminders</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="privacy-note">
        🔒 Phone numbers and private contacts stay strictly on your device. Uma Boron never uploads or shares your address book.
      </p>
    </aside>
  )
}
