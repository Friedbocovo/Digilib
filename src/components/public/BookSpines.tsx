import type { ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

export function BookSpines({ colors, labels = [] }: { colors: string[]; labels?: string[] }) {
  const row = [...colors, ...colors].slice(0, 14)
  const { ref, visible } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`flex h-44 items-end gap-px px-1 ${visible ? 'shelf-rise' : ''}`}>
      {row.map((color, i) => {
        const width = 18 + ((i * 7) % 14)
        const height = 72 + ((i * 13) % 24)
        return (
          <div
            key={`${color}-${i}`}
            className="spine flex items-end justify-center pb-3"
            style={{
              width,
              height: `${height}%`,
              animationDelay: visible ? `${i * 45}ms` : undefined,
              background: `linear-gradient(90deg, rgba(0,0,0,0.35), transparent 22%, rgba(255,255,255,0.06) 48%, transparent 70%, rgba(0,0,0,0.28)), ${color}`,
            }}
          >
            {labels[i % labels.length] && i % 3 === 0 && (
              <span className="rotate-180 text-[8px] uppercase tracking-widest text-[#d4a574]/80 [writing-mode:vertical-rl]">
                {labels[i % labels.length]}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ShelfBlock({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h3 className="font-display text-2xl text-[#24160f]">{title}</h3>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8b5a2b]">{meta}</p>
      </div>
      <div className="bg-[#2a1b12]/6 px-2 pt-6">{children}</div>
      <div className="wood-shelf mt-0" />
    </div>
  )
}
