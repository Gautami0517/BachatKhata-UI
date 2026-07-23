/**
 * Signup — POST /auth/signup → auto POST /auth/login → Dashboard.
 * Signup alone returns 201 empty; tokens only come from login.
 */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LightningOutlineIcon } from '../components/icons'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import { isValidPassword, PASSWORD_HINT } from '../utils/password'

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      pushToast('Fill in all fields')
      return
    }
    if (!isValidPassword(password)) {
      pushToast(PASSWORD_HINT)
      return
    }
    if (password !== confirmPassword) {
      pushToast('Passwords do not match')
      return
    }

    setBusy(true)
    try {
      await signup({
        email: trimmedEmail,
        name: trimmedName,
        password,
        confirmPassword,
      })
      pushToast('Account created', 'success')
      navigate('/', { replace: true })
    } catch (error) {
      pushToast(getErrorMessage(error, 'Signup failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 pb-10 pt-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <LightningOutlineIcon className="mb-3 h-8 w-8 text-gray-900" strokeWidth={1.8} />
        <h1 className="text-2xl font-bold tracking-tight text-[#3b3a8c]">C-Vault</h1>
        <p className="mt-1 text-sm text-gray-500">Create your vault</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">Name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b3a8c]"
            placeholder="Your name"
            required
          />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b3a8c]"
            placeholder="••••••••"
            required
            minLength={8}
          />
          <span className="mt-1 block text-[11px] text-gray-400">{PASSWORD_HINT}</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b3a8c]"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[#3b3a8c] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#3b3a8c]">
          Sign in
        </Link>
      </p>
    </main>
  )
}
