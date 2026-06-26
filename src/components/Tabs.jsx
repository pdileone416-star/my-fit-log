export default function Tabs({ tabs, activeTab, onChange, variant = 'bottom' }) {
  if (variant === 'inline') {
    return (
      <div className="mx-[14px] mb-2.5 flex gap-1.5 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--adim)' : 'var(--s3)',
                borderColor: active ? 'var(--a)' : 'var(--b2)',
                color: active ? 'var(--a)' : 'var(--txm)',
              }}
            >
              {Icon ? <Icon size={15} aria-hidden="true" /> : null}
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[460px] px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-[18px]"
      style={{ background: 'rgba(17,17,19,0.93)', borderTop: '1px solid var(--b)' }}
    >
      <div
        className="grid grid-cols-4 gap-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative flex flex-col items-center justify-center gap-[3px] rounded-[11px] px-2.5 py-1.5 font-bold uppercase tracking-[0.05em] transition-all duration-150 ${
              activeTab === id
                ? 'text-accent'
                : 'text-text/25 hover:bg-blush hover:text-title'
            }`}
          >
            {Icon ? <Icon size={19} aria-hidden="true" /> : null}
            <span className="text-[9px]">{label}</span>
            <span className={`mt-px size-[3px] rounded-full bg-current transition-opacity ${activeTab === id ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        ))}
      </div>
    </nav>
  )
}
