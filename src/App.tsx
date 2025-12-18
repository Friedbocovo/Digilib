import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AccessPage from './pages/AccessPage'
import PaymentPage from './pages/PaymentPage'
import LibraryPage from './pages/LibraryPage'
import BookDetailsPage from './pages/BookDetailsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import InstallPrompt from './components/InstallPrompt'


function App() {
  return (
    <Router>
            <InstallPrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
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