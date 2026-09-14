import type { ReactNode } from 'react'
import Video from '../pages/vid_ebook3.mp4'

export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="bg-atelier relative min-h-dvh overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-20">
        <source src={Video} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ink/75" />
      <div
        className={`relative z-10 mx-auto flex min-h-dvh flex-col justify-center px-5 py-10 ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
      >
        {children}
      </div>
    </div>
  )
}
