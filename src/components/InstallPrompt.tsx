import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    if (isInstalled) {
      return
    }

    // Vérifier si l'utilisateur a déjà fermé la bannière
    const hasClosedBanner = localStorage.getItem('pwa-banner-closed')
    if (hasClosedBanner) {
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Afficher le prompt d'installation
    await deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      console.log('✅ PWA installée')
    } else {
      console.log('❌ Installation refusée')
    }

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleClose = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-closed', 'true')
  }

  if (!showBanner) return null

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.icon}>
          📱
        </div>
        <div style={styles.text}>
          <h3 style={styles.title}>Installer DigiLib</h3>
          <p style={styles.description}>
            Accédez rapidement à votre bibliothèque depuis votre écran d'accueil
          </p>
        </div>
        <div style={styles.actions}>
          <button onClick={handleInstall} style={styles.installButton}>
            <Download size={18} />
            <span>Installer</span>
          </button>
          <button onClick={handleClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  banner: {
    position: 'fixed' as const,
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 1000,
    animation: 'slideUp 0.4s ease-out',
    maxWidth: '600px',
    margin: '0 auto',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
  },
  icon: {
    fontSize: '2.5rem',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    color: 'white',
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  description: {
    margin: 0,
    fontSize: '0.9rem',
    opacity: 0.95,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  installButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    color: '#667eea',
    padding: '0.65rem 1.25rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'transform 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
}

// Ajouter l'animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    .pwa-banner-content {
      flex-direction: column;
      text-align: center;
    }
  }
`
document.head.appendChild(styleSheet)

export default InstallPrompt