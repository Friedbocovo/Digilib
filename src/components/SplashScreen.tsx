import { useEffect, useState } from 'react'
import Logo from '../pages/logo2.png'

const TITLE = 'DigiLib'
const TOTAL_DURATION = 8000

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), TOTAL_DURATION)
    const finishTimer = setTimeout(onFinish, TOTAL_DURATION + 700)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-ink transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <img src={Logo} alt="DigiLib" className="splash-logo h-20 w-20 object-contain sm:h-28 sm:w-28" />

      <h1 className="splash-title flex font-display font-semibold tracking-[0.04em]">
        {TITLE.split('').map((letter, i) => (
          <span
            key={i}
            className="splash-letter"
            style={{ animationDelay: `${0.4 + i * 0.28}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <div className="absolute bottom-16 flex w-56 flex-col items-center gap-2 sm:w-64">
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-gold/15">
          <div className="splash-loading-bar h-full rounded-full bg-gold" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Ouverture de la bibliothèque</p>
      </div>
    </div>
  )
}
