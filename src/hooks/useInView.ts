import { useCallback, useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement>(once = true, threshold = 0.18) {
  const [node, setNode] = useState<T | null>(null)
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  useEffect(() => {
    observerRef.current?.disconnect()
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin: '80px 0px 80px 0px' }
    )
    observerRef.current = observer
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, once, threshold])

  return { ref, visible }
}
