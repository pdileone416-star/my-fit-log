import { createId } from '../utils/storage'

export const DEFAULT_WORKOUT_PLAN_VERSION = 'orange-home-plan-2026-06-14'

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

const homeRows = [
  ['Giorno 1', 'Rematore manubrio', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r4-c3-1.jpg'],
  ['Giorno 1', 'Lat pull elastico', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r5-c3-2.jpg'],
  ['Giorno 1', 'Alzate laterali', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r6-c3-3.jpg'],
  ['Giorno 1', 'Curl bicipiti', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r7-c3-4.jpg'],
  ['Giorno 1', 'Tricipiti sopra testa', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r8-c3-5.jpg'],
  ['Giorno 1', 'Push up inclinati', '3 x 8-12', '', '/exercise-images/allenamento-casa/allenamento-casa-r9-c3-6.jpg'],
  ['Giorno 1', 'Circuito addome', 'Crunch 3 x 20 | Dead bug 3 x 12 | Plank 3 x 30 sec', '', '/exercise-images/allenamento-casa/allenamento-casa-r10-c3-7.jpg'],
  ['Giorno 2', 'Hip thrust', '4 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r13-c3-8.jpg'],
  ['Giorno 2', 'Ponte glutei con elastico', '3 x 20', '', '/exercise-images/allenamento-casa/allenamento-casa-r14-c3-9.jpg'],
  ['Giorno 2', 'Kickback elastico', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r15-c3-10.jpg'],
  ['Giorno 2', 'Abduzioni', '4 x 20', '', '/exercise-images/allenamento-casa/allenamento-casa-r16-c3-11.jpg'],
  ['Giorno 2', 'Romanian deadlift', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r17-c3-12.jpg'],
  ['Giorno 2', 'Frog pumps', '3 x 25', '', '/exercise-images/allenamento-casa/allenamento-casa-r18-c3-13.jpg'],
  ['Giorno 3', 'Core e stretching', 'Plank laterale 3 x 20 | Vacuum 4 x 20 | Stretching', '', '/exercise-images/allenamento-casa/allenamento-casa-r21-c3-14.jpg'],
  ['Giorno 4', 'Rematore presa stretta', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r24-c3-15.jpg'],
  ['Giorno 4', 'Pulldown elastico', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r25-c3-16.jpg'],
  ['Giorno 4', 'Military press', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r26-c3-17.jpg'],
  ['Giorno 4', 'Alzate frontali', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r27-c3-18.jpg'],
  ['Giorno 4', 'Curl martello', '3 x 12', '', '/exercise-images/allenamento-casa/allenamento-casa-r28-c3-19.jpg'],
  ['Giorno 4', 'Kickback tricipiti', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r29-c3-20.jpg'],
  ['Giorno 4', 'Circuito addome', 'Crunch bici 3 x 20 | Reverse crunch 3 x 15 | Plank', '', '/exercise-images/allenamento-casa/allenamento-casa-r30-c3-21.jpg'],
  ['Giorno 5', 'Hip thrust', '4 x 10', '', '/exercise-images/allenamento-casa/allenamento-casa-r33-c3-22.jpg'],
  ['Giorno 5', 'Glute bridge isometrico', '3 x 30 sec', '', '/exercise-images/allenamento-casa/allenamento-casa-r34-c3-23.jpg'],
  ['Giorno 5', 'Abduzioni', '4 x 20', '', '/exercise-images/allenamento-casa/allenamento-casa-r35-c3-24.jpg'],
  ['Giorno 5', 'Kickback', '3 x 15', '', '/exercise-images/allenamento-casa/allenamento-casa-r36-c3-25.jpg'],
  ['Giorno 5', 'Frog pumps', '3 x 30', '', '/exercise-images/allenamento-casa/allenamento-casa-r37-c3-26.jpg'],
]

function buildPlan({ name, goal, days, rows }) {
  return {
    id: createId(),
    name,
    version: DEFAULT_WORKOUT_PLAN_VERSION,
    goal,
    days: days.map(({ workoutDay, goal: dayGoal }) => ({
      id: createId(),
      workoutDay,
      goal: dayGoal,
      exercises: rows
        .filter(([day]) => day === workoutDay)
        .map(([, exercise, plannedSetsReps, technicalNotes, imageData]) => ({
          id: createId(),
          exercise,
          plannedSetsReps,
          technicalNotes,
          personalNotes: '',
          imageData,
        })),
    })),
  }
}

export function buildDefaultWorkoutPlans() {
  return [
    buildPlan({
      name: 'Scheda base',
      goal: 'Programmazione completa divisa in Giorno 1, Giorno 2 e Giorno 3',
      days: [
        { workoutDay: 'Giorno 1', goal: 'Parte alta, spalle, schiena e core' },
        { workoutDay: 'Giorno 2', goal: 'Glutei, gambe e core' },
        { workoutDay: 'Giorno 3', goal: 'Parte alta, spalle, schiena e core' },
      ],
      rows: baseRows,
    }),
    buildPlan({
      name: 'Allenamento casa',
      goal: 'Fisico asciutto e tonico, focus schiena, braccia, addome e glutei. Progressione: aumenta peso fino a 10 kg, poi reps 12 -> 15 -> 18 -> 20, rallenta esecuzione, usa elastico + peso e aumenta serie quando serve.',
      days: [
        { workoutDay: 'Giorno 1', goal: 'Upper body + addome' },
        { workoutDay: 'Giorno 2', goal: 'Glutei + camminata' },
        { workoutDay: 'Giorno 3', goal: 'Cardio + Core' },
        { workoutDay: 'Giorno 4', goal: 'Upper body + addome' },
        { workoutDay: 'Giorno 5', goal: 'Glutei focus' },
      ],
      rows: homeRows,
    }),
  ]
}

export const workoutPlans = buildDefaultWorkoutPlans()
