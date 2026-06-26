export default function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-[5px] text-[11px] font-bold tracking-[0.03em] text-text/55 ${className}`}>
      {label ? <span>{label}</span> : null}
      <textarea
        className="min-h-[68px] rounded-[10px] border border-blush-border bg-[#2e2e33] px-3 py-2.5 text-[13px] font-medium text-text outline-none transition-all duration-150 placeholder:text-text/30 focus:border-accent focus:ring-4 focus:ring-accent/15"
        {...props}
      />
    </label>
  )
}
