import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import '../index.css'
import {
  ArrowLeft,
  Eye,
  Download,
  BookOpen,
  Clock
} from 'lucide-react'

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
  categories?: {
    name: string
    color: string
  }
}

export default function BookDetailsPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadBookDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const getCoverImageUrl = (coverUrl: string) => {
    if (!coverUrl) {
      return 'https://via.placeholder.com/400x600/667eea/ffffff?text=Pas+de+couverture'
    }

    if (coverUrl.includes('drive.google.com')) {
      const fileIdMatch = coverUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w600`
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

  const loadBookDetails = async () => {
    try {
      const userEmail = localStorage.getItem('user_email')
      if (!userEmail) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('books')
        .select('*, categories(*)')
        .eq('id', bookId)
        .single()

      if (error) throw error

      setBook(data)

      try {
        await supabase
          .from('books')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', bookId)
      } catch (err) {
        console.log('Erreur incrémentation vues:', err)
      }

    } catch (error) {
      console.error('Erreur:', error)
      setPopup({ message: 'Erreur de chargement du livre', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRead = () => {
    if (!book?.drive_link) return
    window.open(book.drive_link, '_blank')
  }

  const handleDownload = async () => {
    if (!book) return

    setDownloading(true)
    setPopup({ message: 'Téléchargement en cours...', type: 'info' })

    try {
      const downloadUrl = getDirectDownloadLink(book.drive_link, book.drive_file_id)
      window.open(downloadUrl, '_blank')

      await supabase
        .from('books')
        .update({ downloads: book.downloads + 1 })
        .eq('id', book.id)

      setPopup({ message: 'Téléchargement lancé !', type: 'success' })
      setBook({ ...book, downloads: book.downloads + 1 })

    } catch (error) {
      console.error('Erreur téléchargement:', error)
      setPopup({ message: 'Erreur lors du téléchargement', type: 'error' })
    } finally {
      setTimeout(() => setDownloading(false), 2000)
    }
  }

  // ✅ CORRECTION : Retourner à la liste des livres de la catégorie
  const handleBack = () => {
    const savedCategoryId = localStorage.getItem('selected_category_id')
    
    if (savedCategoryId && book?.category_id === savedCategoryId) {
      // Si on vient de la même catégorie, retourner à la liste des livres
      navigate('/library')
    } else if (book?.category_id) {
      // Si la catégorie sauvegardée ne correspond pas, mettre à jour et retourner
      localStorage.setItem('selected_category_id', book.category_id)
      navigate('/library')
    } else {
      // Par défaut, retourner aux catégories
      localStorage.removeItem('selected_category_id')
      navigate('/library')
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement du livre...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Livre introuvable</p>
        <button onClick={handleBack} style={styles.backButton}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Retour à la bibliothèque
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container} className='container'>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Retour
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.bookLayout}>
          {/* COLONNE GAUCHE: Image */}
          <div style={styles.leftColumn}>
            <img
              src={getCoverImageUrl(book.cover_url)}
              alt={book.title}
              style={styles.coverImage}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x600/667eea/ffffff?text=Erreur+image'
              }}
            />

          </div>

          {/* COLONNE DROITE: Détails */}
          <div style={styles.rightColumn}>
            {book.categories && (
              <div
                style={{
                  ...styles.categoryBadge,
                  background: book.categories.color
                }}
              >
                {book.categories.name}
              </div>
            )}

            <h1 style={styles.title}>{book.title}</h1>

            {book.author && (
              <p style={styles.author}>Par {book.author}</p>
            )}

            <div style={styles.metadata}>
              {book.language && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Langue:</span>
                  <span style={styles.metaValue}>{book.language}</span>
                </div>
              )}
              {book.pages && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Pages:</span>
                  <span style={styles.metaValue}>{book.pages}</span>
                </div>
              )}
              {book.file_size && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Taille:</span>
                  <span style={styles.metaValue}>{book.file_size}</span>
                </div>
              )}
              {book.published_year && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Année:</span>
                  <span style={styles.metaValue}>{book.published_year}</span>
                </div>
              )}
            </div>

            <div style={styles.descriptionSection}>
              <h2 style={styles.sectionTitle}>Description</h2>
              <p style={styles.description}>{book.description}</p>
            </div>

            <div style={styles.actions}>
              <button
                onClick={handleRead}
                style={styles.readButton}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <BookOpen size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Lire en ligne
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  ...styles.downloadButton,
                  ...(downloading ? styles.downloadButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!downloading) e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {downloading ? (
                  <>
                    <Clock size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Télécharger
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh' },
  header: {
    background: 'rgba(16, 6, 6, 0.8)',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  backButton: {
    background: '#667eea',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(1rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
  },
  bookLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'clamp(2rem, 5vw, 3rem)',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  coverImage: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    aspectRatio: '2 / 3',
    objectFit: 'cover' as const,
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(255, 255, 255, 1)',
    margin: '0 auto',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  stat: {
    flex: '1 1 150px',
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
    fontWeight: '600',
    color: '#333',
  },
  rightColumn: {
    background: 'white',
    padding: 'clamp(1.5rem, 4vw, 3rem)',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  categoryBadge: {
    display: 'inline-block',
    color: 'white',
    padding: '0.5rem 1.25rem',
    borderRadius: '20px',
    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
    fontWeight: '800',
    color: '#333',
    marginBottom: '0.75rem',
    lineHeight: 1.2,
    wordBreak: 'break-word' as const,
  },
  author: {
    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '2rem',
  },
  metadata: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '2.5rem',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  metaLabel: {
    fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
    color: '#333',
    fontWeight: '600',
  },
  descriptionSection: { marginBottom: '2.5rem' },
  sectionTitle: {
    fontSize: 'clamp(1.3rem, 4vw, 1.5rem)',
    fontWeight: '700',
    color: '#333',
    marginBottom: '1rem',
  },
  description: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
    lineHeight: 1.8,
    color: '#555',
    whiteSpace: 'pre-line' as const,
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  readButton: {
    background: '#667eea',
    color: 'white',
    padding: 'clamp(1rem, 3vw, 1.25rem)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
    fontWeight: '700',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  downloadButton: {
    background: '#10b981',
    color: 'white',
    padding: 'clamp(1rem, 3vw, 1.25rem)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
    fontWeight: '700',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  spinner: {
    width: 'clamp(40px, 10vw, 60px)',
    height: 'clamp(40px, 10vw, 60px)',
    border: '6px solid rgba(255,255,255,0.3)',
    borderTop: '6px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    fontWeight: '600',
    color: 'white',
    textAlign: 'center' as const,
  },
  error: {
    textAlign: 'center' as const,
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    color: '#ef4444',
    padding: 'clamp(2rem, 5vw, 3rem)',
  },
}

// Media query pour desktop
if (typeof window !== 'undefined' && window.innerWidth >= 768) {
  Object.assign(styles.bookLayout, {
    gridTemplateColumns: 'min(400px, 40%) 1fr',
  })
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
document.head.appendChild(styleSheet)