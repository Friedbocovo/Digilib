export interface FreeBook {
  id: string
  title: string
  cover_url: string
  drive_link: string
}

export interface FAQItem {
  question: string
  answer: string
}

export const WHATSAPP_URL =
  "https://wa.me/22941822980?text=Bonjour%2C%20j'aimerais%20avoir%20acc%C3%A8s%20%C3%A0%20la%20biblioth%C3%A8que%20DigiLib"

export const CONTACT_EMAIL = 'flybrary4@gmail.com'
export const LIBRARY_PRICE = 5000

export const freeBooks: FreeBook[] = [
  {
    id: '1',
    title: '7 exercices pour durer plus longtemps',
    cover_url: 'https://drive.google.com/file/d/1jCwHs9qHytb3HLrvSmpwFA7MksibOdOs/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1O7SXPt_34TEz5BN8pqr8m2eCbBiwBIlr/view?usp=drivesdk',
  },
  {
    id: '2',
    title: 'Réussir sa prise de parole en public',
    cover_url: 'https://drive.google.com/file/d/1KlLb2abtBsEBLlMKFwp1pxML01IdVM7R/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1KlLb2abtBsEBLlMKFwp1pxML01IdVM7R/view?usp=drivesdk',
  },
  {
    id: '3',
    title: 'Les secrets de la confiance en soi',
    cover_url: 'https://drive.google.com/file/d/1_43l2OLOeZ3JCHsNZ9Wo0uAxeSwPeAyv/view?usp=drivesdk',
    drive_link: 'https://drive.google.com/file/d/1_43l2OLOeZ3JCHsNZ9Wo0uAxeSwPeAyv/view?usp=drivesdk',
  },
]

export const catalogPreview = [
  { name: 'Développement personnel', count: 200, spines: ['#4a1d28', '#6e3f1c', '#1c3a32', '#1c2740', '#3d2416'] },
  { name: 'Romans & récits', count: 310, spines: ['#2a1b12', '#8b5a2b', '#4a2812', '#1a100c', '#6e3f1c'] },
  { name: 'Sciences & savoirs', count: 150, spines: ['#1c2740', '#3d2416', '#1c3a32', '#4a1d28', '#2a1b12'] },
  { name: 'Affaires & leadership', count: 270, spines: ['#6e3f1c', '#1c2740', '#8b5a2b', '#1a100c', '#4a2812'] },
]

export const EXTRA_CATALOG_RAYONS = [
  'Histoire & géopolitique',
  'Spiritualité & foi',
  'Jeunesse & famille',
  'Art & culture',
  'Langues & grammaire',
  'Santé & bien-être',
]

export const faqs: FAQItem[] = [
  {
    question: 'Comment ça marche ?',
    answer:
      `Payez une seule fois ${LIBRARY_PRICE} XOF via Mobile Money, et accédez à vie à toute la bibliothèque. Lecture en ligne et téléchargement des fichiers.`,
  },
  {
    question: 'Quels modes de paiement ?',
    answer: 'MTN Money, Moov Money et Celtiis Money au Bénin.',
  },
  {
    question: 'Accès à vie ?',
    answer: 'Oui. Un seul paiement, pas d’abonnement mensuel.',
  },
  {
    question: 'Puis-je télécharger les livres ?',
    answer: 'Oui, sans limite, pour lire hors connexion.',
  },
]
