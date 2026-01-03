'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Custom hook for scroll-triggered animations
 *
 * @param options - Configuration options for IntersectionObserver
 * @returns Object with ref to attach to element and visibility state
 *
 * @example
 * const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
 *
 * <div ref={ref} className={`transition-all duration-700 ${
 *   isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
 * }`}>
 *   Content
 * </div>
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // If triggerOnce is true, disconnect observer after first trigger
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          // Only reset if not triggerOnce
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

/**
 * Custom hook for staggered scroll animations (for lists/grids)
 *
 * @param itemCount - Number of items to animate
 * @param options - Configuration options for IntersectionObserver
 * @returns Object with containerRef and array of visibility states
 *
 * @example
 * const { containerRef, itemsVisible } = useStaggeredScrollAnimation(3)
 *
 * <div ref={containerRef}>
 *   {items.map((item, i) => (
 *     <div key={i} className={`transition-all duration-700 ${
 *       itemsVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
 *     }`} style={{ transitionDelay: `${i * 100}ms` }}>
 *       {item}
 *     </div>
 *   ))}
 * </div>
 */
export function useStaggeredScrollAnimation(
  itemCount: number,
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [itemsVisible, setItemsVisible] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger items sequentially with delays
          const newVisibility = new Array(itemCount).fill(false)

          itemCount && Array.from({ length: itemCount }).forEach((_, index) => {
            setTimeout(() => {
              setItemsVisible((prev) => {
                const updated = [...prev]
                updated[index] = true
                return updated
              })
            }, index * 100) // 100ms delay between each item
          })

          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setItemsVisible(new Array(itemCount).fill(false))
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [itemCount, threshold, rootMargin, triggerOnce])

  return { containerRef, itemsVisible }
}
