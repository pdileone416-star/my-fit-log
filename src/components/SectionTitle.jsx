export default function SectionTitle({ title, eyebrow, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {eyebrow && (
        <p style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#f06030',
          marginBottom: 4,
        }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px', color: '#f0ede8', marginBottom: 3 }}>
        {title}
      </h2>
      {children && (
        <p style={{ fontSize: 12, color: 'rgba(240,237,232,0.55)', lineHeight: 1.5 }}>
          {children}
        </p>
      )}
    </div>
  )
}
