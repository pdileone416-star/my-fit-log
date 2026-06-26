export default function Card({ children, className = '', ...props }) {
  return (
    <section className={`glass min-w-0 max-w-full overflow-hidden rounded-3xl p-4 ${className}`} {...props}>
      {children}
    </section>
  )
}
