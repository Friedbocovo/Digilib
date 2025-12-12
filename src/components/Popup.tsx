interface PopupProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Popup({ message, type = 'info', onClose }: PopupProps) {
  return (
    <div style={popupStyles.overlay} onClick={onClose}>
      <div style={popupStyles.container} onClick={(e) => e.stopPropagation()}>
        <div style={{
          ...popupStyles.icon,
          background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
        }}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </div>
        <p style={popupStyles.message}>{message}</p>
        <button onClick={onClose} style={popupStyles.button}>
          OK
        </button>
      </div>
    </div>
  )
}

const popupStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideIn 0.3s ease-out',
  },
  icon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    fontSize: '2rem',
    color: 'white',
    fontWeight: 'bold' as const,
  },
  message: {
    fontSize: '1.125rem',
    color: '#333',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  button: {
    background: '#667eea',
    color: 'white',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
  },
}