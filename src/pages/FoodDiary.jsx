import { ChevronDown, ChevronUp, Heart, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import Textarea from '../components/Textarea'
import { createId, sortByDateDesc, todayISO } from '../utils/storage'
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
  feelingStatus: '',
  feelingTags: [],
  feeling: '',
  notes: '',
  bodyPhoto: '',
}

const feelingStatuses = ['Molto bene', 'Bene', 'Normale', 'Male', 'Molto male']
const feelingTags = ['Gonfia', 'Ciclo', 'Fame', 'Stress', 'Energia alta', 'Stanchezza', 'Mal di testa', 'Pancia', 'Sonno', 'Digestione', 'Altro']
const compactWeekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
const compactMonths = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

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
            className="h-28 w-full rounded-2xl border border-blush-border bg-white object-contain p-1 sm:h-36"
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
    'feelingStatus',
    'feelingTags',
    'feeling',
    'notes',
    'bodyPhoto',
  ].some((key) => Array.isArray(log[key]) ? log[key].length > 0 : String(log[key] || '').trim())
}

function selectedFeelingTags(value) {
  return Array.isArray(value) ? value : []
}

function compactDate(date) {
  if (!date) return { day: '-', month: '', weekday: '' }
  const parsed = new Date(`${date}T12:00:00`)
  return {
    day: String(parsed.getDate()).padStart(2, '0'),
    month: compactMonths[parsed.getMonth()],
    weekday: compactWeekdays[parsed.getDay()],
  }
}

function hasAnyPhoto(log) {
  return Boolean(log.breakfastPhoto || log.lunchPhoto || log.snackPhoto || log.dinnerPhoto || log.bodyPhoto)
}

function photoCount(log) {
  return [log.breakfastPhoto, log.lunchPhoto, log.snackPhoto, log.dinnerPhoto, log.bodyPhoto].filter(Boolean).length
}

function dailyCompletion(log) {
  const meals = mealCountFromLog(log)
  const checks = [
    Boolean(log.weight),
    meals === 4,
    Boolean(log.feelingStatus || log.feeling),
    Boolean(log.supplements),
    hasAnyPhoto(log),
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function mealCountFromLog(log) {
  return ['breakfast', 'lunch', 'snack', 'dinner'].filter((key) => log[key]?.trim()).length
}

function CompletionChecklist({ log }) {
  const meals = mealCountFromLog(log)
  const items = [
    ['Peso', log.weight ? 'compilato' : 'non compilato', Boolean(log.weight)],
    ['Pasti', `${meals}/4`, meals === 4],
    ['Sensazione', log.feelingStatus || log.feeling ? 'compilata' : 'non compilata', Boolean(log.feelingStatus || log.feeling)],
    ['Integratori', log.supplements ? 'presenti' : 'assenti', Boolean(log.supplements)],
    ['Foto', hasAnyPhoto(log) ? 'presenti' : 'assenti', hasAnyPhoto(log)],
  ]

  return (
    <div className="grid gap-3 rounded-2xl border border-blush-border bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-title">Completamento giornata</p>
        <p className="text-sm font-black text-accent">{dailyCompletion(log)}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-blush">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${dailyCompletion(log)}%` }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, value, done]) => (
          <div key={label} className="flex items-center justify-between gap-2 rounded-xl bg-pink-bg px-3 py-2 text-sm">
            <span className="font-bold text-title">{label}</span>
            <span className={done ? 'font-bold text-title' : 'text-text'}>{done ? '✓' : '×'} {value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiaryFields({ value, onUpdate, onDateChange }) {
  function toggleTag(tag) {
    const current = selectedFeelingTags(value.feelingTags)
    onUpdate('feelingTags', current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
  }

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
      </div>
      <div className="grid gap-3 rounded-2xl border border-blush-border bg-white p-3">
        <p className="font-bold text-title">Come ti senti</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {feelingStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold transition ${value.feelingStatus === status ? 'bg-accent text-white' : 'bg-pink-bg text-title hover:bg-blush'}`}
              onClick={() => onUpdate('feelingStatus', value.feelingStatus === status ? '' : status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {feelingTags.map((tag) => {
            const active = selectedFeelingTags(value.feelingTags).includes(tag)
            return (
              <button
                key={tag}
                type="button"
                className={`rounded-full px-3 py-2 text-xs font-bold transition ${active ? 'bg-sage text-title' : 'bg-blush text-title hover:bg-sage'}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <Textarea label="Nota libera" placeholder="Es. leggera, stanca, gonfia, energica..." value={value.feeling || ''} onChange={(event) => onUpdate('feeling', event.target.value)} />
      </div>
      <PhotoField label="Foto corpo / progressi" value={value.bodyPhoto || ''} onChange={(photo) => onUpdate('bodyPhoto', photo)} />
      <CompletionChecklist log={value} />
      <Textarea label="Note generali" rows={4} value={value.notes || ''} onChange={(event) => onUpdate('notes', event.target.value)} />
    </>
  )
}

export default function FoodDiary({ dailyLogs, setDailyLogs }) {
  const [form, setForm] = useState(emptyLog)
  const [showCreateForm, setShowCreateForm] = useState(false)
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

    function handleNewDaily() {
      setForm(emptyLog)
      setShowCreateForm(true)
    }

    window.addEventListener('my-fit-log-edit-daily', handleEdit)
    window.addEventListener('my-fit-log-new-daily', handleNewDaily)
    return () => {
      window.removeEventListener('my-fit-log-edit-daily', handleEdit)
      window.removeEventListener('my-fit-log-new-daily', handleNewDaily)
    }
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
    setShowCreateForm(false)
  }

  function resetForm() {
    setForm(emptyLog)
    setShowCreateForm(false)
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

  function openLogDetail(log) {
    if (editingLogId === log.id) {
      cancelInlineEdit()
    }
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
    return mealCountFromLog(log)
  }

  function foodRating(log) {
    const meals = mealCount(log)
    const hasNotes = Boolean(log.notes?.trim())
    const hasFeeling = Boolean(log.feelingStatus || log.feeling?.trim())
    const hasSupplements = Boolean(log.supplements?.trim())
    const score = meals + (hasNotes ? 1 : 0) + (hasFeeling ? 1 : 0) + (hasSupplements ? 1 : 0)
    if (score >= 5) return 'Completa'
    if (score >= 3) return 'Buona'
    return 'Da completare'
  }

  function dayWentWell(log) {
    if (foodRating(log) === 'Completa') return true
    return foodRating(log) === 'Buona'
  }

  function moodLabel(log) {
    const parts = [
      log.feelingStatus,
      selectedFeelingTags(log.feelingTags).slice(0, 2).join(', '),
      log.feeling,
    ].filter(Boolean)
    if (parts.length) return parts.join(' - ')
    if (foodRating(log) === 'Completa') return 'Giornata completa'
    if (foodRating(log) === 'Buona') return 'Giornata buona'
    return 'Da completare'
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionTitle title="Diario alimentare" eyebrow="giornata">
            Controlla andamento e giornate salvate. Apri il form solo quando vuoi registrare una nuova giornata.
          </SectionTitle>
          <Button type="button" onClick={() => {
            setForm(emptyLog)
            setShowCreateForm(true)
          }}>
            <Plus size={18} aria-hidden="true" />
            Nuova giornata
          </Button>
        </div>

        {showCreateForm ? (
          <form onSubmit={saveLog} className="mt-4 grid gap-4 rounded-2xl border border-blush-border bg-pink-bg p-3">
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
        ) : null}
      </Card>

      <Card>
        <SectionTitle title="Andamento giornate" eyebrow={`${progressLogs.length} ultimi record`}>
          Una vista veloce per vedere peso e sensazioni giorno dopo giorno.
        </SectionTitle>

        {progressLogs.length === 0 ? (
          <p className="text-sm">Appena salvi una giornata, comparira qui il tuo percorso.</p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-4">
            {progressLogs.map((log) => {
              const wentWell = dayWentWell(log)
              const date = compactDate(log.date)
              return (
                <button
                  type="button"
                  key={log.id}
                  onClick={() => openLogDetail(log)}
                  className="min-w-[170px] rounded-2xl border border-blush-border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent lg:min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-accent">{date.weekday}</p>
                      <p className="text-3xl font-black leading-none text-title">{date.day}</p>
                      <p className="text-xs font-bold uppercase text-text">{date.month}</p>
                    </div>
                    <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${wentWell ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                      <Heart size={20} className={wentWell ? 'fill-current' : ''} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <p className="line-clamp-2 text-sm font-bold text-title">{moodLabel(log)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-pink-bg px-2.5 py-1 text-xs font-bold text-title">{mealCount(log)}/4 pasti</span>
                      <span className="rounded-full bg-pink-bg px-2.5 py-1 text-xs font-bold text-title">{log.weight || '-'} kg</span>
                    </div>
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
            const date = compactDate(log.date)
            return (
              <article key={log.id} className="rounded-3xl border border-blush-border bg-white p-3 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="grid w-16 shrink-0 place-items-center rounded-2xl bg-pink-bg px-2 py-3 text-center">
                    <p className="text-xs font-bold uppercase text-accent">{date.weekday}</p>
                    <p className="text-3xl font-black leading-none text-title">{date.day}</p>
                    <p className="text-xs font-bold uppercase text-text">{date.month}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="rounded-xl bg-blush px-3 py-2 text-sm font-bold text-title">Come ti senti: {moodLabel(log)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${foodRating(log) === 'Completa' ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                        {foodRating(log)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">Peso {log.weight || '-'} kg</span>
                      <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">{mealCount(log)}/4 pasti</span>
                      <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">{photoCount(log)} foto</span>
                      <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-title">{dailyCompletion(log)}%</span>
                    </div>
                    {log.supplements ? <p className="mt-2 text-sm">Integratori / applicazioni: {log.supplements}</p> : null}
                  </div>
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
                  <div className="mt-3 grid gap-3 rounded-2xl bg-pink-bg p-3 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ['Colazione', log.breakfast],
                        ['Pranzo', log.lunch],
                        ['Merenda', log.snack],
                        ['Cena', log.dinner],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-white px-3 py-2">
                          <p className="text-xs font-bold uppercase text-accent">{label}</p>
                          <p className="mt-1 text-sm text-text">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                    <p className="rounded-xl bg-white px-3 py-2"><strong>Come ti senti:</strong> {moodLabel(log)}</p>
                    {selectedFeelingTags(log.feelingTags).length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedFeelingTags(log.feelingTags).map((tag) => (
                          <span key={tag} className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-title">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                    {log.supplements ? <p><strong>Integratori / applicazioni:</strong> {log.supplements}</p> : null}
                    {log.notes ? <p><strong>Note:</strong> {log.notes}</p> : null}
                    <CompletionChecklist log={log} />
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
                  <th>Come ti senti</th>
                  <th>Integratori / applicazioni</th>
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
                      <td>{moodLabel(log)}</td>
                      <td>{log.supplements || '-'}</td>
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
