import { useState, type CSSProperties } from 'react'
import { getCoverImageUrl } from '../lib/drive'

interface CoverImageProps {
  src: string
  alt: string
  className?: string
  size?: number
  style?: CSSProperties
}

export function CoverImage({ src, alt, className = '', size = 400, style }: CoverImageProps) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={`flex items-end bg-gradient-to-br from-[#8b5a2b] via-[#3d2416] to-[#1a100c] p-4 ${className}`}
        style={style}
      >
        <p className="font-display text-lg leading-tight text-[#f6efe4]">{alt}</p>
      </div>
    )
  }
  return (
    <img
      src={getCoverImageUrl(src, size)}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}
