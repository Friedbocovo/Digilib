import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Brand } from '../Brand'

const links = [
  { to: '/comment-ca-marche', label: 'Comment entrer' },
  { to: '/catalogue', label: 'Rayons' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#d4a574]/20 bg-[#1a100c]/90 text-[#f3e6d0] backdrop-blur-md transition-all ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-all md:px-8 ${scrolled ? 'py-2' : 'py-3'}`}>
        <Brand size="sm" onClick={() => navigate('/')} />
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[11px] uppercase tracking-[0.16em] ${isActive ? 'text-[#d4a574]' : 'text-[#f3e6d0]/70 hover:text-[#d4a574]'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/access" className="btn-library bg-[#d4a574] text-[#1a100c]">
            Entrer
          </Link>
        </nav>
        <button type="button" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-[#d4a574]/15 px-5 py-4 lg:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm text-[#f3e6d0]/80">
              {l.label}
            </Link>
          ))}
          <Link to="/access" onClick={() => setOpen(false)} className="btn-library mt-3 bg-[#d4a574] text-[#1a100c]">
            Entrer
          </Link>
        </div>
      )}
    </header>
  )
}
