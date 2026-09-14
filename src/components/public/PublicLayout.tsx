import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <div className="theme-public">
      <PublicHeader />
      <main key={location.pathname} className="page-enter">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
