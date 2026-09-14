export const CARD_QR_PREFIX = 'DIGILIB1'

export interface MemberCardPayload {
  email: string
  phone: string
}

export function encodeCardPayload({ email, phone }: MemberCardPayload): string {
  return [CARD_QR_PREFIX, email.trim().toLowerCase(), phone.trim()].join('|')
}

export function decodeCardPayload(raw: string): MemberCardPayload | null {
  const parts = raw.trim().split('|')
  if (parts.length !== 3 || parts[0] !== CARD_QR_PREFIX) return null

  const email = parts[1].trim().toLowerCase()
  const phone = parts[2].trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValid || !phone) return null

  return { email, phone }
}
