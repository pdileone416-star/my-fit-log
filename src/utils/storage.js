import { useEffect, useState } from 'react'

export const STORAGE_KEYS = {
  dailyLogs: 'dailyLogs',
  workoutLogs: 'workoutLogs',
  workoutLogsBackup: 'workoutLogs_backup',
  workoutSessions: 'workoutSessions',
  workoutPlans: 'workoutPlans',
  supplementOptions: 'supplementOptions',
  users: 'myFitLogUsers',
  currentUser: 'myFitLogCurrentUser',
}

export function createId() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useLocalStorage(key, fallback = []) {
  const [value, setValue] = useState(() => readStorage(key, fallback))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue]
}

export function storageKeyForUser(userId, key) {
  return `myFitLog:${userId}:${key}`
}

export async function hashSecret(value) {
  if (!crypto?.subtle) {
    return fallbackHash(value)
  }

  const data = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fallbackHash(value) {
  let hashA = 0x811c9dc5
  let hashB = 0x45d9f3b

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    hashA ^= code
    hashA = Math.imul(hashA, 0x01000193)
    hashB ^= code + index
    hashB = Math.imul(hashB, 0x85ebca6b)
  }

  return `fallback-${(hashA >>> 0).toString(16).padStart(8, '0')}${(hashB >>> 0).toString(16).padStart(8, '0')}`
}

export async function registerUser({ name, email, password }) {
  const users = readStorage(STORAGE_KEYS.users, [])
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Esiste gia un profilo con questa email.')
  }

  const user = {
    id: createId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashSecret(`${normalizedEmail}:${password}`),
    createdAt: new Date().toISOString(),
  }

  writeStorage(STORAGE_KEYS.users, [...users, user])
  migrateLegacyData(user.id)
  const sessionUser = toSessionUser(user)
  writeStorage(STORAGE_KEYS.currentUser, sessionUser)
  return sessionUser
}

export async function loginUser({ email, password }) {
  const users = readStorage(STORAGE_KEYS.users, [])
  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await hashSecret(`${normalizedEmail}:${password}`)
  const user = users.find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash)

  if (!user) {
    throw new Error('Email o password non corrette.')
  }

  const sessionUser = toSessionUser(user)
  writeStorage(STORAGE_KEYS.currentUser, sessionUser)
  return sessionUser
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser)
}

export function getCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null)
}

function toSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function migrateLegacyData(userId) {
  Object.values({
    dailyLogs: STORAGE_KEYS.dailyLogs,
    workoutLogs: STORAGE_KEYS.workoutLogs,
    workoutSessions: STORAGE_KEYS.workoutSessions,
    workoutPlans: STORAGE_KEYS.workoutPlans,
  }).forEach((key) => {
    const userKey = storageKeyForUser(userId, key)
    const existingUserData = readStorage(userKey, [])
    const legacyData = readStorage(key, [])

    if (existingUserData.length === 0 && legacyData.length > 0) {
      writeStorage(userKey, legacyData)
    }
  })

  migrateWorkoutLogsToSessions(userId)
}

export function normalizeWorkoutDay(value) {
  const normalized = String(value || '').trim()
  if (normalized === '1') return 'Giorno 1'
  if (normalized === '2') return 'Giorno 2'
  if (normalized === '3') return 'Giorno 3'
  return normalized || 'Giorno 1'
}

export function migrateWorkoutLogsToSessions(userId) {
  const sessionsKey = storageKeyForUser(userId, STORAGE_KEYS.workoutSessions)
  const logsKey = storageKeyForUser(userId, STORAGE_KEYS.workoutLogs)
  const backupKey = storageKeyForUser(userId, STORAGE_KEYS.workoutLogsBackup)
  const existingSessions = readStorage(sessionsKey, [])
  const legacyLogs = readStorage(logsKey, [])

  if (existingSessions.length > 0 || legacyLogs.length === 0) {
    return
  }

  if (readStorage(backupKey, []).length === 0) {
    writeStorage(backupKey, legacyLogs)
  }

  const grouped = legacyLogs.reduce((groups, log) => {
    const workoutDay = normalizeWorkoutDay(log.workoutDay)
    const date = log.date || todayISO()
    const key = `${date}|${workoutDay}`
    const session = groups.get(key) || {
      id: createId(),
      date,
      workoutDay,
      title: `${workoutDay} - ${date}`,
      notes: '',
      exercises: [],
    }

    session.exercises.push({
      id: log.id || createId(),
      exercise: log.exercise || 'Esercizio',
      plannedSetsReps: log.plannedSetsReps || '',
      completedSetsReps: log.completedSetsReps || '',
      weightKg: log.weightKg || '',
      fatigue: log.fatigue || '',
      completed: Boolean(log.completed),
      notes: log.notes || '',
    })

    groups.set(key, session)
    return groups
  }, new Map())

  writeStorage(sessionsKey, Array.from(grouped.values()))
}

export function formatDate(date) {
  if (!date) return 'Nessuna data'
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

export function sortByDateDesc(items) {
  return [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
