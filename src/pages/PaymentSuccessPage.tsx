import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const cartId = localStorage.getItem('maketou_cart_id')
    const MAKETOU_API_KEY = import.meta.env.VITE_MAKETOU_API_KEY

    if (!cartId) {
      navigate('/payment')
      return
    }

    try {
      // Vérifier le statut du panier Maketou
      const response = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        headers: {
          'Authorization': `Bearer ${MAKETOU_API_KEY}`
        }
      })

      const cart = await response.json()

      if (cart.status === 'completed') {
        // Enregistrer le paiement
        const paymentId = cart.paymentId
        // Appeler handlePaymentSuccess...
        navigate('/library')
      } else {
        navigate('/payment')
      }
    } catch (error) {
      console.error('Erreur vérification:', error)
      navigate('/payment')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      {checking ? 'Vérification du paiement...' : 'Redirection...'}
    </div>
  )
}