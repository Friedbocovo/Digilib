import { Mail, MessageCircle } from 'lucide-react'
import { PublicLayout } from '../components/public/PublicLayout'
import { PageHero } from '../components/public/PageHero'
import { Reveal } from '../components/public/Reveal'
import { CONTACT_EMAIL, WHATSAPP_URL } from '../data/publicContent'

export default function ContactPage() {
  return (
    <PublicLayout>
      <PageHero kicker="Contact" title="Le bureau vous répond">
        Une question sur la carte, le paiement ou l’accès ? Écrivez-nous.
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <Reveal>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-3xl border border-[#d4a574]/20 bg-[#1a100c] p-8 shadow-[0_20px_48px_rgba(26,16,12,0.18)] transition hover:border-[#d4a574]/40 md:p-10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4a574]/30 bg-[#d4a574]/10">
                <MessageCircle size={22} className="text-[#d4a574]" strokeWidth={1.5} />
              </span>
              <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[#d4a574]">WhatsApp</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#f6efe4]">Message direct</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#f6efe4]/65">
                Réponse rapide pour la carte, le paiement ou l’accès à la salle.
              </p>
              <p className="mt-6 text-sm font-medium text-[#d4a574] transition group-hover:text-[#efc792]">
                Ouvrir WhatsApp →
              </p>
            </a>
          </Reveal>

          <Reveal delay={100}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex h-full flex-col rounded-3xl border border-[#24160f]/12 bg-[#f7efe2] p-8 transition hover:border-[#8b5a2b]/35 hover:shadow-[0_16px_40px_rgba(36,22,15,0.1)] md:p-10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8b5a2b]/25 bg-[#2a1b12]/6">
                <Mail size={22} className="text-[#8b5a2b]" strokeWidth={1.5} />
              </span>
              <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[#8b5a2b]">Email</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#24160f]">Écrire au bureau</h2>
              <p className="mt-3 flex-1 break-all text-sm leading-7 text-[#6b5e52]">{CONTACT_EMAIL}</p>
              <p className="mt-6 text-sm font-medium text-[#8b5a2b] transition group-hover:text-[#24160f]">
                Envoyer un email →
              </p>
            </a>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  )
}
