import type { ReactNode } from 'react'
import { AuthShell } from './AuthShell'
import { EntryCard } from './EntryCard'

interface AuthCardLayoutProps {
  name?: string
  city?: string
  email?: string
  phone?: string
  hint?: string
  children: ReactNode
}

export function AuthCardLayout({
  name,
  city,
  email,
  phone,
  hint = 'Votre carte se remplit au fur et à mesure. Un seul paiement, accès à vie.',
  children,
}: AuthCardLayoutProps) {
  return (
    <AuthShell wide>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-14">
        <div>
          <EntryCard name={name} city={city} email={email} phone={phone} />
          <p className="mt-5 text-center text-xs leading-6 text-muted lg:text-left">{hint}</p>
        </div>
        <div className="rounded-3xl border border-line bg-panel/95 p-6 sm:p-8">{children}</div>
      </div>
    </AuthShell>
  )
}
