import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { LoadingScreen } from '../components/LoadingScreen'
import { CoverImage } from '../components/CoverImage'
import { LibraryChrome } from '../components/library/LibraryChrome'
import { getDirectDownloadLink } from '../lib/drive'
import { ArrowLeft, Download, BookOpen, Clock } from 'lucide-react'

interface Book {
  id: string
  title: string
  author?: string
  description: string
  cover_url: string
  drive_link: string
  drive_file_id?: string
  file_size?: string
  pages?: number
  language?: string
  published_year?: number
  downloads: number
  views: number
  category_id?: string
  categories?: { name: string; color: string }
}

export default function BookDetailsPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [similarBooks, setSimilarBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadBookDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const loadBookDetails = async () => {
    try {
      if (!localStorage.getItem('user_email')) {
        navigate('/')
        return
      }
      const { data, error } = await supabase.from('books').select('*, categories(*)').eq('id', bookId).single()
      if (error) throw error
      setBook(data)
      await supabase.from('books').update({ views: (data.views || 0) + 1 }).eq('id', bookId)

      if (data.category_id) {
        const { data: similar } = await supabase
          .from('books')
          .select('*, categories(*)')
          .eq('category_id', data.category_id)
          .neq('id', bookId)
          .limit(4)
        setSimilarBooks(similar || [])
      } else {
        setSimilarBooks([])
      }
    } catch {
      setPopup({ message: 'Erreur de chargement du livre', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    const saved = localStorage.getItem('selected_category_id')
    if (book?.category_id) {
      if (saved !== book.category_id) localStorage.setItem('selected_category_id', book.category_id)
      navigate('/library')
    } else {
      localStorage.removeItem('selected_category_id')
      navigate('/library')
    }
  }

  const handleDownload = async () => {
    if (!book) return
    setDownloading(true)
    setPopup({ message: 'Téléchargement en cours...', type: 'info' })
    try {
      window.open(getDirectDownloadLink(book.drive_link, book.drive_file_id), '_blank')
      await supabase.from('books').update({ downloads: book.downloads + 1 }).eq('id', book.id)
      setBook({ ...book, downloads: book.downloads + 1 })
      setPopup({ message: 'Téléchargement lancé !', type: 'success' })
    } catch {
      setPopup({ message: 'Erreur lors du téléchargement', type: 'error' })
    } finally {
      setTimeout(() => setDownloading(false), 1500)
    }
  }

  if (loading) return <LoadingScreen message="Ouverture de l’ouvrage..." />

  if (!book) {
    return (
      <LibraryChrome onHome={() => navigate('/library')}>
        <div className="mx-auto max-w-lg px-5 py-20 text-center">
          <p className="font-display text-2xl text-[#f6efe4]">Livre introuvable</p>
          <button type="button" onClick={handleBack} className="btn-library mt-6 bg-[#d4a574] text-[#1a100c]">
            Retour
          </button>
        </div>
      </LibraryChrome>
    )
  }

  return (
    <LibraryChrome onHome={() => navigate('/library')}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      <div className="mx-auto max-w-[1680px] px-3 py-10 sm:px-4 lg:px-6">
        <button type="button" onClick={handleBack} className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#d4a574]">
          <ArrowLeft size={14} />
          Retour au rayon
        </button>
        <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
          <div className="book-3d mx-auto w-[min(100%,340px)] lg:mx-0">
            <CoverImage src={book.cover_url} alt={book.title} size={900} className="book-face" />
          </div>
          <div>
            {book.categories && <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4a574]">{book.categories.name}</p>}
            <h1 className="mt-2 font-display text-5xl font-semibold text-[#f6efe4]">{book.title}</h1>
            {book.author && <p className="mt-2 text-lg text-[#d4a574]">Par {book.author}</p>}
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#f6efe4]/70">{book.description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[#f6efe4]/45">
              {book.pages && (
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={14} /> {book.pages} pages
                </span>
              )}
              {book.language && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {book.language}
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => window.open(book.drive_link, '_blank')} className="btn-library border border-[#d4a574]/40 text-[#f6efe4]">
                Lire en ligne
              </button>
              <button type="button" disabled={downloading} onClick={handleDownload} className="btn-library bg-[#d4a574] text-[#1a100c] disabled:opacity-60">
                <Download size={14} />
                Télécharger
              </button>
            </div>
          </div>
        </div>

        {similarBooks.length > 0 && (
          <div className="mt-20">
            <div className="gold-rule" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#d4a574]">Dans le même rayon</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#f6efe4]">Livres similaires</h2>
            <div className="mt-10 grid items-end gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {similarBooks.map((similar) => (
                <article
                  key={similar.id}
                  onClick={() => navigate(`/book/${similar.id}`)}
                  className="flex cursor-pointer flex-col items-center"
                >
                  <div className="book-3d w-[min(100%,220px)]">
                    <CoverImage src={similar.cover_url} alt={similar.title} className="book-face" />
                  </div>
                  <h3 className="mt-7 text-center font-display text-xl leading-snug text-[#f6efe4]">{similar.title}</h3>
                  {similar.author && <p className="mt-1 text-sm text-[#d4a574]">Par {similar.author}</p>}
                </article>
              ))}
            </div>
            <div className="wood-shelf mt-10" />
          </div>
        )}
      </div>
    </LibraryChrome>
  )
}
