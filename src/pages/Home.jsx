import { CalendarDays, CheckCircle2, Dumbbell, HeartPulse, LineChart, Plus, Scale, Sparkles, Utensils } from 'lucide-react'
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

function mealCount(log) {
  return ['breakfast', 'lunch', 'snack', 'dinner'].filter((key) => log?.[key]?.trim()).length
}

export default function Home({ dailyLogs, workoutSessions, goTo }) {
  const today = todayISO()
  const todayLog = dailyLogs.find((log) => log.date === today)
  const todayWorkouts = workoutSessions.filter((session) => session.date === today)
  const todayExercises = todayWorkouts.flatMap((session) => session.exercises || [])
  const completedWorkouts = todayExercises.filter((exercise) => exercise.completed).length
  const meals = mealCount(todayLog)
  const sortedWeights = [...dailyLogs].filter((log) => log.weight).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const currentWeight = sortedWeights[0]?.weight
  const firstWeight = sortedWeights[sortedWeights.length - 1]?.weight
  const weightDelta = currentWeight && firstWeight ? (Number(currentWeight) - Number(firstWeight)).toFixed(1) : null
  const recentLogs = [...dailyLogs].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const last7Dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T12:00:00`)
    date.setDate(date.getDate() - index)
    return date.toISOString().slice(0, 10)
  })
  const last7Logs = last7Dates.map((date) => dailyLogs.find((log) => log.date === date)).filter(Boolean)
  const last7Meals = last7Logs.reduce((sum, log) => sum + mealCount(log), 0)
  const avgMeals = last7Logs.length ? (last7Meals / last7Logs.length).toFixed(1) : '-'
  const weightDays = last7Logs.filter((log) => log.weight).length
  const feelingDays = last7Logs.filter((log) => log.feelingStatus || log.feeling).length
  const completionItems = [
    Boolean(todayLog?.weight),
    meals === 4,
    Boolean(todayLog?.feelingStatus || todayLog?.feeling),
    Boolean(todayLog?.supplements),
  ]
  const completed = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-blush-border bg-warm-white p-5 shadow-soft">
        <p className="text-sm font-bold text-accent">{formatDate(today)}</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-title">Ciao, oggi si registra con calma.</h2>
            <p className="mt-1 text-sm text-text">Peso, pasti, workout e benessere in un unico diario rosa e ordinato.</p>
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
        <Stat icon={Scale} title="Peso" value={todayLog?.weight ? `${todayLog.weight} kg` : 'Da inserire'} />
        <Stat icon={Scale} title="Variazione peso" value={weightDelta ? `${weightDelta} kg` : '-'} tone="bg-sage" />
        <Stat icon={Utensils} title="Alimentazione" value={`${meals}/4 pasti`} tone="bg-sage" />
        <Stat icon={Dumbbell} title="Workout" value={todayExercises.length ? `${completedWorkouts}/${todayExercises.length} esercizi` : 'Non compilato'} />
        <Stat icon={HeartPulse} title="Come ti senti" value={todayLog?.feelingStatus || todayLog?.feeling || 'Da inserire'} tone="bg-sage" />
      </div>

      <Card>
        <SectionTitle title="Costanza ultimi 7 giorni" eyebrow="monitoraggio">
          Una lettura rapida per capire se stai mantenendo continuita.
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-pink-bg p-3"><p className="text-xs font-bold uppercase text-accent">Giorni compilati</p><p className="text-2xl font-black text-title">{last7Logs.length}/7</p></div>
          <div className="rounded-2xl bg-pink-bg p-3"><p className="text-xs font-bold uppercase text-accent">Media pasti</p><p className="text-2xl font-black text-title">{avgMeals}/4</p></div>
          <div className="rounded-2xl bg-pink-bg p-3"><p className="text-xs font-bold uppercase text-accent">Peso registrato</p><p className="text-2xl font-black text-title">{weightDays}/7</p></div>
          <div className="rounded-2xl bg-pink-bg p-3"><p className="text-xs font-bold uppercase text-accent">Sensazioni</p><p className="text-2xl font-black text-title">{feelingDays}/7</p></div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Completamento giornata" eyebrow="riepilogo">
          Integratori / applicazioni: {todayLog?.supplements || '-'}.
        </SectionTitle>
        <div className="h-4 overflow-hidden rounded-full bg-blush">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completed}%` }} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-title">
          <CheckCircle2 size={18} aria-hidden="true" />
          {completed}% completato
        </p>
      </Card>

      <Card>
        <SectionTitle title="Ultime giornate" eyebrow="lettura veloce" />
        <div className="grid gap-2">
          {recentLogs.slice(0, 3).map((log) => (
            <button key={log.id} type="button" onClick={() => goTo('diary')} className="rounded-2xl border border-blush-border bg-pink-bg p-3 text-left transition hover:border-accent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-title">{log.date}</p>
                  <p className="text-sm">Peso {log.weight || '-'} kg - {mealCount(log)}/4 pasti</p>
                  <p className="text-sm font-bold text-title">{log.feelingStatus || log.feeling || 'Sensazione non inserita'}</p>
                </div>
                <CalendarDays size={18} className="text-accent" aria-hidden="true" />
              </div>
            </button>
          ))}
          {dailyLogs.length === 0 ? <p className="text-sm">Salva una giornata per vedere qui il riepilogo.</p> : null}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <Sparkles className="text-accent" aria-hidden="true" />
          <div>
            <p className="font-bold text-title">Ultima nota</p>
            <p className="text-sm">{todayLog?.notes || 'Nessuna nota salvata per oggi.'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
