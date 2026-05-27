import { Activity, Droplets, LineChart, Scale } from 'lucide-react'
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

export default function Progress({ dailyLogs, workoutSessions }) {
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
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Data</th>
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
                  <td>{log.weight ? `${log.weight} kg` : '-'}</td>
                  <td>{log.energy || '-'}</td>
                  <td>{log.bloating || '-'}</td>
                  <td>{log.stress || '-'}</td>
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
    </div>
  )
}
