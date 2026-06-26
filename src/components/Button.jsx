const variants = {
  primary: {
    background: 'linear-gradient(135deg, #ff7a42, #f06030)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(240,96,48,0.25)',
  },
  secondary: {
    background: '#232326',
    color: '#f0ede8',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(240,237,232,0.55)',
    border: 'none',
  },
  danger: {
    background: 'rgba(224,85,85,0.14)',
    color: '#e05555',
    border: '1px solid rgba(224,85,85,0.2)',
  },
}

export default function Button({ children, variant = 'primary', className = '', style = {}, ...props }) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '10px 16px',
        borderRadius: 11,
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...(variants[variant] || variants.primary),
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}
