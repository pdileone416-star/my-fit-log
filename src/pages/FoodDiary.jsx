import { ChevronDown, ChevronUp, Heart, ImagePlus, Pencil, Save, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import Textarea from '../components/Textarea'
import { createId, formatDate, sortByDateDesc, todayISO } from '../utils/storage'
import { Fragment, useEffect, useState } from 'react'

const emptyLog = {
  date: todayISO(),
  weight: '',
  breakfast: '',
  breakfastPhoto: '',
  lunch: '',
  lunchPhoto: '',
  snack: '',
  snackPhoto: '',
  dinner: '',
  dinnerPhoto: '',
  supplements: '',
  water: '',
  energy: '',
  bloating: '',
  stress: '',
  cycle: '',
  notes: '',
  bodyPhoto: '',
}

async function preparePhotoFile(file) {
  const isHeic = file.type === 'image/heic'
    || file.type === 'image/heif'
    || /\.(heic|heif)$/i.test(file.name)

  if (!isHeic) return file

  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.82,
  })

  return Array.isArray(converted) ? converted[0] : converted
}

async function compressPhoto(file) {
  const readableFile = await preparePhotoFile(file)

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(readableFile)
    const image = new Image()

    image.onload = () => {
      const maxSide = 1200
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

      const context = canvas.getContext('2d')
      context.fillStyle = '#FFFDFB'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(imageUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.78))
    }

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Formato immagine non leggibile.'))
    }

    image.src = imageUrl
  })
}

function PhotoField({ label, value, onChange }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  async function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const compressed = await compressPhoto(file)
      onChange(compressed)
    } catch {
      setError('Questa foto non si riesce a leggere. Prova a convertirla in JPG oppure fai uno screenshot.')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="grid gap-2 text-sm font-semibold text-title">
      <span>{label}</span>
      {value ? (
        <button type="button" className="rounded-2xl" onClick={() => setPreview({ src: value, label })}>
          <img
            src={value}
            alt=""
            className="max-h-48 w-full rounded-2xl border border-blush-border bg-white object-contain p-1"
            onError={() => setError('Foto salvata male: rimuovila e caricala di nuovo.')}
          />
        </button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blush px-4 py-2 text-sm font-semibold text-title transition hover:bg-sage">
          <ImagePlus size={16} aria-hidden="true" />
          {loading ? 'Carico...' : 'Aggiungi foto'}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange('')}>Rimuovi</Button>
        ) : null}
      </div>
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
      {preview ? <PhotoModal photo={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  )
}

function PhotoModal({ photo, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-title/80 p-4" role="dialog" aria-modal="true">
      <div className="grid max-h-[92vh] w-full max-w-3xl gap-3 rounded-3xl bg-warm-white p-3 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-title">{photo.label}</p>
          <Button type="button" variant="ghost" onClick={onClose}><X size={18} />Chiudi</Button>
        </div>
        <img src={photo.src} alt="" className="max-h-[78vh] w-full rounded-2xl object-contain" />
      </div>
    </div>
  )
}

function hasDailyContent(log) {
  return [
    'weight',
    'breakfast',
    'breakfastPhoto',
    'lunch',
    'lunchPhoto',
    'snack',
    'snackPhoto',
    'dinner',
    'dinnerPhoto',
    'supplements',
    'water',
    'energy',
    'bloating',
    'stress',
    'cycle',
    'notes',
    'bodyPhoto',
  ].some((key) => String(log[key] || '').trim())
}

function DiaryFields({ value, onUpdate, onDateChange }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Data" type="date" value={value.date} onChange={(event) => onDateChange(event.target.value)} required />
        <Input label="Peso kg" type="number" step="0.1" value={value.weight || ''} onChange={(event) => onUpdate('weight', event.target.value)} />
        <Textarea label="Colazione" value={value.breakfast || ''} onChange={(event) => onUpdate('breakfast', event.target.value)} />
        <PhotoField label="Foto colazione" value={value.breakfastPhoto || ''} onChange={(photo) => onUpdate('breakfastPhoto', photo)} />
        <Textarea label="Pranzo" value={value.lunch || ''} onChange={(event) => onUpdate('lunch', event.target.value)} />
        <PhotoField label="Foto pranzo" value={value.lunchPhoto || ''} onChange={(photo) => onUpdate('lunchPhoto', photo)} />
        <Textarea label="Merenda" value={value.snack || ''} onChange={(event) => onUpdate('snack', event.target.value)} />
        <PhotoField label="Foto merenda" value={value.snackPhoto || ''} onChange={(photo) => onUpdate('snackPhoto', photo)} />
        <Textarea label="Cena" value={value.dinner || ''} onChange={(event) => onUpdate('dinner', event.target.value)} />
        <PhotoField label="Foto cena" value={value.dinnerPhoto || ''} onChange={(photo) => onUpdate('dinnerPhoto', photo)} />
        <Input label="Integratori / applicazioni" value={value.supplements || ''} onChange={(event) => onUpdate('supplements', event.target.value)} />
        <Input label="Acqua" placeholder="Es. 2 litri" value={value.water || ''} onChange={(event) => onUpdate('water', event.target.value)} />
        <Input label="Energia" placeholder="1-10 o testo libero" value={value.energy || ''} onChange={(event) => onUpdate('energy', event.target.value)} />
        <Input label="Gonfiore" placeholder="1-10 o testo libero" value={value.bloating || ''} onChange={(event) => onUpdate('bloating', event.target.value)} />
        <Input label="Stress" placeholder="1-10 o testo libero" value={value.stress || ''} onChange={(event) => onUpdate('stress', event.target.value)} />
        <Input label="Ciclo / ritenzione" value={value.cycle || ''} onChange={(event) => onUpdate('cycle', event.target.value)} />
      </div>
      <PhotoField label="Foto corpo / progressi" value={value.bodyPhoto || ''} onChange={(photo) => onUpdate('bodyPhoto', photo)} />
      <Textarea label="Note generali" rows={4} value={value.notes || ''} onChange={(event) => onUpdate('notes', event.target.value)} />
    </>
  )
}

export default function FoodDiary({ dailyLogs, setDailyLogs }) {
  const [form, setForm] = useState(emptyLog)
  const [inlineForm, setInlineForm] = useState(emptyLog)
  const [editingLogId, setEditingLogId] = useState(null)
  const [openDays, setOpenDays] = useState([])
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const sortedLogs = sortByDateDesc(dailyLogs)
  const progressLogs = [...dailyLogs].sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-21)

  useEffect(() => {
    function handleEdit(event) {
      const log = event.detail
      setInlineForm({ ...emptyLog, ...log })
      setEditingLogId(log.id)
      setOpenDays((days) => days.includes(log.id) ? days : [...days, log.id])
    }

    window.addEventListener('my-fit-log-edit-daily', handleEdit)
    return () => window.removeEventListener('my-fit-log-edit-daily', handleEdit)
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveLog(event) {
    event.preventDefault()
    if (!hasDailyContent(form)) return
    const payload = { ...form, id: dailyLogs.find((log) => log.date === form.date)?.id || createId() }
    setDailyLogs((logs) => [payload, ...logs.filter((log) => log.date !== form.date)])
    setForm(emptyLog)
  }

  function resetForm() {
    setForm(emptyLog)
  }

  function loadByDate(date) {
    const existing = dailyLogs.find((log) => log.date === date)
    setForm(existing || { ...emptyLog, date })
  }

  function editLog(log) {
    setInlineForm({ ...emptyLog, ...log })
    setEditingLogId(log.id)
    setOpenDays((days) => days.includes(log.id) ? days : [...days, log.id])
  }

  function updateInline(field, value) {
    setInlineForm((current) => ({ ...current, [field]: value }))
  }

  function cancelInlineEdit() {
    setInlineForm(emptyLog)
    setEditingLogId(null)
  }

  function saveInlineLog(event) {
    event.preventDefault()
    if (!editingLogId || !hasDailyContent(inlineForm)) return

    const payload = { ...inlineForm, id: editingLogId }
    setDailyLogs((logs) => [payload, ...logs.filter((log) => log.id !== editingLogId && log.date !== payload.date)])
    setOpenDays((days) => days.filter((dayId) => dayId !== editingLogId))
    cancelInlineEdit()
  }

  function deleteLog(id) {
    setDailyLogs((logs) => logs.filter((log) => log.id !== id))
    if (editingLogId === id) {
      cancelInlineEdit()
    }
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
          <DiaryFields value={form} onUpdate={update} onDateChange={loadByDate} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="w-full md:w-auto" disabled={!hasDailyContent(form)}>
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
            const isEditing = editingLogId === log.id
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

                {isEditing ? (
                  <form onSubmit={saveInlineLog} className="mt-3 grid gap-4 rounded-xl bg-pink-bg p-3">
                    <DiaryFields
                      value={inlineForm}
                      onUpdate={updateInline}
                      onDateChange={(date) => updateInline('date', date)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={!hasDailyContent(inlineForm)}><Save size={16} />Aggiorna giornata</Button>
                      <Button type="button" variant="ghost" className="border border-blush-border" onClick={cancelInlineEdit}><X size={16} />Annulla</Button>
                    </div>
                  </form>
                ) : isOpen ? (
                  <div className="mt-3 grid gap-2 rounded-xl bg-pink-bg p-3 text-sm">
                    <p><strong>Colazione:</strong> {log.breakfast || '-'}</p>
                    <p><strong>Pranzo:</strong> {log.lunch || '-'}</p>
                    <p><strong>Merenda:</strong> {log.snack || '-'}</p>
                    <p><strong>Cena:</strong> {log.dinner || '-'}</p>
                    <p><strong>Note:</strong> {log.notes || '-'}</p>
                    {[log.breakfastPhoto, log.lunchPhoto, log.snackPhoto, log.dinnerPhoto, log.bodyPhoto].some(Boolean) ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          ['Colazione', log.breakfastPhoto],
                          ['Pranzo', log.lunchPhoto],
                          ['Merenda', log.snackPhoto],
                          ['Cena', log.dinnerPhoto],
                          ['Corpo', log.bodyPhoto],
                        ].filter(([, photo]) => photo).map(([label, photo]) => (
                          <figure key={label} className="rounded-xl border border-blush-border bg-white p-2">
                            <button type="button" className="block w-full" onClick={() => setPreviewPhoto({ src: photo, label })}>
                              <img src={photo} alt="" className="h-28 w-full rounded-lg bg-pink-bg object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                            </button>
                            <figcaption className="mt-1 text-xs font-bold text-title">{label}</figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : log.notes ? (
                  <p className="mt-2 text-sm">{log.notes}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => toggleDay(log.id)} disabled={isEditing}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isOpen ? 'Chiudi' : 'Apri'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => editLog(log)} disabled={isEditing}><Pencil size={16} />Modifica</Button>
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
                  <Fragment key={log.id}>
                    <tr>
                      <td>{log.date}</td>
                      <td>{log.weight || '-'}</td>
                      <td>{mealCount(log)}/4</td>
                      <td>{log.water || '-'}</td>
                      <td>E {log.energy || '-'} / G {log.bloating || '-'} / S {log.stress || '-'}</td>
                      <td>{foodRating(log)}</td>
                      <td>{log.notes || '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" onClick={() => editLog(log)} disabled={editingLogId === log.id}><Pencil size={16} />Modifica</Button>
                          <Button type="button" variant="danger" onClick={() => deleteLog(log.id)}><Trash2 size={16} />Elimina</Button>
                        </div>
                      </td>
                    </tr>
                    {editingLogId === log.id ? (
                      <tr>
                        <td colSpan="8">
                          <form onSubmit={saveInlineLog} className="grid gap-4 rounded-xl bg-pink-bg p-3">
                            <DiaryFields
                              value={inlineForm}
                              onUpdate={updateInline}
                              onDateChange={(date) => updateInline('date', date)}
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button type="submit" disabled={!hasDailyContent(inlineForm)}><Save size={16} />Aggiorna giornata</Button>
                              <Button type="button" variant="ghost" className="border border-blush-border" onClick={cancelInlineEdit}><X size={16} />Annulla</Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
                {sortedLogs.length === 0 ? <tr><td colSpan="8">Nessuna giornata salvata.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      {previewPhoto ? <PhotoModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} /> : null}
    </div>
  )
}
