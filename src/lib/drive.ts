export function getCoverImageUrl(coverUrl: string, size = 400): string {
  if (!coverUrl) {
    return `https://placehold.co/${size}x${Math.round(size * 1.4)}/1b1713/e8d8be?text=Livre`
  }
  if (coverUrl.startsWith('data:') || coverUrl.startsWith('blob:') || coverUrl.startsWith('/')) {
    return coverUrl
  }
  const fileIdMatch = coverUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (fileIdMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w${size}`
  }
  if (coverUrl.includes('id=')) {
    const idMatch = coverUrl.match(/id=([^&]+)/)
    if (idMatch?.[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w${size}`
    }
  }
  return coverUrl
}

export function getDirectDownloadLink(driveLink?: string, driveFileId?: string): string {
  if (driveFileId) {
    return `https://drive.google.com/uc?export=download&id=${driveFileId}`
  }
  if (driveLink?.includes('drive.google.com')) {
    const match = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`
    }
  }
  return driveLink || '#'
}

export function getDirectImageUrl(url: string): string {
  if (!url) return 'https://placehold.co/150x200/1b1713/e8d8be?text=Livre'
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url
  let fileId = ''
  if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([^/]+)/)
    if (match) fileId = match[1]
  } else if (url.includes('id=')) {
    const match = url.match(/id=([^&]+)/)
    if (match) fileId = match[1]
  } else if (url.length > 20 && !url.includes('/')) {
    fileId = url
  }
  if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`
  return url
}
