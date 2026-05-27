export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-title',
    secondary: 'bg-blush text-title hover:bg-sage',
    ghost: 'bg-transparent text-title hover:bg-blush',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
