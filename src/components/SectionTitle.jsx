export default function SectionTitle({ title, eyebrow, children }) {
  return (
    <div className="mb-4">
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
      )}
      <h2 className="text-xl font-black text-title">{title}</h2>
      {children && (
        <p className="mt-1 text-sm leading-relaxed text-text/65">{children}</p>
      )}
    </div>
  )
}
