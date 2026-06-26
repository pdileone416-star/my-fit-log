import { Activity, Camera, HeartPulse, LineChart, Scale } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { sortByDateDesc } from '../utils/storage'

function MiniStat({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-blush text-title">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">{label}</p>
          <p className="text-xl font-black text-title">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function PhotoModal({ photo, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-title/80 p-4" role="dialog" aria-modal="true">
      <div className="grid max-h-[92vh] w-full max-w-3xl gap-3 rounded-3xl bg-warm-white p-3 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-title">{photo.label}</p>
          <Button type="button" variant="ghost" onClick={onClose}>Chiudi</Button>
        </div>
        <img src={photo.src} alt="" className="max-h-[78vh] w-full rounded-2xl object-contain" />
      </div>
    </div>
  )
}

function compactDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function dayRatingValue(log) {
  const value = Number(log?.dayRating)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function dayRatingLabel(log) {
  const value = dayRatingValue(log)
  return value ? `${value}/5` : ''
}

function feelingLabel(log) {
  return [log.feelingStatus, log.feeling].filter(Boolean).join(' - ')
}

function shortDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export default function Progress({ dailyLogs, workoutSessions }) {
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const sortedLogs = sortByDateDesc(dailyLogs)
  const weights = sortedLogs.filter((log) => log.weight)
  const latestWeight = weights[0]?.weight || '-'
  const firstWeight = weights[weights.length - 1]?.weight
  const delta = latestWeight !== '-' && firstWeight ? (Number(latestWeight) - Number(firstWeight)).toFixed(1) : '-'
  const exercises = workoutSessions.flatMap((session) => session.exercises || [])
  const completed = exercises.filter((exercise) => exercise.completed).length
  const ratedDays = dailyLogs.filter((log) => dayRatingValue(log))
  const goodDays = ratedDays.filter((log) => dayRatingValue(log) >= 4)

  return (
    <div className="grid gap-5">
      <SectionTitle title="Progressi" eyebrow="andamento">
        Una vista semplice per controllare peso, valutazione e benessere nel tempo.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <MiniStat icon={Scale} label="Peso attuale" value={latestWeight === '-' ? '-' : `${latestWeight} kg`} />
        <MiniStat icon={LineChart} label="Variazione" value={delta === '-' ? '-' : `${delta} kg`} />
        <MiniStat icon={HeartPulse} label="Giornate da 4 in su" value={`${goodDays.length}/${ratedDays.length || 0}`} />
        <MiniStat icon={Activity} label="Workout completati" value={completed} />
      </div>

      <Card>
        <SectionTitle title="Trend peso" eyebrow="ultimi record">
          Foto corpo, peso, sensazione e valutazione giornata nello stesso punto.
        </SectionTitle>
        {weights.length ? (
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {weights.slice(0, 20).map((log, index) => {
              const current = Number(log.weight)
              const previous = Number(weights[index + 1]?.weight) || 0
              const weightDelta = previous ? current - previous : null
              return (
                <div key={`weight-${log.id}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800 }}>{shortDate(log.date)}</p>
                    <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.35)' }}>{compactDate(log.date)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {weightDelta !== null ? (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: weightDelta < 0 ? '#4caf7d' : weightDelta > 0 ? '#e05555' : 'rgba(240,237,232,0.35)',
                      }}>
                        {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                      </span>
                    ) : null}
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#f06030' }}>{log.weight} kg</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:hidden">
          {sortedLogs.slice(0, 12).map((log) => (
            <article key={log.id} className="rounded-2xl border border-blush-border bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-blush-border bg-pink-bg text-accent">
                  {log.bodyPhoto ? (
                    <button type="button" className="h-full w-full" onClick={() => setPreviewPhoto({ src: log.bodyPhoto, label: `Foto corpo - ${compactDate(log.date)}` })}>
                      <img src={log.bodyPhoto} alt="" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                    </button>
                  ) : (
                    <Camera size={22} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-title">{compactDate(log.date)}</p>
                  {log.weight ? <p className="text-sm">Peso: {log.weight} kg</p> : null}
                  {feelingLabel(log) ? <p className="text-sm">Come ti senti: {feelingLabel(log)}</p> : null}
                  {dayRatingLabel(log) ? (
                    <p className={`mt-1 w-fit rounded-full px-3 py-1 text-xs font-bold ${dayRatingValue(log) >= 4 ? 'bg-sage text-title' : 'bg-blush text-title'}`}>
                      Valutazione {dayRatingLabel(log)}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          {sortedLogs.length === 0 ? <p className="text-sm">Nessuna giornata salvata.</p> : null}
        </div>
        <div className="table-wrap hidden lg:block">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Foto corpo</th>
                <th>Peso</th>
                <th>Come ti senti</th>
                <th>Valutazione giornata</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.slice(0, 12).map((log) => (
                <tr key={log.id}>
                  <td>{compactDate(log.date)}</td>
                  <td>
                    {log.bodyPhoto ? (
                      <button type="button" onClick={() => setPreviewPhoto({ src: log.bodyPhoto, label: `Foto corpo - ${compactDate(log.date)}` })}>
                        <img src={log.bodyPhoto} alt="" className="h-16 w-16 rounded-xl border border-blush-border bg-pink-bg object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                      </button>
                    ) : ''}
                  </td>
                  <td>{log.weight ? `${log.weight} kg` : ''}</td>
                  <td>{feelingLabel(log)}</td>
                  <td>{dayRatingLabel(log)}</td>
                </tr>
              ))}
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5">Nessuna giornata salvata.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Ultime note stato" eyebrow="benessere" />
        <div style={{ display: 'grid', gap: 8 }}>
          {sortedLogs
            .filter((log) => log.feeling || log.feelingStatus)
            .slice(0, 10)
            .map((log) => (
              <div key={`feeling-${log.id}`} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,237,232,0.35)' }}>
                    {shortDate(log.date)}
                  </span>
                  {log.feelingStatus && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#f06030',
                      background: 'rgba(240,96,48,0.14)',
                      padding: '2px 8px',
                      borderRadius: 99,
                    }}>
                      {log.feelingStatus}
                    </span>
                  )}
                </div>
                {log.feeling && (
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(240,237,232,0.6)',
                    borderLeft: '3px solid #f06030',
                    paddingLeft: 9,
                    lineHeight: 1.5,
                  }}>
                    {log.feeling}
                  </div>
                )}
              </div>
            ))}
          {sortedLogs.filter((log) => log.feeling || log.feelingStatus).length === 0 && (
            <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.35)', textAlign: 'center', padding: '16px 0' }}>
              Nessuna nota ancora.
            </p>
          )}
        </div>
      </Card>
      {previewPhoto ? <PhotoModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} /> : null}
    </div>
  )
}
