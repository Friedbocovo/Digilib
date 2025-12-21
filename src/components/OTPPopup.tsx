import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface OTPPopupProps {
  code: string
  onClose: () => void
}

export function OTPPopup({ code, onClose }: OTPPopupProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={24} />
        </button>

        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <span className="font-bold">CODE OTP</span> 
          </div>
          <p style={styles.subtitle}>Prouvez nous que vous n'êtes pas un robot</p>
        </div>

        <div style={styles.codeSection}>
          <p style={styles.label}>Votre code de vérification :</p>
          <div style={styles.codeBox}>
            <span style={styles.code}>{code}</span>
          </div>
          
          <button onClick={handleCopy} style={styles.copyButton}>
            {copied ? (
              <>
                <Check size={18} />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copier le code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  },
  popup: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    animation: 'slideUp 0.3s ease',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: 'rgba(0, 0, 0, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: '#666',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '3rem 2rem 2rem',
    textAlign: 'center' as const,
    color: 'white',
  },
  iconWrapper: {
    fontSize: '2rem',
    marginBottom: '1rem',
    animation: 'bounce 1s ease infinite',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: 0,
    fontSize: '1rem',
    opacity: 0.9,
  },
  codeSection: {
    padding: '2rem',
    textAlign: 'center' as const,
  },
  label: {
    margin: '0 0 1rem 0',
    fontSize: '0.95rem',
    color: '#666',
    fontWeight: '500',
  },
  codeBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    borderRadius: '15px',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
  },
  code: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '8px',
    fontFamily: 'monospace',
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#667eea',
    color: 'white',
    padding: '0.875rem 2rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  footer: {
    background: '#f9fafb',
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e5e7eb',
  },
  info: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#666',
    textAlign: 'center' as const,
  },
}

// Ajouter les animations CSS
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  }
  
  button:active {
    transform: translateY(0);
  }
`
document.head.appendChild(styleSheet)