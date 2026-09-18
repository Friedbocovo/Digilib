import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { decodeCardPayload } from '../lib/memberCard'
import { Link } from 'react-router-dom'
import { QrCode, Upload } from 'lucide-react'

export default function AccessPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [mode, setMode] = useState<'form' | 'card'>('form')
  const [cardLoading, setCardLoading] = useState(false)
  const [cardPreviewUrl, setCardPreviewUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const storedCity = localStorage.getItem('user_city')
      if (storedCity) setCity(storedCity)

      const storedName = localStorage.getItem('user_name')
      if (storedName) setName(storedName)
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

  const grantAccess = (accessEmail: string, accessPhone: string, accessName?: string, accessCity?: string) => {
    const accessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('library_access_token', accessToken)
    localStorage.setItem('user_email', accessEmail)
    localStorage.setItem('user_phone', accessPhone)
    if (accessCity) localStorage.setItem('user_city', accessCity)
    if (accessName) localStorage.setItem('user_name', accessName)
    setPopup({ message: '✅ Accès autorisé ! Redirection...', type: 'success' })
    setTimeout(() => navigate('/library'), 1500)
  }

  const handleCardFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setCardPreviewUrl(imageUrl)
    setCardLoading(true)
    const scanStart = Date.now()
    const MIN_SCAN_TIME = 1600
    try {
      const image = new Image()
      const imageData: ImageData = await new Promise((resolve, reject) => {
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = image.naturalWidth
          canvas.height = image.naturalHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('canvas'))
            return
          }
          ctx.drawImage(image, 0, 0)
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
        }
        image.onerror = () => reject(new Error('image'))
        image.src = imageUrl
      })

      const code = jsQR(imageData.data, imageData.width, imageData.height)
      const payload = code ? decodeCardPayload(code.data) : null

      if (!payload) {
        setPopup({ message: 'QR code illisible sur cette image. Essayez le formulaire.', type: 'error' })
        return
      }

      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .ilike('user_email', payload.email)
        .eq('phone_number', payload.phone)
        .eq('status', 'completed')
        .limit(1)

      if (!paymentData?.length) {
        setPopup({ message: "Aucun accès valide trouvé pour cette carte.", type: 'error' })
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('name, city')
        .eq('email', payload.email)
        .maybeSingle()

      grantAccess(payload.email, payload.phone, userData?.name, userData?.city)
    } catch {
      setPopup({ message: 'Impossible de lire cette carte. Essayez le formulaire.', type: 'error' })
    } finally {
      const elapsed = Date.now() - scanStart
      if (elapsed < MIN_SCAN_TIME) await new Promise((r) => setTimeout(r, MIN_SCAN_TIME - elapsed))
      setCardLoading(false)
      URL.revokeObjectURL(imageUrl)
      setCardPreviewUrl('')
    }
  }

  return (
    <>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      {cardLoading && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 p-4">
          <div className="card-scan-frame relative w-full max-w-[260px] overflow-hidden rounded-xl border border-gold/30 bg-[#1c1410]">
            {cardPreviewUrl && <img src={cardPreviewUrl} alt="" className="block w-full" />}
            <div className="card-scan-line" />
            <span className="card-scan-corner card-scan-corner-tl" />
            <span className="card-scan-corner card-scan-corner-tr" />
            <span className="card-scan-corner card-scan-corner-bl" />
            <span className="card-scan-corner card-scan-corner-br" />
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
            <QrCode size={14} className="animate-pulse" />
            Analyse de la carte…
          </p>
        </div>
      )}

      <AuthCardLayout name={name} city={city} email={email} phone={phone}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Bureau des inscriptions</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-parchment">Carte d’entrée</h1>
          <p className="mt-2 text-sm text-muted">Retrouvez la salle ou commencez le parcours.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full border border-gold/25 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setMode('form')}
              className={`rounded-full py-2 text-xs uppercase tracking-[0.14em] transition ${
                mode === 'form' ? 'bg-gold text-ink' : 'text-muted'
              }`}
            >
              Formulaire
            </button>
            <button
              type="button"
              onClick={() => setMode('card')}
              className={`rounded-full py-2 text-xs uppercase tracking-[0.14em] transition ${
                mode === 'card' ? 'bg-gold text-ink' : 'text-muted'
              }`}
            >
              Ma carte
            </button>
          </div>

          {mode === 'card' ? (
            <div className="mt-6 flex flex-col gap-4">
              <p className="text-sm leading-6 text-muted">
                Uploadez l’image de votre carte de membre DigiLib. Le QR code présent sur la carte nous permet de
                vérifier votre accès instantanément.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCardFile(file)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                disabled={cardLoading}
                onClick={() => fileInputRef.current?.click()}
                className="btn-library bg-gold text-ink disabled:opacity-60"
              >
                {cardLoading ? (
                  <>
                    <QrCode size={14} className="animate-pulse" /> Vérification...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Uploader ma carte
                  </>
                )}
              </button>
              <Link to="/" className="text-center text-sm text-muted underline">
                Retour à l’accueil
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmitInfo} className="mt-6 flex flex-col gap-3">
            {!isReturningUser && (
              <>
                <input
                  type="text"
                  placeholder="Votre nom complet *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field"
                  required
                />

                <input
                  type="text"
                  placeholder="Votre ville *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="field"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Votre email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              required
              disabled={isReturningUser}
            />

            <input
              type="tel"
              placeholder="Votre numéro de téléphone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
              required
            />

            <button type="submit" disabled={loading} className="btn-library bg-gold text-ink disabled:opacity-60">
              {loading ? 'Vérification...' : 'Continuer'}
            </button>
            <Link to="/" className="text-center text-sm text-muted underline">
              Retour à l’accueil
            </Link>
            {isReturningUser && (
              <p className="text-center text-sm text-muted">
                Pas vous ?{' '}
                <button
                  type="button"
                  className="text-gold underline"
                  onClick={() => {
                    setIsReturningUser(false)
                    setEmail('')
                    setPhone('')
                    localStorage.removeItem('user_email')
                    localStorage.removeItem('user_phone')
                  }}
                >
                  Changer de compte
                </button>
              </p>
            )}
          </form>
          )}
      </AuthCardLayout>
    </>
  )
}
