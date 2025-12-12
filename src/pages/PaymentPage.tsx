import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  CreditCard, 
  Check, 
  Loader 
} from 'lucide-react'
import Video from './vid_ebook2.mp4'

// ⚠️ MODE SIMULATION - Changez false en true pour activer FedaPay réel
const SIMULATION_MODE = true

const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || ''
const LIBRARY_ACCESS_PRICE = 3000

export default function PaymentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [step, setStep] = useState<'email' | 'payment'>('email')
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const tempEmail = localStorage.getItem('temp_email')
    const tempPhone = localStorage.getItem('temp_phone')
    
    if (tempEmail) setUserEmail(tempEmail)
    if (tempPhone) setUserPhone(tempPhone)
    
    if (tempEmail && tempPhone) {
      setStep('payment')
    }
  }, [])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const phoneRegex = /^(229)?[0-9]{8}$/
    if (!phoneRegex.test(userPhone.replace(/\s/g, ''))) {
      setPopup({ 
        message: 'Numéro invalide. Format: 229XXXXXXXX ou 90123456', 
        type: 'error' 
      })
      return
    }

    if (userEmail && userEmail.includes('@')) {
      setStep('payment')
    } else {
      setPopup({ message: 'Veuillez entrer un email valide', type: 'error' })
    }
  }

  const handlePayment = async () => {
    if (!userEmail || !userPhone) {
      setPopup({ message: 'Veuillez entrer un email et un numéro de téléphone', type: 'error' })
      return
    }

    setLoading(true)

    if (SIMULATION_MODE) {
      console.log('🎮 MODE SIMULATION ACTIVÉ')
      setPopup({ message: 'Simulation de paiement en cours...', type: 'info' })
      
      setTimeout(async () => {
        await handlePaymentSuccess({
          transaction_id: `SIM-${Date.now()}`,
          status: 'successful'
        }, `SIM-${Date.now()}`)
      }, 2000)
      
    } else {
      if (!FEDAPAY_PUBLIC_KEY) {
        setPopup({ message: 'Clé API FedaPay manquante', type: 'error' })
        setLoading(false)
        return
      }

      try {
        const cleanEmail = userEmail.trim().toLowerCase()
        const cleanPhone = userPhone.trim().replace(/\s/g, '')
        const phoneNumber = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`
        
        const response = await fetch('https://api.fedapay.com/v1/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FEDAPAY_PUBLIC_KEY}`
          },
          body: JSON.stringify({
            description: 'Accès bibliothèque Free Books',
            amount: LIBRARY_ACCESS_PRICE,
            currency: { iso: 'XOF' },
            customer: {
              firstname: cleanEmail.split('@')[0],
              lastname: 'User',
              email: cleanEmail,
              phone_number: { number: phoneNumber, country: 'bj' }
            }
          })
        })

        const data = await response.json()

        if (data.v1?.token) {
          const paymentUrl = `https://checkout.fedapay.com/${data.v1.token}`
          window.open(paymentUrl, '_blank')
          setPopup({ message: 'Complétez le paiement dans le nouvel onglet', type: 'info' })
        } else {
          throw new Error('Token non reçu')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Erreur FedaPay:', error)
        setPopup({ message: 'Erreur de paiement. Vérifiez votre clé API.', type: 'error' })
        setLoading(false)
      }
    }
  }

  const handlePaymentSuccess = async (transaction: any, transactionId: string) => {
    try {
      const accessToken = generateAccessToken()
      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanPhone = userPhone.trim()
      const userName = cleanEmail.split('@')[0] // Extraire le nom de l'email

      console.log('📝 Enregistrement du paiement dans Supabase...')

      let userId = null
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .single()

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            name: userName,
            email: cleanEmail,
            phone_number: cleanPhone,
            has_paid: true
          })
          .select('id')
          .single()
        
        userId = newUser?.id
      }

      const { data, error } = await supabase.from('payments').insert({
        user_id: userId,
        user_email: cleanEmail,
        phone_number: cleanPhone,
        amount: LIBRARY_ACCESS_PRICE,
        transaction_id: transactionId,
        payment_method: SIMULATION_MODE ? 'simulation' : 'fedapay',
        status: 'completed',
      }).select()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setPopup({ message: `Erreur d'enregistrement: ${error.message}`, type: 'error' })
        setLoading(false)
        return
      }

      console.log('✅ Paiement enregistré:', data)

      localStorage.setItem('library_access_token', accessToken)
      localStorage.setItem('user_email', cleanEmail)
      localStorage.setItem('user_name', userName) // Stocker le nom
      localStorage.removeItem('temp_email')
      localStorage.removeItem('temp_phone')

      setPopup({ message: SIMULATION_MODE ? '🎮 Paiement simulé avec succès !' : 'Paiement réussi !', type: 'success' })
      setTimeout(() => navigate('/library'), 1500)
    } catch (error: any) {
      console.error('❌ Error:', error)
      setPopup({ message: `Erreur: ${error.message}`, type: 'error' })
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      
      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={Video} type="video/mp4" />
      </video>
      
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowLeft size={18} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
          Retour
        </button>

        <h1 style={styles.title}>
          <CreditCard size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Paiement
        </h1>

        {SIMULATION_MODE && (
          <div style={styles.simBadge}>
            🎮 MODE SIMULATION
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>
                <Mail size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Votre adresse email :
              </label>
              <input
                type="email"
                placeholder="exemple@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>
                <Phone size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Votre numéro de téléphone :
              </label>
              <input
                type="tel"
                placeholder="90123456 ou 229XXXXXXXX"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                style={styles.input}
                required
              />
              <p style={styles.phoneHint}>
                Entrez votre numéro Mobile Money (MTN, Moov)
              </p>
            </div>
            
            <button type="submit" style={styles.nextButton}>
              Continuer
            </button>
          </form>
        ) : (
          <>
            <div style={styles.priceCard}>
              <p style={styles.priceLabel}>Prix unique</p>
              <p style={styles.price}>{LIBRARY_ACCESS_PRICE} XOF</p>
              <p style={styles.priceDescription}>Accès illimité à vie</p>
            </div>

            <div style={styles.benefits}>
              <h3 style={styles.benefitsTitle}>Ce que vous obtenez :</h3>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  <Check size={18} style={{ color: '#10b981', marginRight: '0.5rem', flexShrink: 0 }} />
                  Accès illimité à tous les livres
                </li>
                <li style={styles.benefitItem}>
                  <Check size={18} style={{ color: '#10b981', marginRight: '0.5rem', flexShrink: 0 }} />
                  Téléchargement sans restriction
                </li>
                <li style={styles.benefitItem}>
                  <Check size={18} style={{ color: '#10b981', marginRight: '0.5rem', flexShrink: 0 }} />
                  Nouvelles publications régulières
                </li>
                <li style={styles.benefitItem}>
                  <Check size={18} style={{ color: '#10b981', marginRight: '0.5rem', flexShrink: 0 }} />
                  Accès à vie - un seul paiement
                </li>
              </ul>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                ...styles.payButton,
                ...(loading ? styles.payButtonDisabled : {}),
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', animation: 'spin 1s linear infinite' }} />
                  {SIMULATION_MODE ? 'Simulation...' : 'Chargement...'}
                </>
              ) : (
                <>
                  <CreditCard size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Payer Maintenant
                </>
              )}
            </button>

            <p style={styles.secureText}>
              {SIMULATION_MODE ? '🎮 Paiement simulé - Mode test' : '🔒 Paiement sécurisé par FedaPay'}
            </p>

            <button onClick={() => setStep('email')} style={styles.changeEmailButton}>
              Changer les informations
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function generateAccessToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgba(10, 56, 97, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative' as const,
    zIndex: 1,
  },
  simBadge: {
    background: '#f59e0b',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  backButton: {
    position: 'absolute' as const,
    top: '1rem',
    left: '1rem',
    background: 'transparent',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    color: '#667eea',
    marginBottom: '2rem',
    textAlign: 'center' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' },
  label: { 
    color: '#333', 
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.875rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.3s',
  },
  phoneHint: { fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' },
  nextButton: {
    background: '#667eea',
    color: 'white',
    padding: '0.875rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  priceCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  priceLabel: { fontSize: '1rem', opacity: 0.9, margin: '0 0 0.5rem 0' },
  price: { fontSize: '3rem', fontWeight: 'bold' as const, margin: '0' },
  priceDescription: { fontSize: '1rem', opacity: 0.9, margin: '0.5rem 0 0 0' },
  benefits: { marginBottom: '2rem' },
  benefitsTitle: { color: '#333', marginBottom: '1rem' },
  benefitsList: { 
    listStyle: 'none', 
    padding: 0, 
    margin: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#555',
  },
  payButton: {
    width: '100%',
    background: '#667eea',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.125rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  payButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  secureText: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  changeEmailButton: {
    width: '100%',
    background: 'transparent',
    color: '#667eea',
    padding: '0.75rem',
    border: '2px solid #667eea',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    transition: 'all 0.3s',
  },
  video: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    objectFit: 'cover' as const,
    opacity: 0.4,
    zIndex: 0,
    pointerEvents: 'none' as const,
  },
}

const loaderSheet = document.createElement('style')
loaderSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
document.head.appendChild(loaderSheet)