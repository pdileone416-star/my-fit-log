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
  supplementItems: [],
  feelingStatus: '',
  feelingTags: [],
  feeling: '',
  dayRating: '',
  notes: '',
  bodyPhoto: '',
}

const feelingStatuses = ['Molto bene', 'Bene', 'Normale', 'Male', 'Molto male']
const feelingTags = ['Gonfia', 'Ciclo', 'Fame', 'Stress', 'Energia alta', 'Stanchezza', 'Mal di testa', 'Pancia', 'Sonno', 'Digestione', 'Altro']
const compactWeekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
const compactMonths = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const defaultSupplementOptions = ['L-teanina', 'Magnesio', 'Zafferano', 'Somatoline', 'Fanghi']

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
    'supplementItems',
    'feelingStatus',
    'feelingTags',
    'feeling',
    'dayRating',
    'notes',
    'bodyPhoto',
  ].some((key) => Array.isArray(log[key]) ? log[key].length > 0 : String(log[key] || '').trim())
}

function selectedFeelingTags(value) {
  return Array.isArray(value) ? value : []
}

function selectedSupplements(value) {
  return Array.isArray(value) ? value : []
}

function supplementsLabel(log) {
  if (Array.isArray(log.supplementItems) && log.supplementItems.length) {
    return log.supplementItems.join(', ')
  }

  return log.supplements || ''
}

function hydrateDailyLog(log) {
  if (!log) return emptyLog
  const supplementItems = Array.isArray(log.supplementItems) && log.supplementItems.length
    ? log.supplementItems
    : String(log.supplements || '').split(',').map((item) => item.trim()).filter(Boolean)
  return { ...emptyLog, ...log, supplementItems }
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

function monthKey(date) {
  return date ? date.slice(0, 7) : 'senza-data'
}

function monthLabel(date) {
  if (!date) return 'Senza data'
  return new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function photoCount(log) {
  return [log.breakfastPhoto, log.lunchPhoto, log.snackPhoto, log.dinnerPhoto, log.bodyPhoto].filter(Boolean).length
}

function dayRatingValue(log) {
  const value = Number(log.dayRating)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function dayRatingLabel(log) {
  const value = dayRatingValue(log)
  return value ? `${value}/5` : ''
}

function mealCountFromLog(log) {
  return ['breakfast', 'lunch', 'snack', 'dinner'].filter((key) => log[key]?.trim()).length
}

function SupplementPicker({ value, options, onUpdate, onAddOption, onDeleteOption }) {
  const [newOption, setNewOption] = useState('')
  const selected = selectedSupplements(value.supplementItems)

  function toggleSupplement(option) {
    onUpdate('supplementItems', selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option])
  }

  function addOption() {
    const label = newOption.trim()
    if (!label) return
    onAddOption(label)
    onUpdate('supplementItems', selected.includes(label) ? selected : [...selected, label])
    setNewOption('')
  }

  return (
    <details className="rounded-2xl border border-blush-border bg-white p-3 md:col-span-2" open={selected.length > 0 || options.length === 0}>
      <summary className="cursor-pointer list-none">
        <p className="font-bold text-title">Integratori / applicazioni</p>
        <p className="text-sm text-text">{selected.length ? selected.join(', ') : 'Apri e seleziona cosa hai preso oggi.'}</p>
      </summary>
      <div className="mt-3 grid gap-3">
        {options.length ? (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const active = selected.includes(option)
              return (
                <span key={option} className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${active ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                  <button type="button" onClick={() => toggleSupplement(option)}>{option}</button>
                  <button type="button" className="grid size-5 place-items-center rounded-full bg-white/70" onClick={() => onDeleteOption(option)} aria-label={`Elimina ${option}`}>
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl bg-pink-bg px-3 py-2 text-sm">Aggiungi il primo integratore o applicazione.</p>
        )}
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input label="Nuova scelta" value={newOption} onChange={(event) => setNewOption(event.target.value)} placeholder="Es. Omega 3, creatina, crema..." />
        <Button type="button" className="self-end" onClick={addOption}><Plus size={16} />Aggiungi</Button>
      </div>
      </div>
    </details>
  )
}

function DiaryFields({ value, onUpdate, onDateChange, supplementOptions, onAddSupplementOption, onDeleteSupplementOption }) {
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
        <SupplementPicker
          value={value}
          options={supplementOptions}
          onUpdate={onUpdate}
          onAddOption={onAddSupplementOption}
          onDeleteOption={onDeleteSupplementOption}
        />
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
      <div className="grid gap-3 rounded-2xl border border-blush-border bg-white p-3">
        <div>
          <p className="font-bold text-title">Valutazione giornata</p>
          <p className="text-sm text-text">Da 1 a 5, scegli com'e andata nel complesso.</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((rating) => {
            const active = String(value.dayRating || '') === String(rating)
            return (
              <button
                key={rating}
                type="button"
                className={`min-h-12 rounded-xl text-base font-black transition ${active ? 'bg-accent text-white shadow-soft' : 'bg-pink-bg text-title hover:bg-blush'}`}
                onClick={() => onUpdate('dayRating', active ? '' : String(rating))}
                aria-pressed={active}
              >
                {rating}
              </button>
            )
          })}
        </div>
      </div>
      <PhotoField label="Foto corpo / progressi" value={value.bodyPhoto || ''} onChange={(photo) => onUpdate('bodyPhoto', photo)} />
      <Textarea label="Note generali" rows={4} value={value.notes || ''} onChange={(event) => onUpdate('notes', event.target.value)} />
    </>
  )
}

export default function FoodDiary({ dailyLogs, setDailyLogs, supplementOptions = [], setSupplementOptions }) {
  const [form, setForm] = useState(emptyLog)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [inlineForm, setInlineForm] = useState(emptyLog)
  const [editingLogId, setEditingLogId] = useState(null)
  const [openDays, setOpenDays] = useState([])
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [visibleSavedCount, setVisibleSavedCount] = useState(20)
  const sortedLogs = sortByDateDesc(dailyLogs)
  const progressLogs = [...dailyLogs].sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-21)
  const monthOptions = Array.from(new Map(sortedLogs.map((log) => [monthKey(log.date), monthLabel(log.date)])).entries())
  const filteredSavedLogs = selectedMonth === 'all'
    ? sortedLogs
    : sortedLogs.filter((log) => monthKey(log.date) === selectedMonth)
  const visibleSavedLogs = filteredSavedLogs.slice(0, visibleSavedCount)
  const groupedSavedLogs = visibleSavedLogs.reduce((groups, log) => {
    const key = monthKey(log.date)
    const existing = groups.find((group) => group.key === key)
    if (existing) {
      existing.logs.push(log)
      return groups
    }
    return [...groups, { key, label: monthLabel(log.date), logs: [log] }]
  }, [])

  useEffect(() => {
    function handleEdit(event) {
      const log = event.detail
      setInlineForm(hydrateDailyLog(log))
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

  useEffect(() => {
    if (!setSupplementOptions) return

    const legacyOptions = dailyLogs
      .flatMap((log) => String(log.supplements || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean)
    const nextOptions = Array.from(new Set([...defaultSupplementOptions, ...(supplementOptions || []), ...legacyOptions]))

    if (nextOptions.length !== (supplementOptions || []).length) {
      setSupplementOptions(nextOptions)
    }
  }, [dailyLogs, setSupplementOptions, supplementOptions])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function addSupplementOption(label) {
    if (!setSupplementOptions) return
    setSupplementOptions((options) => options.includes(label) ? options : [...options, label])
  }

  function deleteSupplementOption(label) {
    if (!setSupplementOptions) return
    setSupplementOptions((options) => options.filter((option) => option !== label))
    setForm((current) => ({ ...current, supplementItems: selectedSupplements(current.supplementItems).filter((item) => item !== label) }))
    setInlineForm((current) => ({ ...current, supplementItems: selectedSupplements(current.supplementItems).filter((item) => item !== label) }))
  }

  function normalizeDailyPayload(log, id) {
    const supplementItems = selectedSupplements(log.supplementItems)
    return {
      ...log,
      id,
      supplementItems,
      supplements: supplementItems.length ? supplementItems.join(', ') : (log.supplements || ''),
    }
  }

  function saveLog(event) {
    event.preventDefault()
    if (!hasDailyContent(form)) return
    const payload = normalizeDailyPayload(form, dailyLogs.find((log) => log.date === form.date)?.id || createId())
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
    setForm(existing ? hydrateDailyLog(existing) : { ...emptyLog, date })
  }

  function editLog(log) {
    setInlineForm(hydrateDailyLog(log))
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

    const payload = normalizeDailyPayload(inlineForm, editingLogId)
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
    const rating = dayRatingValue(log)
    if (rating >= 4) return 'Ottima'
    if (rating === 3) return 'Buona'
    if (rating > 0) return 'Faticosa'

    const meals = mealCount(log)
    const hasNotes = Boolean(log.notes?.trim())
    const hasFeeling = Boolean(log.feelingStatus || log.feeling?.trim())
    const hasSupplements = Boolean(supplementsLabel(log).trim())
    const score = meals + (hasNotes ? 1 : 0) + (hasFeeling ? 1 : 0) + (hasSupplements ? 1 : 0)
    if (score >= 5) return 'Completa'
    if (score >= 3) return 'Buona'
    return 'Da completare'
  }

  function dayWentWell(log) {
    const rating = dayRatingValue(log)
    if (rating) return rating >= 4
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
    if (dayRatingLabel(log)) return `Valutazione ${dayRatingLabel(log)}`
    return 'Giornata salvata'
  }

  function dayNumber(log) {
    const chronological = [...dailyLogs].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    const index = chronological.findIndex((item) => item.id === log.id)
    return index >= 0 ? index + 1 : chronological.length
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <SectionTitle title="Diario alimentare" eyebrow="giornata">
              Controlla andamento e giornate salvate. Apri il form solo quando vuoi registrare una nuova giornata.
            </SectionTitle>
          </div>
          <Button type="button" className="w-full sm:w-auto" onClick={() => {
            setForm(emptyLog)
            setShowCreateForm(true)
          }}>
            <Plus size={18} aria-hidden="true" />
            Nuova giornata
          </Button>
        </div>

        {showCreateForm ? (
          <form onSubmit={saveLog} className="mt-4 grid gap-4 rounded-2xl border border-blush-border bg-pink-bg p-3">
            <DiaryFields
              value={form}
              onUpdate={update}
              onDateChange={loadByDate}
              supplementOptions={supplementOptions}
              onAddSupplementOption={addSupplementOption}
              onDeleteSupplementOption={deleteSupplementOption}
            />
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
          Una vista veloce per vedere sensazioni e valutazione giorno dopo giorno.
        </SectionTitle>

        {progressLogs.length === 0 ? (
          <p className="text-sm">Appena salvi una giornata, comparira qui il tuo percorso.</p>
        ) : (
          <div className="flex w-full max-w-full snap-x gap-3 overflow-x-auto pb-3">
            {progressLogs.map((log) => {
              const wentWell = dayWentWell(log)
              const date = compactDate(log.date)
              return (
                <button
                  type="button"
                  key={log.id}
                  onClick={() => openLogDetail(log)}
                  className="min-w-[235px] snap-start rounded-2xl border border-blush-border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent sm:min-w-[260px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-accent">{date.weekday} {date.day} {date.month}</p>
                      <p className="text-3xl font-black leading-none text-title">{date.day}</p>
                      <p className="text-xs font-bold uppercase text-text">Giorno {dayNumber(log)}</p>
                    </div>
                    <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${wentWell ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                      <Heart size={20} className={wentWell ? 'fill-current' : ''} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <p className="break-anywhere line-clamp-2 text-sm font-bold text-title">{moodLabel(log)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dayRatingLabel(log) ? (
                        <span className="rounded-full bg-sage px-2.5 py-1 text-xs font-bold text-title">Valutazione {dayRatingLabel(log)}</span>
                      ) : null}
                      {log.weight ? (
                        <span className="rounded-full bg-pink-bg px-2.5 py-1 text-xs font-bold text-title">Peso {log.weight} kg</span>
                      ) : null}
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
          Archivio compatto per consultare tante giornate senza perdere il filo.
        </SectionTitle>

        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1.5 text-sm font-bold text-title">
            <span>Filtra per mese</span>
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value)
                setVisibleSavedCount(20)
              }}
              className="min-h-11 rounded-xl border border-blush-border bg-white px-3 text-text outline-none focus:border-accent"
            >
              <option value="all">Tutti i mesi</option>
              {monthOptions.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <p className="rounded-2xl bg-pink-bg px-3 py-2 text-sm font-bold text-title">
            {filteredSavedLogs.length} giornate trovate
          </p>
        </div>

        <div className="grid min-w-0 gap-4 lg:hidden">
          {filteredSavedLogs.length === 0 ? <p className="text-sm">Nessuna giornata salvata.</p> : null}
          {groupedSavedLogs.map((group) => (
            <div key={group.key} className="grid gap-2">
              <p className="px-1 text-xs font-black uppercase text-accent">{group.label}</p>
              {group.logs.map((log) => {
                const isOpen = openDays.includes(log.id)
                const isEditing = editingLogId === log.id
                const date = compactDate(log.date)
                return (
                  <article key={log.id} className="min-w-0 rounded-2xl border border-blush-border bg-white p-3 shadow-soft">
                    <div className="flex items-start gap-3">
                      <button type="button" className="grid w-16 shrink-0 place-items-center rounded-2xl bg-pink-bg px-2 py-3 text-center" onClick={() => toggleDay(log.id)} disabled={isEditing}>
                        <p className="text-xs font-bold uppercase text-accent">{date.weekday}</p>
                        <p className="text-3xl font-black leading-none text-title">{date.day}</p>
                        <p className="text-xs font-bold uppercase text-text">{date.month}</p>
                        <p className="mt-1 text-[10px] font-black uppercase text-accent">Giorno {dayNumber(log)}</p>
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <button type="button" className="min-w-0 text-left" onClick={() => toggleDay(log.id)} disabled={isEditing}>
                            <p className="break-anywhere line-clamp-2 text-sm font-black text-title">{moodLabel(log)}</p>
                            {log.notes ? <p className="break-anywhere mt-1 line-clamp-1 text-xs text-text">{log.notes}</p> : null}
                          </button>
                          {dayRatingLabel(log) ? (
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${dayWentWell(log) ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                              {dayRatingLabel(log)}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {log.weight ? <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">Peso {log.weight} kg</span> : null}
                          {photoCount(log) > 0 ? <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">{photoCount(log)} foto</span> : null}
                          {supplementsLabel(log) ? <span className="rounded-full bg-pink-bg px-3 py-1 text-xs font-bold text-title">Integratori</span> : null}
                        </div>
                      </div>
                    </div>

                    {isEditing ? (
                      <form onSubmit={saveInlineLog} className="mt-3 grid gap-4 rounded-xl bg-pink-bg p-3">
                        <DiaryFields
                          value={inlineForm}
                          onUpdate={updateInline}
                          onDateChange={(date) => updateInline('date', date)}
                          supplementOptions={supplementOptions}
                          onAddSupplementOption={addSupplementOption}
                          onDeleteSupplementOption={deleteSupplementOption}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" disabled={!hasDailyContent(inlineForm)}><Save size={16} />Aggiorna giornata</Button>
                          <Button type="button" variant="ghost" className="border border-blush-border" onClick={cancelInlineEdit}><X size={16} />Annulla</Button>
                        </div>
                      </form>
                    ) : isOpen ? (
                      <div className="mt-3 grid gap-3 rounded-2xl bg-pink-bg p-3 text-sm">
                        {[
                          ['Colazione', log.breakfast],
                          ['Pranzo', log.lunch],
                          ['Merenda', log.snack],
                          ['Cena', log.dinner],
                        ].some(([, value]) => value?.trim()) ? (
                          <div className="grid gap-2">
                            {[
                              ['Colazione', log.breakfast],
                              ['Pranzo', log.lunch],
                              ['Merenda', log.snack],
                              ['Cena', log.dinner],
                            ].filter(([, value]) => value?.trim()).map(([label, value]) => (
                              <div key={label} className="rounded-xl bg-white px-3 py-2">
                                <p className="text-xs font-bold uppercase text-accent">{label}</p>
                                <p className="break-anywhere mt-1 text-sm text-text">{value}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="break-anywhere rounded-xl bg-white px-3 py-2"><strong>Come ti senti:</strong> {moodLabel(log)}</p>
                        {dayRatingLabel(log) ? <p className="rounded-xl bg-white px-3 py-2"><strong>Valutazione giornata:</strong> {dayRatingLabel(log)}</p> : null}
                        {selectedFeelingTags(log.feelingTags).length ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedFeelingTags(log.feelingTags).map((tag) => (
                              <span key={tag} className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-title">{tag}</span>
                            ))}
                          </div>
                        ) : null}
                        {supplementsLabel(log) ? <p className="break-anywhere"><strong>Integratori / applicazioni:</strong> {supplementsLabel(log)}</p> : null}
                        {log.notes ? <p className="break-anywhere"><strong>Note:</strong> {log.notes}</p> : null}
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
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button type="button" variant="secondary" onClick={() => toggleDay(log.id)} disabled={isEditing}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isOpen ? 'Chiudi' : 'Apri'}
                      </Button>
                      <Button type="button" variant="ghost" className="border border-blush-border" onClick={() => editLog(log)} disabled={isEditing}><Pencil size={16} />Modifica</Button>
                      <Button type="button" variant="danger" className="col-span-2 sm:col-span-1" onClick={() => deleteLog(log.id)}><Trash2 size={16} />Elimina</Button>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>Come ti senti</th>
                  <th>Valutazione giornata</th>
                  <th>Integratori / applicazioni</th>
                  <th>Note</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {visibleSavedLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr>
                      <td>{log.date}</td>
                      <td>{log.weight ? `${log.weight} kg` : ''}</td>
                      <td>{moodLabel(log)}</td>
                      <td>{dayRatingLabel(log)}</td>
                      <td>{supplementsLabel(log)}</td>
                      <td>{log.notes || ''}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" onClick={() => editLog(log)} disabled={editingLogId === log.id}><Pencil size={16} />Modifica</Button>
                          <Button type="button" variant="danger" onClick={() => deleteLog(log.id)}><Trash2 size={16} />Elimina</Button>
                        </div>
                      </td>
                    </tr>
                    {editingLogId === log.id ? (
                      <tr>
                        <td colSpan="7">
                          <form onSubmit={saveInlineLog} className="grid gap-4 rounded-xl bg-pink-bg p-3">
                            <DiaryFields
                              value={inlineForm}
                              onUpdate={updateInline}
                              onDateChange={(date) => updateInline('date', date)}
                              supplementOptions={supplementOptions}
                              onAddSupplementOption={addSupplementOption}
                              onDeleteSupplementOption={deleteSupplementOption}
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
                {filteredSavedLogs.length === 0 ? <tr><td colSpan="7">Nessuna giornata salvata.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
        {visibleSavedCount < filteredSavedLogs.length ? (
          <div className="mt-4 flex justify-center">
            <Button type="button" variant="secondary" onClick={() => setVisibleSavedCount((count) => count + 20)}>
              Mostra altre 20
            </Button>
          </div>
        ) : null}
      </Card>
      {previewPhoto ? <PhotoModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} /> : null}
    </div>
  )
}
