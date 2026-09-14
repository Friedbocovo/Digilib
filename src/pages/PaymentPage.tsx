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
  User,
  MapPin
} from 'lucide-react'
import { AuthCardLayout } from '../components/AuthCardLayout'

// ⚠️ MODE SIMULATION 
const SIMULATION_MODE = false

const MAKETOU_API_KEY = import.meta.env.VITE_MAKETOU_API_KEY || ''
const MAKETOU_PRODUCT_ID = import.meta.env.VITE_MAKETOU_PRODUCT_ID || ''
const LIBRARY_ACCESS_PRICE = 2000

export default function PaymentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userCity, setUserCity] = useState('')
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const tempName = localStorage.getItem('user_name')
    const tempEmail = localStorage.getItem('user_email')
    const tempPhone = localStorage.getItem('user_phone')
    const tempCity = localStorage.getItem('user_city')

    if (!tempEmail || !tempPhone) {
      navigate('/access')
      return
    }

    if (tempName) setUserName(tempName)
    setUserEmail(tempEmail)
    setUserPhone(tempPhone)
    if (tempCity) setUserCity(tempCity)

    setStep('payment')
  }, [navigate])

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

    if (!userCity.trim()) {
      setPopup({ message: 'Veuillez entrer votre ville', type: 'error' })
      return
    }

    localStorage.setItem('user_name', userName.trim())
    localStorage.setItem('user_email', userEmail.trim().toLowerCase())
    localStorage.setItem('user_phone', userPhone.trim())
    localStorage.setItem('user_city', userCity.trim())

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
    <>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      <AuthCardLayout
        name={userName}
        city={userCity}
        email={userEmail}
        phone={userPhone}
        hint={
          step === 'info'
            ? 'Modifiez vos informations : la carte se met à jour en direct.'
            : 'Vos informations sont inscrites sur votre carte DigiLib.'
        }
      >
        <button type="button" onClick={() => navigate('/access')} className="mb-4 inline-flex items-center gap-2 text-sm text-gold">
          <ArrowLeft size={18} />
          Retour
        </button>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
          {step === 'info' ? 'Modification' : 'Caisse'}
        </p>
        <h1 className="mt-2 flex items-center gap-2 font-display text-4xl font-semibold text-parchment">
          <CreditCard size={28} />
          {step === 'info' ? 'Vos informations' : 'Carte d’entrée'}
        </h1>

        {SIMULATION_MODE && (
          <p className="mt-4 rounded-full bg-gold/20 px-4 py-2 text-center text-sm text-gold-bright">
            Mode simulation
          </p>
        )}

        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              <User size={16} />
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="field"
              required
            />

            <label className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={16} />
              Ville
            </label>
            <input
              type="text"
              placeholder="Cotonou"
              value={userCity}
              onChange={(e) => setUserCity(e.target.value)}
              className="field"
              required
            />

            <label className="flex items-center gap-2 text-sm text-muted">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="field"
              required
            />

            <label className="flex items-center gap-2 text-sm text-muted">
              <Phone size={16} />
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="01234567 ou 22901234567"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="field"
              required
            />
            <div className="rounded-2xl border border-line bg-ink/30 p-3 text-xs text-muted">
              <p className="font-medium text-parchment">Formats acceptés</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Bénin : 01234567 (10 chiffres, commence par 01)</li>
                <li>Bénin : 22901234567 (avec indicatif)</li>
                <li>International : +33612345678</li>
              </ul>
            </div>

            <button type="submit" className="btn-library bg-gold text-ink">
              Continuer
            </button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6 text-center">
              <p className="text-sm text-muted">Prix unique</p>
              <p className="font-display text-5xl font-semibold text-gold">{LIBRARY_ACCESS_PRICE} XOF</p>
              <p className="mt-1 text-sm text-muted">Accès illimité à vie</p>
            </div>

            <div>
              <h3 className="font-display text-xl text-parchment">Ce que vous obtenez</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {[
                  'Accès illimité à tous les livres',
                  'Téléchargement sans restriction',
                  'Nouvelles publications régulières',
                  'Accès à vie — un seul paiement',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleMaketouPayment}
              disabled={loading}
              className="btn-library flex items-center justify-center gap-2 bg-gold text-ink disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {SIMULATION_MODE ? 'Simulation…' : 'Chargement…'}
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Payer maintenant
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted">
              {SIMULATION_MODE ? 'Paiement simulé — mode test' : 'Paiement sécurisé par Maketou'}
            </p>

            <button
              type="button"
              onClick={() => setStep('info')}
              className="rounded-full border border-line py-2.5 text-sm text-gold transition hover:border-gold/50"
            >
              Changer les informations
            </button>
          </div>
        )}
      </AuthCardLayout>
    </>
  )
}

function generateAccessToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
