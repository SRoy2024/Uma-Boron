import { useEffect, useRef, useState } from 'react'
import { Copy, Eye, EyeOff, KeyRound, LogIn, LogOut, Mail, ShieldCheck, UserPlus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { checkAuthRateLimit, isAdminSession, isEditorSession } from '../lib/authAccess'

export default function AuthDialog({ open, onClose, session, configured, initialMode = 'signin', onToast }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteResult, setInviteResult] = useState(null)
  const closeRef = useRef(null)
  const attemptsRef = useRef([])

  useEffect(() => {
    if (!open) return
    setMode(initialMode)
    setError('')
    closeRef.current?.focus()
  }, [initialMode, open])
  if (!open) return null

  const run = async (operation) => {
    if (!supabase) { setError('Supabase browser configuration is missing.'); return }
    setBusy(true); setError('')
    try {
      const { error: operationError } = await operation()
      if (operationError) {
        setError(operationError.status === 429 ? 'Too many requests. Please wait and try again.' : 'That account request could not be completed. Check your details and try again.')
      }
      return !operationError
    } catch {
      setError('The account service could not be reached. Please check your connection and try again.')
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const now = Date.now()
    const rateLimit = checkAuthRateLimit(attemptsRef.current, now)
    attemptsRef.current = rateLimit.recent
    if (!rateLimit.allowed) {
      setError('Too many account attempts. Please wait one minute and try again.')
      return
    }
    attemptsRef.current.push(now)
    if (mode === 'recover') {
      const ok = await run(() => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` }))
      if (ok) onToast('Recovery requested. Delivery depends on the configured email provider.')
      return
    }
    if (mode === 'signup') {
      const ok = await run(() => supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/`, data: { password_enabled: true } } }))
      if (ok) onToast('Check your email to confirm the account. Default Supabase email is not production-ready.')
      return
    }
    if (mode === 'password') {
      const ok = await run(() => supabase.auth.updateUser({
        password,
        data: { ...session?.user?.user_metadata, password_enabled: true, force_password_change: false },
      }))
      if (ok) { onToast('Password added to this account.'); setMode('signin') }
      return
    }
    const ok = await run(() => supabase.auth.signInWithPassword({ email, password }))
    if (ok) onClose()
  }

  const google = async () => {
    await run(() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/` } }))
  }

  const signOut = async () => {
    const ok = await run(() => supabase.auth.signOut())
    if (ok) { onToast('Signed out.'); onClose() }
  }

  const inviteAdmin = async (event) => {
    event.preventDefault()
    if (!supabase || !isAdminSession(session)) return
    setBusy(true); setError(''); setInviteResult(null)
    try {
      const { data, error: inviteError } = await supabase.functions.invoke('invite-admin', {
        body: { email: inviteEmail },
      })
      if (inviteError) throw inviteError
      setInviteResult(data)
      setInviteEmail('')
      onToast('Administrator invitation created.')
    } catch {
      setError('The administrator invitation could not be created. Check the address and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button ref={closeRef} className="dialog-close" type="button" onClick={onClose} aria-label="Close account dialog"><X size={19} /></button>
        <span className="auth-mark" lang="bn">উমা</span>
        <h2 id="auth-title">{session ? 'Your Uma Boron account' : mode === 'signup' ? 'Create your account' : mode === 'recover' ? 'Recover your password' : 'Keep your memories close'}</h2>
        {!configured && <p className="auth-warning">Browser-safe Supabase configuration is missing. Authentication is unavailable.</p>}
        {session ? (
          <div className="signed-in-state">
            <ShieldCheck size={28} />
            <p>Signed in as <strong>{session.user.email}</strong></p>
            {isEditorSession(session) && (
              <p className="editor-access-confirmed"><ShieldCheck size={16} />{isAdminSession(session) ? 'Administrator access active' : 'Editor access active'} — every festival chapter is unlocked.</p>
            )}
            <button className="primary-action" type="button" onClick={() => setMode('password')}><KeyRound size={17} />Set or change email password</button>
            <button className="secondary-action" type="button" onClick={signOut}><LogOut size={17} />Sign out</button>
            {mode === 'password' && <form onSubmit={submit}><PasswordField value={password} setValue={setPassword} visible={visible} setVisible={setVisible} /><button className="primary-action" disabled={busy || password.length < 8}>{busy ? 'Saving…' : 'Save password'}</button></form>}
            {isAdminSession(session) && (
              <section className="admin-invite-panel" aria-labelledby="admin-invite-title">
                <h3 id="admin-invite-title"><UserPlus size={17} />Invite an administrator</h3>
                <p>The invitee receives a secure account invitation. Share the temporary password separately and ask them to replace it after signing in.</p>
                <form onSubmit={inviteAdmin}>
                  <label>Administrator email<input type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="off" maxLength="254" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="admin@example.com" /></label>
                  <button className="primary-action" type="submit" disabled={busy}>{busy ? 'Creating invitation…' : 'Invite administrator'}</button>
                </form>
                {inviteResult?.temporaryPassword && (
                  <div className="temporary-password" role="status">
                    <span>One-time temporary password</span>
                    <code>{inviteResult.temporaryPassword}</code>
                    <button type="button" onClick={async () => { await navigator.clipboard.writeText(inviteResult.temporaryPassword); onToast('Temporary password copied.') }}><Copy size={15} />Copy</button>
                    <small>This value is shown only now. Send it through a separate trusted channel.</small>
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          <>
            <div className="auth-mode-tabs" role="tablist" aria-label="Account action">
              <button type="button" className={mode === 'signin' ? 'is-active' : ''} onClick={() => setMode('signin')}><LogIn size={15} />Sign in</button>
              <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}><UserPlus size={15} />Sign up</button>
            </div>
            {mode !== 'recover' && <button className="google-button" type="button" onClick={google} disabled={busy || !configured}><span>G</span>Continue with Google</button>}
            {mode !== 'recover' && <div className="auth-divider"><span>or use email</span></div>}
            <form onSubmit={submit}>
              <label>Email<input type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="email" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              {mode !== 'recover' && <PasswordField value={password} setValue={setPassword} visible={visible} setVisible={setVisible} />}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-action" type="submit" disabled={busy || !configured}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'recover' ? 'Send recovery link' : 'Sign in'}</button>
            </form>
            <div className="auth-links">
              {mode === 'signin' && <button type="button" onClick={() => setMode('recover')}>Forgot password?</button>}
              {mode !== 'signin' && <button type="button" onClick={() => setMode('signin')}>Back to sign in</button>}
            </div>
          </>
        )}
        <p className="auth-footnote"><Mail size={14} />Email verification and recovery require a production SMTP provider. Google, Spotify, and Calendar permissions remain separate.</p>
      </section>
    </div>
  )
}

function PasswordField({ value, setValue, visible, setVisible }) {
  return <label>Password<span className="password-wrap"><input type={visible ? 'text' : 'password'} autoComplete="current-password" minLength="8" maxLength="128" required value={value} onChange={(event) => setValue(event.target.value)} /><button type="button" onClick={() => setVisible((state) => !state)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
}
