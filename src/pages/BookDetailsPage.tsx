import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
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
        <button onClick={() => navigate('/library')} style={styles.backButton}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Retour à la bibliothèque
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      
      <div style={styles.header}>
        <button onClick={() => navigate('/library')} style={styles.backButton}>
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
            <div style={styles.stats}>
              <div style={styles.stat}>
                <Eye size={24} style={{ color: '#667eea' }} />
                <span style={styles.statValue}>{book.views || 0} vues</span>
              </div>
              <div style={styles.stat}>
                <Download size={24} style={{ color: '#10b981' }} />
                <span style={styles.statValue}>{book.downloads || 0} téléchargements</span>
              </div>
            </div>
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
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    background: 'white',
    padding: '1.5rem 2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  backButton: {
    background: '#667eea',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
  },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  bookLayout: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '3rem',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  coverImage: {
    width: '100%',
    height: '550px',
    objectFit: 'cover' as const,
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
  },
  stat: {
    flex: 1,
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statValue: { fontSize: '0.95rem', fontWeight: '600', color: '#333' },
  rightColumn: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  categoryBadge: {
    display: 'inline-block',
    color: 'white',
    padding: '0.5rem 1.25rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#333',
    marginBottom: '0.75rem',
    lineHeight: 1.2,
  },
  author: {
    fontSize: '1.3rem',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '2rem',
  },
  metadata: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '2.5rem',
    padding: '1.5rem',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  metaLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: '1.05rem',
    color: '#333',
    fontWeight: '600',
  },
  descriptionSection: { marginBottom: '2.5rem' },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.05rem',
    lineHeight: 1.8,
    color: '#555',
    whiteSpace: 'pre-line' as const,
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  readButton: {
    background: '#667eea',
    color: 'white',
    padding: '1.25rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    background: '#10b981',
    color: 'white',
    padding: '1.25rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255,255,255,0.3)',
    borderTop: '6px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
  },
  error: {
    textAlign: 'center' as const,
    fontSize: '1.5rem',
    color: '#ef4444',
    padding: '3rem',
  },
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
document.head.appendChild(styleSheet)