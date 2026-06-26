export default function Input({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-[5px] text-[11px] font-bold tracking-[0.03em] text-text/55 ${className}`}>
      <span>{label}</span>
      <input
        className="min-h-0 rounded-[10px] border border-blush-border bg-[#342e1e] px-3 py-2.5 text-[13px] font-medium text-text outline-none transition-all duration-150 placeholder:text-text/30 focus:border-accent focus:ring-4 focus:ring-accent/15"
        {...props}
      />
    </label>
  )
}
