export default function Input({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-title ${className}`}>
      <span>{label}</span>
      <input
        className="min-h-11 rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-base font-normal text-text outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-text/40 focus:border-accent/60 focus:bg-white/80 focus:ring-4 focus:ring-accent/15"
        {...props}
      />
    </label>
  )
}
