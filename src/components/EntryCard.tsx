import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Logo from '../pages/logo2.png'
import { LIBRARY_PRICE } from '../data/publicContent'
import { CARD_QR_PREFIX } from '../lib/memberCard'

interface EntryCardProps {
  name?: string
  city?: string
  email?: string
  phone?: string
}

function field(value: string | undefined, placeholder: string) {
  return value?.trim() || placeholder
}

export function EntryCard({ name, city, email, phone }: EntryCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const cleanEmail = email?.trim().toLowerCase() || ''
  const cleanPhone = phone?.trim() || ''
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)

  useEffect(() => {
    if (!emailValid || !cleanPhone) {
      setQrDataUrl('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(`${CARD_QR_PREFIX}|${cleanEmail}|${cleanPhone}`, {
      margin: 0,
      width: 160,
      color: { dark: '#1a100c', light: '#f6efe4' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [emailValid, cleanEmail, cleanPhone])

  return (
    <div className="entry-card mx-auto w-full max-w-[380px]">
      <div className="entry-card-face overflow-hidden rounded-2xl border border-[#d4a574]/45 bg-gradient-to-br from-[#1a100c] via-[#24160f] to-[#1a100c] p-3.5 shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:p-4">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-start justify-between gap-2">
            <img src={Logo} alt="DigiLib" className="h-9 w-9 object-contain drop-shadow-md sm:h-10 sm:w-10" />
            <div
              className="h-6 w-8 shrink-0 rounded-sm border border-[#d4a574]/30 bg-gradient-to-br from-[#efc792] via-[#d4a574] to-[#8b5a2b] sm:h-7 sm:w-9"
              aria-hidden
            />
          </div>

          <div className="mt-1.5 shrink-0">
            <p className="font-display text-lg font-semibold leading-none text-[#f6efe4] sm:text-xl">DigiLib</p>
            <p className="mt-0.5 text-[7px] uppercase tracking-[0.2em] text-[#d4a574] sm:text-[8px]">
              Carte d&apos;entrée · Accès à vie
            </p>
          </div>

          <div className="mt-2 min-h-0 flex-1 border-t border-[#d4a574]/20 pt-2">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              <div className="min-w-0">
                <p className="text-[7px] uppercase tracking-[0.16em] text-[#a89880]">Titulaire</p>
                <p className="truncate font-display text-xs text-[#f6efe4] sm:text-sm">{field(name, 'Votre nom')}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[7px] uppercase tracking-[0.16em] text-[#a89880]">Ville</p>
                <p className="truncate font-display text-xs text-[#f6efe4] sm:text-sm">{field(city, 'Votre ville')}</p>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-[7px] uppercase tracking-[0.16em] text-[#a89880]">Contact</p>
                <p className="truncate text-[9px] text-[#f6efe4]/78 sm:text-[10px]">
                  {email?.trim() || 'email@exemple.com'}
                  {phone?.trim() ? ` · ${phone.trim()}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex shrink-0 items-end justify-between border-t border-[#d4a574]/20 pt-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR code de la carte"
                className="h-9 w-9 rounded-sm bg-[#f6efe4] p-0.5 sm:h-10 sm:w-10"
              />
            ) : (
              <span />
            )}
            <p className="font-display text-sm leading-none text-[#d4a574] sm:text-base">{LIBRARY_PRICE} XOF</p>
          </div>
        </div>
      </div>
    </div>
  )
}
