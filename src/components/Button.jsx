export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:
      'border-0 bg-gradient-to-br from-accent-light to-accent text-[#2b2410] shadow-[0_6px_18px_rgba(229,184,61,0.22)] hover:-translate-y-px active:scale-[0.98]',
    secondary:
      'border border-blush-border bg-blush text-title hover:bg-[#342e1e] active:scale-[0.98]',
    ghost:
      'border-0 bg-transparent text-text/55 hover:bg-blush hover:text-title active:scale-[0.98]',
    danger:
      'border border-red-400/25 bg-red-500/15 text-red-300 hover:bg-red-500/20 active:scale-[0.98]',
  }

  return (
    <button
      className={`inline-flex min-h-0 items-center justify-center gap-1.5 rounded-[11px] px-4 py-2.5 text-[13px] font-bold whitespace-nowrap transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
