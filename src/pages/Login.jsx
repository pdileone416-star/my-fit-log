import { Heart, LockKeyhole, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { loginUser, registerUser } from '../utils/storage'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function passwordIsReady(password) {
    return password.length >= 8
      && /[A-Z]/.test(password)
      && /[a-z]/.test(password)
      && /\d/.test(password)
  }

  async function submit(event) {
    event.preventDefault()
    if (mode === 'register' && !passwordIsReady(form.password)) {
      setError('La password deve avere almeno 8 caratteri, una maiuscola, una minuscola e un numero.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = mode === 'login' ? await loginUser(form) : await registerUser(form)
      onLogin(user)
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <main className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-blush-border bg-warm-white p-5 shadow-soft sm:p-7">
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-blush text-title">
            <Heart size={28} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold uppercase tracking-wide text-accent">My Fit Log</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-title sm:text-4xl">
            Il tuo diario fit, protetto e pronto sul telefono.
          </h1>
          <p className="mt-3 text-sm leading-6 text-text sm:text-base">
            Crea un profilo locale per tenere separati diario alimentare, workout, progressi e schede. I dati restano salvati nel browser anche dopo il refresh.
          </p>
        </section>

        <Card className="p-5 sm:p-7">
          <div className="mb-5 flex rounded-2xl bg-pink-bg p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${mode === 'login' ? 'bg-accent text-white' : 'text-title'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${mode === 'register' ? 'bg-accent text-white' : 'text-title'}`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === 'register' ? (
              <Input label="Nome" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            ) : null}
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            <Input
              label="Password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 8 : undefined}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
            {mode === 'register' ? (
              <p className="rounded-xl bg-pink-bg px-3 py-2 text-xs font-semibold text-title">
                Usa almeno 8 caratteri con maiuscola, minuscola e numero.
              </p>
            ) : null}

            {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {mode === 'login' ? <LogIn size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
              {loading ? 'Attendi...' : mode === 'login' ? 'Entra' : 'Crea profilo'}
            </Button>
          </form>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-text">
            <LockKeyhole size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            Protezione locale: per sincronizzare gli stessi dati tra PC e smartphone servira in futuro un database cloud.
          </p>
        </Card>
      </main>
    </div>
  )
}
