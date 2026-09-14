import Logo from '../pages/logo2.png'

interface BrandProps {
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark'
  onClick?: () => void
}

const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }
const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }

export function Brand({ size = 'md', tone = 'dark', onClick }: BrandProps) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left">
      <img src={Logo} alt="DigiLib" className={`${sizes[size]} object-contain`} />
      <span
        className={`font-display font-semibold tracking-tight ${textSizes[size]} ${
          tone === 'light' ? 'text-espresso' : 'text-parchment'
        }`}
      >
        DigiLib
      </span>
    </button>
  )
}
