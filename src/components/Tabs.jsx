export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="sticky top-0 z-20 mb-5 max-w-full overflow-x-auto py-3 md:static md:rounded-3xl md:px-2 md:py-2">
      <div
        className="md:glass flex w-max gap-1.5 px-1 md:w-full md:flex-wrap md:rounded-3xl md:px-2 md:py-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-gradient-to-br from-accent-light to-accent text-white shadow-[0_4px_14px_rgba(232,98,42,0.35)]'
                : 'bg-white/50 text-title backdrop-blur-sm hover:bg-white/80'
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
