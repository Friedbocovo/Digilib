import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendOTPEmail, registerOTPPopupCallback } from '../services/emailService'
import { OTPPopup } from '../components/OTPPopup'
import { Popup } from '../components/Popup'
import Video from './vid_ebook2.mp4'

export default function AccessPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // États pour la popup OTP
  const [showOTPPopup, setShowOTPPopup] = useState(false)
  const [otpCode, setOTPCode] = useState('')

  useEffect(() => {
    const storedEmail = localStorage.getItem('user_email')
    if (storedEmail) {
      setIsReturningUser(true)
      setEmail(storedEmail)
    }

    // Enregistrer le callback pour afficher la popup OTP
    registerOTPPopupCallback((code: string) => {
      setOTPCode(code)
      setShowOTPPopup(true)
    })
  }, [])

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isReturningUser && !name.trim()) {
      setPopup({ message: 'Veuillez entrer votre nom', type: 'error' })
      return
    }

    if (!email.trim() || !phone.trim()) {
      setPopup({ message: 'Veuillez remplir tous les champs', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()
      const cleanPhone = phone.trim()

      // Vérifier si l'utilisateur a déjà payé
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .ilike('user_email', cleanEmail)
        .eq('phone_number', cleanPhone)
        .eq('status', 'completed')
        .limit(1)

      if (paymentData && paymentData.length > 0) {
        // Utilisateur a déjà payé → Générer et envoyer OTP
        const otpCode = generateOTP()
        setGeneratedOtp(otpCode)

        // Sauvegarder le code OTP dans Supabase
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expire dans 10 minutes
        
        await supabase.from('otp_codes').insert({
          code: otpCode,
          email: cleanEmail,
          expires_at: expiresAt.toISOString(),
          used: false
        })

        // Envoyer l'email OTP (ou afficher la popup en mode simulation)
        setPopup({ message: 'Génération du code...', type: 'info' })
        const emailSent = await sendOTPEmail(cleanEmail, otpCode)

        if (emailSent) {
          // Sauvegarder les infos en localStorage
          localStorage.setItem('user_email', cleanEmail)
          localStorage.setItem('user_phone', cleanPhone)
          if (!isReturningUser && name.trim()) {
            localStorage.setItem('user_name', name.trim())
          }

          setPopup({ message: 'Code généré ! Copiez-le depuis la popup', type: 'success' })
          setStep('otp')
        } else {
          setPopup({ message: 'Erreur lors de la génération du code. Veuillez réessayer.', type: 'error' })
        }
      } else {
        // Utilisateur n'a pas payé → Rediriger vers la page de paiement
        localStorage.setItem('user_email', cleanEmail)
        localStorage.setItem('user_phone', cleanPhone)
        if (!isReturningUser && name.trim()) {
          localStorage.setItem('user_name', name.trim())
        }

        setPopup({ message: 'Aucun paiement trouvé. Redirection...', type: 'info' })
        setTimeout(() => navigate('/payment'), 1500)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setPopup({ message: 'Une erreur est survenue', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      setPopup({ message: 'Le code doit contenir 6 chiffres', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()

      // Vérifier le code dans Supabase
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', cleanEmail)
        .eq('code', otp)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (otpError || !otpData || otpData.length === 0) {
        setPopup({ message: 'Code invalide ou expiré', type: 'error' })
        setLoading(false)
        return
      }

      // Marquer le code comme utilisé
      await supabase
        .from('otp_codes')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', otpData[0].id)

      // Générer un token d'accès
      const accessToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15)

      localStorage.setItem('library_access_token', accessToken)

      setPopup({ message: 'Accès autorisé ! Redirection...', type: 'success' })
      setTimeout(() => navigate('/library'), 1500)

    } catch (error) {
      console.error('Erreur:', error)
      setPopup({ message: 'Erreur de vérification', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      {/* Popup OTP personnalisée */}
      {showOTPPopup && (
        <OTPPopup 
          code={otpCode} 
          onClose={() => setShowOTPPopup(false)} 
        />
      )}

      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={Video} type="video/mp4" />
      </video>

      <div style={styles.overlay} />

      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>📚 DigiLib</h1>
          <p style={styles.subtitle}>
            {step === 'info' 
              ? 'Accédez à votre bibliothèque' 
              : 'Entrez le code de vérification'}
          </p>

          {step === 'info' ? (
            <form onSubmit={handleSubmitInfo} style={styles.form}>
              {!isReturningUser && (
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                disabled={isReturningUser}
              />

              <input
                type="tel"
                placeholder="Votre numéro de téléphone"
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

              {isReturningUser && (
                <p style={styles.info}>
                  Pas vous ? <button 
                    type="button"
                    onClick={() => {
                      setIsReturningUser(false)
                      setEmail('')
                      localStorage.removeItem('user_email')
                    }}
                    style={styles.linkButton}
                  >
                    Changer de compte
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={styles.form}>
              <p style={styles.otpInfo}>
                Un code à 6 chiffres a été généré.<br />
                <strong>Copiez-le depuis la popup ci-dessus</strong>
              </p>

              <input
                type="text"
                placeholder="Collez le code à 6 chiffres"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={styles.otpInput}
                maxLength={6}
                required
                autoFocus
              />

              <button 
                type="submit" 
                style={styles.button}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  // Réafficher la popup si nécessaire
                  if (otpCode) {
                    setShowOTPPopup(true)
                  }
                }}
                style={styles.resendButton}
              >
                🔄 Réafficher le code
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('info')
                  setOtp('')
                }}
                style={styles.backLink}
              >
                ← Retour
              </button>
            </form>
          )}
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
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%)',
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
  otpInput: {
    padding: '1.5rem',
    fontSize: '1.5rem',
    border: '2px solid #667eea',
    borderRadius: '12px',
    outline: 'none',
    textAlign: 'center' as const,
    letterSpacing: '0.5rem',
    fontWeight: '700',
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
  resendButton: {
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    padding: '0.875rem',
    border: '2px solid #667eea',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
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
  otpInfo: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    textAlign: 'center' as const,
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
}