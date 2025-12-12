import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { 
  BookOpen, 
  LogOut, 
  ArrowLeft, 
  Search, 
  Download, 
  Eye,
  ArrowRight,
  User
} from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description?: string
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
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    checkAccessAndLoadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCoverImageUrl = (coverUrl: string) => {
    if (!coverUrl) {
      return 'https://via.placeholder.com/280x400/667eea/ffffff?text=Pas+de+couverture'
    }
    
    if (coverUrl.includes('drive.google.com')) {
      const fileIdMatch = coverUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400`
      }
    }
    
    return coverUrl
  }

  const getDirectDownloadLink = (driveLink: string, driveFileId?: string) => {
    if (driveFileId) {
      return `https://drive.google.com/uc?export=download&id=${driveFileId}`
    }
    
    if (driveLink && driveLink.includes('drive.google.com')) {
      const match = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`
      }
    }
    
    return driveLink
  }

  const handleDownload = async (book: Book, e: React.MouseEvent) => {
    e.stopPropagation()
    
    setPopup({ message: 'Téléchargement en cours...', type: 'info' })

    try {
      const { data: bookData } = await supabase
        .from('books')
        .select('drive_link, drive_file_id, downloads')
        .eq('id', book.id)
        .single()

      if (bookData) {
        const finalUrl = getDirectDownloadLink(bookData.drive_link, bookData.drive_file_id)
        window.open(finalUrl, '_blank')
        
        await supabase
          .from('books')
          .update({ downloads: (bookData.downloads || 0) + 1 })
          .eq('id', book.id)

        setPopup({ message: 'Téléchargement lancé !', type: 'success' })
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      setPopup({ message: 'Erreur lors du téléchargement', type: 'error' })
    }
  }

  const checkAccessAndLoadData = async () => {
    try {
      const userEmail = localStorage.getItem('user_email')
      const accessToken = localStorage.getItem('library_access_token')
      let storedName = localStorage.getItem('user_name')

      if (!accessToken || !userEmail) {
        navigate('/')
        return
      }

      // Si pas de nom stocké, extraire du email
      if (!storedName && userEmail) {
        storedName = userEmail.split('@')[0]
        localStorage.setItem('user_name', storedName)
      }

      setUserName(storedName || '')

      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'completed')
        .limit(1)

      if (!paymentData || paymentData.length === 0) {
        setPopup({ message: 'Accès non autorisé', type: 'error' })
        setTimeout(() => navigate('/'), 2000)
        return
      }

      await loadData()
    } catch (error) {
      console.error('Erreur:', error)
      navigate('/')
    }
  }

  const loadData = async () => {
    try {
      const [categoriesResult, booksResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('books').select('id, title, author, description, cover_url, drive_link, drive_file_id, downloads, category_id, categories(*)').order('created_at', { ascending: false })
      ])

      if (categoriesResult.data) setCategories(categoriesResult.data)
      if (booksResult.data) setBooks(booksResult.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('library_access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    setPopup({ message: 'Déconnexion réussie !', type: 'success' })
    setTimeout(() => navigate('/'), 1000)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`)
  }

  const filteredBooks = selectedCategory
    ? books.filter(book => book.category_id === selectedCategory && 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      
      <header style={styles.header}>
        <h1 style={styles.logo}>
          <BookOpen size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          DigiLib
        </h1>
        <div style={styles.headerActions}>
          <span style={styles.userName}>
            <User size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Bienvenue, {userName}
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Quitter
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {!selectedCategory ? (
          // VUE CATÉGORIES
          <>
            <div style={styles.welcomeSection}>
              <h2 style={styles.welcomeTitle}>Explorez notre bibliothèque</h2>
              <p style={styles.welcomeSubtitle}>Choisissez une catégorie pour découvrir nos livres</p>
            </div>

            <div style={styles.categoriesGrid}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    ...styles.categoryCard,
                    background: `linear-gradient(135deg, ${category.color}ee 0%, ${category.color}cc 100%)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <div style={styles.categoryIcon}>{category.icon}</div>
                  <h3 style={styles.categoryName}>{category.name}</h3>
                  <p style={styles.categoryDesc}>{category.description}</p>
                  <div style={styles.categoryArrow}>
                    <ArrowRight size={24} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // VUE LIVRES
          <>
            <div style={styles.breadcrumb}>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={styles.backButton}
              >
                <ArrowLeft size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Retour aux catégories
              </button>
              <h2 style={styles.categoryTitle}>
                {categories.find(c => c.id === selectedCategory)?.icon}{' '}
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
            </div>

            <div style={styles.searchBar}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {filteredBooks.length === 0 ? (
              <p style={styles.emptyMessage}>Aucun livre dans cette catégorie</p>
            ) : (
              <div style={styles.booksGrid}>
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    style={styles.bookCard}
                    onClick={() => handleBookClick(book.id)}
                  >
                    <img
                      src={getCoverImageUrl(book.cover_url)}
                      alt={book.title}
                      style={styles.bookCover}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/280x400/667eea/ffffff?text=Erreur+image'
                      }}
                    />
                    <div style={styles.bookInfo}>
                      <h3 style={styles.bookTitle}>{book.title}</h3>
                      {book.author && (
                        <p style={styles.bookAuthor}>Par {book.author}</p>
                      )}
                      <p style={styles.bookDescription}>
                        {book.description.substring(0, 100)}...
                      </p>
                      <div style={styles.bookActions}>
                        <button 
                          style={styles.detailsButton}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookClick(book.id)
                          }}
                        >
                          <Eye size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          Voir plus
                        </button>
                        <button 
                          style={styles.downloadButtonSmall}
                          onClick={(e) => handleDownload(book, e)}
                        >
                          <Download size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    background: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logo: { 
    margin: 0, 
    color: '#667eea', 
    fontSize: '1.5rem', 
    display: 'flex', 
    alignItems: 'center',
    fontWeight: 'bold',
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1.5rem' 
  },
  userName: { 
    color: '#333', 
    fontWeight: '600', 
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  logoutButton: {
    background: '#ef4444',
    color: 'white',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
  },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  welcomeSection: { textAlign: 'center' as const, marginBottom: '3rem' },
  welcomeTitle: { fontSize: '2.5rem', color: '#333', marginBottom: '0.5rem' },
  welcomeSubtitle: { fontSize: '1.1rem', color: '#666' },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  categoryCard: {
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    position: 'relative' as const,
  },
  categoryIcon: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  categoryName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  categoryDesc: {
    fontSize: '0.95rem',
    opacity: 0.9,
    margin: 0,
  },
  categoryArrow: {
    position: 'absolute' as const,
    bottom: '1.5rem',
    right: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
  },
  breadcrumb: { marginBottom: '2rem' },
  backButton: {
    background: '#667eea',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
  },
  categoryTitle: { fontSize: '2rem', color: '#333', margin: '1rem 0' },
  searchBar: { 
    marginBottom: '2rem',
    position: 'relative' as const,
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  bookCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  bookCover: { width: '100%', height: '350px', objectFit: 'cover' as const },
  bookInfo: { padding: '1.5rem' },
  bookTitle: { margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem', fontWeight: '700' },
  bookAuthor: { margin: '0 0 0.75rem 0', color: '#667eea', fontSize: '0.9rem', fontWeight: '600' },
  bookDescription: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 },
  bookActions: { display: 'flex', gap: '0.5rem' },
  detailsButton: {
    flex: 1,
    background: '#667eea',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  downloadButtonSmall: {
    background: '#10b981',
    color: 'white',
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    color: '#666',
    marginTop: '3rem',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255,255,255,0.3)',
    borderTop: '6px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem',
  },
  loadingText: { fontSize: '1.25rem', fontWeight: '600', color: 'white' },
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
document.head.appendChild(styleSheet)