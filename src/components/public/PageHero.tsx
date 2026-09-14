import type { ReactNode } from 'react'
import AislePhoto from '../../pages/bg2.jpg'

export function PageHero({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[#1a100c] px-5 py-16 text-[#f6efe4] md:px-8 md:py-20">
      <img src={AislePhoto} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a100c] via-[#1a100c]/88 to-[#1a100c]/55" />
      <div className="relative mx-auto max-w-6xl">
        <div className="gold-rule" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[#d4a574]">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">{title}</h1>
        {children && <div className="mt-4 max-w-xl text-sm leading-7 text-[#f6efe4]/70">{children}</div>}
      </div>
    </section>
  )
}
