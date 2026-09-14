import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { LoadingScreen } from '../components/LoadingScreen'
import { CoverImage } from '../components/CoverImage'
import { LibraryChrome, ROMANS } from '../components/library/LibraryChrome'
import { EntryCard } from '../components/EntryCard'
import { getDirectDownloadLink } from '../lib/drive'
import { ArrowLeft, Search, Download, Eye } from 'lucide-react'
import AislePhoto from './bg2.jpg'

const dust = [
  { left: '12%', bottom: '18%', delay: '0s' },
  { left: '46%', bottom: '22%', delay: '3.2s' },
  { left: '78%', bottom: '24%', delay: '2.4s' },
]

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description?: string
  image_url?: string
}

interface Book {
  id: string
  title: string
  author?: string
  description: string
  cover_url: string
  drive_link?: string
  drive_file_id?: string
  downloads?: number
  category_id?: string
  categories?: Category
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userCity, setUserCity] = useState('')
  const [userEmailInfo, setUserEmailInfo] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [downloadingCard, setDownloadingCard] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    checkAccessAndLoadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('selected_category_id')
    if (saved) setSelectedCategory(saved)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      if (selectedCategory) {
        setSelectedCategory(null)
        setSearchQuery('')
        localStorage.removeItem('selected_category_id')
      }
    }
    if (selectedCategory) window.history.pushState({ categoryView: true }, '')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedCategory])

  const checkAccessAndLoadData = async () => {
    try {
      const userEmail = localStorage.getItem('user_email')
      const accessToken = localStorage.getItem('library_access_token')
      let storedName = localStorage.getItem('user_name')
      if (!accessToken || !userEmail) {
        navigate('/')
        return
      }
      if (!storedName && userEmail) {
        storedName = userEmail.split('@')[0]
        localStorage.setItem('user_name', storedName)
      }
      setUserName(storedName || '')
      setUserEmailInfo(userEmail || '')
      setUserCity(localStorage.getItem('user_city') || '')
      setUserPhone(localStorage.getItem('user_phone') || '')
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'completed')
        .limit(1)
      if (!paymentData?.length) {
        setPopup({ message: 'Accès non autorisé', type: 'error' })
        setTimeout(() => navigate('/'), 2000)
        return
      }
      await loadData()
    } catch {
      navigate('/')
    }
  }

  const loadData = async () => {
    try {
      const [categoriesResult, booksResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('books')
          .select('id, title, author, description, cover_url, drive_link, drive_file_id, downloads, category_id, categories(*)')
          .order('created_at', { ascending: false }),
      ])
      let nextCategories = categoriesResult.data || []
      if (categoriesResult.error) {
        setLoadError(categoriesResult.error.message)
        const fallback = await supabase.from('categories').select('id, name, color, icon, description').order('name')
        nextCategories = fallback.data || []
      }
      setCategories(nextCategories)
      if (booksResult.data) setBooks(booksResult.data)
    } catch {
      setLoadError('Impossible de charger les rayons.')
    } finally {
      setLoading(false)
    }
  }

  const categoryImage = (category: Category) =>
    category.image_url || books.find((b) => b.category_id === category.id)?.cover_url || ''

  const handleLogout = () => {
    ;['library_access_token', 'user_email', 'user_name', 'user_city', 'selected_category_id'].forEach((k) =>
      localStorage.removeItem(k)
    )
    navigate('/')
  }

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id)
    localStorage.setItem('selected_category_id', id)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    localStorage.removeItem('selected_category_id')
    window.history.back()
  }

  const handleDownload = async (book: Book, e: React.MouseEvent) => {
    e.stopPropagation()
    setPopup({ message: 'Téléchargement en cours...', type: 'info' })
    try {
      const { data: bookData } = await supabase.from('books').select('drive_link, drive_file_id, downloads').eq('id', book.id).single()
      if (bookData) {
        window.open(getDirectDownloadLink(bookData.drive_link, bookData.drive_file_id), '_blank')
        await supabase.from('books').update({ downloads: (bookData.downloads || 0) + 1 }).eq('id', book.id)
        setPopup({ message: 'Téléchargement lancé !', type: 'success' })
      }
    } catch {
      setPopup({ message: 'Erreur lors du téléchargement', type: 'error' })
    }
  }

  const handleDownloadCard = async () => {
    if (!cardRef.current || downloadingCard) return
    setDownloadingCard(true)
    const faceEl = cardRef.current.querySelector<HTMLElement>('.entry-card-face')
    const prevTransform = faceEl?.style.transform
    const prevTransition = faceEl?.style.transition
    try {
      if (faceEl) {
        faceEl.style.transition = 'none'
        faceEl.style.transform = 'none'
      }
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true })
      const link = document.createElement('a')
      const safeName = (userName || 'membre').trim().toLowerCase().replace(/\s+/g, '-')
      link.download = `digilib-carte-${safeName}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setPopup({ message: 'Impossible de télécharger la carte.', type: 'error' })
    } finally {
      if (faceEl) {
        faceEl.style.transform = prevTransform || ''
        faceEl.style.transition = prevTransition || ''
      }
      setDownloadingCard(false)
    }
  }

  if (loading) return <LoadingScreen message="Ouverture de la salle..." />

  const currentCategory = categories.find((c) => c.id === selectedCategory)
  const filteredBooks = selectedCategory
    ? books.filter((b) => b.category_id === selectedCategory && b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const heroImage = currentCategory ? categoryImage(currentCategory) : ''

  return (
    <LibraryChrome onHome={() => navigate('/library')} onLogout={handleLogout}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      {!selectedCategory ? (
        <>
          <section className="relative min-h-[70vh] overflow-hidden">
            <img src={AislePhoto} alt="" className="kenburns absolute inset-0 h-full w-full object-cover object-[30%_center]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a100c] via-[#1a100c]/78 to-[#1a100c]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a100c] via-transparent to-[#1a100c]/25" />
            <div className="dust">
              {dust.map((p) => (
                <span key={p.left + p.delay} style={{ left: p.left, bottom: p.bottom, animationDelay: p.delay }} />
              ))}
            </div>
            <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1680px] flex-col items-center gap-10 px-3 py-20 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-6">
              <div className="max-w-xl">
                <div className="gold-rule" />
                <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-[#d4a574]">La salle</p>
                <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.96] text-[#f6efe4] sm:text-7xl">
                  {userName || 'Lecteur'}
                  <span className="mt-1 block italic font-medium text-[#d4a574]">vos rayons vous attendent.</span>
                </h1>
                <p className="mt-6 max-w-md text-base leading-8 text-[#f6efe4]/78">Choisissez un rayon. L’image ouvre la collection.</p>
              </div>
              <div className="order-first flex w-full max-w-[380px] shrink-0 flex-col items-center gap-4 lg:order-none">
                <div className="w-full lg:origin-center lg:scale-125 xl:scale-[1.4]">
                  <div ref={cardRef}>
                    <EntryCard name={userName} city={userCity} email={userEmailInfo} phone={userPhone} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  disabled={downloadingCard}
                  className="btn-library border border-[#d4a574]/40 text-[#f6efe4] disabled:opacity-60 lg:mt-8 xl:mt-12"
                >
                  <Download size={14} /> {downloadingCard ? 'Génération...' : 'Télécharger ma carte'}
                </button>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-[1680px] px-3 pb-16 sm:px-4 lg:px-6">
            {loadError && <p className="mb-8 text-sm text-[#e86b6b]">{loadError}</p>}
            {categories.length === 0 && !loadError && <p className="py-16 text-[#f6efe4]/80">Aucun rayon n’est encore ouvert.</p>}
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, i) => {
                const count = books.filter((b) => b.category_id === category.id).length
                const image = categoryImage(category)
                return (
                  <button key={category.id} type="button" onClick={() => handleCategoryClick(category.id)} className="catalog-card">
                    <div className="catalog-photo">
                      {image ? (
                        <CoverImage src={image} alt={category.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center px-3">
                          <p className="text-center font-display text-xl text-[#8b5a2b]">{category.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="catalog-card-body">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-xl italic text-[#8b5a2b]">{ROMANS[i] || i + 1}</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8b5a2b]">
                          {count} {count > 1 ? 'titres' : 'titre'}
                        </p>
                      </div>
                      <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-[#24160f]">{category.name}</h2>
                      {category.description && <p className="mt-2 text-sm leading-6 text-[#6b5e52]">{category.description}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="relative min-h-[42vh] overflow-hidden">
            {heroImage ? (
              <CoverImage src={heroImage} alt="" size={1200} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src={AislePhoto} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a100c] via-[#1a100c]/82 to-[#1a100c]/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a100c] via-transparent to-[#1a100c]/40" />
            <div className="relative z-10 mx-auto max-w-[1680px] px-3 py-14 sm:px-4 lg:px-6">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="mb-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#d4a574]"
              >
                <ArrowLeft size={14} />
                Toutes les cartes
              </button>
              <div className="gold-rule" />
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#d4a574]">Rayon</p>
              <h1 className="mt-2 font-display text-5xl font-semibold text-[#f6efe4]">{currentCategory?.name}</h1>
              {currentCategory?.description && (
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#f6efe4]/70">{currentCategory.description}</p>
              )}
            </div>
          </section>

          <div className="mx-auto max-w-[1680px] px-3 py-10 sm:px-4 lg:px-6">
            <div className="relative mb-10 max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4a574]" />
              <input
                type="text"
                placeholder="Chercher dans ce rayon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field pl-11"
              />
            </div>
            {filteredBooks.length === 0 ? (
              <p className="py-16 text-center text-[#f6efe4]/50">Aucun livre dans ce rayon.</p>
            ) : (
              Array.from({ length: Math.ceil(filteredBooks.length / 4) }, (_, row) =>
                filteredBooks.slice(row * 4, row * 4 + 4)
              ).map((rowBooks, row) => (
                <div key={row}>
                  <div className="grid items-end gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {rowBooks.map((book) => (
                      <article key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="flex cursor-pointer flex-col items-center">
                        <div className="book-3d w-[min(100%,220px)]">
                          <CoverImage src={book.cover_url} alt={book.title} className="book-face" />
                        </div>
                        <h3 className="mt-7 text-center font-display text-2xl leading-snug text-[#f6efe4]">{book.title}</h3>
                        {book.author && <p className="mt-1 text-sm text-[#d4a574]">Par {book.author}</p>}
                        <div className="mt-4 flex w-full max-w-[220px] flex-col gap-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.id}`) }} className="btn-library bg-[#d4a574] text-[#1a100c]">
                            <Eye size={14} /> Voir
                          </button>
                          <button type="button" onClick={(e) => handleDownload(book, e)} className="btn-library border border-[#d4a574]/40 text-[#f6efe4]">
                            <Download size={14} /> Télécharger
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="wood-shelf mt-10 mb-10" />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </LibraryChrome>
  )
}
