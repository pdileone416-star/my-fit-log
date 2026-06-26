export default function SectionTitle({ title, eyebrow, children }) {
  return (
    <div className="mb-3.5">
      {eyebrow && (
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent">{eyebrow}</p>
      )}
      <h2 className="text-[19px] font-extrabold tracking-[-0.3px] text-title">{title}</h2>
      {children && (
        <p className="mt-[3px] text-xs leading-normal text-text/55">{children}</p>
      )}
    </div>
  )
}
