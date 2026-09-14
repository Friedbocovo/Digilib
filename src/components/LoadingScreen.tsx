export function LoadingScreen({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="bg-atelier grid min-h-dvh place-items-center px-6 text-parchment">
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
        <p className="mt-4 text-center text-sm text-muted">{message}</p>
      </div>
    </div>
  )
}
