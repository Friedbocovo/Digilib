import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
 import { Resend } from 'resend'
import Video from './vid_ebook2.mp4'

export default function PaymentCheckPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'check' | 'otp'>('check')
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const handleCheckPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userEmail || !userPhone) {
      setPopup({ message: 'Veuillez remplir tous les champs', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanPhone = userPhone.trim()

      console.log('🔍 Vérification du paiement pour:', { cleanEmail, cleanPhone })

      // Vérifier si l'utilisateur a déjà payé
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', cleanEmail)
        .eq('phone_number', cleanPhone)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)

      if (paymentError) {
        console.error('❌ Erreur Supabase:', paymentError)
        setPopup({ message: 'Erreur de vérification', type: 'error' })
        setLoading(false)
        return
      }

      // CAS 1: Paiement trouvé → Générer et envoyer OTP
      if (paymentData && paymentData.length > 0) {
        console.log('✅ Paiement trouvé ! Génération du code OTP...')
        await generateAndSendOTP(cleanEmail)
        setStep('otp')
        setPopup({ 
          message: 'Un code de vérification a été envoyé à votre email', 
          type: 'success' 
        })
      } 
      // CAS 2: Pas de paiement → Rediriger vers page de paiement
      else {
        console.log('❌ Aucun paiement trouvé - Redirection vers paiement')
        setPopup({ 
          message: 'Aucun paiement trouvé. Redirection vers la page de paiement...', 
          type: 'info' 
        })
        
        // Sauvegarder temporairement les infos pour la page de paiement
        localStorage.setItem('temp_email', cleanEmail)
        localStorage.setItem('temp_phone', cleanPhone)
        
        setTimeout(() => navigate('/payment'), 2000)
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      setPopup({ message: `Erreur: ${error.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const generateAndSendOTP = async (email: string) => {
    // Générer un code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // Expire dans 10 minutes

    console.log('🔑 Code OTP généré:', otpCode)

    try {
      // Sauvegarder le code OTP dans la base de données
      const { error: otpError } = await supabase
        .from('otp_codes')
        .insert({
          code: otpCode,
          email: email,
          expires_at: expiresAt.toISOString(),
          used: false
        })

      if (otpError) {
        console.error('❌ Erreur sauvegarde OTP:', otpError)
        throw otpError
      }

      // Envoyer l'email avec le code OTP
      await sendOTPEmail(email, otpCode)
      
      console.log('✅ OTP envoyé avec succès')
    } catch (error) {
      console.error('❌ Erreur génération/envoi OTP:', error)
      throw error
    }
  }

const resend = new Resend('re_votre_cle_api')

const sendOTPEmail = async (email: string, code: string) => {
  await resend.emails.send({
    from: 'Free Books <noreply@votre-domaine.com>',
    to: email,
    subject: 'Votre code d\'accès - Free Books',
    html: `
      <h1>Votre code d'accès</h1>
      <p>Voici votre code de vérification :</p>
      <h2 style="font-size: 32px; letter-spacing: 5px;">${code}</h2>
      <p>Ce code expire dans 10 minutes.</p>
    `
  })
}

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode || otpCode.length !== 6) {
      setPopup({ message: 'Code invalide. Le code doit contenir 6 chiffres', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const cleanEmail = userEmail.trim().toLowerCase()
      const cleanCode = otpCode.trim()

      console.log('🔍 Vérification du code OTP:', cleanCode)

      // Vérifier le code OTP dans la base de données
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('email', cleanEmail)
        .eq('used', false)
        .single()

      if (otpError || !otpData) {
        console.error('❌ Code invalide:', otpError)
        setPopup({ message: 'Code invalide ou expiré', type: 'error' })
        setLoading(false)
        return
      }

      // Vérifier si le code n'est pas expiré
      const expirationDate = new Date(otpData.expires_at)
      if (expirationDate < new Date()) {
        setPopup({ message: 'Ce code a expiré. Veuillez recommencer.', type: 'error' })
        setLoading(false)
        return
      }

      console.log('✅ Code OTP valide!')

      // Marquer le code comme utilisé
      await supabase
        .from('otp_codes')
        .update({ 
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('code', cleanCode)

      // Générer un token d'accès
      const accessToken = generateAccessToken()
      
      // Sauvegarder dans localStorage
      localStorage.setItem('library_access_token', accessToken)
      localStorage.setItem('user_email', cleanEmail)

      setPopup({ message: 'Connexion réussie ! Redirection...', type: 'success' })
      setTimeout(() => navigate('/library'), 1500)

    } catch (error) {
      console.error('❌ Erreur:', error)
      setPopup({ message: `Erreur: ${error.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setLoading(true)
    try {
      const cleanEmail = userEmail.trim().toLowerCase()
      await generateAndSendOTP(cleanEmail)
      setPopup({ message: 'Un nouveau code a été envoyé', type: 'success' })
    } catch (error) {
      setPopup({ message: 'Erreur lors du renvoi du code', type: 'error' })
    } finally {
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
          Retour
        </button>

        <h1 style={styles.title}>
          {step === 'check' ? 'Accès à la Bibliothèque' : 'Vérification'}
        </h1>

        {step === 'check' ? (
          <form onSubmit={handleCheckPayment} style={styles.form}>
            <label style={styles.label}>Adresse email :</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={styles.input}
              required
            />
            
            <label style={styles.label}>Numéro de téléphone :</label>
            <input
              type="tel"
              placeholder="229XXXXXXXX"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              style={styles.input}
              required
            />
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Vérification...' : 'Continuer'}
            </button>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                💡 Si vous avez déjà payé, un code de vérification sera envoyé à votre email. 
                Sinon, vous serez redirigé vers la page de paiement.
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.otpInfo}>
              <p style={styles.otpText}>
                Un code à 6 chiffres a été envoyé à :
              </p>
              <p style={styles.emailDisplay}>{userEmail}</p>
            </div>

            <label style={styles.label}>Code de vérification :</label>
            <input
              type="text"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{...styles.input, ...styles.otpInput}}
              required
              maxLength={6}
            />

            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>

            <button 
              type="button"
              onClick={resendOTP}
              disabled={loading}
              style={styles.resendButton}
            >
              Renvoyer le code
            </button>

            <button 
              type="button"
              onClick={() => setStep('check')} 
              style={styles.backLink}
            >
              ← Changer d'email/téléphone
            </button>
          </form>
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
    textDecoration: 'underline',
  },
  title: {
    fontSize: '2rem',
    color: '#667eea',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  label: {
    color: '#333',
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.875rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  otpInput: {
    textAlign: 'center' as const,
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
    letterSpacing: '10px',
  },
  submitButton: {
    background: '#667eea',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  infoBox: {
    background: '#e0e7ff',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid #667eea',
    marginTop: '0.5rem',
  },
  infoText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#4338ca',
    lineHeight: 1.5,
  },
  otpInfo: {
    background: '#f3f4f6',
    padding: '1rem',
    borderRadius: '10px',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  },
  otpText: {
    margin: '0 0 0.5rem 0',
    color: '#666',
    fontSize: '0.9rem',
  },
  emailDisplay: {
    margin: 0,
    color: '#667eea',
    fontWeight: 'bold' as const,
    fontSize: '1.1rem',
  },
  resendButton: {
    background: 'transparent',
    color: '#667eea',
    padding: '0.75rem',
    border: '2px solid #667eea',
    borderRadius: '10px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  backLink: {
    background: 'transparent',
    border: 'none',
    color: '#667eea',
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
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