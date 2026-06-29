import { ChevronDown, Heart, Image as ImageIcon, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import SectionTitle from '../components/SectionTitle'
import Textarea from '../components/Textarea'
import { compressPhoto } from '../utils/photos'
import { createId, sortByDateDesc, todayISO } from '../utils/storage'
import { useEffect, useState } from 'react'

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

function numericDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
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

function dayRatingValue(log) {
  const value = Number(log.dayRating)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function dayRatingLabel(log) {
  const value = dayRatingValue(log)
  return value ? `${value}/5` : ''
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
    <div className="grid gap-3 rounded-2xl border border-blush-border bg-white p-3 md:col-span-2">
      <div>
        <p className="font-bold text-title">Integratori / applicazioni</p>
        <p className="text-sm text-text">{selected.length ? `Selezionati: ${selected.join(', ')}` : 'Seleziona cosa hai preso oggi.'}</p>
      </div>
      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const active = selected.includes(option)
            return (
              <span key={option} className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${active ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                <button type="button" onClick={() => toggleSupplement(option)}>{option}</button>
                <button type="button" className="grid size-5 place-items-center rounded-full bg-white/70" onClick={() => onDeleteOption(option)} aria-label={`Elimina ${option} dal sistema`}>
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
              className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold transition ${value.feelingStatus === status ? 'bg-accent text-[#2b2410]' : 'bg-pink-bg text-title hover:bg-blush'}`}
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
                className={`min-h-12 rounded-xl text-base font-black transition ${active ? 'bg-accent text-[#2b2410] shadow-soft' : 'bg-pink-bg text-title hover:bg-blush'}`}
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
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [visibleSavedCount, setVisibleSavedCount] = useState(20)
  const [expandedLogIds, setExpandedLogIds] = useState([])
  const sortedLogs = sortByDateDesc(dailyLogs)
  const monthOptions = Array.from(new Map(sortedLogs.map((log) => [monthKey(log.date), monthLabel(log.date)])).entries())
  const filteredSavedLogs = selectedMonth === 'all'
    ? sortedLogs
    : sortedLogs.filter((log) => monthKey(log.date) === selectedMonth)
  const visibleSavedLogs = filteredSavedLogs.slice(0, visibleSavedCount)

  useEffect(() => {
    function handleEdit(event) {
      const log = event.detail
      setInlineForm(hydrateDailyLog(log))
      setEditingLogId(log.id)
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

  function addSupplementOption(label) {
    if (!setSupplementOptions) return
    setSupplementOptions((options) => options.includes(label) ? options : [...options, label])
  }

  function removeSupplementFromLog(log, label) {
    const supplementItems = selectedSupplements(log.supplementItems).filter((item) => item !== label)
    return {
      ...log,
      supplementItems,
      supplements: supplementItems.join(', '),
    }
  }

  function deleteSupplementOption(label) {
    if (!setSupplementOptions) return
    setSupplementOptions((options) => options.filter((option) => option !== label))
    setForm((current) => removeSupplementFromLog(current, label))
    setInlineForm((current) => removeSupplementFromLog(current, label))
    setDailyLogs((logs) => logs.map((log) => removeSupplementFromLog(hydrateDailyLog(log), label)))
  }

  function normalizeDailyPayload(log, id) {
    const supplementItems = selectedSupplements(log.supplementItems)
    return {
      ...log,
      id,
      supplementItems,
      supplements: supplementItems.join(', '),
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
    cancelInlineEdit()
  }

  function deleteLog(id) {
    setDailyLogs((logs) => logs.filter((log) => log.id !== id))
    setExpandedLogIds((ids) => ids.filter((expandedId) => expandedId !== id))
    if (editingLogId === id) {
      cancelInlineEdit()
    }
  }

  function toggleExpandedLog(id) {
    setExpandedLogIds((ids) => ids.includes(id) ? ids.filter((expandedId) => expandedId !== id) : [...ids, id])
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
        <SectionTitle title="Tabella giornate" eyebrow={`${filteredSavedLogs.length} record`}>
          Una vista tipo diario Excel: scorri le colonne, confronti le giornate e apri la riga solo quando vuoi leggere tutto.
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

        <div className="diary-board-wrap">
          {visibleSavedLogs.length === 0 ? <p className="rounded-2xl bg-pink-bg px-3 py-3 text-sm font-semibold">Nessuna giornata salvata.</p> : null}

          {visibleSavedLogs.length ? (
            <div className="diary-board">
              <div className="diary-board-header">
                <span className="diary-board-day-head">Giorno</span>
                <span>Valutazione</span>
                <span>Peso</span>
                <span>Colazione</span>
                <span>Pranzo</span>
                <span>Merenda</span>
                <span>Cena</span>
                <span>Integratori</span>
                <span>Come ti senti</span>
                <span>Foto</span>
                <span>Azioni</span>
              </div>

          {visibleSavedLogs.map((log) => {
            const isEditing = editingLogId === log.id
            const isExpanded = expandedLogIds.includes(log.id)
            const date = compactDate(log.date)
            const passed = dayRatingValue(log) > 3
            const ratingClass = passed
              ? 'bg-sage text-title'
                : dayRatingValue(log)
                  ? 'bg-orange-100 text-title'
                  : 'bg-pink-bg text-title'
            const moodText = [log.feelingStatus, log.feeling].filter(Boolean).join(' - ')
            const photoButton = (photo, label) => photo ? (
              <button type="button" className="rounded-full bg-blush px-3 py-1 text-xs font-bold text-title transition hover:bg-sage" onClick={() => setPreviewPhoto({ src: photo, label })}>
                Foto
              </button>
            ) : null
            const photoCellButton = (photo, label) => photo ? (
              <button
                type="button"
                className="diary-board-photo-chip"
                onClick={() => setPreviewPhoto({ src: photo, label })}
              >
                <ImageIcon size={12} aria-hidden="true" />
                Foto
              </button>
            ) : null
            const mealSummary = [
              ['Colazione', log.breakfast, log.breakfastPhoto],
              ['Pranzo', log.lunch, log.lunchPhoto],
              ['Merenda', log.snack, log.snackPhoto],
              ['Cena', log.dinner, log.dinnerPhoto],
            ]
            const photoCount = [
              log.breakfastPhoto,
              log.lunchPhoto,
              log.snackPhoto,
              log.dinnerPhoto,
              log.bodyPhoto,
            ].filter(Boolean).length
            const mealPreview = (value, photo) => {
              if (value) return value
              if (photo) return 'Foto'
              return '-'
            }

            return (
              <article key={log.id} className="diary-board-record">
                <div className="diary-board-row">
                  <div className="diary-board-day-cell">
                    <span className={`diary-board-heart ${passed ? 'bg-sage' : 'bg-blush'}`}>
                      <Heart size={17} className={passed ? 'fill-current' : ''} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.05em] text-accent">{date.weekday} {date.day} {date.month}</p>
                      <p className="text-sm font-black leading-tight text-title">Giorno {dayNumber(log)}</p>
                      <p className="text-[10px] font-bold text-text/50">{numericDate(log.date)}</p>
                    </div>
                  </div>

                  <div className="diary-board-cell">
                    {dayRatingLabel(log) ? <span className={`diary-board-pill ${ratingClass}`}>{dayRatingLabel(log)}</span> : <span className="diary-board-empty">-</span>}
                  </div>
                  <div className="diary-board-cell">
                    {log.weight ? <span className="diary-board-pill bg-sage text-title">{log.weight} kg</span> : <span className="diary-board-empty">-</span>}
                  </div>
                  {mealSummary.map(([label, value, photo]) => (
                    <div key={label} className="diary-board-cell diary-board-meal-cell">
                      <p className="diary-board-cell-text">{mealPreview(value, photo)}</p>
                      {photoCellButton(photo, `Foto ${label.toLowerCase()}`)}
                    </div>
                  ))}
                  <div className="diary-board-cell">
                    {supplementsLabel(log) ? <p className="diary-board-cell-text">{supplementsLabel(log)}</p> : <span className="diary-board-empty">-</span>}
                  </div>
                  <div className="diary-board-cell">
                    {moodText ? <p className="diary-board-cell-text">{moodText}</p> : <span className="diary-board-empty">-</span>}
                  </div>
                  <div className="diary-board-cell diary-board-meal-cell">
                    {photoCount ? (
                      <>
                        <span className="diary-board-pill bg-blush text-title">{photoCount} foto</span>
                        {photoCellButton(log.bodyPhoto, 'Foto corpo')}
                      </>
                    ) : <span className="diary-board-empty">-</span>}
                  </div>
                  <div className="diary-board-actions">
                    <button
                      type="button"
                      className="diary-board-action bg-blush text-title"
                      onClick={() => toggleExpandedLog(log.id)}
                    >
                      <ChevronDown size={16} className={`transition ${isExpanded ? 'rotate-180' : ''}`} />
                      {isExpanded ? 'Chiudi' : 'Apri'}
                    </button>
                    <button
                      type="button"
                      className="diary-board-action border border-blush-border text-title disabled:opacity-50"
                      onClick={() => editLog(log)}
                      disabled={isEditing}
                    >
                      <Pencil size={15} />
                      Modifica
                    </button>
                    <button
                      type="button"
                      className="diary-board-action border border-red-300/70 bg-red-50/80 text-red-700"
                      onClick={() => deleteLog(log.id)}
                    >
                      <Trash2 size={15} />
                      Elimina
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="diary-board-details">
                    <div className="grid gap-2 md:grid-cols-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.06em] text-accent">Pasti</p>
                      {mealSummary.some(([, value, photo]) => value || photo) ? mealSummary.map(([label, value, photo]) => (
                        value || photo ? (
                          <div key={label} className="rounded-xl bg-white px-3 py-2">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="text-[11px] font-black uppercase text-accent">{label}</p>
                              {photoButton(photo, `Foto ${label.toLowerCase()}`)}
                            </div>
                            {value ? <p className="diary-cell-text text-sm leading-5">{value}</p> : null}
                          </div>
                        ) : null
                      )) : <p className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-text/55">Nessun pasto compilato.</p>}
                    </div>

                    {supplementsLabel(log) ? (
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] font-black uppercase text-accent">Integratori / applicazioni</p>
                        <p className="diary-cell-text text-sm font-semibold leading-5">{supplementsLabel(log)}</p>
                      </div>
                    ) : null}

                    {log.notes ? (
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] font-black uppercase text-accent">Note</p>
                        <p className="diary-cell-text text-sm leading-5">{log.notes}</p>
                      </div>
                    ) : null}

                    {log.bodyPhoto ? <div>{photoButton(log.bodyPhoto, 'Foto corpo')}</div> : null}
                  </div>
                ) : null}

                {isEditing ? (
                  <form onSubmit={saveInlineLog} className="m-3 grid gap-4 rounded-xl bg-pink-bg p-3">
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
                ) : null}
              </article>
            )
          })}
            </div>
          ) : null}
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
