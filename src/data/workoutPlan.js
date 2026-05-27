import { createId } from '../utils/storage'

const baseRows = [
  ['Giorno 1', 'Lat machine presa media', '3x10-12', 'Petto alto, spalle basse, tira verso la parte alta del petto.'],
  ['Giorno 1', 'Rematore macchina chest-supported', '3x10-12', 'Petto appoggiato, tira i gomiti indietro e stringi le scapole.'],
  ['Giorno 1', 'Shoulder press macchina', '3x10-12', 'Schiena appoggiata; se senti fastidio alla spalla riduci o fermati.'],
  ['Giorno 1', 'Alzate laterali manubri', '3x12-15', 'Alza fino alla linea spalle senza slancio e senza trapezi.'],
  ['Giorno 1', 'Chest press macchina', '3x10-12', 'Spinta controllata, spalle aperte e scapole stabili.'],
  ['Giorno 1', 'Rear delt machine / alzate posteriori', '3x15', 'Focus parte dietro spalla e schiena alta.'],
  ['Giorno 1', 'Curl manubri o macchina', '3x12', 'Gomiti fermi vicino al busto.'],
  ['Giorno 1', 'Push down tricipiti al cavo', '3x12-15', 'Gomiti aderenti ai fianchi, non muovere spalle e busto.'],
  ['Giorno 1', 'Crunch macchina o a terra', '3x15-20', 'Chiudi costole verso bacino, non tirare il collo.'],
  ['Giorno 1', 'Plank', '3x30-40 sec', 'Corpo in linea, addome forte.'],
  ['Giorno 2', 'Hip thrust macchina', '4x10-12', 'Spingi coi talloni, stringi il gluteo senza inarcare troppo.'],
  ['Giorno 2', 'Kick back al cavo', '3x12-15 per lato', 'Busto fermo, spingi col gluteo senza ruotare il bacino.'],
  ['Giorno 2', 'Abductor machine', '3x18-20', 'Apri in controllo e torna lentamente.'],
  ['Giorno 2', 'Leg curl seduto o sdraiato', '3x12-15', 'Talloni verso glutei, bacino fermo.'],
  ['Giorno 2', 'Reverse crunch', '3x15', 'Bacino verso il petto senza slancio.'],
  ['Giorno 2', 'Dead bug', '3x10 per lato', 'Schiena bassa aderente, movimento lento.'],
  ['Giorno 2', 'Plank', '3x30-40 sec', 'Corpo in linea e addome forte.'],
  ['Giorno 3', 'Alzate laterali al cavo o manubri', '4x12-15', 'Controllo, cerca la spalla e non lo slancio.'],
  ['Giorno 3', 'Rear delt machine / alzate posteriori', '3x15', 'Apri dietro con petto fermo.'],
  ['Giorno 3', 'Pulley basso o lat machine leggera', '3x12', 'Tira in controllo e chiudi le scapole.'],
  ['Giorno 3', 'Chest press macchina', '3x10-12', 'Spinta controllata, spalle aperte.'],
  ['Giorno 3', 'Face pull al cavo', '3x15', 'Tira verso il viso con gomiti alti.'],
]

export function buildDefaultWorkoutPlans() {
  return ['Giorno 1', 'Giorno 2', 'Giorno 3'].map((day) => ({
    id: createId(),
    name: `Scheda ${day}`,
    workoutDay: day,
    goal: day === 'Giorno 2' ? 'Glutei, gambe e core' : 'Parte alta, spalle, schiena e core',
    exercises: baseRows
      .filter(([workoutDay]) => workoutDay === day)
      .map(([, exercise, plannedSetsReps, technicalNotes]) => ({
        id: createId(),
        exercise,
        plannedSetsReps,
        technicalNotes,
        personalNotes: '',
        imageData: '',
      })),
  }))
}

export const workoutPlans = buildDefaultWorkoutPlans()
