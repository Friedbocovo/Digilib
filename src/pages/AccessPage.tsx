import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import Video from './vid_ebook2.mp4'
import Logo from "./logo2.png"

export default function AccessPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà un token d'accès
    const accessToken = localStorage.getItem('library_access_token')
    if (accessToken) {
      navigate('/library')
      return
    }

    // Vérifier si l'utilisateur revient (email déjà sauvegardé)
    const storedEmail = localStorage.getItem('user_email')
    if (storedEmail) {
      setIsReturningUser(true)
      setEmail(storedEmail)
      
      const storedPhone = localStorage.getItem('user_phone')
      if (storedPhone) setPhone(storedPhone)
    }
  }, [navigate])

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isReturningUser && !name.trim()) {
      setPopup({ message: 'Veuillez entrer votre nom', type: 'error' })
      return
    }

    if (!email.trim() || !phone.trim()) {
      setPopup({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' })
      return
    }

    if (!isReturningUser && city.trim().length < 2) {
      setPopup({ message: 'Veuillez entrer une ville valide', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()
      const cleanPhone = phone.trim()
      const cleanCity = city.trim()
      const cleanName = name.trim()

      console.log('🔍 Vérification du paiement...')

      // Vérifier si l'utilisateur a déjà payé
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .ilike('user_email', cleanEmail)
        .eq('phone_number', cleanPhone)
        .eq('status', 'completed')
        .limit(1)

      if (paymentError) {
        console.error('❌ Erreur vérification paiement:', paymentError)
      }

      if (paymentData && paymentData.length > 0) {
        console.log('✅ Paiement trouvé, accès accordé directement')

        // ✅ Mettre à jour la ville dans la table users si c'est un nouvel utilisateur
        if (!isReturningUser && cleanName) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle()

          if (existingUser) {
            await supabase
              .from('users')
              .update({ 
                city: cleanCity,
                name: cleanName,
                last_login: new Date().toISOString()
              })
              .eq('id', existingUser.id)
            
            console.log('✅ Ville mise à jour dans users')
          }
        }

        // Générer un token d'accès
        const accessToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15)

        // Sauvegarder dans localStorage
        localStorage.setItem('library_access_token', accessToken)
        localStorage.setItem('user_email', cleanEmail)
        localStorage.setItem('user_phone', cleanPhone)
        localStorage.setItem('user_city', cleanCity)
        if (!isReturningUser && cleanName) {
          localStorage.setItem('user_name', cleanName)
        }

        setPopup({ message: '✅ Accès autorisé ! Redirection...', type: 'success' })
        setTimeout(() => navigate('/library'), 1500)

      } else {
        console.log('⚠️ Aucun paiement trouvé, redirection vers /payment')
        
        // Créer/Mettre à jour l'utilisateur AVANT la redirection
        if (!isReturningUser && cleanName) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle()

          if (existingUser) {
            await supabase
              .from('users')
              .update({ 
                name: cleanName,
                phone_number: cleanPhone,
                city: cleanCity 
              })
              .eq('id', existingUser.id)
            
            console.log('✅ Utilisateur mis à jour avec ville')
          } else {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                name: cleanName,
                email: cleanEmail,
                phone_number: cleanPhone,
                city: cleanCity,
                has_paid: false
              })
            
            if (createError) {
              console.error('❌ Erreur création utilisateur:', createError)
            } else {
              console.log('✅ Nouvel utilisateur créé avec ville')
            }
          }
        }

        // Sauvegarder dans localStorage pour la page de paiement
        localStorage.setItem('user_email', cleanEmail)
        localStorage.setItem('user_phone', cleanPhone)
        localStorage.setItem('user_city', cleanCity)
        if (!isReturningUser && cleanName) {
          localStorage.setItem('user_name', cleanName)
        }

        setPopup({ message: 'Vous n\'avez pas encore payé. Redirection...', type: 'info' })
        setTimeout(() => navigate('/payment'), 1500)
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      setPopup({ message: 'Une erreur est survenue. Veuillez réessayer.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={Video} type="video/mp4" />
      </video>

      <div style={styles.overlay} />

      <div style={styles.content}>
        <div style={styles.card}>
          <div className='flex justify-center items-center md:mb-3 gap-3'>
            <img src={Logo} alt="Logo" className="md:h-15 md:w-15 h-12 w-12 mb-0" />
            <h1 style={styles.title}>DigiLib</h1>
          </div>
          <p style={styles.subtitle}>Accédez à votre bibliothèque</p>

          <form onSubmit={handleSubmitInfo} style={styles.form}>
            {!isReturningUser && (
              <>
                <input
                  type="text"
                  placeholder="Votre nom complet *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />

                <input
                  type="text"
                  placeholder="Votre ville *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={styles.input}
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Votre email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              disabled={isReturningUser}
            />

            <input
              type="tel"
              placeholder="Votre numéro de téléphone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Continuer →'}
            </button>

            <button 
              type="button"
              onClick={handleBack} 
              style={styles.backButton}
            >
              Retour à l'accueil
            </button>

            {isReturningUser && (
              <p style={styles.info}>
                Pas vous ? <button
                  type="button"
                  onClick={() => {
                    setIsReturningUser(false)
                    setEmail('')
                    setPhone('')
                    localStorage.removeItem('user_email')
                    localStorage.removeItem('user_phone')
                  }}
                  style={styles.linkButton}
                >
                  Changer de compte
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { position: 'relative' as const, minHeight: '100vh', overflow: 'hidden' },
  video: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    zIndex: 0,
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
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(227, 229, 233, 0.1) 0%, rgba(210, 209, 212, 0.3) 100%)',
    zIndex: 1,
  },
  content: {
    position: 'relative' as const,
    zIndex: 2,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#333',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2.5rem',
    textAlign: 'center' as const,
  },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' },
  input: {
    padding: '1rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  info: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
}