/**
 * Post-install / cold-start auth landing.
 * Sign up + Sign in first; after login, tokens persist until explicit logout
 * or the server rejects the refresh token.
 */
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LightningOutlineIcon } from '../components/icons'
import { getErrorMessage, useToast } from '../components/ToastProvider'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { pushToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSignIn, setShowSignIn] = useState(
    () => new URLSearchParams(location.search).get('mode') === 'signin',
  )

  const from =
    (location.state as { from?: string } | null)?.from ||
    new URLSearchParams(location.search).get('next') ||
    '/'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      pushToast('Enter email and password')
      return
    }
    setBusy(true)
    try {
      await login({ email: email.trim(), password })
      pushToast('Welcome back', 'success')
      navigate(from.startsWith('/') ? from : '/', { replace: true })
    } catch (error) {
      pushToast(getErrorMessage(error, 'Login failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 pb-10 pt-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <LightningOutlineIcon className="mb-3 h-8 w-8 text-gray-900" strokeWidth={1.8} />
        <h1 className="text-2xl font-bold tracking-tight text-[#3b3a8c]">C-Vault</h1>
        <p className="mt-1 text-sm text-gray-500">
          {showSignIn ? 'Sign in to your vault' : 'Save offers to your vault — start here'}
        </p>
      </div>

      {!showSignIn ? (
        <div className="space-y-3">
          <Link
            to="/signup"
            className="block w-full rounded-full bg-[#3b3a8c] py-3.5 text-center text-sm font-semibold text-white"
          >
            Sign up
          </Link>
          <button
            type="button"
            onClick={() => setShowSignIn(true)}
            className="w-full rounded-full border border-[#3b3a8c]/35 bg-white py-3.5 text-sm font-semibold text-[#3b3a8c]"
          >
            Sign in
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b3a8c]"
                placeholder="you@email.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b3a8c]"
                placeholder="••••••••"
                required
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#3b3a8c] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/signup" className="font-semibold text-[#3b3a8c]">
              Sign up
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setShowSignIn(false)}
            className="mt-3 w-full text-center text-xs text-gray-400"
          >
            Back
          </button>
        </>
      )}
    </main>
  )
}
