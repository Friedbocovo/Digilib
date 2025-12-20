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
  Loader,
  User
} from 'lucide-react'
import Video from './vid_ebook2.mp4'

// ⚠️ MODE SIMULATION 
const SIMULATION_MODE = false

const MAKETOU_API_KEY = import.meta.env.VITE_MAKETOU_API_KEY || ''
const MAKETOU_PRODUCT_ID = import.meta.env.VITE_MAKETOU_PRODUCT_ID || ''
const LIBRARY_ACCESS_PRICE = 5000

export default function PaymentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const tempName = localStorage.getItem('user_name')
    const tempEmail = localStorage.getItem('user_email')
    const tempPhone = localStorage.getItem('user_phone')
    
    if (tempName) setUserName(tempName)
    if (tempEmail) setUserEmail(tempEmail)
    if (tempPhone) setUserPhone(tempPhone)
    
    if (tempEmail && tempPhone) {
      setStep('payment')
    }
  }, [])

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userName.trim()) {
      setPopup({ message: 'Veuillez entrer votre nom', type: 'error' })
      return
    }

    if (!userEmail.includes('@')) {
      setPopup({ message: 'Veuillez entrer un email valide', type: 'error' })
      return
    }

    // Validation du téléphone spécifique au Bénin
    const cleanPhone = userPhone.replace(/\s/g, '').replace(/^\+/, '')
    
    // Format Bénin : doit commencer par 01 (8 chiffres) ou 22901 (11 chiffres)
    const isBeninFormat8 = /^[0-9]{8}$/.test(cleanPhone) // 01XXXXXXXX ( chiffres)
    const isBeninFormat11 = /^22901[0-9]{8}$/.test(cleanPhone) // 22901XXXXXXXX (13 chiffres)
    
    // Format international (10-15 chiffres, mais pas Bénin)
    const isInternational = /^[0-9]{10,15}$/.test(cleanPhone) && !cleanPhone.startsWith('229')
    
    if (!isBeninFormat8 && !isBeninFormat11 && !isInternational) {
      setPopup({ 
        message: 'Format de numéro invalide.\n\nFormats acceptés :\n• Bénin : 01XXXXXXXX (ex: 0197234567)\n• Bénin : 22901XXXXXXXX (ex: 2299701234567)\n• International : +33612345678', 
        type: 'error' 
      })
      return
    }

    setStep('payment')
  }

  const handleMaketouPayment = async () => {
    if (!userEmail || !userPhone || !userName) {
      setPopup({ message: 'Veuillez remplir tous les champs', type: 'error' })
      return
    }

    setLoading(true)

    if (SIMULATION_MODE) {
      console.log('🎮 MODE SIMULATION ACTIVÉ')
      setPopup({ message: 'Simulation de paiement en cours...', type: 'info' })
      
      setTimeout(async () => {
        await handlePaymentSuccess(`SIM-${Date.now()}`)
      }, 2000)
      
    } else {
      // MODE PRODUCTION : Maketou
      try {
        if (!MAKETOU_API_KEY || !MAKETOU_PRODUCT_ID) {
          setPopup({ message: 'Configuration Maketou manquante', type: 'error' })
          setLoading(false)
          return
        }

        const cleanEmail = userEmail.trim().toLowerCase()
        const cleanPhone = userPhone.trim().replace(/\s/g, '')
        const cleanName = userName.trim()

        // Diviser le nom en prénom et nom
        const nameParts = cleanName.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || firstName

        // Formater le numéro de téléphone pour Bénin
        let formattedPhone = cleanPhone
        if (!cleanPhone.startsWith('+')) {
          // Si le numéro commence par 22901, ajouter le +
          if (cleanPhone.startsWith('22901')) {
            formattedPhone = `+${cleanPhone}`
          }
          // Si c'est un numéro à 10 chiffres commençant par 01 (Bénin), ajouter +229
          else if (cleanPhone.length === 10 && cleanPhone.startsWith('01')) {
            formattedPhone = `+229${cleanPhone}`
          }
          // Sinon, ajouter le + pour international
          else {
            formattedPhone = `+${cleanPhone}`
          }
        }

        console.log('📦 Création du panier Maketou...')
        console.log('📞 Numéro formaté:', formattedPhone)

        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        
        const payload: any = {
          productDocumentId: MAKETOU_PRODUCT_ID,
          email: cleanEmail,
          firstName: firstName,
          lastName: lastName,
          phone: formattedPhone,
          meta: {
            source: 'digilib-website',
            userName: cleanName
          }
        }

        if (!isLocalhost) {
          payload.redirectURL = `${window.location.origin}/library`
        }

        console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2))

        const response = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAKETOU_API_KEY}`
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        console.log('📥 Réponse Maketou:', data)

        if (response.ok && data.redirectUrl) {
          console.log('✅ Panier créé:', data.cart.id)
          
          localStorage.setItem('maketou_cart_id', data.cart.id)
          localStorage.setItem('user_name', cleanName)
          localStorage.setItem('user_email', cleanEmail)
          localStorage.setItem('user_phone', formattedPhone)

          window.location.href = data.redirectUrl
        } else {
          // Gérer les erreurs de format de numéro spécifiquement
          let errorMessage = 'Erreur lors de la création du panier'
          
          if (data.message) {
            // Si c'est une erreur de validation du numéro
            if (JSON.stringify(data.message).includes('phoneNumber') || 
                JSON.stringify(data.message).includes('phone')) {
              errorMessage = `Format de numéro invalide.\n\nFormats acceptés:\n• Bénin: 0190123456 ou 2290190123456\n• International: +33612345678`
            }
            // Sinon, extraire le message d'erreur
            else if (Array.isArray(data.message)) {
              const messages = data.message.map(msg => {
                if (typeof msg === 'string') return msg
                if (msg.message) return msg.message
                if (msg.error) return msg.error
                return 'Erreur inconnue'
              }).filter(msg => msg !== 'Erreur inconnue')
              errorMessage = messages.length > 0 ? messages.join(', ') : errorMessage
            } else if (typeof data.message === 'string') {
              errorMessage = data.message
            }
          }
          
          console.error('❌ Erreur Maketou:', data)
          setPopup({ message: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        }
        
      } catch (error: any) {
        console.error('❌ Erreur Maketou:', error)
        setPopup({ 
          message: error.message || 'Erreur de paiement. Veuillez réessayer.', 
          type: 'error' 
        })
        setLoading(false)
      }
    }
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      const accessToken = generateAccessToken()
      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanPhone = userPhone.trim()
      const cleanName = userName.trim()

      console.log('📝 Enregistrement du paiement dans Supabase...')

      let userId = null
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .single()

      if (existingUser) {
        userId = existingUser.id
        await supabase
          .from('users')
          .update({ has_paid: true })
          .eq('id', userId)
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            name: cleanName,
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
        payment_method: SIMULATION_MODE ? 'simulation' : 'maketou',
        status: 'completed',
      }).select()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setPopup({ message: 'Erreur d\'enregistrement. Contactez le support.', type: 'error' })
        setLoading(false)
        return
      }

      console.log('✅ Paiement enregistré:', data)

      localStorage.setItem('library_access_token', accessToken)
      localStorage.setItem('user_email', cleanEmail)
      localStorage.setItem('user_name', cleanName)
      localStorage.setItem('user_phone', cleanPhone)
      localStorage.removeItem('maketou_cart_id')

      setPopup({ 
        message: SIMULATION_MODE ? '🎮 Paiement simulé avec succès !' : 'Paiement réussi !', 
        type: 'success' 
      })
      
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

        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>
                <User size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Votre nom complet :
              </label>
              <input
                type="text"
                placeholder="Jean Dupont"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

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
                placeholder="01234567 ou 22901234567"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                style={styles.input}
                required
              />
              <div style={styles.phoneHintBox}>
                <p style={styles.phoneHint}>
                  <strong>Formats acceptés :</strong>
                </p>
                <ul style={styles.phoneHintList}>
                  <li>🇧🇯 Bénin : 01234567 (10 chiffres commençant par 01)</li>
                  <li>🇧🇯 Bénin : 22901234567 (avec indicatif pays)</li>
                  <li>🌍 International : +33612345678</li>
                </ul>
              </div>
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
              onClick={handleMaketouPayment}
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
              {SIMULATION_MODE ? '🎮 Paiement simulé - Mode test' : '🔒 Paiement sécurisé par Maketou'}
            </p>

            <button onClick={() => setStep('info')} style={styles.changeInfoButton}>
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
  phoneHintBox: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },
  phoneHint: { 
    fontSize: '0.875rem', 
    color: '#0369a1', 
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold' as const,
  },
  phoneHintList: {
    fontSize: '0.875rem',
    color: '#075985',
    margin: 0,
    paddingLeft: '1.5rem',
    listStyle: 'none',
  },
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
  changeInfoButton: {
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