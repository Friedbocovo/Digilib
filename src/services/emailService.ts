const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// ⚠️ MODE SIMULATION - Changez en false quand vous aurez un domaine vérifié sur Resend
const SIMULATION_MODE = true

// Variable globale pour stocker le callback de la popup
let showOTPPopupCallback: ((code: string) => void) | null = null

/**
 * Enregistrer le callback pour afficher la popup OTP
 * À appeler depuis AccessPage
 */
export const registerOTPPopupCallback = (callback: (code: string) => void) => {
  showOTPPopupCallback = callback
}

/**
 * Envoie un code OTP par email
 */
export const sendOTPEmail = async (email: string, code: string): Promise<boolean> => {
  console.log('📧 Tentative d\'envoi d\'email à:', email)
  console.log('🔑 Code OTP:', code)

  if (SIMULATION_MODE) {
    // Mode simulation : afficher le code dans une popup personnalisée
    if (showOTPPopupCallback) {
      showOTPPopupCallback(code)
      console.log('✅ Mode simulation : Code affiché dans la popup')
    } else {
      // Fallback si la popup n'est pas enregistrée
      alert(`🎮 MODE SIMULATION\n\n✅ Code OTP : ${code}\n\nCopiez ce code et collez-le pour vous connecter.`)
      console.log('✅ Mode simulation : Code affiché dans une alerte (fallback)')
    }
    return true
  }

  // Mode production avec Supabase Edge Function
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de l\'envoi')
    }

    const data = await response.json()
    console.log('✅ Email envoyé avec succès:', data)
    return true
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi:', error.message)
    return false
  }
}