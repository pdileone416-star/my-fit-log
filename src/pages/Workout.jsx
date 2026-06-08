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
  goal: '',
  days: [],
}

const emptyPlanExercise = {
  workoutDay: 'Giorno 1',
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

function getPlanDays(plan) {
  if (plan.days?.length) return plan.days
  return [{
    id: plan.id,
    workoutDay: normalizeWorkoutDay(plan.workoutDay),
    goal: plan.goal || '',
    exercises: plan.exercises || [],
  }]
}

function upsertPlanExercise(days, workoutDay, exercise, editingExerciseId) {
  const existingDay = days.find((day) => day.workoutDay === workoutDay)

  if (!existingDay) {
    return [...days, {
      id: createId(),
      workoutDay,
      goal: '',
      exercises: [exercise],
    }]
  }

  return days.map((day) => {
    if (day.workoutDay !== workoutDay) return day
    return {
      ...day,
      exercises: editingExerciseId
        ? day.exercises.map((item) => item.id === editingExerciseId ? exercise : item)
        : [...day.exercises, exercise],
    }
  })
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
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [planExercise, setPlanExercise] = useState(emptyPlanExercise)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [editingPlanExerciseId, setEditingPlanExerciseId] = useState(null)
  const [selectedPlanDays, setSelectedPlanDays] = useState({})
  const [openPlanDetails, setOpenPlanDetails] = useState({})
  const [inlinePlanExercise, setInlinePlanExercise] = useState(emptyPlanExercise)
  const [inlinePlanEdit, setInlinePlanEdit] = useState(null)

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
    const workoutDay = normalizeWorkoutDay(planExercise.workoutDay)
    const payload = {
      id: editingPlanExerciseId || createId(),
      exercise: planExercise.exercise,
      plannedSetsReps: planExercise.plannedSetsReps,
      technicalNotes: planExercise.technicalNotes,
      personalNotes: planExercise.personalNotes,
      imageData: planExercise.imageData,
    }
    setPlanForm((current) => ({
      ...current,
      days: upsertPlanExercise(current.days || [], workoutDay, payload, editingPlanExerciseId),
    }))
    setPlanExercise(emptyPlanExercise)
    setEditingPlanExerciseId(null)
  }

  function resetPlanExercise() {
    setPlanExercise(emptyPlanExercise)
    setEditingPlanExerciseId(null)
  }

  function resetPlanForm() {
    setPlanForm(emptyPlan)
    setEditingPlanId(null)
    resetPlanExercise()
    setShowPlanForm(false)
  }

  function savePlan(event) {
    event.preventDefault()
    const payload = { ...planForm, id: editingPlanId || createId() }
    setWorkoutPlans((plans) => editingPlanId ? plans.map((plan) => plan.id === editingPlanId ? payload : plan) : [payload, ...plans])
    resetPlanForm()
  }

  function editPlan(plan) {
    setPlanForm({ id: plan.id, name: plan.name, goal: plan.goal || '', days: getPlanDays(plan) })
    setEditingPlanId(plan.id)
    setShowPlanForm(true)
    setMode('plans')
  }

  function deletePlan(id) {
    setWorkoutPlans((plans) => plans.filter((plan) => plan.id !== id))
    if (editingPlanId === id) {
      setPlanForm(emptyPlan)
      setEditingPlanId(null)
      setShowPlanForm(false)
    }
    if (inlinePlanEdit?.planId === id) {
      resetInlinePlanExercise()
    }
  }

  function getSelectedPlanDay(plan) {
    const days = getPlanDays(plan)
    return days.find((day) => day.workoutDay === selectedPlanDays[plan.id]) || days[0]
  }

  function getPlanDetailKey(plan, day) {
    return `${plan.id}-${day?.workoutDay || 'giorno'}`
  }

  function resetInlinePlanExercise() {
    setInlinePlanExercise(emptyPlanExercise)
    setInlinePlanEdit(null)
  }

  function togglePlanDetails(plan) {
    const day = getSelectedPlanDay(plan)
    const key = getPlanDetailKey(plan, day)
    setOpenPlanDetails((details) => ({ ...details, [key]: !details[key] }))
  }

  function openInlinePlanExercise(plan, day, exercise = null) {
    const workoutDay = normalizeWorkoutDay(day.workoutDay)
    setOpenPlanDetails((details) => ({ ...details, [getPlanDetailKey(plan, day)]: true }))
    setInlinePlanExercise(exercise ? { ...exercise, workoutDay } : { ...emptyPlanExercise, workoutDay })
    setInlinePlanEdit({
      planId: plan.id,
      workoutDay,
      exerciseId: exercise?.id || null,
    })
  }

  function saveInlinePlanExercise(event) {
    event.preventDefault()
    if (!inlinePlanEdit || !inlinePlanExercise.exercise.trim()) return

    const workoutDay = normalizeWorkoutDay(inlinePlanExercise.workoutDay)
    const payload = {
      id: inlinePlanEdit.exerciseId || createId(),
      exercise: inlinePlanExercise.exercise,
      plannedSetsReps: inlinePlanExercise.plannedSetsReps,
      technicalNotes: inlinePlanExercise.technicalNotes,
      personalNotes: inlinePlanExercise.personalNotes,
      imageData: inlinePlanExercise.imageData,
    }

    setWorkoutPlans((plans) => plans.map((plan) => (
      plan.id === inlinePlanEdit.planId
        ? { ...plan, days: upsertPlanExercise(getPlanDays(plan), workoutDay, payload, inlinePlanEdit.exerciseId) }
        : plan
    )))
    resetInlinePlanExercise()
  }

  function deleteInlinePlanExercise(planId, workoutDay, exerciseId) {
    setWorkoutPlans((plans) => plans.map((plan) => {
      if (plan.id !== planId) return plan
      return {
        ...plan,
        days: getPlanDays(plan).map((day) => (
          day.workoutDay === workoutDay
            ? { ...day, exercises: (day.exercises || []).filter((exercise) => exercise.id !== exerciseId) }
            : day
        )),
      }
    }))
    if (inlinePlanEdit?.planId === planId && inlinePlanEdit?.exerciseId === exerciseId) {
      resetInlinePlanExercise()
    }
  }

  function applyPlan(plan, workoutDay) {
    const day = getPlanDays(plan).find((item) => item.workoutDay === workoutDay) || getPlanDays(plan)[0]
    const session = {
      id: createId(),
      date: todayISO(),
      workoutDay: normalizeWorkoutDay(day.workoutDay),
      title: `${plan.name} - ${normalizeWorkoutDay(day.workoutDay)}`,
      notes: day.goal || plan.goal || '',
      exercises: (day.exercises || []).map((item) => ({
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
    setOpenSessions((sessions) => sessions.includes(session.id) ? sessions : [session.id, ...sessions])
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
        <div className="grid gap-5">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <SectionTitle title="Schede allenamento" eyebrow="workoutPlans">
                Vedi prima le schede salvate. Apri il form solo quando vuoi creare o modificare una scheda.
              </SectionTitle>
              <Button type="button" onClick={() => {
                setPlanForm(emptyPlan)
                setEditingPlanId(null)
                resetPlanExercise()
                setShowPlanForm(true)
              }}>
                <Plus size={18} />
                Nuova scheda
              </Button>
            </div>
          </Card>

          {showPlanForm ? (
            <Card>
              <SectionTitle title={editingPlanId ? 'Modifica scheda' : 'Nuova scheda'} eyebrow="scheda" />
              <form onSubmit={savePlan} className="grid gap-4">
              <Input label="Nome scheda" value={planForm.name} onChange={(event) => setPlanForm((plan) => ({ ...plan, name: event.target.value }))} required />
              <Textarea label="Obiettivo generale scheda" value={planForm.goal} onChange={(event) => setPlanForm((plan) => ({ ...plan, goal: event.target.value }))} />

              <div className="rounded-2xl border border-blush-border bg-pink-bg p-3">
                <p className="mb-3 font-bold text-title">{editingPlanExerciseId ? 'Modifica esercizio scheda' : 'Aggiungi esercizio alla scheda'}</p>
                <div className="grid gap-3">
                  <Input label="Giorno della scheda" value={planExercise.workoutDay} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, workoutDay: event.target.value }))} placeholder="Es. Giorno 1, Upper body, Camminata" required />
                  <Input label="Esercizio" value={planExercise.exercise} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, exercise: event.target.value }))} />
                  <Input label="Serie x rip previste" value={planExercise.plannedSetsReps} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, plannedSetsReps: event.target.value }))} />
                  <Textarea label="Note tecniche" value={planExercise.technicalNotes} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, technicalNotes: event.target.value }))} />
                  <Textarea label="Note personali" value={planExercise.personalNotes} onChange={(event) => setPlanExercise((exercise) => ({ ...exercise, personalNotes: event.target.value }))} />
                  <ImageField label="Immagine esercizio" value={planExercise.imageData} onChange={(imageData) => setPlanExercise((exercise) => ({ ...exercise, imageData }))} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={addPlanExercise}><Plus size={16} />Salva esercizio scheda</Button>
                    <Button type="button" variant="ghost" onClick={resetPlanExercise}><X size={16} />Annulla</Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                {getPlanDays(planForm).map((day) => (
                  <div key={day.id || day.workoutDay} className="rounded-xl border border-blush-border bg-white p-3">
                    <p className="font-black text-title">{day.workoutDay}</p>
                    <div className="mt-2 grid gap-2">
                      {(day.exercises || []).map((item) => (
                        <div key={item.id} className="rounded-xl bg-pink-bg p-3">
                          <p className="font-bold text-title">{item.exercise}</p>
                          <p className="text-sm">{item.plannedSetsReps}</p>
                          {item.imageData ? <img src={item.imageData} alt="" className="mt-2 max-h-36 w-full rounded-xl border border-blush-border object-contain bg-white p-2" /> : null}
                          <div className="mt-2 flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => {
                              setPlanExercise({ ...item, workoutDay: day.workoutDay })
                              setEditingPlanExerciseId(item.id)
                            }}><Pencil size={16} />Modifica</Button>
                            <Button type="button" variant="danger" onClick={() => setPlanForm((plan) => ({
                              ...plan,
                              days: getPlanDays(plan).map((planDay) => planDay.workoutDay === day.workoutDay
                                ? { ...planDay, exercises: planDay.exercises.filter((exercise) => exercise.id !== item.id) }
                                : planDay),
                            }))}><Trash2 size={16} />Elimina</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit"><Save size={18} />{editingPlanId ? 'Aggiorna scheda' : 'Crea nuova scheda'}</Button>
                <Button type="button" variant="ghost" className="border border-blush-border" onClick={resetPlanForm}><X size={18} />Annulla</Button>
              </div>
              </form>
            </Card>
          ) : null}

          <Card>
            <SectionTitle title="Schede salvate" eyebrow={`${workoutPlans.length} schede`} />
            <div className="grid gap-3">
              {workoutPlans.length === 0 ? <p className="text-sm">Non hai ancora schede salvate.</p> : null}
              {workoutPlans.map((plan) => {
                const selectedDay = getSelectedPlanDay(plan)
                const detailKey = getPlanDetailKey(plan, selectedDay)
                const detailsOpen = Boolean(openPlanDetails[detailKey])
                const inlineFormOpen = inlinePlanEdit?.planId === plan.id && inlinePlanEdit?.workoutDay === selectedDay?.workoutDay

                return (
                  <article key={plan.id} className="rounded-2xl border border-blush-border bg-white p-3">
                    <p className="font-bold text-title">{plan.name}</p>
                    <p className="text-sm">
                      {getPlanDays(plan).length} giorni - {getPlanDays(plan).reduce((sum, day) => sum + (day.exercises?.length || 0), 0)} esercizi
                    </p>
                    {plan.goal ? <p className="mt-1 text-sm">{plan.goal}</p> : null}
                    <label className="mt-3 grid gap-1.5 text-sm font-semibold text-title">
                      <span>Scegli giorno</span>
                      <select
                        className="min-h-11 rounded-xl border border-blush-border bg-pink-bg px-3 py-2 text-base font-normal text-text outline-none transition focus:border-accent focus:ring-4 focus:ring-blush"
                        value={selectedPlanDays[plan.id] || getPlanDays(plan)[0]?.workoutDay || ''}
                        onChange={(event) => setSelectedPlanDays((days) => ({ ...days, [plan.id]: event.target.value }))}
                      >
                        {getPlanDays(plan).map((day) => (
                          <option key={day.id || day.workoutDay} value={day.workoutDay}>
                            {day.workoutDay} - {(day.exercises || []).length} esercizi
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" onClick={() => applyPlan(plan, selectedPlanDays[plan.id] || getPlanDays(plan)[0]?.workoutDay)}><CopyPlus size={16} />Usa giorno scelto</Button>
                      <Button type="button" variant="secondary" onClick={() => togglePlanDetails(plan)}>
                        {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {detailsOpen ? 'Chiudi esercizi' : 'Apri esercizi'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => editPlan(plan)}><Pencil size={16} />Modifica scheda</Button>
                      <Button type="button" variant="danger" onClick={() => deletePlan(plan.id)}><Trash2 size={16} />Elimina</Button>
                    </div>

                    {detailsOpen && selectedDay ? (
                      <div className="mt-4 grid gap-3 rounded-2xl border border-blush-border bg-pink-bg p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-accent">{selectedDay.workoutDay}</p>
                            <p className="text-sm">{(selectedDay.exercises || []).length} esercizi salvati</p>
                          </div>
                          <Button type="button" onClick={() => openInlinePlanExercise(plan, selectedDay)}><Plus size={16} />Aggiungi esercizio</Button>
                        </div>

                        {inlineFormOpen ? (
                          <form onSubmit={saveInlinePlanExercise} className="grid gap-3 rounded-2xl border border-blush-border bg-white p-3">
                            <Input label="Giorno della scheda" value={inlinePlanExercise.workoutDay} onChange={(event) => setInlinePlanExercise((exercise) => ({ ...exercise, workoutDay: event.target.value }))} required />
                            <Input label="Esercizio" value={inlinePlanExercise.exercise} onChange={(event) => setInlinePlanExercise((exercise) => ({ ...exercise, exercise: event.target.value }))} required />
                            <Input label="Serie x rip previste" value={inlinePlanExercise.plannedSetsReps} onChange={(event) => setInlinePlanExercise((exercise) => ({ ...exercise, plannedSetsReps: event.target.value }))} />
                            <Textarea label="Note tecniche" value={inlinePlanExercise.technicalNotes} onChange={(event) => setInlinePlanExercise((exercise) => ({ ...exercise, technicalNotes: event.target.value }))} />
                            <Textarea label="Note personali" value={inlinePlanExercise.personalNotes} onChange={(event) => setInlinePlanExercise((exercise) => ({ ...exercise, personalNotes: event.target.value }))} />
                            <ImageField label="Immagine esercizio" value={inlinePlanExercise.imageData} onChange={(imageData) => setInlinePlanExercise((exercise) => ({ ...exercise, imageData }))} />
                            <div className="flex flex-wrap gap-2">
                              <Button type="submit"><Save size={16} />{inlinePlanEdit.exerciseId ? 'Aggiorna esercizio' : 'Salva esercizio'}</Button>
                              <Button type="button" variant="ghost" onClick={resetInlinePlanExercise}><X size={16} />Annulla</Button>
                            </div>
                          </form>
                        ) : null}

                        <div className="grid gap-2">
                          {(selectedDay.exercises || []).length === 0 ? <p className="text-sm">Nessun esercizio in questo giorno.</p> : null}
                          {(selectedDay.exercises || []).map((exercise) => (
                            <article key={exercise.id} className="rounded-xl border border-blush-border bg-white p-3">
                              <p className="font-bold text-title">{exercise.exercise}</p>
                              <p className="text-sm">{exercise.plannedSetsReps || 'Serie non indicate'}</p>
                              {exercise.technicalNotes ? <p className="mt-1 text-sm">Tecnica: {exercise.technicalNotes}</p> : null}
                              {exercise.personalNotes ? <p className="mt-1 text-sm">Note: {exercise.personalNotes}</p> : null}
                              {exercise.imageData ? <img src={exercise.imageData} alt="" className="mt-2 max-h-40 w-full rounded-xl border border-blush-border object-contain bg-pink-bg p-2" /> : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button type="button" variant="ghost" onClick={() => openInlinePlanExercise(plan, selectedDay, exercise)}><Pencil size={16} />Modifica</Button>
                                <Button type="button" variant="danger" onClick={() => deleteInlinePlanExercise(plan.id, selectedDay.workoutDay, exercise.id)}><Trash2 size={16} />Elimina</Button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
