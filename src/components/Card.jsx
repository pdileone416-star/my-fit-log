export default function Card({ children, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        background: '#1a1a1c',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24,
        padding: 18,
        margin: '0 14px 10px',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
