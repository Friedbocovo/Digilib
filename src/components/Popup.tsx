interface PopupProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

const tones = { success: 'bg-success', error: 'bg-danger', info: 'bg-info' }

export function Popup({ message, type = 'info', onClose }: PopupProps) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-2xl font-bold text-ink ${tones[type]}`}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'i'}
        </div>
        <p className="text-parchment">{message}</p>
        <button type="button" onClick={onClose} className="mt-6 rounded-full bg-gold px-6 py-2 text-sm font-semibold text-ink">
          OK
        </button>
      </div>
    </div>
  )
}
