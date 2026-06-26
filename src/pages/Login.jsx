import { LockKeyhole, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
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
      <main className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-5 lg:grid-cols-[1fr_1fr]">

        {/* Left: brand panel */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #ffe79a 0%, #e5b83d 54%, #b88918 100%)',
            boxShadow: '0 20px 60px rgba(229,184,61,0.28)',
          }}
        >
          <div className="relative z-10">
            <span className="mb-5 grid size-16 place-items-center overflow-hidden rounded-2xl bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <img src="/favicon.svg" alt="" className="size-12" />
            </span>
            <p className="text-sm font-bold uppercase tracking-widest text-[#3a2d0d]/70">My Fit Log</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#2b2410] sm:text-4xl">
              Il tuo diario fit, protetto e sempre con te.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#3a2d0d]/80">
              Peso, pasti, workout e progressi in un unico posto. Semplice da usare ogni giorno, direttamente dal telefono.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Diario alimentare', 'Schede workout', 'Progressi peso', 'Solo tuo'].map((tag) => (
                <span key={tag} className="rounded-full bg-white/35 px-3 py-1 text-sm font-semibold text-[#2b2410] backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Right: form */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          {/* mode switcher */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-blush/50 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gradient-to-br from-accent-light to-accent text-[#2b2410] shadow-[0_4px_12px_rgba(229,184,61,0.3)]'
                  : 'text-title hover:bg-white/40'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gradient-to-br from-accent-light to-accent text-[#2b2410] shadow-[0_4px_12px_rgba(229,184,61,0.3)]'
                  : 'text-title hover:bg-white/40'
              }`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === 'register' && (
              <Input label="Nome" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            )}
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
            {mode === 'register' && (
              <p className="rounded-2xl bg-blush/60 px-4 py-3 text-xs font-semibold text-title">
                Usa almeno 8 caratteri con maiuscola, minuscola e numero.
              </p>
            )}

            {error && (
              <p className="rounded-2xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {mode === 'login' ? <LogIn size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
              {loading ? 'Attendi...' : mode === 'login' ? 'Entra' : 'Crea profilo'}
            </Button>
          </form>

          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-text/60">
            <LockKeyhole size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            I dati restano salvati solo nel browser. Per sincronizzare tra dispositivi servira in futuro un cloud.
          </p>
        </div>
      </main>
    </div>
  )
}
