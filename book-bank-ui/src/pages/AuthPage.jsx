import React, { useState } from 'react'
import { Button } from '../components/Button'

/* ── Left-panel fanned book silhouettes ──────────────────── */

const FAN_BOOKS = [
  { rotate: -24, left: '8%',  w: 70,  h: 178, opacity: 0.07 },
  { rotate: -12, left: '22%', w: 82,  h: 205, opacity: 0.10 },
  { rotate:   0, left: '36%', w: 90,  h: 222, opacity: 0.12 },
  { rotate:  12, left: '50%', w: 82,  h: 205, opacity: 0.10 },
  { rotate:  24, left: '62%', w: 70,  h: 178, opacity: 0.07 },
]

function BookFan() {
  return (
    <div className="auth-fan" aria-hidden="true">
      {FAN_BOOKS.map((b, i) => (
        <div
          key={i}
          className="auth-fan__book"
          style={{
            left:      b.left,
            width:     b.w,
            height:    b.h,
            transform: `rotate(${b.rotate}deg)`,
            opacity:   b.opacity,
          }}
        />
      ))}
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */

function IconEyeOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IconEyeClosed() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6.5 6.8a2 2 0 002.7 2.7M4 4.4C2.6 5.5 1.5 7.1 1 8c1.1 2.3 3.8 5 7 5 1.3 0 2.5-.4 3.6-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.3 3.1C7.5 3 7.8 3 8 3c3.2 0 5.9 2.7 7 5-.4.8-1 1.6-1.7 2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Reusable form field ─────────────────────────────────── */

function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
  const [showPw, setShowPw] = useState(false)
  const isPassword  = type === 'password'
  const resolvedType = isPassword ? (showPw ? 'text' : 'password') : type

  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={resolvedType}
          className={`auth-input${isPassword ? ' auth-input--pw' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPw ? <IconEyeOpen /> : <IconEyeClosed />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Login form ──────────────────────────────────────────── */

function LoginForm({ onSwitch }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8001/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.detail || (data.non_field_errors && data.non_field_errors[0]) || 'Invalid email or password.'
        setError(msg)
        return
      }
      localStorage.setItem('bb_access', data.access)
      localStorage.setItem('bb_refresh', data.refresh)
      localStorage.setItem('bb_user', JSON.stringify(data.user))
      window.location.hash = '#account'
    } catch (err) {
      setError('Could not connect to backend server at http://localhost:8001')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div style={{
          background: 'rgba(180, 40, 40, 0.1)',
          border: '1px solid rgba(180, 40, 40, 0.3)',
          color: '#b42828',
          padding: '10px 14px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          marginBottom: '14px',
        }}>
          {error}
        </div>
      )}

      <Field
        id="login-email" label="Email address" type="email"
        value={email} onChange={setEmail}
        placeholder="you@university.edu" autoComplete="email"
      />
      <Field
        id="login-password" label="Password" type="password"
        value={password} onChange={setPassword}
        placeholder="••••••••" autoComplete="current-password"
      />

      <div className="auth-forgot-row">
        <a href="#" className="auth-forgot" onClick={e => e.preventDefault()}>
          Forgot password?
        </a>
      </div>

      <Button
        variant="ochre"
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '13px 20px', fontSize: '0.9375rem', justifyContent: 'center' }}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="auth-switch">
        New to Book Bank?{' '}
        <button type="button" className="auth-switch__link" onClick={onSwitch}>
          Create an account
        </button>
      </p>
    </form>
  )
}

/* ── Register form ───────────────────────────────────────── */

function RegisterForm({ onSwitch }) {
  const [name,      setName]      = useState('')
  const [studentId, setStudentId] = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !studentId || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8001/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          enrollment_number: studentId.trim(),
          email: email.trim(),
          password,
          confirm_password: confirm,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const firstKey = Object.keys(data)[0]
        const firstVal = data[firstKey]
        const msg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : 'Registration failed.')
        setError(msg)
        return
      }
      localStorage.setItem('bb_access', data.access)
      localStorage.setItem('bb_refresh', data.refresh)
      localStorage.setItem('bb_user', JSON.stringify(data.user))
      window.location.hash = '#account'
    } catch (err) {
      setError('Could not connect to backend server at http://localhost:8001')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div style={{
          background: 'rgba(180, 40, 40, 0.1)',
          border: '1px solid rgba(180, 40, 40, 0.3)',
          color: '#b42828',
          padding: '10px 14px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          marginBottom: '14px',
        }}>
          {error}
        </div>
      )}

      <Field
        id="reg-name" label="Full name"
        value={name} onChange={setName}
        placeholder="Jane Smith" autoComplete="name"
      />
      <Field
        id="reg-sid" label="Student / Staff ID"
        value={studentId} onChange={setStudentId}
        placeholder="S-20240001" autoComplete="off"
      />
      <Field
        id="reg-email" label="University email" type="email"
        value={email} onChange={setEmail}
        placeholder="jsmith@university.edu" autoComplete="email"
      />
      <Field
        id="reg-password" label="Password" type="password"
        value={password} onChange={setPassword}
        placeholder="At least 8 characters" autoComplete="new-password"
      />
      <Field
        id="reg-confirm" label="Confirm password" type="password"
        value={confirm} onChange={setConfirm}
        placeholder="••••••••" autoComplete="new-password"
      />

      <Button
        variant="ochre"
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '13px 20px', fontSize: '0.9375rem', justifyContent: 'center', marginTop: '4px' }}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="auth-switch__link" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </form>
  )
}

/* ── Page ────────────────────────────────────────────────── */

export default function AuthPage({ mode = 'login' }) {
  const [currentMode, setCurrentMode] = useState(mode)
  const isLogin = currentMode === 'login'

  const switchTo = (m) => {
    setCurrentMode(m)
    window.history.replaceState(null, '', `#${m}`)
  }

  return (
    <div className="auth-page">

      {/* ── Left — ink panel ── */}
      <aside className="auth-left">
        {/* Logo */}
        <div className="auth-left__logo">
          <span className="auth-left__logo-name">Book Bank</span>
          <span className="auth-left__logo-sub">Management System</span>
        </div>

        {/* Quote */}
        <div className="auth-left__body">
          <blockquote className="auth-left__quote">
            Every borrowed<br />page is a world<br />returned.
          </blockquote>
          <cite className="auth-left__cite">— The Book Bank</cite>
        </div>

        {/* Fanned silhouettes at bottom */}
        <BookFan />
      </aside>

      {/* ── Right — form panel ── */}
      <main className="auth-right">
        <div className="auth-right__inner">

          {/* Tab toggle */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              id="tab-login"
              role="tab"
              aria-selected={isLogin}
              aria-controls="auth-panel"
              className={`auth-tab${isLogin ? ' active' : ''}`}
              onClick={() => switchTo('login')}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={!isLogin}
              aria-controls="auth-panel"
              className={`auth-tab${!isLogin ? ' active' : ''}`}
              onClick={() => switchTo('register')}
            >
              Register
            </button>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-sub">
            {isLogin
              ? 'Sign in to manage your loans and reservations.'
              : 'Join Book Bank to borrow, reserve, and track your reading.'
            }
          </p>

          {/* Form panel */}
          <div id="auth-panel" role="tabpanel">
            {isLogin
              ? <LoginForm  key="login"    onSwitch={() => switchTo('register')} />
              : <RegisterForm key="register" onSwitch={() => switchTo('login')}   />
            }
          </div>

          {/* Back link */}
          <div className="auth-back">
            <a
              href="#catalog"
              onClick={e => { e.preventDefault(); window.location.hash = '#catalog' }}
            >
              ← Back to catalogue
            </a>
          </div>

        </div>
      </main>
    </div>
  )
}
