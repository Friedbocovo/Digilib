import { BookOpen, MessageCircleMore, Download, Grid, User, ArrowRight, Star, Mail, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Video from "./vid_ebook3.mp4"
import BG from "./bg2.jpg"
import Logo from "./logo2.png"

interface FreeBook {
  id: string
  title: string
  author?: string
  cover_url: string
  drive_link: string
}

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "Comment ça marche ?",
    answer: "C'est simple ! Payez une seule fois 5000 XAF via Mobile Money (MTN, Moov ou Celtiis), et accédez à vie à notre bibliothèque complète de milliers de livres. Vous pouvez lire en ligne ou télécharger gratuitement tous les livres que vous voulez."
  },
  {
    question: "Quels sont les modes de paiement ?",
    answer: "Nous acceptons tous les opérateurs de Mobile Money du Bénin : MTN Money, Moov Money et Celtiis Money. Une fois votre paiement validé, vous recevez immédiatement votre accès."
  },
  {
    question: "Est-ce vraiment un accès à vie ?",
    answer: "Oui, absolument ! Un seul paiement de 5000 FCFA vous donne un accès illimité et permanent à toute notre bibliothèque. Pas d'abonnement mensuel, pas de frais cachés. Vous payez une fois et c'est pour toujours."
  },
  {
    question: "Puis-je télécharger les livres ?",
    answer: "Oui ! Tous les livres peuvent être téléchargés gratuitement et sans limite. Une fois téléchargés, vous pouvez les lire même sans connexion internet, sur votre téléphone, tablette ou ordinateur."
  },
  {
    question: "Combien de livres sont disponibles ?",
    answer: "Notre bibliothèque contient des milliers de livres dans tous les genres : romans, développement personnel, sciences, histoire, biographies, essais, et bien plus encore. Nous ajoutons régulièrement de nouveaux titres."
  }
]

// LIVRES GRATUITS EN DUR
const freeBooks: FreeBook[] = [
  {
    id: '1',
    title: '7 exercices pour durer plus longtemps',
    cover_url: 'https://drive.google.com/file/d/1jCwHs9qHytb3HLrvSmpwFA7MksibOdOs/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1O7SXPt_34TEz5BN8pqr8m2eCbBiwBIlr/view?usp=drivesdk'
  },
  {
    id: '2',
    title: 'Réussir sa prise de parole en public',
    cover_url: 'https://drive.google.com/file/d/1KlLb2abtBsEBLlMKFwp1pxML01IdVM7R/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1lglrtiug7ummMqW-fuM3KeDx-Ht7Etrx/view?usp=sharing'
  },
  {
    id: '3',
    title: '10 bonnes raisons de devenir entrepreneur',
    cover_url: 'https://drive.google.com/file/d/1_43l2OLOeZ3JCHsNZ9Wo0uAxeSwPeAyv/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1UhjD6CVuFhWs0eFamwbDyuNNKpRm6kY6/view?usp=sharing'
  }
]

export default function HomePage() {
  const navigate = useNavigate()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const handleAccessLibrary = () => {
    navigate('/access')
  }

  const handleAdminLogin = () => {
    navigate('/admin-login')
  }

  const handleDownloadFreeBook = (book: FreeBook) => {
    try {
      // Extraire l'ID du fichier Google Drive
      const match = book.drive_link.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        const fileId = match[1]
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
        window.open(downloadUrl, '_blank')
      } else {
        // Si on ne peut pas extraire l'ID, ouvrir le lien original
        window.open(book.drive_link, '_blank')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      // Fallback: ouvrir le lien original
      window.open(book.drive_link, '_blank')
    }
  }

  const getCoverImageUrl = (coverUrl: string) => {
    if (!coverUrl) {
      return 'https://via.placeholder.com/200x280/667eea/ffffff?text=Livre'
    }

    // Extraire l'ID du fichier Google Drive
    const fileIdMatch = coverUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch && fileIdMatch[1]) {
      // Utiliser l'API thumbnail de Google Drive
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400`
    }

    return coverUrl
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div style={styles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
        className='md:flex hidden'
      >
        <source src={Video} type="video/mp4" />
      </video>

      <img src={BG} alt="BG" className='md:hidden flex' style={styles.video} />

      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.logo} className="flex">
            <img src={Logo} alt="Logo" className="md:h-15 md:w-15 h-10 w-10" />
            <span style={styles.logoText}>DigiLib</span>
          </div>
<button
            onClick={handleAccessLibrary}
           className='h-12 w-auto flex items-center gap-2 bg-white text-purple-600 font-semibold px-4 rounded-lg hover:shadow-lg transition-shadow duration-300'
          >
            <span className='md:flex hidden'>Accéder à la Bibliothèque</span>
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </header>

        <main style={styles.hero}>
          <div style={styles.badge}>
            <Star size={14} strokeWidth={3} />
            <span>Accès Illimité</span>
          </div>

          <h1 style={styles.title} className='md:text-6xl text-4xl'>
            Votre Bibliothèque<br />
            Numérique Illimitée
          </h1>

          <p style={styles.subtitle}>
            Des milliers de livres. Un seul paiement. Pour toujours.
          </p>

          <div style={styles.features} className='md:w-[100%] w-[60%] flex-wrap justify-center'>
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
                Téléchargez tous vos livres préférés sur vos appareils. Lisez hors ligne, sur votre ordinateur, tablette ou smartphone. Emportez votre bibliothèque partout avec vous.
              </p>
            </div>

            <div style={styles.feature}>
              <div style={styles.iconWrapper}>
                <Grid size={32} strokeWidth={2} />
              </div>
              <h3 style={styles.featureTitle}>Tous Les Genres</h3>
              <p style={styles.featureDesc}>
                Une diversité incroyable de contenus pour tous les goûts. Fiction, non-fiction, classiques littéraires, best-sellers contemporains, livres académiques.
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

          {/* SECTION LIVRES GRATUITS */}
          <div style={styles.freeBooksSection}>
            <h2 style={styles.freeBooksTitle}>
              📚 Découvrez nos livres gratuits
            </h2>
            <p style={styles.freeBooksSubtitle}>
              Téléchargez gratuitement ces livres pour découvrir notre bibliothèque
            </p>

            <div style={styles.freeBooksGrid}>
              {freeBooks.map((book) => (
                <div key={book.id} style={styles.freeBookCard}>
                  <img
                    src={getCoverImageUrl(book.cover_url)}
                    alt={book.title}
                    style={styles.freeBookCover}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x280/667eea/ffffff?text=Livre'
                    }}
                  />
                  <div style={styles.freeBookInfo}>
                    <h3 style={styles.freeBookTitle}>{book.title}</h3>
                    {book.author && (
                      <p style={styles.freeBookAuthor}>{book.author}</p>
                    )}
                    <button
                      onClick={() => handleDownloadFreeBook(book)}
                      style={styles.downloadFreeButton}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                    >
                      <Download size={18} />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION FAQ */}
          <div style={styles.faqSection}>
            <h2 style={styles.faqSectionTitle}>❓ Questions Fréquentes</h2>
            <p style={styles.faqSectionSubtitle}>
              Tout ce que vous devez savoir sur DigiLib
            </p>

            <div style={styles.faqContainer}>
              {faqs.map((faq, index) => (
                <div key={index} style={styles.faqItem}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    style={{
                      ...styles.faqQuestion,
                      ...(openFAQ === index ? styles.faqQuestionActive : {})
                    }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={24}
                      style={{
                        transition: 'transform 0.3s ease',
                        transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </button>

                  {openFAQ === index && (
                    <div style={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            {/* LOGO (Gauche) */}
            <div style={styles.footerSection}>
              <div style={styles.footerLogo}>
            <img src={Logo} alt="Logo" className="md:h-15 md:w-15 h-10 w-10" />
                <span style={styles.footerLogoText}>DigiLib</span>
              </div>
              <p style={styles.footerTagline}>
                Votre bibliothèque numérique illimitée
              </p>
            </div>

            {/* CONTACT (Centre) */}
            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Contact</h3>
              <div style={styles.contactInfo}>
                <a href="mailto:flybrary4@gmail.com" style={styles.contactLink}>
                  <Mail size={18} />
                  <span>flybrary4@gmail.com</span>
                </a>
                <a
                  href="https://wa.me/22941822980?text=Bonjour%2C%20j'aimerais%20avoir%20acc%C3%A8s%20%C3%A0%20la%20biblioth%C3%A8que%20DigiLib"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.contactLink, cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }} className='flex items-center gap-2'>
                    <MessageCircleMore size={20} strokeWidth={2} />WhatsApp
                  </span>
                  </a>
              </div>
            </div>

            {/* LIENS RAPIDES (Droite) */}
            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Liens Rapides</h3>
              <div style={styles.faqLinks}>
                <button
                  onClick={handleAccessLibrary}
                  style={styles.faqLink}
                >
                  Accéder à la bibliothèque
                </button>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div style={styles.copyright}>
            <p>© 2025 DigiLib. Tous droits réservés.</p>
          </div>
        </footer>
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
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 3rem)',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white',
  },
  logoText: {
    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: 'clamp(0.5rem, 2vw, 0.65rem) clamp(0.75rem, 3vw, 1.25rem)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  hero: {
    flex: 1,
    maxWidth: '1200px',
    margin: '100px auto 0',
    textAlign: 'center' as const,
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'clamp(1rem, 4vw, 2rem)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '1.4rem',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 'clamp(2rem, 6vw, 4.5rem)',
    fontWeight: '800',
    marginBottom: '1.5rem',
    lineHeight: '1.1',
    fontFamily: '"Itim',
    letterSpacing: '-2px',
    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.4rem)',
    marginBottom: '4rem',
    opacity: 0.95,
    fontWeight: '400',
    lineHeight: '1.6',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
    gap: 'clamp(1rem, 3vw, 2rem)',
    marginBottom: '3.5rem',
    width: '100%',
  },
  feature: {
    background: 'rgba(255,255,255,0.12)',
    padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    textAlign: 'left' as const,
  },
  iconWrapper: {
    width: 'clamp(48px, 10vw, 64px)',
    height: 'clamp(48px, 10vw, 64px)',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  featureTitle: {
    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    fontWeight: '700',
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
  },
  featureDesc: {
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    fontWeight: '700',
    padding: 'clamp(1rem, 3vw, 1.4rem) clamp(2rem, 6vw, 3.5rem)',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    marginBottom: '4rem',
  },

  // SECTION LIVRES GRATUITS
  freeBooksSection: {
    width: '100%',
    marginTop: '4rem',
    marginBottom: '4rem',
  },
  freeBooksTitle: {
    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  freeBooksSubtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    opacity: 0.9,
    marginBottom: '3rem',
  },
  freeBooksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
    gap: 'clamp(1.5rem, 4vw, 2.5rem)',
    justifyItems: 'center',
  },
  freeBookCard: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '15px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '280px',
  },
  freeBookCover: {
    width: '100%',
    height: 'clamp(280px, 35vw, 350px)',
    objectFit: 'cover' as const,
    backgroundColor: '#f0f0f0',
  },
  freeBookInfo: {
    padding: 'clamp(1rem, 3vw, 1.5rem)',
  },
  freeBookTitle: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'white',
    minHeight: '2.5rem',
    lineHeight: '1.3',
  },
  freeBookAuthor: {
    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
    opacity: 0.8,
    marginBottom: '1rem',
    color: 'white',
  },
  downloadFreeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    background: '#10b981',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    transition: 'background 0.3s ease',
  },

  // SECTION FAQ
  faqSection: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '4rem',
    marginBottom: '4rem',
  },
  faqSectionTitle: {
    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  faqSectionSubtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    opacity: 0.9,
    marginBottom: '3rem',
  },
  faqContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  faqItem: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  faqQuestion: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
    fontWeight: '600',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  faqQuestionActive: {
    background: 'rgba(255,255,255,0.05)',
  },
  faqAnswer: {
    padding: '0 clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 1.5rem)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    lineHeight: '1.7',
    animation: 'fadeIn 0.3s ease',
  },

  // FOOTER
  footer: {
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem) 1rem',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
    gap: 'clamp(2rem, 5vw, 3rem)',
    marginBottom: '2rem',
  },
  footerSection: {
    color: 'white',
  },
  footerTitle: {
    fontSize: 'clamp(1.1rem, 3vw, 1.2rem)',
    fontWeight: '700',
    marginBottom: '1.5rem',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  contactLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
  },
  faqLinks: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  faqLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'color 0.3s ease',
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    padding: 0,
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  footerLogoText: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
  },
  footerTagline: {
    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
    opacity: 0.7,
    margin: 0,
  },
  copyright: {
    textAlign: 'center' as const,
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
  },
}

// Animation CSS
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`
document.head.appendChild(styleSheet)