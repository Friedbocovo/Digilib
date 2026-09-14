import { Download } from 'lucide-react'
import { PublicLayout } from '../components/public/PublicLayout'
import { PageHero } from '../components/public/PageHero'
import { CoverImage } from '../components/CoverImage'
import { BookSpines, ShelfBlock } from '../components/public/BookSpines'
import { getDirectDownloadLink } from '../lib/drive'
import { Reveal } from '../components/public/Reveal'
import { MoreRayonsCta } from '../components/public/MoreRayonsCta'
import { catalogPreview, freeBooks } from '../data/publicContent'

export default function CatalogPage() {
  return (
    <PublicLayout>
      <PageHero kicker="Plan de la salle" title="Les rayonnages">
        Chaque rayon s’ouvre avec la carte. Trois ouvrages restent sur la table, en consultation libre.
      </PageHero>
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          {catalogPreview.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 90}>
              <ShelfBlock title={cat.name} meta={`+${cat.count} titres`}>
                <BookSpines colors={cat.spines} labels={[cat.name]} />
              </ShelfBlock>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14">
          <MoreRayonsCta />
        </Reveal>
        <Reveal className="mt-20">
          <div className="gold-rule" />
          <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#8b5a2b]">Consultation libre</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-[#24160f]">Sur la table</h2>
        </Reveal>
        <div className="mt-10 bg-[#2a1b12]/6 px-4 pt-12 sm:px-10">
          <div className="grid items-end gap-10 sm:grid-cols-3">
            {freeBooks.map((book, i) => (
              <Reveal key={book.id} delay={i * 140}>
                <article className="book-float flex flex-col items-center">
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
              </Reveal>
            ))}
          </div>
          <div className="wood-shelf mt-10" />
        </div>
      </section>
    </PublicLayout>
  )
}
