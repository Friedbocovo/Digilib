import { supabase } from './supabase'

const SESSION_KEY = 'admin_session'
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

export async function initializeAdminPassword(password: string) {
  const hashedPassword = await hashPassword(password)

  const { error } = await supabase
    .from('admin_settings')
    .insert({
      password_hash: hashedPassword,
      is_primary: true,
    })

  if (error) throw error
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('password_hash')
      .eq('is_primary', true)
      .maybeSingle()

    if (error || !data) {
      return false
    }

    const isValid = await verifyPassword(password, data.password_hash)

    if (isValid) {
      const sessionToken = generateSessionToken()
      const expiresAt = Date.now() + SESSION_TIMEOUT
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token: sessionToken, expiresAt }))
    }

    return isValid
  } catch (error) {
    console.error('Error verifying admin password:', error)
    return false
  }
}

export function isAdminSessionValid(): boolean {
  const session = localStorage.getItem(SESSION_KEY)

  if (!session) return false

  try {
    const { expiresAt } = JSON.parse(session)
    if (Date.now() > expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY)
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoded = await hashPassword(password)
  return encoded === hash
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<boolean> {
  const isValid = await verifyAdminPassword(oldPassword)
  if (!isValid) return false

  try {
    const newHash = await hashPassword(newPassword)

    const { error } = await supabase
      .from('admin_settings')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('is_primary', true)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error changing password:', error)
    return false
  }
}
