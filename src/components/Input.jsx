export default function Input({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-title ${className}`}>
      <span>{label}</span>
      <input
        className="min-h-11 rounded-xl border border-blush-border bg-white px-3 py-2 text-base font-normal text-text outline-none transition focus:border-accent focus:ring-4 focus:ring-blush"
        {...props}
      />
    </label>
  )
}
