export default function SectionTitle({ eyebrow, title, children }) {
  return (
    <header className="mb-4 min-w-0">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-accent">{eyebrow}</p> : null}
      <h2 className="break-words text-2xl font-bold text-title">{title}</h2>
      {children ? <p className="mt-1 max-w-full break-words text-sm text-text">{children}</p> : null}
    </header>
  )
}
