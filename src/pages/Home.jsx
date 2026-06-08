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

function miniDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
}

export default function Home({ dailyLogs, goTo }) {
  const today = todayISO()
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
  const completionItems = [
    Boolean(todayLog?.weight),
    Boolean(todayLog?.feelingStatus || todayLog?.feeling),
    Boolean(dayRatingValue(todayLog)),
    supplementsTaken(todayLog),
  ]
  const completed = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)
  const missingItems = [
    !todayLog?.weight ? 'peso' : '',
    !(todayLog?.feelingStatus || todayLog?.feeling) ? 'come ti senti' : '',
    !dayRatingValue(todayLog) ? 'valutazione giornata' : '',
    !supplementsTaken(todayLog) ? 'integratori / applicazioni' : '',
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
          {missingItems.length ? `Da completare: ${missingItems.join(', ')}.` : 'Giornata compilata bene.'}
        </SectionTitle>
        <div className="h-4 overflow-hidden rounded-full bg-blush">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completed}%` }} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-title">
          <CheckCircle2 size={18} aria-hidden="true" />
          {completed}% completato
        </p>
        {missingItems.length ? (
          <div className="mt-3 flex gap-2 rounded-2xl border border-blush-border bg-pink-bg p-3 text-sm font-bold text-title">
            <AlertCircle size={18} className="shrink-0 text-accent" aria-hidden="true" />
            <span>Puoi completare: {missingItems.join(', ')}.</span>
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
