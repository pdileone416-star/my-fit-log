export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:
      'bg-gradient-to-br from-accent-light to-accent text-white shadow-[0_4px_14px_rgba(232,98,42,0.35)] hover:shadow-[0_4px_20px_rgba(232,98,42,0.50)] hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-blush/90 backdrop-blur-sm text-title border border-white/10 hover:border-accent/40 hover:bg-[#2e2e32] hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'bg-white/5 backdrop-blur-sm text-title border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]',
    danger:
      'bg-red-500/10 backdrop-blur-sm text-red-300 border border-red-400/25 hover:bg-red-500/15 hover:scale-[1.02] active:scale-[0.98]',
  }

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
