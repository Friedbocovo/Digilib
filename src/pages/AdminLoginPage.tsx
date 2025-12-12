import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Assurez-vous que ces fonctions sont correctement définies dans votre fichier d'authentification
import { verifyAdminPassword, isAdminSessionValid } from '../lib/adminAuth'
import Video from './vid_ebook2.mp4'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Vérification initiale : Si la session est déjà valide, on redirige vers /admin
  if (isAdminSessionValid()) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Logique de vérification : Vérifie le mot de passe local (1234567) ou via la fonction externe
    const isValid = 1234567 === Number(password) ? true : await verifyAdminPassword(password)

    if (isValid) {
      // 🔑 CORRECTION CLÉ : Enregistrement de la preuve d'accès dans le localStorage
      // C'est cette clé que la page Admin vérifie pour autoriser l'affichage.
      localStorage.setItem('admin_token', 'validated') 
      
      setPassword('')
      navigate('/admin') // Redirection réussie vers la page Admin
    } else {
      setError('Mot de passe incorrect')
    }

    setLoading(false)
  }

  const handleBack = () => {
    navigate('/')
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

      <div style={styles.card}>
        <h1 style={styles.title}>Connexion Admin</h1>
        <p style={styles.subtitle}>Accès réservé aux administrateurs</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Mot de passe administrateur"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoFocus
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? 'Vérification...' : 'Accéder'}
          </button>
        </form>

        <button onClick={handleBack} style={styles.backButton}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
    textAlign: 'center' as const,
    position: 'relative' as const, // Nécessaire pour placer le contenu au-dessus de la vidéo
    zIndex: 1,
  },
  title: {
    fontSize: '2rem',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '2rem',
  },
  input: {
    padding: '0.875rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
    margin: '0',
  },
  submitButton: {
    background: '#10b981',
    color: 'white',
    padding: '0.875rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  backButton: {
    width: '100%',
    background: 'transparent',
    color: '#10b981',
    padding: '0.75rem',
    border: '2px solid #10b981',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    transition: 'background 0.3s',
  },
  video: {
    position: 'fixed' as const, // Changé à 'fixed' pour couvrir tout l'arrière-plan
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    objectFit: 'cover' as const,
    zIndex: 0,
    pointerEvents: 'none' as const,
  },
}