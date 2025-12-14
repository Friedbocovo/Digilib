import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { Book, LucideIcon } from 'lucide-react'
import { 
  Settings, 
  LogOut, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  FolderOpen, 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Download,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  created_at: string
}

interface Book {
  id: string
  title: string
  author?: string
  description: string
  cover_url: string
  drive_link: string
  drive_file_id?: string
  category_id?: string
  file_size?: string
  pages?: number
  language?: string
  published_year?: number
  downloads: number
  views: number
  created_at: string
}

interface Payment {
  id: number
  user_id?: string
  user_email: string
  phone_number: string
  amount: number
  transaction_id?: string
  payment_method: string
  status: string
  created_at: string
  users?: {
    name: string
  }
}

interface User {
  id: string
  name: string
  email: string
  phone_number: string
  created_at: string
}

const IconMap: { [key: string]: LucideIcon } = {
  Book: Book,
}

const getLucideIcon = (iconName: string, size = 20, color = 'white') => {
  const IconComponent = IconMap[iconName]
  if (IconComponent) {
    return <IconComponent size={size} color={color} />
  }
  return <Book size={size} color={color} /> 
}

const getDirectImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/150x200/667eea/ffffff?text=Livre'
  
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    return url
  }
  
  let fileId = ''
  
  if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([^\/]+)/)
    if (match) fileId = match[1]
  } else if (url.includes('id=')) {
    const match = url.match(/id=([^&]+)/)
    if (match) fileId = match[1]
  } else if (url.length > 20 && !url.includes('/')) {
    fileId = url
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  
  return url || 'https://via.placeholder.com/150x200/667eea/ffffff?text=Livre'
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'categories' | 'books' | 'payments'>('payments')
  const [categories, setCategories] = useState<Category[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#667eea', icon: 'Book' })
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    drive_link: '',
    drive_file_id: '',
    category_id: '',
    file_size: '',
    pages: '',
    language: '',
    published_year: ''
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (activeTab === 'categories') loadCategories()
    else if (activeTab === 'books') loadBooks()
    else if (activeTab === 'payments') loadPayments()
  }, [activeTab])

  const checkAdminAccess = async () => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      navigate('/admin-login')
      return
    }
    await loadPayments()
  }

  const loadCategories = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setPopup({ message: 'Erreur de chargement des catégories', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error loading books:', error)
      setPopup({ message: 'Erreur de chargement des livres', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    setLoading(true)
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          users (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (paymentsError) throw paymentsError

      setPayments(paymentsData || [])

      const completed = paymentsData?.filter(p => p.status === 'completed') || []
      const pending = paymentsData?.filter(p => p.status === 'pending') || []
      const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount), 0)
      const uniqueUsers = new Set(completed.map(p => p.user_email))

      setStats({
        totalUsers: uniqueUsers.size,
        totalRevenue,
        completedPayments: completed.length,
        pendingPayments: pending.length
      })

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])

    } catch (error) {
      console.error('Error loading payments:', error)
      setPopup({ message: 'Erreur de chargement des paiements', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.color) {
      setPopup({ message: 'Veuillez remplir tous les champs', type: 'error' })
      return
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryForm)
          .eq('id', editingCategory.id)

        if (error) throw error
        setPopup({ message: 'Catégorie modifiée avec succès', type: 'success' })
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryForm])

        if (error) throw error
        setPopup({ message: 'Catégorie créée avec succès', type: 'success' })
      }

      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', color: '#667eea', icon: 'Book' })
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      setPopup({ message: 'Erreur lors de la sauvegarde', type: 'error' })
    }
  }

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.drive_link) {
      setPopup({ message: 'Veuillez remplir au moins le titre et le lien Drive', type: 'error' })
      return
    }

    try {
      const bookData = {
        ...bookForm,
        pages: bookForm.pages ? parseInt(bookForm.pages) : null,
        published_year: bookForm.published_year ? parseInt(bookForm.published_year) : null,
        downloads: 0,
        views: 0
      }

      if (editingBook) {
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id)

        if (error) throw error
        setPopup({ message: 'Livre modifié avec succès', type: 'success' })
      } else {
        const { error } = await supabase
          .from('books')
          .insert([bookData])

        if (error) throw error
        setPopup({ message: 'Livre ajouté avec succès', type: 'success' })
      }

      setShowBookModal(false)
      setEditingBook(null)
      setBookForm({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        drive_link: '',
        drive_file_id: '',
        category_id: '',
        file_size: '',
        pages: '',
        language: '',
        published_year: ''
      })
      loadBooks()
    } catch (error) {
      console.error('Error saving book:', error)
      setPopup({ message: 'Erreur lors de la sauvegarde', type: 'error' })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPopup({ message: 'Catégorie supprimée', type: 'success' })
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      setPopup({ message: 'Erreur lors de la suppression', type: 'error' })
    }
  }

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPopup({ message: 'Livre supprimé', type: 'success' })
      loadBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      setPopup({ message: 'Erreur lors de la suppression', type: 'error' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin-login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
  }

  return (
    <div style={styles.container}>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      <header style={styles.header}>
        <h1 style={styles.logo}>
          <Settings size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
         <span className="md:flex hidden "> Admin Dashboard</span> <span className="md:hidden flex text-2xl  "> Admin D...</span>

        </h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          <span className="md:flex hidden">Déconnexion</span>
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Users size={40} style={{ marginBottom: '0.5rem' }} />
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Utilisateurs payants</div>
          </div>

          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <DollarSign size={40} style={{ marginBottom: '0.5rem' }} />
            <div style={styles.statValue}>{formatAmount(stats.totalRevenue)}</div>
            <div style={styles.statLabel}>Revenus totaux</div>
          </div>

          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <CheckCircle size={40} style={{ marginBottom: '0.5rem' }} />
            <div style={styles.statValue}>{stats.completedPayments}</div>
            <div style={styles.statLabel}>Paiements réussis</div>
          </div>

          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Clock size={40} style={{ marginBottom: '0.5rem' }} />
            <div style={styles.statValue}>{stats.pendingPayments}</div>
            <div style={styles.statLabel}>Paiements en attente</div>
          </div>
        </div>

        <div style={styles.tabs} className="md:flex grid">
          <button
            onClick={() => setActiveTab('payments')}
            style={{
              ...styles.tab,
              ...(activeTab === 'payments' ? styles.activeTab : {})
            }}
          >
            <CreditCard size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Paiements ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              ...styles.tab,
              ...(activeTab === 'categories' ? styles.activeTab : {})
            }}
          >
            <FolderOpen size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Catégories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              ...styles.tab,
              ...(activeTab === 'books' ? styles.activeTab : {})
            }}
          >
            <BookOpen size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Livres ({books.length})
          </button>
        </div>

        <div style={styles.tabContent}>
          {loading ? (
            <div style={styles.loading}>Chargement...</div>
          ) : (
            <>
              {activeTab === 'payments' && (
                <div>
                  <h2 style={styles.sectionTitle}>Liste des paiements</h2>
                  
                  {payments.length === 0 ? (
                    <p style={styles.emptyMessage}>Aucun paiement pour le moment</p>
                  ) : (
                    <div style={styles.tableContainer}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Téléphone</th>
                            <th style={styles.th}>Montant</th>
                            <th style={styles.th}>Méthode</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Transaction ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} style={styles.tr}>
                              <td style={styles.td}>
                                <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#999' }} />
                                {formatDate(payment.created_at)}
                              </td>
                              <td style={styles.td}>
                                <strong>{payment.users?.name || 'N/A'}</strong>
                              </td>
                              <td style={styles.td}>
                                <Mail size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#999' }} />
                                {payment.user_email}
                              </td>
                              <td style={styles.td}>
                                <Phone size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#999' }} />
                                {payment.phone_number}
                              </td>
                              <td style={styles.td}>
                                <strong>{formatAmount(payment.amount)}</strong>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.methodBadge}>
                                  {payment.payment_method}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <span style={{
                                  ...styles.statusBadge,
                                  ...(payment.status === 'completed' 
                                    ? styles.statusCompleted 
                                    : payment.status === 'pending'
                                    ? styles.statusPending
                                    : styles.statusFailed)
                                }}>
                                  {payment.status === 'completed' && <CheckCircle size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />}
                                  {payment.status === 'pending' && <Clock size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />}
                                  {payment.status === 'completed' ? 'Réussi' :
                                   payment.status === 'pending' ? 'En attente' :
                                   'Échoué'}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <small style={{ color: '#999', fontFamily: 'monospace' }}>
                                  {payment.transaction_id || '-'}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h2 style={{ ...styles.sectionTitle, marginTop: '3rem' }}>
                    Utilisateurs inscrits ({users.length})
                  </h2>
                  
                  {users.length === 0 ? (
                    <p style={styles.emptyMessage}>Aucun utilisateur inscrit</p>
                  ) : (
                    <div style={styles.usersGrid}>
                      {users.map((user) => (
                        <div key={user.id} style={styles.userCard}>
                          <div style={styles.userAvatar}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={styles.userInfo}>
                            <h3 style={styles.userName}>{user.name}</h3>
                            <p style={styles.userEmail}>
                              <Mail size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                              {user.email}
                            </p>
                            <p style={styles.userPhone}>
                              <Phone size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                              {user.phone_number}
                            </p>
                            <p style={styles.userDate}>
                              <Calendar size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                              Inscrit le {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Catégories</h2>
                    <button
                      onClick={() => {
                        setEditingCategory(null)
                        setCategoryForm({ name: '', description: '', color: '#667eea', icon: 'Book' })
                        setShowCategoryModal(true)
                      }}
                      style={styles.addButton}
                    >
                      <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      <span className='md:flex hidden'>Nouvelle catégorie</span>
                    </button>
                  </div>

                  <div style={styles.grid}>
                    {categories.map((category) => (
                      <div key={category.id} style={styles.categoryCard}>
                        <div style={{ ...styles.categoryIcon, background: category.color }}>
                          {category.icon}
                        </div>
                        <h3 style={styles.categoryName}>{category.name}</h3>
                        <p style={styles.categoryDesc}>{category.description}</p>
                        <div style={styles.cardActions}>
                          <button
                            onClick={() => {
                              setEditingCategory(category)
                              setCategoryForm({
                                name: category.name,
                                description: category.description || '',
                                color: category.color,
                                icon: category.icon
                              })
                              setShowCategoryModal(true)
                            }}
                            style={styles.editButton}
                          >
                            <Edit2 size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            style={styles.deleteButton}
                          >
                            <Trash2 size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'books' && (
                <div>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Livres</h2>
                    <button
                      onClick={() => {
                        setEditingBook(null)
                        setBookForm({
                          title: '',
                          author: '',
                          description: '',
                          cover_url: '',
                          drive_link: '',
                          drive_file_id: '',
                          category_id: '',
                          file_size: '',
                          pages: '',
                          language: '',
                          published_year: ''
                        })
                        setShowBookModal(true)
                      }}
                      style={styles.addButton}
                    >
                      <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Nouveau livre
                    </button>
                  </div>

                  <div style={styles.grid}>
                    {books.map((book) => (
                      <div key={book.id} style={styles.bookCard}>
                        <img
                          src={getDirectImageUrl(book.cover_url)}
                          alt={book.title}
                          style={styles.bookCover}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150x200/667eea/ffffff?text=Livre'
                          }}
                        />
                        <div style={styles.bookInfo}>
                          <h3 style={styles.bookTitle}>{book.title}</h3>
                          {book.author && <p style={styles.bookAuthor}>{book.author}</p>}
                          <div style={styles.bookStats}>
                            <span>
                              <Eye size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                              {book.views}
                            </span>
                            <span>
                              <Download size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                              {book.downloads}
                            </span>
                          </div>
                          <div style={styles.cardActions}>
                            <button
                              onClick={() => {
                                setEditingBook(book)
                                setBookForm({
                                  title: book.title,
                                  author: book.author || '',
                                  description: book.description,
                                  cover_url: book.cover_url,
                                  drive_link: book.drive_link,
                                  drive_file_id: book.drive_file_id || '',
                                  category_id: book.category_id || '',
                                  file_size: book.file_size || '',
                                  pages: book.pages?.toString() || '',
                                  language: book.language || '',
                                  published_year: book.published_year?.toString() || ''
                                })
                                setShowBookModal(true)
                              }}
                              style={styles.editButton}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              style={styles.deleteButton}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCategoryModal && (
        <div style={styles.modal} onClick={() => setShowCategoryModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }} style={styles.form}>
              <label style={styles.label}>Nom</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                style={styles.input}
                required
              />

              <label style={styles.label}>Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                style={styles.textarea}
                rows={3}
              />

              <label style={styles.label}>Icône (emoji)</label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                style={styles.input}
                placeholder="📚"
              />

              <label style={styles.label}>Couleur</label>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                style={styles.colorInput}
              />

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={styles.cancelButton}>
                  Annuler
                </button>
                <button type="submit" style={styles.saveButton}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookModal && (
        <div style={styles.modal} onClick={() => setShowBookModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingBook ? 'Modifier le livre' : 'Nouveau livre'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBook(); }} style={styles.form}>
              <label style={styles.label}>Titre *</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                style={styles.input}
                required
              />

              <label style={styles.label}>Auteur</label>
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                style={styles.input}
              />

              <label style={styles.label}>Description</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                style={styles.textarea}
                rows={4}
              />

              <label style={styles.label}>Catégorie</label>
              <select
                value={bookForm.category_id}
                onChange={(e) => setBookForm({ ...bookForm, category_id: e.target.value })}
                style={styles.input}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <label style={styles.label}>URL de couverture (Google Drive)</label>
              <input
                type="text"
                value={bookForm.cover_url}
                onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })}
                style={styles.input}
                placeholder="https://drive.google.com/file/d/1abc123.../view"
              />
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                💡 Astuce : Partagez l'image publiquement sur Drive et copiez le lien complet
              </p>

              <label style={styles.label}>Lien Google Drive *</label>
              <input
                type="text"
                value={bookForm.drive_link}
                onChange={(e) => setBookForm({ ...bookForm, drive_link: e.target.value })}
                style={styles.input}
                placeholder="https://drive.google.com/file/d/..."
                required
              />

              <label style={styles.label}>ID fichier Drive (optionnel)</label>
              <input
                type="text"
                value={bookForm.drive_file_id}
                onChange={(e) => setBookForm({ ...bookForm, drive_file_id: e.target.value })}
                style={styles.input}
                placeholder="1dkPeFZDNDsU_3-B_..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={styles.label}>Langue</label>
                  <input
                    type="text"
                    value={bookForm.language}
                    onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                    style={styles.input}
                    placeholder="Français"
                  />
                </div>

                <div>
                  <label style={styles.label}>Taille du fichier</label>
                  <input
                    type="text"
                    value={bookForm.file_size}
                    onChange={(e) => setBookForm({ ...bookForm, file_size: e.target.value })}
                    style={styles.input}
                    placeholder="2.5 MB"
                  />
                </div>

                <div>
                  <label style={styles.label}>Nombre de pages</label>
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Année de publication</label>
                  <input
                    type="number"
                    value={bookForm.published_year}
                    onChange={(e) => setBookForm({ ...bookForm, published_year: e.target.value })}
                    style={styles.input}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowBookModal(false)} style={styles.cancelButton}>
                  Annuler
                </button>
                <button type="submit" style={styles.saveButton}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    background: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logo: { margin: 0, color: '#667eea', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' },
  logoutButton: {
    padding: '0.6rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
  },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    color: 'white',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statValue: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  statLabel: { fontSize: '0.9rem', opacity: 0.9 },
  tabs: {
    gap: '1rem',
    marginBottom: '2rem',
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.3s',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  activeTab: {
    background: '#667eea',
    color: 'white',
  },
  tabContent: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minHeight: '400px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#667eea',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#999',
    fontSize: '1.1rem',
  },
  tableContainer: {
    overflowX: 'auto' as const,
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.95rem',
  },
  th: {
    textAlign: 'left' as const,
    padding: '1rem',
    background: '#f8f9fa',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #e0e0e0',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '1rem',
    color: '#555',
  },
  methodBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statusCompleted: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e',
  },
  statusFailed: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  userCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  userEmail: {
    margin: '0.25rem 0',
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  },
  userPhone: {
    margin: '0.25rem 0',
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  },
  userDate: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.85rem',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  categoryCard: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '1px solid #e0e0e0',
  },
  categoryIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  categoryName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.2rem',
    color: '#333',
  },
  categoryDesc: {
    margin: '0 0 1rem 0',
    fontSize: '0.9rem',
    color: '#666',
    minHeight: '40px',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  editButton: {
    padding: '0.5rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  bookCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  bookCover: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
    backgroundColor: '#f0f0f0',
  },
  bookInfo: {
    padding: '1rem',
  },
  bookTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  bookAuthor: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.9rem',
    color: '#666',
  },
  bookStats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#999',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  modalTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    width: '100%',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  colorInput: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    height: '50px',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
}