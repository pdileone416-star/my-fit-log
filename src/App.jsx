import { useEffect, useState } from 'react'
import { Dumbbell, Home as HomeIcon, LineChart, LogOut, Utensils } from 'lucide-react'
import Button from './components/Button'
import Tabs from './components/Tabs'
import Home from './pages/Home'
import FoodDiary from './pages/FoodDiary'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import Login from './pages/Login'
import { DEFAULT_WORKOUT_PLAN_VERSION, buildDefaultWorkoutPlans } from './data/workoutPlan'
import { getCurrentUser, logoutUser, migrateWorkoutLogsToSessions, readStorage, STORAGE_KEYS, storageKeyForUser, useLocalStorage, writeStorage } from './utils/storage'

const defaultSupplementOptions = ['L-teanina', 'Magnesio', 'Zafferano', 'Somatoline', 'Fanghi']
const defaultWorkoutPlanNames = ['Scheda base', 'Allenamento casa']

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
  const [activeTab, setActiveTab] = useState('home')
  const [dailyLogs, setDailyLogs] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.dailyLogs), [])
  const [workoutSessions, setWorkoutSessions] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.workoutSessions), [])
  const [workoutPlans, setWorkoutPlans] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.workoutPlans), buildDefaultWorkoutPlans())
  const [supplementOptions, setSupplementOptions] = useLocalStorage(storageKeyForUser(user.id, STORAGE_KEYS.supplementOptions), defaultSupplementOptions)

  useEffect(() => {
    migrateWorkoutLogsToSessions(user.id)
  }, [user.id])

  useEffect(() => {
    const seedKey = storageKeyForUser(user.id, 'workoutPlansSeeded')
    const hasOldSplitBase = workoutPlans.some((plan) => plan.name === 'Scheda Giorno 1')
      && workoutPlans.some((plan) => plan.name === 'Scheda Giorno 2')
      && workoutPlans.some((plan) => plan.name === 'Scheda Giorno 3')
      && !workoutPlans.some((plan) => plan.name === 'Scheda base')
    const hasMissingDefaultPlan = defaultWorkoutPlanNames.some((name) => !workoutPlans.some((plan) => plan.name === name))
    const hasOutdatedDefaultPlan = workoutPlans.some((plan) => defaultWorkoutPlanNames.includes(plan.name) && plan.version !== DEFAULT_WORKOUT_PLAN_VERSION)

    if (hasOldSplitBase || hasMissingDefaultPlan || hasOutdatedDefaultPlan) {
      const customPlans = workoutPlans.filter((plan) => !['Scheda Giorno 1', 'Scheda Giorno 2', 'Scheda Giorno 3', ...defaultWorkoutPlanNames].includes(plan.name))
      setWorkoutPlans([...buildDefaultWorkoutPlans(), ...customPlans])
      writeStorage(seedKey, true)
      return
    }

    if (workoutPlans.length === 0 && !readStorage(seedKey, false)) {
      setWorkoutPlans(buildDefaultWorkoutPlans())
      writeStorage(seedKey, true)
    }
  }, [setWorkoutPlans, user.id, workoutPlans])

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'diary', label: 'Diario', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progressi', icon: LineChart },
  ]

  const sharedProps = {
    dailyLogs,
    setDailyLogs,
    workoutSessions,
    setWorkoutSessions,
    workoutPlans,
    setWorkoutPlans,
    supplementOptions,
    setSupplementOptions,
    goTo: setActiveTab,
  }

  return (
    <div style={{ background: '#0f0f10', minHeight: '100vh', maxWidth: 680, margin: '0 auto', paddingBottom: 80 }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 16px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: 'linear-gradient(135deg, #ff7a42, #f06030)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}>
            <img src="/favicon.svg" alt="" style={{ width: 31, height: 31 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px', color: '#f0ede8' }}>My Fit Log</div>
            <div style={{ fontSize: 11, color: 'rgba(240,237,232,0.35)', marginTop: 1 }}>Ciao, {user.name || user.email}</div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onLogout}
          style={{
            background: '#232326',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(240,237,232,0.6)',
            padding: '6px 12px',
            borderRadius: 9,
            fontSize: 12,
          }}
        >
              <LogOut size={17} aria-hidden="true" />
          Esci
        </Button>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <main style={{ minWidth: 0 }}>
          {activeTab === 'home'     && <Home     {...sharedProps} />}
          {activeTab === 'diary'    && <FoodDiary {...sharedProps} />}
          {activeTab === 'workout'  && <Workout  {...sharedProps} />}
          {activeTab === 'progress' && <Progress {...sharedProps} />}
      </main>
    </div>
  )
}

export default App
