import { createId } from '../utils/storage'

const baseRows = [
  ['Giorno 1', 'Hip thrust machine o Glute Bridge', '4 x 12', '', ''],
  ['Giorno 1', 'Abductor machine', '4 x 15-20', '', ''],
  ['Giorno 1', 'Glute kickback al cavo', '3 x 12 per lato', '', '/exercise-images/r21-glute-kickback-al-cavo.jpg'],
  ['Giorno 1', 'Leg curl', '3 x 12', '', '/exercise-images/r22-leg-curl.jpg'],
  ['Giorno 1', 'Ponte glutei a terra', '2 x 20', '', ''],
  ['Giorno 1', 'Plank frontale', '3 x 30-45 sec', '', ''],
  ['Giorno 1', 'Reverse crunch', '3 x 12-15', '', '/exercise-images/r25-reverse-crunch.jpg'],
  ['Giorno 1', 'Side plank', '2 x 30 sec per lato', '', '/exercise-images/r26-side-plank.jpg'],
  ['Giorno 2', 'Lat machine presa larga', '4 x 10-12', '', '/exercise-images/r29-lat-machine-presa-larga.jpg'],
  ['Giorno 2', 'Pulley basso', '3 x 12', '', '/exercise-images/r30-pulley-basso.jpg'],
  ['Giorno 2', 'Shoulder press manubri', '3 x 10-12', '', '/exercise-images/r31-shoulder-press-manubri.jpg'],
  ['Giorno 2', 'Alzate laterali', '4 x 12-15', '', '/exercise-images/r32-alzate-laterali.jpg'],
  ['Giorno 2', 'Face pull al cavo', '3 x 15', '', '/exercise-images/r33-face-pull-al-cavo.jpg'],
  ['Giorno 2', 'Curl bicipiti manubri', '3 x 12', '', '/exercise-images/r34-curl-bicipiti-manubri.jpg'],
  ['Giorno 2', 'Hammer curl', '2 x 12', '', '/exercise-images/r35-hammer-curl.jpg'],
  ['Giorno 2', 'Russian twist controllato', '3 x 20 totali', '', '/exercise-images/r36-russian-twist-controllato.jpg'],
  ['Giorno 2', 'Plank laterale', '2 x 30 sec per lato', '', '/exercise-images/r37-plank-laterale.jpg'],
  ['Giorno 3', 'Hip thrust o glute bridge machine', '3 x 12', '', '/exercise-images/r41-hip-thrust-o-glute-bridge-machine.jpg'],
  ['Giorno 3', 'Romanian deadlift con manubri leggeri', '3 x 10-12', '', '/exercise-images/r42-romanian-deadlift-con-manubri-leggeri.jpg'],
  ['Giorno 3', 'Lat machine', '3 x 12', '', '/exercise-images/r43-lat-machine.jpg'],
  ['Giorno 3', 'Chest press leggera', '2 x 12', '', '/exercise-images/r44-chest-press-leggera.jpg'],
  ['Giorno 3', 'Alzate laterali', '3 x 15', '', '/exercise-images/r45-alzate-laterali.jpg'],
  ['Giorno 3', 'Abductor machine', '3 x 20', '', '/exercise-images/r46-abductor-machine.jpg'],
  ['Giorno 3', 'Curl bicipiti', '2 x 12', '', '/exercise-images/r47-curl-bicipiti.jpg'],
  ['Giorno 3', 'Dead bug', '3 x 10 per lato', '', '/exercise-images/r48-dead-bug.jpg'],
  ['Giorno 3', 'Mountain climber lento', '2 x 20 totali', '', '/exercise-images/r49-mountain-climber-lento.jpg'],
]

export function buildDefaultWorkoutPlans() {
  return [{
    id: createId(),
    name: 'Scheda base',
    version: 'sheet-images-2026-05-27',
    goal: 'Programmazione completa divisa in Giorno 1, Giorno 2 e Giorno 3',
    days: ['Giorno 1', 'Giorno 2', 'Giorno 3'].map((day) => ({
      id: createId(),
      workoutDay: day,
      goal: day === 'Giorno 2' ? 'Glutei, gambe e core' : 'Parte alta, spalle, schiena e core',
      exercises: baseRows
        .filter(([workoutDay]) => workoutDay === day)
        .map(([, exercise, plannedSetsReps, technicalNotes, imageData]) => ({
          id: createId(),
          exercise,
          plannedSetsReps,
          technicalNotes,
          personalNotes: '',
          imageData,
        })),
    })),
  }]
}

export const workoutPlans = buildDefaultWorkoutPlans()
