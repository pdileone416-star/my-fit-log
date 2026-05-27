import { ChevronDown, ChevronUp, Heart, Pencil, Save, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import Textarea from '../components/Textarea'
import { createId, formatDate, sortByDateDesc, todayISO } from '../utils/storage'
import { useEffect, useState } from 'react'

const emptyLog = {
  date: todayISO(),
  weight: '',
  breakfast: '',
  lunch: '',
  snack: '',
  dinner: '',
  supplements: '',
  water: '',
  energy: '',
  bloating: '',
  stress: '',
  cycle: '',
  notes: '',
}

export default function FoodDiary({ dailyLogs, setDailyLogs }) {
  const [form, setForm] = useState(emptyLog)
  const [openDays, setOpenDays] = useState([])
  const sortedLogs = sortByDateDesc(dailyLogs)
  const progressLogs = [...dailyLogs].sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-21)

  useEffect(() => {
    function handleEdit(event) {
      setForm(event.detail)
    }

    window.addEventListener('my-fit-log-edit-daily', handleEdit)
    return () => window.removeEventListener('my-fit-log-edit-daily', handleEdit)
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveLog(event) {
    event.preventDefault()
    const payload = { ...form, id: dailyLogs.find((log) => log.date === form.date)?.id || createId() }
    setDailyLogs((logs) => [payload, ...logs.filter((log) => log.date !== form.date)])
    setForm({ ...emptyLog, date: form.date })
  }

  function resetForm() {
    setForm(emptyLog)
  }

  function loadByDate(date) {
    const existing = dailyLogs.find((log) => log.date === date)
    setForm(existing || { ...emptyLog, date })
  }

  function editLog(log) {
    setForm(log)
    setOpenDays((days) => days.includes(log.id) ? days : [...days, log.id])
  }

  function deleteLog(id) {
    setDailyLogs((logs) => logs.filter((log) => log.id !== id))
  }

  function toggleDay(id) {
    setOpenDays((days) => days.includes(id) ? days.filter((dayId) => dayId !== id) : [...days, id])
  }

  function mealCount(log) {
    return ['breakfast', 'lunch', 'snack', 'dinner'].filter((key) => log[key]?.trim()).length
  }

  function foodRating(log) {
    const meals = mealCount(log)
    const hasWater = Boolean(log.water?.trim())
    const hasNotes = Boolean(log.notes?.trim())
    const score = meals + (hasWater ? 1 : 0) + (hasNotes ? 1 : 0)
    if (score >= 5) return 'Completa'
    if (score >= 3) return 'Buona'
    return 'Da completare'
  }

  function dayWentWell(log) {
    const energy = Number(log.energy)
    const bloating = Number(log.bloating)
    const stress = Number(log.stress)
    const hasNumericMood = Boolean(energy || bloating || stress)

    if (foodRating(log) === 'Completa') return true
    if (!hasNumericMood) return foodRating(log) === 'Buona'
    return (energy >= 6 || !energy) && (bloating <= 5 || !bloating) && (stress <= 5 || !stress)
  }

  function moodLabel(log) {
    const energy = Number(log.energy)
    const bloating = Number(log.bloating)
    const stress = Number(log.stress)

    if (energy >= 7 && (!stress || stress <= 5) && (!bloating || bloating <= 5)) return 'Mi sono sentita bene'
    if (energy && energy <= 4) return 'Energia bassa'
    if (stress >= 7) return 'Stress alto'
    if (bloating >= 7) return 'Gonfiore alto'
    if (foodRating(log) === 'Completa') return 'Giornata completa'
    if (foodRating(log) === 'Buona') return 'Giornata buona'
    return 'Da completare'
  }

  return (
    <div className="grid gap-5">
      <Card>
        <SectionTitle title="Diario alimentare" eyebrow="giornata">
          Salva peso, pasti, acqua e sensazioni. Se esiste gia una giornata con la stessa data, viene aggiornata.
        </SectionTitle>

        <form onSubmit={saveLog} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Data" type="date" value={form.date} onChange={(e) => loadByDate(e.target.value)} required />
            <Input label="Peso kg" type="number" step="0.1" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
            <Textarea label="Colazione" value={form.breakfast} onChange={(e) => update('breakfast', e.target.value)} />
            <Textarea label="Pranzo" value={form.lunch} onChange={(e) => update('lunch', e.target.value)} />
            <Textarea label="Merenda" value={form.snack} onChange={(e) => update('snack', e.target.value)} />
            <Textarea label="Cena" value={form.dinner} onChange={(e) => update('dinner', e.target.value)} />
            <Input label="Integratori / applicazioni" value={form.supplements} onChange={(e) => update('supplements', e.target.value)} />
            <Input label="Acqua" placeholder="Es. 2 litri" value={form.water} onChange={(e) => update('water', e.target.value)} />
            <Input label="Energia" placeholder="1-10 o testo libero" value={form.energy} onChange={(e) => update('energy', e.target.value)} />
            <Input label="Gonfiore" placeholder="1-10 o testo libero" value={form.bloating} onChange={(e) => update('bloating', e.target.value)} />
            <Input label="Stress" placeholder="1-10 o testo libero" value={form.stress} onChange={(e) => update('stress', e.target.value)} />
            <Input label="Ciclo / ritenzione" value={form.cycle} onChange={(e) => update('cycle', e.target.value)} />
          </div>
          <Textarea label="Note generali" rows={4} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="w-full md:w-auto">
              <Save size={18} aria-hidden="true" />
              Salva giornata
            </Button>
            <Button type="button" variant="ghost" className="w-full border border-blush-border md:w-auto" onClick={resetForm}>
              <X size={18} aria-hidden="true" />
              Annulla
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionTitle title="Andamento giornate" eyebrow={`${progressLogs.length} ultimi record`}>
          Una vista veloce per vedere peso e sensazioni giorno dopo giorno.
        </SectionTitle>

        {progressLogs.length === 0 ? (
          <p className="text-sm">Appena salvi una giornata, comparira qui il tuo percorso.</p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-4">
            {progressLogs.map((log, index) => {
              const wentWell = dayWentWell(log)
              return (
                <button
                  type="button"
                  key={log.id}
                  onClick={() => editLog(log)}
                  className="min-w-[210px] rounded-2xl border border-blush-border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent lg:min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${wentWell ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                      <Heart size={20} className={wentWell ? 'fill-current' : ''} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-accent">Giornata {index + 1}</p>
                      <p className="font-black text-title">{formatDate(log.date)}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm">
                    <p><strong>Peso:</strong> {log.weight ? `${log.weight} kg` : '-'}</p>
                    <p><strong>Sensazione:</strong> {moodLabel(log)}</p>
                    <p><strong>Energia:</strong> {log.energy || '-'} <span className="text-text">|</span> <strong>Stress:</strong> {log.stress || '-'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Giornate salvate" eyebrow={`${sortedLogs.length} giorni`}>
          Diario ordinato dalla giornata piu recente alla piu vecchia.
        </SectionTitle>

        <div className="grid gap-3 lg:hidden">
          {sortedLogs.length === 0 ? <p className="text-sm">Nessuna giornata salvata.</p> : null}
          {sortedLogs.map((log) => {
            const isOpen = openDays.includes(log.id)
            return (
              <article key={log.id} className="rounded-2xl border border-blush-border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-title">{formatDate(log.date)}</p>
                    <p className="text-sm">Peso {log.weight || '-'} kg - {mealCount(log)}/4 pasti - Acqua {log.water || '-'}</p>
                    <p className="text-sm">Energia {log.energy || '-'} - Gonfiore {log.bloating || '-'} - Stress {log.stress || '-'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${foodRating(log) === 'Completa' ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                    {foodRating(log)}
                  </span>
                </div>

                {isOpen ? (
                  <div className="mt-3 grid gap-2 rounded-xl bg-pink-bg p-3 text-sm">
                    <p><strong>Colazione:</strong> {log.breakfast || '-'}</p>
                    <p><strong>Pranzo:</strong> {log.lunch || '-'}</p>
                    <p><strong>Merenda:</strong> {log.snack || '-'}</p>
                    <p><strong>Cena:</strong> {log.dinner || '-'}</p>
                    <p><strong>Note:</strong> {log.notes || '-'}</p>
                  </div>
                ) : log.notes ? (
                  <p className="mt-2 text-sm">{log.notes}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => toggleDay(log.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isOpen ? 'Chiudi' : 'Apri'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => editLog(log)}><Pencil size={16} />Modifica</Button>
                  <Button type="button" variant="danger" onClick={() => deleteLog(log.id)}><Trash2 size={16} />Elimina</Button>
                </div>
              </article>
            )
          })}
        </div>

        <div className="hidden lg:block">
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>Pasti</th>
                  <th>Acqua</th>
                  <th>Benessere</th>
                  <th>Valutazione</th>
                  <th>Note</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{log.weight || '-'}</td>
                    <td>{mealCount(log)}/4</td>
                    <td>{log.water || '-'}</td>
                    <td>E {log.energy || '-'} / G {log.bloating || '-'} / S {log.stress || '-'}</td>
                    <td>{foodRating(log)}</td>
                    <td>{log.notes || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={() => editLog(log)}><Pencil size={16} />Modifica</Button>
                        <Button type="button" variant="danger" onClick={() => deleteLog(log.id)}><Trash2 size={16} />Elimina</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedLogs.length === 0 ? <tr><td colSpan="8">Nessuna giornata salvata.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
