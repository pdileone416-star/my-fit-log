export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="sticky top-0 z-20 -mx-4 mb-5 overflow-x-auto border-b border-blush-border bg-pink-bg/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-2xl md:border md:bg-warm-white">
      <div className="flex min-w-max gap-2 md:min-w-0 md:flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === id ? 'bg-accent text-white shadow-soft' : 'bg-white text-title hover:bg-blush'
            }`}
          >
            {Icon ? <Icon size={18} aria-hidden="true" /> : null}
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
