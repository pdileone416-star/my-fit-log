import { useState } from 'react'
import { Activity, CalendarDays, Dumbbell, Home as HomeIcon, LineChart, LogOut, Utensils } from 'lucide-react'
import Button from './components/Button'
import Tabs from './components/Tabs'
import Home from './pages/Home'
import FoodDiary from './pages/FoodDiary'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import History from './pages/History'
import Login from './pages/Login'
import { getCurrentUser, logoutUser, migrateWorkoutLogsToSessions, STORAGE_KEYS, storageKeyForUser, useLocalStorage } from './utils/storage'

function App() {
  const [user, setUser] = useState(() => getCurrentUser())

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <AppContent key={user.id} user={user} onLogout={() => {
    logoutUser()
    setUser(null)
  }} />
}

function AppContent({ user, onLogout }) {
  migrateWorkoutLogsToSessions(user.id)
  const [activeTab, setActiveTab] = useState('home')
  const [dailyLogs, setDailyLogs] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.dailyLogs), [])
  const [workoutSessions, setWorkoutSessions] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.workoutSessions), [])
  const [workoutPlans, setWorkoutPlans] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.workoutPlans), [])

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'diary', label: 'Diario', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progressi', icon: LineChart },
    { id: 'history', label: 'Storico', icon: CalendarDays },
  ]

  const sharedProps = {
    dailyLogs,
    setDailyLogs,
    workoutSessions,
    setWorkoutSessions,
    workoutPlans,
    setWorkoutPlans,
    goTo: setActiveTab,
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-5 md:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 rounded-3xl border border-blush-border bg-warm-white p-4 shadow-soft sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-blush text-title">
                <Activity size={24} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent sm:text-sm">diario personale</p>
                <h1 className="text-3xl font-black text-title md:text-4xl">My Fit Log</h1>
                <p className="text-sm text-text">Ciao {user.name || user.email}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={onLogout} className="w-full border border-blush-border sm:w-auto">
              <LogOut size={17} aria-hidden="true" />
              Esci
            </Button>
          </div>
        </header>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <main>
          {activeTab === 'home' && <Home {...sharedProps} />}
          {activeTab === 'diary' && <FoodDiary {...sharedProps} />}
          {activeTab === 'workout' && <Workout {...sharedProps} />}
          {activeTab === 'progress' && <Progress {...sharedProps} />}
          {activeTab === 'history' && <History {...sharedProps} />}
        </main>
      </div>
    </div>
  )
}

export default App
