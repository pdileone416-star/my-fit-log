import { Check, ChevronDown, ChevronUp, CopyPlus, Dumbbell, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import Tabs from '../components/Tabs'
import Textarea from '../components/Textarea'
import { createId, normalizeWorkoutDay, todayISO } from '../utils/storage'

const emptySession = {
  date: todayISO(),
  workoutDay: 'Giorno 1',
  title: '',
  notes: '',
}

const emptyExercise = {
  exercise: '',
  plannedSetsReps: '',
  completedSetsReps: '',
  weightKg: '',
  fatigue: '',
  completed: false,
  notes: '',
  imageData: '',
}

const emptyPlan = {
  name: '',
  workoutDay: 'Giorno 1',
  goal: '',
  exercises: [],
}

const emptyPlanExercise = {
  exercise: '',
  plannedSetsReps: '',
  technicalNotes: '',
  personalNotes: '',
  imageData: '',
}

function ImageField({ label, value, onChange }) {
  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-2 text-sm font-semibold text-title">
      <span>{label}</span>
      {value ? (
        <img src={value} alt="" className="max-h-48 w-full rounded-2xl border border-blush-border object-contain bg-white p-2" />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-blush px-4 py-2 text-sm font-semibold text-title transition hover:bg-sage">
          Carica immagine
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange('')}>Rimuovi immagine</Button>
        ) : null}
      </div>
    </div>
  )
}

function sessionCompletion(session) {
  if (session.exercises.length === 0) return 0
  return Math.round((session.exercises.filter((exercise) => exercise.completed).length / session.exercises.length) * 100)
}

export default function Workout({ workoutSessions, setWorkoutSessions, workoutPlans, setWorkoutPlans }) {
  const [mode, setMode] = useState('sessions')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionForm, setSessionForm] = useState(emptySession)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [openSessions, setOpenSessions] = useState([])
  const [activeExerciseSessionId, setActiveExerciseSessionId] = useState(null)
  const [exerciseForm, setExerciseForm] = useState(emptyExercise)
  const [editingExerciseId, setEditingExerciseId] = useState(null)
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [planExercise, setPlanExercise] = useState(emptyPlanExercise)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [editingPlanExerciseId, setEditingPlanExerciseId] = useState(null)

  const sortedSessions = [...workoutSessions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  function saveSession(event) {
    event.preventDefault()
    const payload = {
      ...sessionForm,
      workoutDay: normalizeWorkoutDay(sessionForm.workoutDay),
      id: editingSessionId || createId(),
      exercises: editingSessionId
        ? workoutSessions.find((session) => session.id === editingSessionId)?.exercises || []
        : [],
    }

    setWorkoutSessions((sessions) => (
      editingSessionId
        ? sessions.map((session) => session.id === editingSessionId ? payload : session)
        : [payload, ...sessions]
    ))
    setSessionForm(emptySession)
    setEditingSessionId(null)
    setShowSessionForm(false)
  }

  function editSession(session) {
    setSessionForm({
      date: session.date,
      workoutDay: normalizeWorkoutDay(session.workoutDay),
      title: session.title || '',
      notes: session.notes || '',
    })
    setEditingSessionId(session.id)
    setShowSessionForm(true)
  }

  function toggleSessionDetails(id) {
    setOpenSessions((sessions) => sessions.includes(id) ? sessions.filter((sessionId) => sessionId !== id) : [...sessions, id])
  }

  function deleteSession(id) {
    setWorkoutSessions((sessions) => sessions.filter((session) => session.id !== id))
    if (activeExerciseSessionId === id) {
      resetExerciseForm()
    }
  }

  function resetExerciseForm() {
    setActiveExerciseSessionId(null)
    setExerciseForm(emptyExercise)
    setEditingExerciseId(null)
  }

  function openExerciseForm(sessionId, exercise = null) {
    setActiveExerciseSessionId(sessionId)
    setOpenSessions((sessions) => sessions.includes(sessionId) ? sessions : [...sessions, sessionId])
    setExerciseForm(exercise || emptyExercise)
    setEditingExerciseId(exercise?.id || null)
  }

  function saveExercise(event) {
    event.preventDefault()
    const payload = { ...exerciseForm, id: editingExerciseId || createId() }
    setWorkoutSessions((sessions) => sessions.map((session) => {
      if (session.id !== activeExerciseSessionId) return session
      return {
        ...session,
        exercises: editingExerciseId
          ? session.exercises.map((exercise) => exercise.id === editingExerciseId ? payload : exercise)
          : [...session.exercises, payload],
      }
    }))
    resetExerciseForm()
  }

  function deleteExercise(sessionId, exerciseId) {
    setWorkoutSessions((sessions) => sessions.map((session) => (
      session.id === sessionId
        ? { ...session, exercises: session.exercises.filter((exercise) => exercise.id !== exerciseId) }
        : session
    )))
  }

  function toggleExercise(sessionId, exerciseId) {
    setWorkoutSessions((sessions) => sessions.map((session) => (
      session.id === sessionId
        ? {
            ...session,
            exercises: session.exercises.map((exercise) => (
              exercise.id === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
            )),
          }
        : session
    )))
  }

  function addPlanExercise(event) {
    event.preventDefault()
    if (!planExercise.exercise.trim()) return
    const payload = { ...planExercise, id: editingPlanExerciseId || createId() }
    setPlanForm((current) => ({
      ...current,
      exercises: editingPlanExerciseId
        ? current.exercises.map((item) => item.id === editingPlanExerciseId ? payload : item)
        : [...current.exercises, payload],
    }))
    setPlanExercise(emptyPlanExercise)
    setEditingPlanExerciseId(null)
  }

  function savePlan(event) {
    event.preventDefault()
    const payload = { ...planForm, workoutDay: normalizeWorkoutDay(planForm.workoutDay), id: editingPlanId || createId() }
    setWorkoutPlans((plans) => editingPlanId ? plans.map((plan) => plan.id === editingPlanId ? payload : plan) : [payload, ...plans])
    setPlanForm(emptyPlan)
    setEditingPlanId(null)
    setPlanExercise(emptyPlanExercise)
    setEditingPlanExerciseId(null)
  }

  function editPlan(plan) {
    setPlanForm({ ...plan, workoutDay: normalizeWorkoutDay(plan.workoutDay) })
    setEditingPlanId(plan.id)
    setMode('plans')
  }

  function deletePlan(id) {
    setWorkoutPlans((plans) => plans.filter((plan) => plan.id !== id))
    if (editingPlanId === id) {
      setPlanForm(emptyPlan)
      setEditingPlanId(null)
    }
  }

  function applyPlan(plan) {
    const session = {
      id: createId(),
      date: todayISO(),
      workoutDay: normalizeWorkoutDay(plan.workoutDay),
      title: plan.name,
      notes: plan.goal || '',
      exercises: plan.exercises.map((item) => ({
        id: createId(),
        exercise: item.exercise,
        plannedSetsReps: item.plannedSetsReps,
        completedSetsReps: '',
        weightKg: '',
        fatigue: '',
        completed: false,
        notes: `${item.technicalNotes || ''}${item.personalNotes ? ` | ${item.personalNotes}` : ''}`.trim(),
        imageData: item.imageData || '',
      })),
    }

    setWorkoutSessions((sessions) => [session, ...sessions])
    setMode('sessions')
  }

  return (
    <div className="grid gap-5">
      <Tabs
        tabs={[
          { id: 'sessions', label: 'Workout', icon: Dumbbell },
          { id: 'plans', label: 'Schede', icon: CopyPlus },
        ]}
        activeTab={mode}
        onChange={setMode}
      />

      {mode === 'sessions' ? (
        <div className="grid gap-5">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <SectionTitle title="Sessioni workout" eyebrow="workoutSessions">
                Crea una seduta libera, poi aggiungi gli esercizi dentro la card.
              </SectionTitle>
              <Button type="button" onClick={() => {
                setShowSessionForm(true)
                setEditingSessionId(null)
                setSessionForm(emptySession)
              }}>
                <Plus size={18} aria-hidden="true" />
                Crea nuova sessione
              </Button>
            </div>

            {showSessionForm ? (
              <form onSubmit={saveSession} className="mt-4 grid gap-4 rounded-2xl border border-blush-border bg-pink-bg p-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Data" type="date" value={sessionForm.date} onChange={(event) => setSessionForm((form) => ({ ...form, date: event.target.value }))} required />
                  <Input label="Giorno scheda / Nome sessione" value={sessionForm.workoutDay} onChange={(event) => setSessionForm((form) => ({ ...form, workoutDay: event.target.value }))} placeholder="Es. Giorno 4, Upper body, Camminata" required />
                </div>
                <Input label="Titolo sessione" value={sessionForm.title} onChange={(event) => setSessionForm((form) => ({ ...form, title: event.target.value }))} placeholder="Es. Allenamento parte alta" />
                <Textarea label="Note sessione" value={sessionForm.notes} onChange={(event) => setSessionForm((form) => ({ ...form, notes: event.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit"><Save size={18} />{editingSessionId ? 'Aggiorna sessione' : 'Salva sessione'}</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowSessionForm(false)}><X size={18} />Annulla</Button>
                </div>
              </form>
            ) : null}
          </Card>

          {sortedSessions.length === 0 ? (
            <Card><p className="text-sm">Non hai ancora sessioni salvate.</p></Card>
          ) : null}

          {sortedSessions.map((session) => {
            const percent = sessionCompletion(session)
            const complete = session.exercises.length > 0 && percent === 100
            const isOpen = openSessions.includes(session.id)
            return (
              <Card key={session.id} className="grid gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-accent">{session.date} - {normalizeWorkoutDay(session.workoutDay)}</p>
                    <h3 className="text-xl font-black text-title">{session.title || 'Sessione senza titolo'}</h3>
                    <p className="text-sm">{session.exercises.length} esercizi - {percent}% completato</p>
                    {session.notes ? <p className="mt-2 text-sm">{session.notes}</p> : null}
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${complete ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                    {complete ? 'Sessione completata' : 'In corso'}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-blush">
                  <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${percent}%` }} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => toggleSessionDetails(session.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isOpen ? 'Chiudi esercizi' : 'Apri esercizi'}
                  </Button>
                  <Button type="button" onClick={() => openExerciseForm(session.id)}><Plus size={16} />Aggiungi esercizio</Button>
                  <Button type="button" variant="ghost" onClick={() => editSession(session)}><Pencil size={16} />Modifica sessione</Button>
                  <Button type="button" variant="danger" onClick={() => deleteSession(session.id)}><Trash2 size={16} />Elimina sessione</Button>
                </div>

                {activeExerciseSessionId === session.id ? (
                  <form onSubmit={saveExercise} className="grid gap-3 rounded-2xl border border-blush-border bg-pink-bg p-3">
                    <Input label="Nome esercizio" value={exerciseForm.exercise} onChange={(event) => setExerciseForm((form) => ({ ...form, exercise: event.target.value }))} required />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input label="Serie x rip previste" value={exerciseForm.plannedSetsReps} onChange={(event) => setExerciseForm((form) => ({ ...form, plannedSetsReps: event.target.value }))} />
                      <Input label="Serie x rip effettuate" value={exerciseForm.completedSetsReps} onChange={(event) => setExerciseForm((form) => ({ ...form, completedSetsReps: event.target.value }))} />
                      <Input label="Peso/carico kg" type="number" step="0.5" value={exerciseForm.weightKg} onChange={(event) => setExerciseForm((form) => ({ ...form, weightKg: event.target.value }))} />
                      <Input label="Fatica 1-10" type="number" min="1" max="10" value={exerciseForm.fatigue} onChange={(event) => setExerciseForm((form) => ({ ...form, fatigue: event.target.value }))} />
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-blush-border bg-white p-3 font-semibold text-title">
                      <input type="checkbox" checked={exerciseForm.completed} onChange={(event) => setExerciseForm((form) => ({ ...form, completed: event.target.checked }))} />
                      Completato
                    </label>
                    <ImageField label="Immagine esercizio" value={exerciseForm.imageData} onChange={(imageData) => setExerciseForm((form) => ({ ...form, imageData }))} />
                    <Textarea label="Note" value={exerciseForm.notes} onChange={(event) => setExerciseForm((form) => ({ ...form, notes: event.target.value }))} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit"><Save size={16} />{editingExerciseId ? 'Aggiorna esercizio' : 'Salva esercizio'}</Button>
                      <Button type="button" variant="ghost" onClick={resetExerciseForm}><X size={16} />Annulla</Button>
                    </div>
                  </form>
                ) : null}

                {isOpen ? (
                  <div className="grid gap-3">
                    {session.exercises.length === 0 ? <p className="text-sm">Nessun esercizio in questa sessione.</p> : null}
                    {session.exercises.map((exercise) => (
                      <article key={exercise.id} className="rounded-2xl border border-blush-border bg-white p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold text-title">{exercise.exercise}</p>
                            <p className="text-sm">Previste {exercise.plannedSetsReps || '-'} - Effettuate {exercise.completedSetsReps || '-'}</p>
                            <p className="text-sm">Carico {exercise.weightKg || '-'} kg - Fatica {exercise.fatigue || '-'}</p>
                            {exercise.notes ? <p className="mt-1 text-sm">{exercise.notes}</p> : null}
                            {exercise.imageData ? <img src={exercise.imageData} alt="" className="mt-3 max-h-44 w-full rounded-xl border border-blush-border object-contain bg-pink-bg p-2" /> : null}
                          </div>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${exercise.completed ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                            {exercise.completed ? 'Fatto' : 'Da fare'}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={exercise.completed ? 'secondary' : 'primary'}
                            className={exercise.completed ? 'bg-sage text-title hover:bg-blush' : ''}
                            onClick={() => toggleExercise(session.id, exercise.id)}
                          >
                            <Check size={16} />
                            {exercise.completed ? 'Annulla completamento' : 'Completa'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => openExerciseForm(session.id, exercise)}><Pencil size={16} />Modifica</Button>
                          <Button type="button" variant="danger" onClick={() => deleteExercise(session.id, exercise.id)}><Trash2 size={16} />Elimina</Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card>
            <SectionTitle title="Schede allenamento" eyebrow="workoutPlans">
              Crea schede libere e usale per creare una sessione workout gia compilata.
            </SectionTitle>
            <form onSubmit={savePlan} className="grid gap-4">
              <Input label="Nome scheda" value={planForm.name} onChange={(event) => setPlanForm((plan) => ({ ...plan, name: event.target.value }))} required />
              <Input label="Giorno scheda / Nome sessione" value={planForm.workoutDay} onChange={(event) => setPlanForm((plan) => ({ ...plan, workoutDay: event.target.value }))} placeholder="Es. Giorno 5, Full body, Richiamo glutei" required />
              <Textarea label="Obiettivo scheda" value={planForm.goal} onChange={(event) => setPlanForm((plan) => ({ ...plan, goal: event.target.value }))} />

              <div className="rounded-2xl border border-blush-border bg-pink-bg p-3">
                <p className="mb-3 font-bold text-title">{editingPlanExerciseId ? 'Modifica esercizio scheda' : 'Aggiungi esercizio alla scheda'}</p>
                <div className="grid gap-3">
                  <Input label="Esercizio" value={planExercise.exercise} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, exercise: event.target.value }))} />
                  <Input label="Serie x rip previste" value={planExercise.plannedSetsReps} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, plannedSetsReps: event.target.value }))} />
                  <Textarea label="Note tecniche" value={planExercise.technicalNotes} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, technicalNotes: event.target.value }))} />
                  <Textarea label="Note personali" value={planExercise.personalNotes} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, personalNotes: event.target.value }))} />
                  <ImageField label="Immagine esercizio" value={planExercise.imageData} onChange={(imageData) => setPlanExercise((exercise) => ({ ...exercise, imageData }))} />
                  <Button type="button" variant="secondary" onClick={addPlanExercise}><Plus size={16} />Salva esercizio scheda</Button>
                </div>
              </div>

              <div className="grid gap-2">
                {planForm.exercises.map((item) => (
                  <div key={item.id} className="rounded-xl border border-blush-border bg-white p-3">
                    <p className="font-bold text-title">{item.exercise}</p>
                    <p className="text-sm">{item.plannedSetsReps}</p>
                    {item.imageData ? <img src={item.imageData} alt="" className="mt-2 max-h-36 w-full rounded-xl border border-blush-border object-contain bg-pink-bg p-2" /> : null}
                    <div className="mt-2 flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => {
                        setPlanExercise(item)
                        setEditingPlanExerciseId(item.id)
                      }}><Pencil size={16} />Modifica</Button>
                      <Button type="button" variant="danger" onClick={() => setPlanForm((plan) => ({ ...plan, exercises: plan.exercises.filter((exercise) => exercise.id !== item.id) }))}><Trash2 size={16} />Elimina</Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit"><Save size={18} />{editingPlanId ? 'Aggiorna scheda' : 'Crea nuova scheda'}</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="Schede salvate" eyebrow={`${workoutPlans.length} schede`} />
            <div className="grid gap-3">
              {workoutPlans.length === 0 ? <p className="text-sm">Non hai ancora schede salvate.</p> : null}
              {workoutPlans.map((plan) => (
                <article key={plan.id} className="rounded-2xl border border-blush-border bg-white p-3">
                  <p className="font-bold text-title">{plan.name}</p>
                  <p className="text-sm">{normalizeWorkoutDay(plan.workoutDay)} - {plan.exercises.length} esercizi</p>
                  {plan.goal ? <p className="mt-1 text-sm">{plan.goal}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" onClick={() => applyPlan(plan)}><CopyPlus size={16} />Usa oggi</Button>
                    <Button type="button" variant="ghost" onClick={() => editPlan(plan)}><Pencil size={16} />Modifica</Button>
                    <Button type="button" variant="danger" onClick={() => deletePlan(plan.id)}><Trash2 size={16} />Elimina</Button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
