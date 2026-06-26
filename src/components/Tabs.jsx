export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 680,
      zIndex: 100,
      background: 'rgba(15,15,16,0.93)',
      backdropFilter: 'blur(18px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 8px 16px',
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 11,
              background: 'none',
              border: 'none',
              color: active ? '#f06030' : 'rgba(240,237,232,0.28)',
              fontFamily: 'inherit',
              flex: 1,
              transition: 'all 0.15s',
            }}
          >
            {Icon ? <Icon size={20} aria-hidden="true" /> : null}
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {label}
            </span>
            <span style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#f06030',
              opacity: active ? 1 : 0,
              transition: 'opacity 0.15s',
            }} />
          </button>
        )
      })}
    </nav>
  )
}
