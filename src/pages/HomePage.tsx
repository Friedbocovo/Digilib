import { BookOpen, Download, Grid, User, ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Video from './vid_ebook3.mp4'

export default function HomePage() {
  const navigate = useNavigate()

  const handleAccessLibrary = () => {
    navigate('/payment')
  }

  const handleAdminLogin = () => {
    navigate('/admin-login')
  }

  return (
    <div style={styles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      >
        <source src={Video} type="video/mp4" />
      </video>

      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <BookOpen size={32} strokeWidth={2.5} />
            <span style={styles.logoText}>DigiLib</span>
          </div>
          <button
            onClick={handleAdminLogin}
            style={styles.adminBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <User size={18} />
            <span>Admin</span>
          </button>
        </header>

        <main style={styles.hero}>
          <div style={styles.badge}>
            <Star size={14} strokeWidth={3} />
            <span>Accès Illimitée</span>
          </div>

          <h1 style={styles.title}>
            Votre Bibliothèque<br />
            Numérique Illimitée
          </h1>

          <p style={styles.subtitle}>
            Des milliers de livres. Un seul paiement. Pour toujours.
          </p>

          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.iconWrapper}>
                <BookOpen size={32} strokeWidth={2} />
              </div>
              <h3 style={styles.featureTitle}>Lecture Illimitée</h3>
              <p style={styles.featureDesc}>
                Explorez notre catalogue complet sans aucune restriction. Romans, essais, biographies, développement personnel, sciences, histoire et bien plus encore. Lisez autant que vous voulez, quand vous voulez.
              </p>
            </div>

            <div style={styles.feature}>
              <div style={styles.iconWrapper}>
                <Download size={32} strokeWidth={2} />
              </div>
              <h3 style={styles.featureTitle}>Téléchargement Libre</h3>
              <p style={styles.featureDesc}>
                Téléchargez tous vos livres préférés sur vos appareils. Lisez hors ligne, sur votre ordinateur, tablette ou smartphone. Emportez votre bibliothèque partout avec vous, même sans connexion internet.
              </p>
            </div>

            <div style={styles.feature}>
              <div style={styles.iconWrapper}>
                <Grid size={32} strokeWidth={2} />
              </div>
              <h3 style={styles.featureTitle}>Tous Les Genres</h3>
              <p style={styles.featureDesc}>
                Une diversité incroyable de contenus pour tous les goûts. Fiction, non-fiction, classiques littéraires, best-sellers contemporains, livres académiques, manuels techniques et guides pratiques disponibles instantanément.
              </p>
            </div>
          </div>

          <button
            onClick={handleAccessLibrary}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)'
            }}
          >
            <span>Accéder à la Bibliothèque</span>
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>

        </main>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative' as const,
    minHeight: '100vh',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    zIndex: 0,
  },
  video: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    objectFit: 'cover' as const,
    opacity: 0.7,
    zIndex: 0,
    pointerEvents: 'none' as const,
  },
  content: {
    position: 'relative' as const,
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'linear-gradient(135deg, rgba(10, 56, 97, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%)',
  },
  header: {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
    gap: '20px',
    padding: '1rem 3rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '0.65rem 1.25rem',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  hero: {
    flex: 1,
    maxWidth: '1200px',
    margin: '100px auto',
    textAlign: 'center' as const,
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0rem 0rem  1rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '1.4rem',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '4.5rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    lineHeight: '1.1',
    letterSpacing: '-2px',
    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '1.4rem',
    marginBottom: '4rem',
    opacity: 0.95,
    fontWeight: '400',
    lineHeight: '1.6',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '3.5rem',
    width: '100%',
  },
  feature: {
    background: 'rgba(255,255,255,0.12)',
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    textAlign: 'left' as const,
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
  },
  featureDesc: {
    fontSize: '1rem',
    opacity: 0.9,
    lineHeight: '1.7',
    margin: 0,
  },
  ctaButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'white',
    color: '#6366f1',
    fontSize: '1.2rem',
    fontWeight: '700',
    padding: '1.4rem 3.5rem',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  trustBadge: {
    marginTop: '3rem',
    fontSize: '1rem',
    opacity: 0.95,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  separator: {
    opacity: 0.6,
  },
}