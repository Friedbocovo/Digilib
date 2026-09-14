import { Link } from 'react-router-dom'
import { EXTRA_CATALOG_RAYONS } from '../../data/publicContent'

export function MoreRayonsCta({ className = '' }: { className?: string }) {
  return (
    <div className={`border-t border-[#24160f]/10 pt-10 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b5a2b]">La salle continue</p>
      <h3 className="mt-2 font-display text-3xl font-semibold text-[#24160f]">
        Ce n’est qu’un aperçu — bien d’autres rayons vous attendent
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b5e52]">
        DigiLib regroupe des centaines d’ouvrages répartis dans de nombreuses collections. Voici quelques rayons
        supplémentaires :
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {EXTRA_CATALOG_RAYONS.map((rayon) => (
          <li
            key={rayon}
            className="rounded-full border border-[#24160f]/12 bg-[#f7efe2] px-4 py-2 text-sm text-[#24160f]"
          >
            {rayon}
          </li>
        ))}
        <li className="rounded-full border border-dashed border-[#8b5a2b]/40 px-4 py-2 text-sm text-[#8b5a2b]">
          … et bien plus encore
        </li>
      </ul>
      <Link to="/access" className="btn-library mt-8 bg-[#1a100c] text-[#f6efe4]">
        Voir tous les rayons
      </Link>
    </div>
  )
}
