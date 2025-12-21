'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function TheoDoiDonHangPage() {
  useEffect(() => {
    // Redirect to order page in account
    redirect('/tai-khoan/don-hang')
  }, [])

  return null
}
