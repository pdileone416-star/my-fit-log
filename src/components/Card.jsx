export default function Card({ children, className = '' }) {
  return (
    <section className={`min-w-0 max-w-full overflow-hidden rounded-2xl border border-blush-border bg-warm-white p-4 shadow-soft ${className}`}>
      {children}
    </section>
  )
}
