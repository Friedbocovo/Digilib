export interface Profile {
  id: string
  email: string
  is_admin: boolean
  has_paid: boolean
  payment_date: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Book {
  id: string
  title: string
  description: string
  category_id: string | null
  cover_url: string
  drive_link: string
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  flutterwave_transaction_id: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}
