import { AlertTriangle, Apple, Ban, Carrot, Droplet, Flame, Goal, Leaf, Utensils } from 'lucide-react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'

const breakfastGroups = [
  {
    title: 'Carboidrati',
    icon: Utensils,
    items: [
      ['Pane tostato', '40-50 g'],
      ['Fette biscottate semplici', '30-35 g'],
      ['Gallette di riso', '25-30 g'],
      ["Fiocchi d'avena", '30-40 g'],
    ],
  },
  {
    title: 'Frutta',
    icon: Apple,
    items: [
      ['Mirtilli', '100 g'],
      ['Fragole', '150 g'],
      ['Kiwi', '1 medio'],
      ['Banana', '80-100 g'],
    ],
  },
  {
    title: 'Grassi',
    icon: Droplet,
    items: [
      ['Crema 100% mandorle', '10 g'],
      ['Mandorle', '10 g'],
    ],
  },
]

const snackGroups = [
  {
    title: 'Frutta',
    icon: Apple,
    items: [
      ['Kiwi', '1'],
      ['Fragole', '150 g'],
      ['Mirtilli', '100 g'],
      ['Arancia', '1 piccola'],
    ],
  },
  {
    title: 'Grassi facoltativi',
    icon: Droplet,
    items: [
      ['Mandorle', '10 g'],
      ['Noci', '10 g'],
    ],
  },
]

const lunchDinnerGroups = [
  {
    title: 'Proteine',
    icon: Flame,
    items: [
      ['Pollo', '120-130 g'],
      ['Tacchino', '120-130 g'],
      ['Merluzzo', '150 g'],
      ['Nasello', '150 g'],
      ['Orata', '150 g'],
      ['Branzino', '150 g'],
      ['Salmone', '120 g'],
      ['Tonno naturale sgocciolato', '100 g'],
      ['Uova', '2 intere + 2 albumi'],
    ],
  },
  {
    title: 'Carboidrati',
    icon: Utensils,
    items: [
      ['Riso basmati', '50-60 g'],
      ['Riso jasmine', '50-60 g'],
      ['Patate', '200-250 g'],
      ['Pane', '50-60 g'],
    ],
  },
  {
    title: 'Verdure',
    icon: Carrot,
    items: [
      ['Zucchine', '250-300 g'],
      ['Carote', '250-300 g'],
      ['Finocchi', '250-300 g'],
      ['Zucca', '250-300 g'],
    ],
  },
]

const spices = [
  ['Curcuma', '1 cucchiaino'],
  ['Zenzero', '1 cucchiaino'],
  ['Origano', 'libero'],
  ['Basilico', 'libero'],
  ['Rosmarino', 'libero'],
  ['Prezzemolo', 'libero'],
]

const forbiddenGroups = [
  ['Latticini', ['latte', 'yogurt', 'formaggi', 'mozzarella', 'ricotta']],
  ['Soia', ['latte di soia', 'yogurt di soia', 'tofu']],
  ['Legumi', ['ceci', 'lenticchie', 'fagioli', 'piselli']],
  ['Verdure problematiche', ['cipolla', 'aglio', 'cavolfiore', 'broccoli', 'cavoli']],
  ['Altro', ['bibite gassate', 'alcol', 'chewing gum', 'dolcificanti', 'prodotti proteici industriali', 'barrette proteiche']],
]

const weightGoal = [
  ['1', '52,0 kg'],
  ['10', '50,8 kg'],
  ['20', '49,8 kg'],
  ['30', '48,7 kg'],
  ['40', '47,6 kg'],
  ['50', '46,5-47,0 kg'],
]

function FoodGroup({ title, icon: Icon, items }) {
  return (
    <div className="rounded-2xl border border-blush-border bg-white p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-blush text-title">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h3 className="font-black text-title">{title}</h3>
      </div>
      <div className="grid gap-2">
        {items.map(([name, amount]) => (
          <div key={`${title}-${name}`} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-pink-bg px-3 py-2 text-sm">
            <span className="font-semibold text-text">{name}</span>
            <span className="whitespace-nowrap rounded-full bg-warm-white px-2.5 py-1 text-xs font-black text-title">{amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RuleCard({ title, children, tone = 'bg-blush' }) {
  return (
    <div className={`rounded-2xl border border-blush-border p-3 ${tone}`}>
      <p className="text-xs font-black uppercase tracking-wide text-title">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-text">{children}</p>
    </div>
  )
}

export default function Diet() {
  return (
    <div className="grid gap-5">
      <Card className="border-2 border-accent bg-blush">
        <SectionTitle title="Dieta sgonfia e semplice" eyebrow="schema alimentare">
          Scegli dagli alimenti consentiti, rispetta le grammature e tieni pranzo e cena intercambiabili.
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          <RuleCard title="Obiettivo">Sgonfiarti, controllare la colite e perdere grasso con pochi alimenti ripetibili.</RuleCard>
          <RuleCard title="Regola pasti">Colazione e merenda hanno liste dedicate. Pranzo e cena usano la stessa struttura.</RuleCard>
          <RuleCard title="Combinazione">Scegli 1 proteina + 1 carboidrato + verdure. Olio EVO diviso tra pranzo e cena.</RuleCard>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Colazione" eyebrow="1 carboidrato + 1 frutto + 1 grasso" />
        <div className="grid gap-3 lg:grid-cols-3">
          {breakfastGroups.map((group) => <FoodGroup key={group.title} {...group} />)}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Merenda" eyebrow="1 frutto oppure frutto + frutta secca">
          La frutta secca e facoltativa: usala quando hai piu fame o ti serve piu sazieta.
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {snackGroups.map((group) => <FoodGroup key={group.title} {...group} />)}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Pranzo / Cena" eyebrow="pasti intercambiabili">
          Stessa struttura per entrambi: scegli una proteina, un carboidrato e una verdura.
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-3">
          {lunchDinnerGroups.map((group) => <FoodGroup key={group.title} {...group} />)}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionTitle title="Grassi e spezie" eyebrow="condimenti" />
          <div className="grid gap-3">
            <div className="rounded-2xl border border-blush-border bg-white p-3">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-2xl bg-blush text-title">
                  <Droplet size={18} aria-hidden="true" />
                </span>
                <p className="font-black text-title">Olio EVO</p>
              </div>
              <div className="grid gap-2">
                <p className="rounded-xl bg-pink-bg px-3 py-2 text-sm font-semibold">Totale giornaliero: <strong>20 g</strong></p>
                <p className="rounded-xl bg-pink-bg px-3 py-2 text-sm font-semibold">10 g pranzo + 10 g cena</p>
              </div>
            </div>
            <FoodGroup title="Spezie" icon={Leaf} items={spices} />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Non mangiare" eyebrow="per almeno 3 settimane">
            Lista da evitare per ridurre gonfiore, colite e ritenzione.
          </SectionTitle>
          <div className="grid gap-3">
            {forbiddenGroups.map(([group, items]) => (
              <div key={group} className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-title">
                  <Ban size={17} aria-hidden="true" />
                  <p className="font-black">{group}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-title">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle title="Obiettivo peso" eyebrow="50 giorni">
          Partenza: 52 kg. Il calo iniziale puo essere piu evidente se gonfiore e ritenzione pesano molto.
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-blush-border bg-pink-bg p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-accent text-white">
                <Goal size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase text-accent">Target finale</p>
                <p className="text-3xl font-black text-title">46,5-47,0 kg</p>
              </div>
            </div>
            <p className="mt-3 rounded-2xl bg-warm-white px-3 py-2 text-sm font-semibold text-text">
              Usa questi numeri come riferimento di percorso, non come giudizio giornaliero.
            </p>
          </div>
          <div className="table-wrap">
            <table className="clean-table min-w-[420px]">
              <thead>
                <tr>
                  <th>Giorno</th>
                  <th>Peso atteso</th>
                </tr>
              </thead>
              <tbody>
                {weightGoal.map(([day, weight]) => (
                  <tr key={day}>
                    <td className="font-black text-title">Giorno {day}</td>
                    <td>{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 shrink-0 text-accent" size={20} aria-hidden="true" />
          <p className="text-sm leading-6 text-text">
            Nota: questa pagina serve come promemoria organizzato del tuo schema. Se sintomi di colite, gonfiore o peso cambiano in modo importante, meglio confrontarti con una professionista.
          </p>
        </div>
      </Card>
    </div>
  )
}
