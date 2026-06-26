export default function Card({ children, className = '', style = {}, ...props }) {
  return (
    <section
      className={`min-w-0 max-w-full overflow-hidden ${className}`}
      style={{
        background: 'var(--s1)',
        border: '1px solid var(--b)',
        borderRadius: 24,
        padding: 18,
        margin: '0 14px 10px',
        ...style,
      }}
      {...props}
    >
      {children}
    </section>
  )
}
