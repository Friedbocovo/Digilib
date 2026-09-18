import type { ReactNode } from 'react'
import { LogOut, MessageCircleMore } from 'lucide-react'
import { Brand } from '../Brand'

export function LibraryChrome({
  children,
  onHome,
  onLogout,
}: {
  children: ReactNode
  onHome: () => void
  onLogout?: () => void
}) {
  return (
    <div className="theme-salle min-h-dvh pb-16">
      <header className="sticky top-0 z-40 border-b border-[#d4a574]/20 bg-[#1a100c]/92 text-[#f3e6d0] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-3 py-3 sm:px-4 lg:px-6">
          <Brand size="sm" onClick={onHome} />
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 border border-[#d4a574]/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f3e6d0]"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          )}
        </div>
      </header>
      {children}
      <footer className="fixed inset-x-0 bottom-0 border-t border-[#d4a574]/15 bg-[#1a100c]/92 py-2.5 backdrop-blur-md">
        <a
          href="https://wa.me/22941822980?text=Bonjour%2C%20j'aimerais%20avoir%20acc%C3%A8s%20%C3%A0%20la%20biblioth%C3%A8que%20DigiLib"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex items-center justify-center gap-2 text-sm text-[#f3e6d0]/60 hover:text-[#d4a574]"
        >
          <MessageCircleMore size={16} />
          Besoin d’aide ? Écrivez-nous
        </a>
      </footer>
    </div>
  )
}

const ROMAN_VALUES: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

export function toRoman(num: number): string {
  let n = num
  let result = ''
  for (const [value, symbol] of ROMAN_VALUES) {
    while (n >= value) {
      result += symbol
      n -= value
    }
  }
  return result
}
