import { Activity, Camera, Droplets, LineChart, Scale } from 'lucide-react'
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

export default function Progress({ dailyLogs, workoutSessions }) {
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const sortedLogs = sortByDateDesc(dailyLogs)
  const weights = sortedLogs.filter((log) => log.weight)
  const latestWeight = weights[0]?.weight || '-'
  const firstWeight = weights[weights.length - 1]?.weight
  const delta = latestWeight !== '-' && firstWeight ? (Number(latestWeight) - Number(firstWeight)).toFixed(1) : '-'
  const exercises = workoutSessions.flatMap((session) => session.exercises || [])
  const completed = exercises.filter((exercise) => exercise.completed).length
  const avgEnergy = dailyLogs.length
    ? (dailyLogs.reduce((sum, log) => sum + (Number(log.energy) || 0), 0) / dailyLogs.filter((log) => Number(log.energy)).length || 0).toFixed(1)
    : '-'

  return (
    <div className="grid gap-5">
      <SectionTitle title="Progressi" eyebrow="andamento">
        Una vista semplice per controllare peso, allenamenti e benessere nel tempo.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <MiniStat icon={Scale} label="Peso attuale" value={latestWeight === '-' ? '-' : `${latestWeight} kg`} />
        <MiniStat icon={LineChart} label="Variazione" value={delta === '-' ? '-' : `${delta} kg`} />
        <MiniStat icon={Activity} label="Workout completati" value={completed} />
        <MiniStat icon={Droplets} label="Energia media" value={avgEnergy} />
      </div>

      <Card>
        <SectionTitle title="Trend peso" eyebrow="ultimi record" />
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:hidden">
          {sortedLogs.slice(0, 12).map((log) => (
            <article key={log.id} className="rounded-2xl border border-blush-border bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-blush-border bg-pink-bg text-accent">
                  {log.bodyPhoto ? (
                    <button type="button" className="h-full w-full" onClick={() => setPreviewPhoto({ src: log.bodyPhoto, label: `Foto corpo - ${log.date}` })}>
                      <img src={log.bodyPhoto} alt="" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                    </button>
                  ) : (
                    <Camera size={22} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-black text-title">{log.date}</p>
                  <p className="text-sm">Peso {log.weight ? `${log.weight} kg` : '-'}</p>
                  <p className="text-sm">Energia {log.energy || '-'} - Gonfiore {log.bloating || '-'} - Stress {log.stress || '-'}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="table-wrap hidden lg:block">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Foto corpo</th>
                <th>Peso</th>
                <th>Energia</th>
                <th>Gonfiore</th>
                <th>Stress</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.slice(0, 12).map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>
                    {log.bodyPhoto ? (
                      <button type="button" onClick={() => setPreviewPhoto({ src: log.bodyPhoto, label: `Foto corpo - ${log.date}` })}>
                        <img src={log.bodyPhoto} alt="" className="h-16 w-16 rounded-xl border border-blush-border bg-pink-bg object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                      </button>
                    ) : '-'}
                  </td>
                  <td>{log.weight ? `${log.weight} kg` : '-'}</td>
                  <td>{log.energy || '-'}</td>
                  <td>{log.bloating || '-'}</td>
                  <td>{log.stress || '-'}</td>
                </tr>
              ))}
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6">Nessuna giornata salvata.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      {previewPhoto ? <PhotoModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} /> : null}
    </div>
  )
}
