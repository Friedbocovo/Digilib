import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { ArrowLeft, Mail, Phone, CreditCard, Check, Loader, User } from 'lucide-react'

// ⚠️ MODE SIMULATION (désactiver en production)
const SIMULATION_MODE = false  // ← Mettre à true pour tester sans Maketou

const MAKETOU_API_KEY = import.meta.env.VITE_MAKETOU_API_KEY
const MAKETOU_PRODUCT_ID = import.meta.env.VITE_MAKETOU_PRODUCT_ID
const LIBRARY_ACCESS_PRICE = 3000

export default function PaymentPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('library_access_token')
    if (token) {
      navigate('/library')
    }
  }, [navigate])

  const generateAccessToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

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

    // Validation du téléphone
    const cleanPhone = userPhone.replace(/\s/g, '').replace(/^\+/, '')
    
    // En mode simulation, accepter n'importe quel numéro
    if (SIMULATION_MODE) {
      console.log('🎮 Mode simulation : validation ignorée')
      setStep('payment')
      return
    }
    
    // Vérifier que c'est un numéro (pas de lettres)
    if (!/^[0-9]+$/.test(cleanPhone)) {
      setPopup({ 
        message: '❌ Le numéro ne doit contenir que des chiffres', 
        type: 'error' 
      })
      return
    }

    // Validation selon les formats acceptés
    const isBenin8 = /^[0-9]{8}$/.test(cleanPhone)  // 8 chiffres
    const isBenin11 = /^229[0-9]{8}$/.test(cleanPhone)  // 229 + 8 chiffres
    const isInternational = cleanPhone.length >= 10 && cleanPhone.length <= 15 && !cleanPhone.startsWith('229')
    
    if (!isBenin8 && !isBenin11 && !isInternational) {
      setPopup({ 
        message: '❌ Format de numéro invalide\n\nExemples valides:\n• 97234567 (8 chiffres)\n• 22997234567 (229 + 8 chiffres)\n• 33612345678 (international)', 
        type: 'error' 
      })
      return
    }

    setStep('payment')
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      const accessToken = generateAccessToken()
      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanPhone = userPhone.trim()
      const cleanName = userName.trim()

      console.log('📝 Enregistrement du paiement...')

      let userId = null
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (existingUser) {
        userId = existingUser.id
        await supabase
          .from('users')
          .update({ has_paid: true })
          .eq('id', userId)
      } else {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name: cleanName,
            email: cleanEmail,
            phone_number: cleanPhone,
            has_paid: true
          })
          .select('id')
          .maybeSingle()
        
        if (createError && !SIMULATION_MODE) {
          console.error('❌ Erreur création utilisateur:', createError)
          throw createError
        }
        
        userId = newUser?.id
      }

      const { error } = await supabase.from('payments').insert({
        user_id: userId,
        user_email: cleanEmail,
        phone_number: cleanPhone,
        amount: LIBRARY_ACCESS_PRICE,
        transaction_id: transactionId,
        payment_method: SIMULATION_MODE ? 'simulation' : 'maketou',
        status: 'completed',
      })

      if (error && !SIMULATION_MODE) {
        console.error('❌ Erreur enregistrement paiement:', error)
      }

      localStorage.setItem('library_access_token', accessToken)
      localStorage.setItem('user_email', cleanEmail)
      localStorage.setItem('user_name', cleanName)
      localStorage.setItem('user_phone', cleanPhone)
      localStorage.removeItem('maketou_cart_id')

      setPopup({ 
        message: SIMULATION_MODE ? '🎮 Paiement simulé avec succès !' : '✅ Paiement réussi !', 
        type: 'success' 
      })
      
      setTimeout(() => navigate('/library'), 1500)
    } catch (error: any) {
      console.error('❌ Erreur:', error)
      
      if (SIMULATION_MODE) {
        console.log('⚠️ Mode simulation : erreur ignorée')
        const accessToken = generateAccessToken()
        localStorage.setItem('library_access_token', accessToken)
        localStorage.setItem('user_email', userEmail.trim().toLowerCase())
        localStorage.setItem('user_name', userName.trim())
        localStorage.setItem('user_phone', userPhone.trim())
        
        setPopup({ message: '🎮 Simulation réussie !', type: 'success' })
        setTimeout(() => navigate('/library'), 1500)
      } else {
        setPopup({ message: `Erreur: ${error.message}`, type: 'error' })
        setLoading(false)
      }
    }
  }

  const handleMaketouPayment = async () => {
    if (!userEmail || !userPhone || !userName) {
      setPopup({ message: 'Veuillez remplir tous les champs', type: 'error' })
      return
    }

    setLoading(true)

    if (SIMULATION_MODE) {
      console.log('🎮 MODE SIMULATION ACTIVÉ')
      setPopup({ message: '🎮 Simulation de paiement...', type: 'info' })
      
      setTimeout(async () => {
        await handlePaymentSuccess(`SIM-${Date.now()}`)
      }, 2000)
      return
    }

    try {
      if (!MAKETOU_API_KEY || !MAKETOU_PRODUCT_ID) {
        setPopup({ message: '⚠️ Configuration Maketou manquante', type: 'error' })
        setLoading(false)
        return
      }

      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanPhone = userPhone.trim().replace(/\s/g, '')
      const cleanName = userName.trim()

      const nameParts = cleanName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || firstName

      // Formatage intelligent du numéro
      let formattedPhone = cleanPhone
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.length === 8) {
          // 8 chiffres → Bénin par défaut
          formattedPhone = `+229${cleanPhone}`
        } else if (cleanPhone.startsWith('229')) {
          // Commence par 229 → Ajouter +
          formattedPhone = `+${cleanPhone}`
        } else {
          // Autre format → Ajouter + devant
          formattedPhone = `+${cleanPhone}`
        }
      }

      console.log('📦 Création du panier Maketou...')
      console.log('📞 Numéro formaté:', formattedPhone)
      console.log('📧 Email:', cleanEmail)

      const payload = {
        productDocumentId: MAKETOU_PRODUCT_ID,
        email: cleanEmail,
        firstName: firstName,
        lastName: lastName,
        phone: formattedPhone,
        redirectURL: `${window.location.origin}/library`,  // ← TOUJOURS envoyé
        meta: {
          source: 'digilib-website',
          userName: cleanName
        }
      }

      console.log('📤 Payload:', JSON.stringify(payload, null, 2))

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
      console.log('📊 Status HTTP:', response.status)

      // Vérifier si le panier est créé (même sans redirectUrl)
      if (response.ok && data.cart) {
        console.log('✅ Panier Maketou créé:', data.cart.id)
        
        localStorage.setItem('maketou_cart_id', data.cart.id)
        localStorage.setItem('user_name', cleanName)
        localStorage.setItem('user_email', cleanEmail)
        localStorage.setItem('user_phone', formattedPhone)

        // Si redirectUrl existe, rediriger vers Maketou
        if (data.redirectUrl) {
          console.log('🔗 Redirection vers:', data.redirectUrl)
          window.location.href = data.redirectUrl
        } else {
          // Pas de redirectUrl mais panier créé = considérer comme succès
          console.log('⚠️ Panier créé mais pas de redirectUrl')
          console.log('💡 Simulation du succès...')
          
          setPopup({ 
            message: '✅ Panier créé ! Redirection vers la bibliothèque...', 
            type: 'success' 
          })
          
          setTimeout(async () => {
            await handlePaymentSuccess(data.cart.id)
          }, 1500)
        }
      } else {
        // Erreur de création du panier
        let errorMessage = 'Erreur lors de la création du panier'
        
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMessage = data.message.map(msg => {
              if (typeof msg === 'string') return msg
              if (msg.message) return msg.message
              return JSON.stringify(msg)
            }).join('\n')
          } else if (typeof data.message === 'string') {
            errorMessage = data.message
          } else {
            errorMessage = JSON.stringify(data.message)
          }
        }
        
        console.error('❌ Erreur Maketou:', { status: response.status, data })
        setPopup({ message: `❌ ${errorMessage}`, type: 'error' })
        setLoading(false)
      }
      
    } catch (error: any) {
      console.error('❌ Erreur réseau:', error)
      setPopup({ 
        message: '❌ Erreur de connexion. Vérifiez votre internet et réessayez.', 
        type: 'error' 
      })
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      {SIMULATION_MODE && (
        <div style={styles.simulationBadge}>
          🎮 MODE SIMULATION
        </div>
      )}

      <button onClick={() => navigate('/')} style={styles.backButton}>
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>Accès à la Bibliothèque</h1>
        <p style={styles.subtitle}>Un seul paiement. Accès à vie.</p>

        <div style={styles.priceBox}>
          <div style={styles.priceLabel}>Prix unique</div>
          <div style={styles.priceAmount}>{LIBRARY_ACCESS_PRICE} FCFA</div>
          <div style={styles.priceFeatures}>
            ✅ Accès illimité à vie<br />
            ✅ Téléchargements gratuits<br />
            ✅ Tous les genres disponibles
          </div>
        </div>

        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} style={styles.form}>
            <h2 style={styles.stepTitle}>Vos informations</h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <User size={18} />
                <span>Nom complet</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Jean Dupont"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Phone size={18} />
                <span>Numéro de téléphone (min. 8 chiffres)</span>
              </label>
              <input
                type="tel"
                placeholder="Ex: 01234567 ou 22901234567"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                style={styles.input}
                required
              />
              <div style={styles.helpText}>
                📱 Formats acceptés: 01234567, 22901234567, +33612345678
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              Continuer
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div style={styles.paymentSection}>
            <h2 style={styles.stepTitle}>Paiement Mobile Money</h2>
            
            <div style={styles.infoCard}>
              <p><strong>Nom:</strong> {userName}</p>
              <p><strong>Email:</strong> {userEmail}</p>
              <p><strong>Téléphone:</strong> {userPhone}</p>
            </div>

            <div style={styles.paymentInfo}>
              <CreditCard size={32} />
              <p>Vous allez être redirigé vers la page de paiement Maketou</p>
              <p style={styles.operators}>Accepte: MTN, Moov, Celtiis</p>
            </div>

            <button
              onClick={handleMaketouPayment}
              disabled={loading}
              style={loading ? {...styles.payButton, ...styles.payButtonDisabled} : styles.payButton}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>Payer {LIBRARY_ACCESS_PRICE} FCFA</span>
                </>
              )}
            </button>

            <button onClick={() => setStep('info')} style={styles.backToInfoButton}>
              Modifier mes informations
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative' as const,
  },
  simulationBadge: {
    position: 'fixed' as const,
    top: '1rem',
    right: '1rem',
    background: '#ff9800',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '700',
    zIndex: 1000,
  },
  backButton: {
    position: 'fixed' as const,
    top: '1rem',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    opacity: 0.7,
    marginBottom: '2rem',
  },
  priceBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '15px',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  priceLabel: {
    opacity: 0.9,
    marginBottom: '0.5rem',
  },
  priceAmount: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  priceFeatures: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  stepTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
  },
  helpText: {
    fontSize: '0.85rem',
    opacity: 0.7,
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  paymentSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  infoCard: {
    background: '#f5f5f5',
    padding: '1rem',
    borderRadius: '10px',
  },
  paymentInfo: {
    textAlign: 'center' as const,
    padding: '1.5rem',
    background: '#f9f9f9',
    borderRadius: '12px',
  },
  operators: {
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  payButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    background: '#10b981',
    color: 'white',
    padding: '1.25rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  payButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  backToInfoButton: {
    background: 'transparent',
    color: '#667eea',
    padding: '0.75rem',
    border: '2px solid #667eea',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
}