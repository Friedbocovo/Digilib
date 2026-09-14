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
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isInstalled) return

    if (localStorage.getItem('pwa-banner-closed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleClose = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-closed', 'true')
  }

  if (!showBanner) return null

  return (
    <div
      className="pwa-install-banner fixed bottom-4 left-4 right-4 z-[1000] mx-auto max-w-xl"
      role="dialog"
      aria-label="Installer l’application DigiLib"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d4a574]/28 bg-[#1a100c] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4a574]">Application</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-[#f6efe4]">Installer DigiLib</h3>
          <p className="mt-1 text-sm leading-6 text-[#f6efe4]/65">
            Accédez à la salle depuis votre écran d’accueil, comme une application.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="btn-library flex items-center gap-2 bg-[#d4a574] px-5 py-2.5 text-[#1a100c]"
          >
            <Download size={16} />
            Installer
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a574]/25 text-[#f6efe4]/80 transition hover:border-[#d4a574]/45 hover:text-[#f6efe4]"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
