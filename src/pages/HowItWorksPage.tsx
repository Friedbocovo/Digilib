import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/public/PublicLayout'
import { PageHero } from '../components/public/PageHero'
import { Reveal } from '../components/public/Reveal'
import BureauPhoto from '../assets/visuel-bureau.jpg'
import CartePhoto from '../assets/visuel-carte.jpg'
import SallePhoto from '../assets/visuel-salle.jpg'
import DigiLibLogo from './logo2.png'
import { LIBRARY_PRICE } from '../data/publicContent'

const steps = [
  {
    n: 'I',
    title: 'Le bureau',
    text: 'Nom, ville, email et téléphone. Quelques secondes pour ouvrir votre dossier.',
    image: BureauPhoto,
    alt: 'Bureau d’inscription dans une bibliothèque',
  },
  {
    n: 'II',
    title: 'La carte',
    text: `${LIBRARY_PRICE} XOF une fois. MTN, Moov, Celtiis — puis c’est réglé pour toujours.`,
    image: CartePhoto,
    alt: 'Carte d’entrée DigiLib',
  },
  {
    n: 'III',
    title: 'La salle',
    text: 'Tous les rayons, lecture et téléchargement sans limite, jour et nuit.',
    image: SallePhoto,
    alt: 'Allée de la salle de lecture',
  },
]

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <PageHero kicker="Comment entrer" title="Trois pas, une carte à vie">
        Du bureau à la salle de lecture : simple, clair, définitif.
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <article className="step-card group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d4a574]/18 bg-[#24160f]/95">
                <div className="step-visual-wrap">
                  <img src={s.image} alt={s.alt} className="step-visual" />
                  <div className="step-visual-shade" />
                  {s.n === 'II' && (
                    <img
                      src={DigiLibLogo}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-[44%] z-10 h-[42%] w-auto max-w-[55%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                    />
                  )}
                  <span className="step-visual-num">{s.n}</span>
                </div>
                <div className="flex flex-1 flex-col p-6 pt-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4a574]">Étape {i + 1}</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-[#f6efe4]">{s.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[#f6efe4]/68">{s.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/access" className="btn-library bg-[#1a100c] text-[#f6efe4]">
            Prendre sa carte
          </Link>
          <Link to="/tarifs" className="btn-library border border-[#24160f]/20 text-[#24160f]">
            Voir le tarif
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
