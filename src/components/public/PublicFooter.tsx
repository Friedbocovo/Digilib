import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, WHATSAPP_URL } from '../../data/publicContent'

export function PublicFooter() {
  return (
    <footer className="border-t border-[#d4b483]/15 bg-[#1a100c] px-5 py-12 text-[#f3e6d0] md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-[#d4a574]">DigiLib</p>
          <p className="mt-2 text-sm text-[#f3e6d0]/55">Une salle pour toute une vie.</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4a574]">Parcours</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#f3e6d0]/65">
            <Link to="/comment-ca-marche">Comment entrer</Link>
            <Link to="/catalogue">Rayons</Link>
            <Link to="/tarifs">Tarifs</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4a574]">Contact</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#f3e6d0]/65">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div>
          <Link to="/access" className="btn-library bg-[#d4a574] text-[#1a100c]">
            Prendre sa carte
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-[#d4b483]/15 pt-6 text-center text-xs tracking-[0.12em] text-[#f3e6d0]/45">
        © DigiLib · Bibliothèque numérique
      </p>
    </footer>
  )
}
