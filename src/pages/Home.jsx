import { AlertCircle, CheckCircle2, Dumbbell, HeartPulse, LineChart, Plus, Scale } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { formatDate, todayISO } from '../utils/storage'

function Stat({ icon: Icon, title, value, gradient = 'from-blush to-sage' }) {
  return (
    <article style={{ background: 'var(--s1)', border: '1px solid var(--b)', borderRadius: 18, padding: 14 }}>
      <div>
        <span className={`mb-2 grid size-8 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br ${gradient}`}>
          <Icon size={17} aria-hidden="true" className="text-title" />
        </span>
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-text/30">{title}</p>
          <p className="text-[22px] font-black tracking-[-0.5px] text-title">{value}</p>
        </div>
      </div>
    </article>
  )
}

function dayRatingValue(log) {
  const value = Number(log?.dayRating)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function supplementsTaken(log) {
  return Array.isArray(log?.supplementItems) ? log.supplementItems.length > 0 : Boolean(log?.supplements?.trim())
}

function missingMeals(log) {
  if (!log) return ['colazione', 'pranzo', 'merenda', 'cena']
  return [
    ['breakfast', 'colazione'],
    ['lunch', 'pranzo'],
    ['snack', 'merenda'],
    ['dinner', 'cena'],
  ].filter(([key]) => !log[key]?.trim()).map(([, label]) => label)
}

function miniDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
}

function dateFromISO(date) {
  return new Date(`${date}T12:00:00`)
}

function addDays(date, days) {
  const nextDate = dateFromISO(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

function diffDays(fromDate, toDate) {
  const dayMs = 24 * 60 * 60 * 1000
  return Math.round((dateFromISO(toDate) - dateFromISO(fromDate)) / dayMs)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const weightGoal = [
  ['1', '52,0 kg'],
  ['10', '50,8 kg'],
  ['20', '49,8 kg'],
  ['30', '48,7 kg'],
  ['40', '47,6 kg'],
  ['50', '46,5-47,0 kg'],
]

export default function Home({ dailyLogs, goTo }) {
  const today = todayISO()
  const challengeStart = '2026-06-23'
  const challengeLength = 50
  const challengeEnd = addDays(challengeStart, challengeLength - 1)
  const rawChallengeDay = diffDays(challengeStart, today) + 1
  const challengeDay = clamp(rawChallengeDay, 0, challengeLength)
  const challengeRemaining = Math.max(challengeLength - challengeDay, 0)
  const challengeProgress = Math.round((challengeDay / challengeLength) * 100)
  const challengeLogs = dailyLogs.filter((log) => log.date >= challengeStart && log.date <= challengeEnd).length
  const todayLog = dailyLogs.find((log) => log.date === today)
  const sortedWeights = [...dailyLogs].filter((log) => log.weight).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const currentWeight = sortedWeights[0]?.weight
  const firstWeight = sortedWeights[sortedWeights.length - 1]?.weight
  const weightDelta = currentWeight && firstWeight ? (Number(currentWeight) - Number(firstWeight)).toFixed(1) : null
  const ratedLogs = dailyLogs.filter((log) => dayRatingValue(log))
  const goodRatedLogs = ratedLogs.filter((log) => dayRatingValue(log) >= 4)
  const chartLogs = [...dailyLogs]
    .filter((log) => dayRatingValue(log))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(-8)
  const last7Dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T12:00:00`)
    date.setDate(date.getDate() - index)
    return date.toISOString().slice(0, 10)
  })
  const last7Logs = last7Dates.map((date) => dailyLogs.find((log) => log.date === date)).filter(Boolean)
  const mealsToComplete = missingMeals(todayLog)
  const completionItems = [
    Boolean(todayLog?.weight),
    mealsToComplete.length === 0,
    Boolean(todayLog?.feelingStatus || todayLog?.feeling),
    Boolean(dayRatingValue(todayLog)),
    supplementsTaken(todayLog),
  ]
  const completed = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)
  const reminderItems = [
    !dayRatingValue(todayLog) ? 'Inserisci la valutazione da 1 a 5.' : '',
    !todayLog?.weight ? 'Inserisci il peso, se oggi ti sei pesata.' : '',
    mealsToComplete.length ? `Completa pasti: ${mealsToComplete.join(', ')}.` : '',
    !(todayLog?.feelingStatus || todayLog?.feeling) ? 'Aggiungi come ti senti.' : '',
    !supplementsTaken(todayLog) ? 'Seleziona integratori / applicazioni presi oggi.' : '',
  ].filter(Boolean)

  return (
    <div className="grid gap-0 pt-1">

      {/* Hero banner */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(240,96,48,0.10) 0%, rgba(255,122,66,0.06) 100%)',
          border: '1px solid var(--b)',
          borderRadius: 24,
          padding: 16,
          margin: '0 14px 10px',
        }}
      >
        <div className="relative">
          <p className="text-[13px] font-bold text-accent">{formatDate(today)}</p>
          <div className="mt-2 flex flex-col gap-3">
            <div>
              <h2 className="max-w-[18rem] break-words text-[21px] font-black leading-[1.13] tracking-[-0.25px] text-title">Ciao, oggi si registra con calma.</h2>
              <p className="mt-1 text-[13px] leading-5 text-text/55">Peso, workout e benessere in un diario semplice da telefono.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              <Button className="w-full" onClick={() => {
                goTo('diary')
                setTimeout(() => window.dispatchEvent(new Event('my-fit-log-new-daily')), 0)
              }}>
                <Plus size={17} />Nuova giornata
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => goTo('progress')}>
                <LineChart size={17} />Progressi
              </Button>
              <Button type="button" variant="ghost" className="w-full min-[420px]:col-span-2" onClick={() => goTo('workout')}>
                <Dumbbell size={17} />Workout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge card */}
      <Card
        style={{
          borderColor: 'var(--a)',
          boxShadow: '0 0 0 1px rgba(240,96,48,0.16)',
        }}
      >
        <SectionTitle title="Sfida 50 giorni" eyebrow="primo obiettivo">
          Dal 23 giugno al {formatDate(challengeEnd)}.
        </SectionTitle>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: challengeDay ? 'Oggi sei al' : 'Partenza', value: challengeDay ? `Giorno ${challengeDay}` : 'Domani', sub: `su ${challengeLength}` },
              { label: 'Mancano', value: challengeRemaining, sub: 'giorni al traguardo' },
              { label: 'Giornate registrate', value: challengeLogs, sub: 'dentro la sfida' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="min-w-0 rounded-xl bg-blush px-2 py-3 text-center">
                <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.04em] text-text/30">{label}</p>
                <p className="break-words text-[22px] font-black leading-tight tracking-[-0.6px] text-accent">{value}</p>
                <p className="text-[10px] font-semibold leading-tight text-text/35">{sub}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[#2e2e33]">
              <div className="progress-bar h-full rounded-full transition-all duration-700" style={{ width: `${challengeProgress}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-bold text-text/35">{challengeProgress}% completato - traguardo: {formatDate(challengeEnd)}.</p>
          </div>
        </div>
      </Card>

      {/* Progressione peso reference */}
      <Card>
        <SectionTitle title="Progressione peso di riferimento" eyebrow="sfida 50 giorni">
          Un faro semplice per seguire il percorso con calma, senza giudicare una singola giornata.
        </SectionTitle>
        <div className="table-wrap">
          <table className="clean-table min-w-[300px]">
            <thead>
              <tr>
                <th>Giorno</th>
                <th>Peso di riferimento</th>
              </tr>
            </thead>
            <tbody>
              {weightGoal.map(([day, weight]) => (
                <tr key={day}>
                  <td className="font-black text-title">Giorno {day}</td>
                  <td className="font-semibold">{weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-[9px] px-[14px]">
        <Stat icon={Scale} title="Variazione peso" value={weightDelta ? `${weightDelta} kg` : '-'} gradient="from-sage to-blush" />
        <Stat icon={HeartPulse} title="Giornate da 4 in su" value={`${goodRatedLogs.length}/${ratedLogs.length || 0}`} gradient="from-blush to-sage" />
      </div>

      {/* 7 giorni */}
      <Card>
        <SectionTitle title="Costanza ultimi 7 giorni" eyebrow="monitoraggio">
          Solo il conteggio dei giorni in cui hai registrato qualcosa.
        </SectionTitle>
        <div className="flex items-center gap-3 rounded-2xl bg-pink-bg/60 p-4">
          <div className="flex gap-1.5">
            {last7Dates.map((date) => {
              const hasLog = Boolean(dailyLogs.find((log) => log.date === date))
              return (
                <div
                  key={date}
                  className={`size-8 rounded-xl transition-all ${hasLog ? 'bg-gradient-to-br from-accent-light to-accent shadow-[0_2px_8px_rgba(232,98,42,0.35)]' : 'bg-blush/70'}`}
                  title={date}
                />
              )
            })}
          </div>
          <div>
            <p className="text-2xl font-black text-title">{last7Logs.length}<span className="text-base font-bold text-text/50">/7</span></p>
            <p className="text-xs font-semibold text-text/60">giorni compilati</p>
          </div>
        </div>
      </Card>

      {/* Completamento oggi */}
      <Card>
        <SectionTitle title="Completamento di oggi" eyebrow="oggi">
          {reminderItems.length ? 'Piccoli promemoria per chiudere meglio la giornata.' : 'Giornata compilata alla grande.'}
        </SectionTitle>
        <div className="mb-3 h-3.5 overflow-hidden rounded-full bg-blush/60">
          <div className="progress-bar h-full rounded-full transition-all duration-700" style={{ width: `${completed}%` }} />
        </div>
        <p className="flex items-center gap-2 text-sm font-semibold text-title">
          <CheckCircle2 size={18} aria-hidden="true" className="text-accent" />
          {completed}% completato
        </p>
        {reminderItems.length ? (
          <div className="mt-4 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/8 to-transparent p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent shadow-[0_4px_12px_rgba(232,98,42,0.3)]">
                <AlertCircle size={18} aria-hidden="true" className="text-white" />
              </span>
              <p className="font-black text-title">Reminder di oggi</p>
            </div>
            <div className="grid gap-2">
              {reminderItems.map((item) => (
                <p key={item} className="rounded-xl bg-white/60 px-3 py-2 text-sm font-semibold text-title backdrop-blur-sm">{item}</p>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      {/* Rating chart */}
      <Card>
        <SectionTitle title="Andamento valutazione" eyebrow="ultime giornate">
          Da 1 a 5: arancione pieno quando la giornata e da 4 in su.
        </SectionTitle>
        {chartLogs.length ? (
          <div className="flex h-48 items-end gap-2 rounded-2xl bg-pink-bg/50 p-3">
            {chartLogs.map((log, index) => {
              const rating = dayRatingValue(log)
              const isGood = rating >= 4
              return (
                <button
                  key={log.id || `${log.date}-${index}`}
                  type="button"
                  className="flex min-w-0 flex-1 flex-col items-center gap-2 group"
                  onClick={() => goTo('diary')}
                >
                  <span className={`grid size-8 place-items-center rounded-full text-xs font-black transition-transform group-hover:scale-110 ${
                    isGood
                      ? 'bg-gradient-to-br from-accent-light to-accent text-white shadow-[0_2px_8px_rgba(232,98,42,0.4)]'
                      : 'bg-blush/80 text-title'
                  }`}>
                    {rating}
                  </span>
                  <span
                    className={`w-full rounded-t-2xl transition-all ${isGood ? 'bg-gradient-to-t from-accent to-accent-light' : 'bg-blush'}`}
                    style={{ height: `${Math.max(16, rating * 26)}px` }}
                  />
                  <span className="text-[11px] font-bold text-title/70">{miniDate(log.date)}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="rounded-2xl bg-pink-bg/50 p-4 text-sm text-text/60">Aggiungi una valutazione giornata per vedere il grafico.</p>
        )}
      </Card>
    </div>
  )
}
