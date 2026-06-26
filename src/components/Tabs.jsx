export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[680px] border-t border-white/70 bg-warm-white/90 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(120,46,8,0.10)] backdrop-blur-2xl">
      <div
        className="grid grid-cols-4 gap-1.5"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-black uppercase tracking-wide transition-all duration-200 ${
              activeTab === id
                ? 'bg-gradient-to-br from-accent-light to-accent text-white shadow-[0_4px_14px_rgba(232,98,42,0.35)]'
                : 'text-title/60 hover:bg-blush/60 hover:text-title'
            }`}
          >
            {Icon ? <Icon size={20} aria-hidden="true" /> : null}
            <span>{label}</span>
            <span className={`absolute bottom-1.5 size-1 rounded-full bg-current transition-opacity ${activeTab === id ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        ))}
      </div>
    </nav>
  )
}
