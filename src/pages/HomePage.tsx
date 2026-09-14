import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Download } from 'lucide-react'
import AislePhoto from './bg2.jpg'
import { PublicLayout } from '../components/public/PublicLayout'
import { CoverImage } from '../components/CoverImage'
import { BookSpines, ShelfBlock } from '../components/public/BookSpines'
import { getDirectDownloadLink } from '../lib/drive'
import { MoreRayonsCta } from '../components/public/MoreRayonsCta'
import { catalogPreview, faqs, freeBooks, LIBRARY_PRICE } from '../data/publicContent'

const dust = [
  { left: '12%', bottom: '18%', delay: '0s' },
  { left: '28%', bottom: '30%', delay: '1.6s' },
  { left: '46%', bottom: '22%', delay: '3.2s' },
  { left: '63%', bottom: '36%', delay: '0.8s' },
  { left: '78%', bottom: '24%', delay: '2.4s' },
]

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <PublicLayout>
      <section className="relative min-h-[92vh] overflow-hidden">
        <img src={AislePhoto} alt="Allée de la bibliothèque" className="kenburns absolute inset-0 h-full w-full object-cover object-[30%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a100c] via-[#1a100c]/78 to-[#1a100c]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a100c]/70 via-transparent to-[#1a100c]/25" />
        <div className="dust">
          {dust.map((p) => (
            <span key={p.left + p.delay} style={{ left: p.left, bottom: p.bottom, animationDelay: p.delay }} />
          ))}
        </div>
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl items-center px-5 py-24 md:px-8">
          <div className="hero-copy max-w-xl">
            <div className="gold-rule" />
            <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-[#d4a574]">Bibliothèque numérique · ouverte 24h/24</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.96] text-[#f6efe4] sm:text-7xl">
              Une salle
              <span className="mt-1 block italic font-medium text-[#d4a574]">pour toute une vie.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-[#f6efe4]/78">
              Des milliers d’ouvrages à lire et à emporter. Une carte d’entrée, {LIBRARY_PRICE} XOF, jamais renouvelée.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/access" className="btn-library bg-[#d4a574] text-[#1a100c]">Prendre sa carte</Link>
              <Link to="/catalogue" className="btn-library border border-[#d4a574]/45 text-[#f6efe4]">Voir les rayons</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#24160f]/10 bg-[#1a100c] text-[#f6efe4]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3 md:px-8">
          {[
            { n: '01', t: 'Carte unique', d: 'Payez une fois. La salle reste ouverte.' },
            { n: '02', t: 'Téléchargement libre', d: 'Lecture en ligne, fichiers à emporter.' },
            { n: '03', t: 'Tous les rayons', d: 'Romans, sciences, histoire, affaires.' },
          ].map((item) => (
            <div key={item.n} className="md:border-l md:border-[#d4a574]/25 md:pl-6 first:md:border-l-0 first:md:pl-0">
              <p className="text-[11px] tracking-[0.2em] text-[#d4a574]">{item.n}</p>
              <h2 className="mt-2 font-display text-2xl">{item.t}</h2>
              <p className="mt-1 text-sm text-[#f6efe4]/60">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="gold-rule" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#8b5a2b]">Aperçu</p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-[#24160f]">Les rayonnages</h2>
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          {catalogPreview.map((cat) => (
            <ShelfBlock key={cat.name} title={cat.name} meta={`+${cat.count} titres`}>
              <BookSpines colors={cat.spines} labels={[cat.name]} />
            </ShelfBlock>
          ))}
        </div>

        <MoreRayonsCta className="mt-14" />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="gold-rule" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#8b5a2b]">Consultation libre</p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-[#24160f]">Sur la table</h2>
        <div className="mt-10 bg-[#2a1b12]/6 px-4 pt-12 sm:px-10">
          <div className="grid items-end gap-10 sm:grid-cols-3">
            {freeBooks.map((book) => (
              <article key={book.id} className="book-float flex flex-col items-center">
                <div className="book-3d w-[min(100%,220px)]">
                  <CoverImage src={book.cover_url} alt={book.title} className="book-face" />
                </div>
                <h3 className="mt-7 text-center font-display text-2xl text-[#24160f]">{book.title}</h3>
                <button
                  type="button"
                  onClick={() => window.open(getDirectDownloadLink(book.drive_link), '_blank')}
                  className="btn-library mt-4 bg-[#1a100c] text-[#f6efe4]"
                >
                  <Download size={14} />
                  Télécharger
                </button>
              </article>
            ))}
          </div>
          <div className="wood-shelf mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="gold-rule" />
        <h2 className="mt-6 font-display text-4xl font-semibold text-[#24160f]">Questions fréquentes</h2>
        <div className="mt-8 divide-y divide-[#24160f]/10">
          {faqs.map((faq, i) => (
            <div key={faq.question} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="flex w-full items-center justify-between text-left font-display text-xl text-[#24160f]"
              >
                {faq.question}
                <ChevronDown size={18} className={openFAQ === i ? 'rotate-180' : ''} />
              </button>
              <div className={`faq-answer ${openFAQ === i ? 'open' : ''}`}>
                <div>
                  <p className="pt-3 text-sm leading-7 text-[#6b5e52]">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
