import { AlertCircle, CheckCircle2, Dumbbell, HeartPulse, LineChart, Plus, Scale } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { formatDate, todayISO } from '../utils/storage'

function Stat({ icon: Icon, title, value, tone = 'bg-blush' }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone} text-title`}>
          <Icon size={21} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-title">{title}</p>
          <p className="mt-1 text-2xl font-black text-text">{value}</p>
        </div>
      </div>
    </Card>
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
    <div className="grid gap-5">
      <section className="rounded-3xl border border-blush-border bg-warm-white p-5 shadow-soft">
        <p className="text-sm font-bold text-accent">{formatDate(today)}</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-title">Ciao, oggi si registra con calma.</h2>
            <p className="mt-1 text-sm text-text">Peso, workout e benessere in un diario semplice da telefono.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:flex md:flex-wrap">
            <Button onClick={() => {
              goTo('diary')
              setTimeout(() => window.dispatchEvent(new Event('my-fit-log-new-daily')), 0)
            }}><Plus size={17} />Nuova giornata</Button>
            <Button type="button" variant="secondary" onClick={() => goTo('progress')}><LineChart size={17} />Progressi</Button>
            <Button type="button" variant="ghost" className="border border-blush-border" onClick={() => goTo('workout')}><Dumbbell size={17} />Workout</Button>
          </div>
        </div>
      </section>

      <Card className="border-2 border-accent bg-blush">
        <SectionTitle title="Nuova sfida 50 giorni" eyebrow="primo obiettivo">
          Parte domani, 23 giugno 2026, e arriva fino al {formatDate(challengeEnd)}.
        </SectionTitle>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-warm-white p-3">
              <p className="text-xs font-bold uppercase text-accent">{challengeDay ? 'Oggi sei al' : 'Partenza'}</p>
              <p className="text-3xl font-black text-title">{challengeDay ? `Giorno ${challengeDay}` : 'Domani'}</p>
              <p className="text-sm font-bold text-text">su {challengeLength}</p>
            </div>
            <div className="rounded-2xl bg-warm-white p-3">
              <p className="text-xs font-bold uppercase text-accent">Mancano</p>
              <p className="text-3xl font-black text-title">{challengeRemaining}</p>
              <p className="text-sm font-bold text-text">giorni al primo obiettivo</p>
            </div>
            <div className="rounded-2xl bg-warm-white p-3">
              <p className="text-xs font-bold uppercase text-accent">Giornate registrate</p>
              <p className="text-3xl font-black text-title">{challengeLogs}</p>
              <p className="text-sm font-bold text-text">dentro la sfida</p>
            </div>
          </div>
          <div>
            <div className="h-4 overflow-hidden rounded-full bg-warm-white">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${challengeProgress}%` }} />
            </div>
            <p className="mt-2 text-sm font-bold text-title">
              {challengeProgress}% completato - traguardo: {formatDate(challengeEnd)}.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Progressione peso" eyebrow="riferimento sfida 50 giorni">
          Un riferimento semplice per seguire il percorso con calma, senza giudicare una singola giornata.
        </SectionTitle>
        <div className="table-wrap">
          <table className="clean-table min-w-[360px]">
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
                  <td>{weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Stat icon={Scale} title="Variazione peso" value={weightDelta ? `${weightDelta} kg` : '-'} tone="bg-sage" />
        <Stat icon={HeartPulse} title="Giornate da 4 in su" value={`${goodRatedLogs.length}/${ratedLogs.length || 0}`} />
      </div>

      <Card>
        <SectionTitle title="Costanza ultimi 7 giorni" eyebrow="monitoraggio">
          Solo il conteggio dei giorni in cui hai registrato qualcosa.
        </SectionTitle>
        <div className="rounded-2xl bg-pink-bg p-3">
          <p className="text-xs font-bold uppercase text-accent">Giorni compilati</p>
          <p className="text-2xl font-black text-title">{last7Logs.length}/7</p>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Completamento giornata" eyebrow="oggi">
          {reminderItems.length ? 'Piccoli promemoria per chiudere meglio la giornata.' : 'Giornata compilata bene.'}
        </SectionTitle>
        <div className="h-4 overflow-hidden rounded-full bg-blush">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completed}%` }} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-title">
          <CheckCircle2 size={18} aria-hidden="true" />
          {completed}% completato
        </p>
        {reminderItems.length ? (
          <div className="mt-4 rounded-3xl border-2 border-accent bg-blush p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-title">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent text-white">
                <AlertCircle size={21} aria-hidden="true" />
              </span>
              <p className="font-black">Reminder di oggi</p>
            </div>
            <div className="grid gap-2">
              {reminderItems.map((item) => (
                <p key={item} className="rounded-2xl bg-warm-white px-3 py-2 text-sm font-bold text-title">{item}</p>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <SectionTitle title="Andamento valutazione" eyebrow="ultime giornate">
          Valutazione da 1 a 5: cuore verde quando la giornata e da 4 in su.
        </SectionTitle>
        {chartLogs.length ? (
          <div className="grid gap-3">
            <div className="flex h-44 items-end gap-2 rounded-2xl bg-pink-bg p-3">
              {chartLogs.map((log, index) => {
                const rating = dayRatingValue(log)
                return (
                  <button
                    key={log.id || `${log.date}-${index}`}
                    type="button"
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    onClick={() => goTo('diary')}
                  >
                    <span className={`grid size-8 place-items-center rounded-full text-xs font-black ${rating >= 4 ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                      {rating}
                    </span>
                    <span className="w-full rounded-t-xl bg-accent" style={{ height: `${Math.max(12, rating * 24)}px` }} />
                    <span className="text-[11px] font-bold text-title">{miniDate(log.date)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm">Aggiungi una valutazione giornata per vedere il grafico.</p>
        )}
      </Card>
    </div>
  )
}
