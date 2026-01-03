'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 p-3 bg-primary-500 hover:bg-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-smooth hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          aria-label="Quay lại đầu trang"
          title="Quay lại đầu trang"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  )
}
