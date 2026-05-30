import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import { normalizeWorkoutDay, sortByDateDesc } from '../utils/storage'

function completion(session) {
  const exercises = session.exercises || []
  if (exercises.length === 0) return 0
  return Math.round((exercises.filter((exercise) => exercise.completed).length / exercises.length) * 100)
}

export default function History({ dailyLogs, setDailyLogs, workoutSessions, setWorkoutSessions, goTo }) {
  const [filterDate, setFilterDate] = useState('')
  const [openSessions, setOpenSessions] = useState([])
  const foods = sortByDateDesc(filterDate ? dailyLogs.filter((log) => log.date === filterDate) : dailyLogs)
  const sessions = sortByDateDesc(filterDate ? workoutSessions.filter((session) => session.date === filterDate) : workoutSessions)

  function editDaily(log) {
    goTo('diary')
    setTimeout(() => window.dispatchEvent(new CustomEvent('my-fit-log-edit-daily', { detail: log })), 0)
  }

  function toggleOpen(id) {
    setOpenSessions((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="grid gap-5">
      <Card>
        <SectionTitle title="Storico" eyebrow="ricerca">
          Filtra per data, controlla note e cancella record non piu utili.
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Input label="Filtro data" type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
          <Button type="button" variant="secondary" onClick={() => setFilterDate('')}>Mostra tutto</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Giornate alimentari" eyebrow={`${foods.length} record`} />
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>Pasti</th>
                <th>Come ti senti</th>
                <th>Integratori / applicazioni</th>
                <th>Note</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{log.weight || '-'}</td>
                  <td>{[log.breakfast, log.lunch, log.snack, log.dinner].filter(Boolean).length}/4</td>
                  <td>{log.feeling || '-'}</td>
                  <td>{log.supplements || '-'}</td>
                  <td>{log.notes || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => editDaily(log)}><Pencil size={16} />Modifica</Button>
                      <Button type="button" variant="danger" onClick={() => setDailyLogs((logs) => logs.filter((item) => item.id !== log.id))}><Trash2 size={16} />Elimina</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {foods.length === 0 ? <tr><td colSpan="7">Nessuna giornata trovata.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Sessioni workout" eyebrow={`${sessions.length} sessioni`} />
        <div className="grid gap-3">
          {sessions.length === 0 ? <p className="text-sm">Nessuna sessione trovata.</p> : null}
          {sessions.map((session) => {
            const isOpen = openSessions.includes(session.id)
            const percent = completion(session)
            const complete = (session.exercises || []).length > 0 && percent === 100

            return (
              <article key={session.id} className="rounded-2xl border border-blush-border bg-white p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-accent">{session.date} - {normalizeWorkoutDay(session.workoutDay)}</p>
                    <h3 className="font-black text-title">{session.title || 'Sessione senza titolo'}</h3>
                    <p className="text-sm">{(session.exercises || []).length} esercizi - {percent}% completato</p>
                    {session.notes ? <p className="mt-1 text-sm">{session.notes}</p> : null}
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${complete ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                    {complete ? 'Sessione completata' : 'In corso'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => toggleOpen(session.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isOpen ? 'Chiudi esercizi' : 'Apri esercizi'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => goTo('workout')}><Pencil size={16} />Modifica</Button>
                  <Button type="button" variant="danger" onClick={() => setWorkoutSessions((items) => items.filter((item) => item.id !== session.id))}><Trash2 size={16} />Elimina</Button>
                </div>

                {isOpen ? (
                  <div className="mt-3 grid gap-2">
                    {(session.exercises || []).map((exercise) => (
                      <div key={exercise.id} className="rounded-xl border border-blush-border bg-pink-bg p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold text-title">{exercise.exercise}</p>
                            <p className="text-sm">Previste {exercise.plannedSetsReps || '-'} - Effettuate {exercise.completedSetsReps || '-'}</p>
                            <p className="text-sm">Carico {exercise.weightKg || '-'} kg - Fatica {exercise.fatigue || '-'}</p>
                            {exercise.notes ? <p className="mt-1 text-sm">{exercise.notes}</p> : null}
                            {exercise.imageData ? <img src={exercise.imageData} alt="" className="mt-2 max-h-36 w-full rounded-xl border border-blush-border object-contain bg-white p-2" /> : null}
                          </div>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${exercise.completed ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                            {exercise.completed ? 'Fatto' : 'Da fare'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
