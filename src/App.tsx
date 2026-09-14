import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SplashScreen } from './components/SplashScreen'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import CatalogPage from './pages/CatalogPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import AccessPage from './pages/AccessPage'
import PaymentPage from './pages/PaymentPage'
import LibraryPage from './pages/LibraryPage'
import BookDetailsPage from './pages/BookDetailsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import InstallPrompt from './components/InstallPrompt'

function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('digilib_splash_seen'))

  useEffect(() => {
    if (showSplash) sessionStorage.setItem('digilib_splash_seen', '1')
  }, [showSplash])

  return (
    <Router>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
        <Route path="/catalogue" element={<CatalogPage />} />
        <Route path="/tarifs" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book/:bookId" element={<BookDetailsPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App
