import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Popup } from '../components/Popup'
import { getDirectImageUrl } from '../lib/drive'
import { uploadCategoryImage, uploadBookCover } from '../lib/uploadImage'
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
  Upload,
  Eye,
  Download,
  Phone,
  Mail,
  Calendar,
  X,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  image_url?: string
  created_at: string
}

const emptyCategoryForm = {
  name: '',
  description: '',
  color: '#d4a574',
  icon: '📚',
  image_url: '',
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

const emptyBookForm = {
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
  published_year: '',
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
    city?: string
  }
}

interface User {
  id: string
  name: string
  email: string
  phone_number: string
  city?: string
  created_at: string
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

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [bookForm, setBookForm] = useState(emptyBookForm)
  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null)
  const [bookCoverPreview, setBookCoverPreview] = useState('')
  const [savingBook, setSavingBook] = useState(false)

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
  })

  useEffect(() => {
    checkAdminAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeTab === 'categories') loadCategories()
    else if (activeTab === 'books') {
      loadBooks()
      loadCategories()
    } else if (activeTab === 'payments') loadPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const { data, error } = await supabase.from('categories').select('*').order('name')
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
      const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
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
        .select(`*, users ( name, city )`)
        .order('created_at', { ascending: false })

      if (paymentsError) throw paymentsError

      setPayments(paymentsData || [])

      const completed = paymentsData?.filter((p) => p.status === 'completed') || []
      const pending = paymentsData?.filter((p) => p.status === 'pending') || []
      const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount), 0)
      const uniqueUsers = new Set(completed.map((p) => p.user_email))

      setStats({
        totalUsers: uniqueUsers.size,
        totalRevenue,
        completedPayments: completed.length,
        pendingPayments: pending.length,
      })

      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading payments:', error)
      setPopup({ message: 'Erreur de chargement des paiements', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resetCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
    setCategoryImageFile(null)
    setCategoryImagePreview('')
  }

  const handleCategoryImagePick = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPopup({ message: 'Choisissez une image (JPG, PNG, WebP)', type: 'error' })
      return
    }
    setCategoryImageFile(file)
    setCategoryImagePreview(URL.createObjectURL(file))
  }

  const resetBookModal = () => {
    setShowBookModal(false)
    setEditingBook(null)
    setBookForm(emptyBookForm)
    setBookCoverFile(null)
    setBookCoverPreview('')
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      setPopup({ message: 'Donnez un nom à la catégorie', type: 'error' })
      return
    }

    if (!editingCategory && !categoryForm.image_url && !categoryImageFile) {
      setPopup({ message: 'Ajoutez une image : lien Drive ou fichier', type: 'error' })
      return
    }

    setSavingCategory(true)
    try {
      const image_url = categoryImageFile ? await uploadCategoryImage(categoryImageFile) : categoryForm.image_url

      const payload = { ...categoryForm, image_url }
      const saved = editingCategory
        ? await supabase.from('categories').update(payload).eq('id', editingCategory.id)
        : await supabase.from('categories').insert([payload])

      if (saved.error && /image_url|column/i.test(saved.error.message)) {
        const { image_url: _image, ...withoutImage } = payload
        const retry = editingCategory
          ? await supabase.from('categories').update(withoutImage).eq('id', editingCategory.id)
          : await supabase.from('categories').insert([withoutImage])
        if (retry.error) throw retry.error
        setPopup({
          message: 'Catégorie enregistrée. Ajoutez la colonne image_url dans Supabase pour garder la photo.',
          type: 'info',
        })
      } else if (saved.error) {
        throw saved.error
      } else {
        setPopup({
          message: editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès',
          type: 'success',
        })
      }

      resetCategoryModal()
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      setPopup({ message, type: 'error' })
    } finally {
      setSavingCategory(false)
    }
  }

  const handleBookCoverPick = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPopup({ message: 'Choisissez une image (JPG, PNG, WebP)', type: 'error' })
      return
    }
    setBookCoverFile(file)
    setBookCoverPreview(URL.createObjectURL(file))
  }

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.drive_link) {
      setPopup({ message: 'Veuillez remplir au moins le titre et le lien Drive', type: 'error' })
      return
    }

    setSavingBook(true)
    try {
      const cover_url = bookCoverFile ? await uploadBookCover(bookCoverFile) : bookForm.cover_url

      const bookData = {
        ...bookForm,
        cover_url,
        pages: bookForm.pages ? parseInt(bookForm.pages) : null,
        published_year: bookForm.published_year ? parseInt(bookForm.published_year) : null,
        downloads: 0,
        views: 0,
      }

      if (editingBook) {
        const { error } = await supabase.from('books').update(bookData).eq('id', editingBook.id)
        if (error) throw error
        setPopup({ message: 'Livre modifié avec succès', type: 'success' })
      } else {
        const { error } = await supabase.from('books').insert([bookData])
        if (error) throw error
        setPopup({ message: 'Livre ajouté avec succès', type: 'success' })
      }

      setShowBookModal(false)
      setEditingBook(null)
      setBookForm(emptyBookForm)
      setBookCoverFile(null)
      setBookCoverPreview('')
      loadBooks()
    } catch (error) {
      console.error('Error saving book:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      setPopup({ message, type: 'error' })
    } finally {
      setSavingBook(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
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
      const { error } = await supabase.from('books').delete().eq('id', id)
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' XOF'

  const statCards = [
    { label: 'Utilisateurs payants', value: stats.totalUsers.toString(), icon: Users },
    { label: 'Revenus totaux', value: formatAmount(stats.totalRevenue), icon: DollarSign },
    { label: 'Paiements réussis', value: stats.completedPayments.toString(), icon: CheckCircle },
    { label: 'Paiements en attente', value: stats.pendingPayments.toString(), icon: Clock },
  ]

  return (
    <div className="theme-salle min-h-screen bg-ink">
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/15 bg-[#150f0c]/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5">
          <Settings size={22} className="text-gold" />
          <span className="font-display text-lg font-semibold text-parchment sm:text-xl">Admin DigiLib</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn-library border border-[#e86b6b]/40 text-[#e86b6b] hover:bg-[#e86b6b]/10"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gold/15 bg-[#1c1410] p-5">
              <card.icon size={26} className="text-gold" />
              <div className="mt-3 font-display text-2xl font-semibold text-parchment">{card.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.1em] text-muted">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-full border border-gold/20 bg-[#1c1410] p-1.5">
          {[
            { key: 'payments' as const, label: `Paiements (${payments.length})`, icon: CreditCard },
            { key: 'categories' as const, label: `Catégories (${categories.length})`, icon: FolderOpen },
            { key: 'books' as const, label: `Livres (${books.length})`, icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition sm:text-xs ${
                activeTab === tab.key ? 'bg-gold text-ink' : 'text-muted hover:text-parchment'
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gold/15 bg-[#1c1410] p-4 sm:p-6">
          {loading ? (
            <div className="py-16 text-center text-muted">Chargement...</div>
          ) : (
            <>
              {activeTab === 'payments' && (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-parchment">Liste des paiements</h2>

                  {payments.length === 0 ? (
                    <p className="py-12 text-center text-muted">Aucun paiement pour le moment</p>
                  ) : (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[860px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gold/15 text-left text-[11px] uppercase tracking-[0.1em] text-gold">
                            <th className="px-3 py-3">Date</th>
                            <th className="px-3 py-3">Nom</th>
                            <th className="px-3 py-3">Email</th>
                            <th className="px-3 py-3">Téléphone</th>
                            <th className="px-3 py-3">Ville</th>
                            <th className="px-3 py-3">Montant</th>
                            <th className="px-3 py-3">Méthode</th>
                            <th className="px-3 py-3">Statut</th>
                            <th className="px-3 py-3">Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} className="border-b border-gold/10 text-parchment/85">
                              <td className="px-3 py-3 whitespace-nowrap">
                                <Calendar size={13} className="mr-1.5 inline-block text-muted" />
                                {formatDate(payment.created_at)}
                              </td>
                              <td className="px-3 py-3 font-semibold">{payment.users?.name || 'N/A'}</td>
                              <td className="px-3 py-3">
                                <Mail size={13} className="mr-1.5 inline-block text-muted" />
                                {payment.user_email}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <Phone size={13} className="mr-1.5 inline-block text-muted" />
                                {payment.phone_number}
                              </td>
                              <td className="px-3 py-3">{payment.users?.city || 'Non renseignée'}</td>
                              <td className="px-3 py-3 font-semibold">{formatAmount(payment.amount)}</td>
                              <td className="px-3 py-3">
                                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                                  {payment.payment_method}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                    payment.status === 'completed'
                                      ? 'bg-[#3dcf8e]/15 text-[#3dcf8e]'
                                      : payment.status === 'pending'
                                        ? 'bg-[#efc792]/15 text-[#efc792]'
                                        : 'bg-[#e86b6b]/15 text-[#e86b6b]'
                                  }`}
                                >
                                  {payment.status === 'completed' && <CheckCircle size={12} />}
                                  {payment.status === 'pending' && <Clock size={12} />}
                                  {payment.status === 'completed' ? 'Réussi' : payment.status === 'pending' ? 'En attente' : 'Échoué'}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="font-mono text-xs text-muted">{payment.transaction_id || '-'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h2 className="mt-12 font-display text-2xl font-semibold text-parchment">
                    Utilisateurs inscrits ({users.length})
                  </h2>

                  {users.length === 0 ? (
                    <p className="py-12 text-center text-muted">Aucun utilisateur inscrit</p>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {users.map((user) => (
                        <div key={user.id} className="flex gap-4 rounded-xl border border-gold/10 bg-[#150f0c] p-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold font-display text-lg font-semibold text-ink">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-display text-base text-parchment">{user.name}</h3>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                              <Mail size={12} /> {user.email}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                              <Phone size={12} /> {user.phone_number}
                            </p>
                            <p className="mt-1 text-xs text-muted">{user.city || 'Ville non renseignée'}</p>
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted/70">
                              <Calendar size={11} /> Inscrit le {formatDate(user.created_at)}
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
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-parchment">Catégories</h2>
                    <button
                      onClick={() => {
                        setEditingCategory(null)
                        setCategoryForm(emptyCategoryForm)
                        setCategoryImageFile(null)
                        setCategoryImagePreview('')
                        setShowCategoryModal(true)
                      }}
                      className="btn-library bg-gold text-ink"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Nouvelle catégorie</span>
                    </button>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <div key={category.id} className="rounded-xl border border-gold/10 bg-[#150f0c] p-4 text-center">
                        {category.image_url && (
                          <img
                            src={getDirectImageUrl(category.image_url)}
                            alt={category.name}
                            className="mb-3 h-28 w-full rounded-lg object-cover"
                          />
                        )}
                        <div
                          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                          style={{ background: category.color }}
                        >
                          {category.icon}
                        </div>
                        <h3 className="mt-3 font-display text-lg text-parchment">{category.name}</h3>
                        <p className="mt-1 min-h-[2.5rem] text-sm text-muted">{category.description}</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category)
                              setCategoryForm({
                                name: category.name,
                                description: category.description || '',
                                color: category.color,
                                icon: category.icon,
                                image_url: category.image_url || '',
                              })
                              setCategoryImageFile(null)
                              setCategoryImagePreview('')
                              setShowCategoryModal(true)
                            }}
                            className="btn-library border border-gold/30 text-parchment"
                          >
                            <Edit2 size={14} /> Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="btn-library border border-[#e86b6b]/40 text-[#e86b6b]"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'books' && (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-parchment">Livres</h2>
                    <button
                      onClick={() => {
                        setEditingBook(null)
                        setBookForm(emptyBookForm)
                        setBookCoverFile(null)
                        setBookCoverPreview('')
                        setShowBookModal(true)
                      }}
                      className="btn-library bg-gold text-ink"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Nouveau livre</span>
                    </button>
                  </div>

                  {books.length === 0 ? (
                    <p className="py-12 text-center text-muted">Aucun livre pour le moment</p>
                  ) : (
                    <div className="mt-6 flex flex-col gap-10">
                      {[
                        ...categories.map((category) => ({
                          key: category.id,
                          label: category.name,
                          icon: category.icon,
                          items: books.filter((b) => b.category_id === category.id),
                        })),
                        {
                          key: 'uncategorized',
                          label: 'Sans catégorie',
                          icon: '📂',
                          items: books.filter((b) => !categories.some((c) => c.id === b.category_id)),
                        },
                      ]
                        .filter((group) => group.items.length > 0)
                        .map((group) => (
                          <div key={group.key}>
                            <div className="mb-4 flex items-center gap-2">
                              <span className="text-lg">{group.icon}</span>
                              <h3 className="font-display text-lg text-parchment">{group.label}</h3>
                              <span className="text-xs text-muted">
                                ({group.items.length} {group.items.length > 1 ? 'livres' : 'livre'})
                              </span>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                              {group.items.map((book) => (
                                <div key={book.id} className="overflow-hidden rounded-xl border border-gold/10 bg-[#150f0c]">
                                  <img
                                    src={getDirectImageUrl(book.cover_url)}
                                    alt={book.title}
                                    className="h-48 w-full bg-[#1c1410] object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://placehold.co/300x400/1b1713/e8d8be?text=Livre'
                                    }}
                                  />
                                  <div className="p-4">
                                    <h3 className="truncate font-display text-base text-parchment">{book.title}</h3>
                                    {book.author && <p className="mt-1 truncate text-sm text-muted">{book.author}</p>}
                                    <div className="mt-3 flex gap-4 text-xs text-muted">
                                      <span className="flex items-center gap-1">
                                        <Eye size={13} /> {book.views}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Download size={13} /> {book.downloads}
                                      </span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
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
                                            published_year: book.published_year?.toString() || '',
                                          })
                                          setBookCoverFile(null)
                                          setBookCoverPreview('')
                                          setShowBookModal(true)
                                        }}
                                        className="btn-library flex-1 border border-gold/30 text-parchment"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="btn-library flex-1 border border-[#e86b6b]/40 text-[#e86b6b]"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={resetCategoryModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/15 bg-[#1c1410] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-parchment">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={resetCategoryModal} className="text-muted hover:text-parchment">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveCategory()
              }}
              className="mt-5 flex flex-col gap-3"
            >
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Nom</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="field"
                required
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="field"
                rows={3}
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Icône (emoji)</label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="field"
                placeholder="📚"
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Image de la catégorie</label>
              <input
                type="text"
                value={categoryForm.image_url}
                onChange={(e) => {
                  setCategoryImageFile(null)
                  setCategoryImagePreview('')
                  setCategoryForm({ ...categoryForm, image_url: e.target.value })
                }}
                className="field"
                placeholder="Lien Google Drive (comme pour les couvertures)"
              />
              <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-gold">
                <Upload size={16} />
                Ou uploader une image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCategoryImagePick(e.target.files?.[0])}
                />
              </label>
              {(categoryImagePreview || categoryForm.image_url) && (
                <img
                  src={categoryImagePreview || getDirectImageUrl(categoryForm.image_url)}
                  alt="Aperçu"
                  className="mt-1 h-40 w-full rounded-lg object-cover"
                />
              )}

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Couleur</label>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="h-12 w-full cursor-pointer rounded-lg border border-gold/20 bg-transparent p-1"
              />

              <div className="mt-3 flex justify-end gap-3">
                <button type="button" onClick={resetCategoryModal} className="btn-library border border-gold/20 text-muted">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="btn-library bg-gold text-ink disabled:opacity-60"
                >
                  {savingCategory ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={resetBookModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/15 bg-[#1c1410] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-parchment">
                {editingBook ? 'Modifier le livre' : 'Nouveau livre'}
              </h2>
              <button onClick={resetBookModal} className="text-muted hover:text-parchment">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveBook()
              }}
              className="mt-5 flex flex-col gap-3"
            >
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Titre *</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="field"
                required
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Auteur</label>
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="field"
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Description</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                className="field"
                rows={4}
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Catégorie</label>
              <select
                value={bookForm.category_id}
                onChange={(e) => setBookForm({ ...bookForm, category_id: e.target.value })}
                className="field"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Couverture</label>
              <input
                type="text"
                value={bookForm.cover_url}
                onChange={(e) => {
                  setBookCoverFile(null)
                  setBookCoverPreview('')
                  setBookForm({ ...bookForm, cover_url: e.target.value })
                }}
                className="field"
                placeholder="Lien Google Drive https://drive.google.com/file/d/1abc123.../view"
              />
              <p className="text-xs text-muted">💡 Astuce : Partagez l'image publiquement sur Drive et copiez le lien complet</p>
              <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-gold">
                <Upload size={16} />
                Ou uploader une image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBookCoverPick(e.target.files?.[0])}
                />
              </label>
              {(bookCoverPreview || bookForm.cover_url) && (
                <img
                  src={bookCoverPreview || getDirectImageUrl(bookForm.cover_url)}
                  alt="Aperçu"
                  className="mt-1 h-40 w-full rounded-lg object-cover"
                />
              )}

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Lien Google Drive *</label>
              <input
                type="text"
                value={bookForm.drive_link}
                onChange={(e) => setBookForm({ ...bookForm, drive_link: e.target.value })}
                className="field"
                placeholder="https://drive.google.com/file/d/..."
                required
              />

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">ID fichier Drive (optionnel)</label>
              <input
                type="text"
                value={bookForm.drive_file_id}
                onChange={(e) => setBookForm({ ...bookForm, drive_file_id: e.target.value })}
                className="field"
                placeholder="1dkPeFZDNDsU_3-B_..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Langue</label>
                  <input
                    type="text"
                    value={bookForm.language}
                    onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                    className="field mt-1"
                    placeholder="Français"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Taille du fichier</label>
                  <input
                    type="text"
                    value={bookForm.file_size}
                    onChange={(e) => setBookForm({ ...bookForm, file_size: e.target.value })}
                    className="field mt-1"
                    placeholder="2.5 MB"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Nombre de pages</label>
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                    className="field mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Année de publication</label>
                  <input
                    type="number"
                    value={bookForm.published_year}
                    onChange={(e) => setBookForm({ ...bookForm, published_year: e.target.value })}
                    className="field mt-1"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetBookModal}
                  className="btn-library border border-gold/20 text-muted"
                >
                  Annuler
                </button>
                <button type="submit" disabled={savingBook} className="btn-library bg-gold text-ink disabled:opacity-60">
                  {savingBook ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
