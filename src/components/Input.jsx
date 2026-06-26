export default function Input({ label, className = '', style = {}, ...props }) {
  return (
    <div style={{ display: 'grid', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,237,232,0.55)', letterSpacing: '0.03em' }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: '#2e2e32',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#f0ede8',
          borderRadius: 10,
          padding: '10px 12px',
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 500,
          outline: 'none',
          width: '100%',
          ...style,
        }}
        className={className}
        {...props}
      />
    </div>
  )
}
