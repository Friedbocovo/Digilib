import { Link } from 'react-router-dom'
import { BookOpen, Download, Infinity, Wallet } from 'lucide-react'
import { PublicLayout } from '../components/public/PublicLayout'
import { PageHero } from '../components/public/PageHero'
import { EntryCard } from '../components/EntryCard'
import { Reveal } from '../components/public/Reveal'
import { LIBRARY_PRICE } from '../data/publicContent'

const perks = [
  { icon: BookOpen, text: 'Tous les rayons', detail: 'Romans, sciences, affaires et plus' },
  { icon: Download, text: 'Téléchargement sans limite', detail: 'Fichiers à garder sur votre appareil' },
  { icon: Infinity, text: 'Carte valable à vie', detail: 'Un seul paiement, jamais renouvelé' },
  { icon: Wallet, text: 'MTN, Moov, Celtiis', detail: 'Mobile Money au Bénin' },
]

export default function PricingPage() {
  return (
    <PublicLayout>
      <PageHero kicker="Tarifs" title={`${LIBRARY_PRICE} XOF · une fois`}>
        Pas d’abonnement. Pas de renouvellement. La porte reste ouverte.
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
          <Reveal>
            <EntryCard />
            <p className="mt-5 text-center text-sm leading-7 text-[#6b5e52] lg:text-left">
              Votre carte d’entrée personnelle, remplie après inscription au bureau.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl border border-[#d4a574]/20 bg-[#1a100c] shadow-[0_24px_56px_rgba(26,16,12,0.22)]">
              <div className="border-b border-[#d4a574]/15 px-8 py-10 md:px-10">
                <div className="gold-rule" />
                <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[#d4a574]">Prix unique</p>
                <p className="mt-3 font-display text-6xl font-semibold leading-none text-[#f6efe4] md:text-7xl">
                  {LIBRARY_PRICE}
                  <span className="ml-2 text-2xl font-medium text-[#d4a574] md:text-3xl">XOF</span>
                </p>
                <p className="mt-4 max-w-md text-sm leading-7 text-[#f6efe4]/65">
                  Payez une fois, entrez dans la salle pour toujours. Tous les rayons, tous les livres.
                </p>
              </div>

              <ul className="grid gap-px bg-[#d4a574]/10 sm:grid-cols-2">
                {perks.map((item) => (
                  <li
                    key={item.text}
                    className="flex gap-4 bg-[#24160f] px-6 py-5 md:px-8 md:py-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a574]/30 bg-[#d4a574]/10">
                      <item.icon size={18} className="text-[#d4a574]" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="font-display text-lg text-[#f6efe4]">{item.text}</p>
                      <p className="mt-1 text-xs leading-5 text-[#f6efe4]/55">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 px-8 py-8 sm:flex-row sm:justify-center md:px-10">
                <Link to="/access" className="btn-library justify-center bg-[#d4a574] text-[#1a100c]">
                  Obtenir ma carte
                </Link>
                <Link
                  to="/comment-ca-marche"
                  className="btn-library justify-center border border-[#d4a574]/35 text-[#f6efe4]"
                >
                  Comment entrer
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  )
}
