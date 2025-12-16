import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatAI from '@/components/ChatAI'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Cửa Hàng Thể Thao - Đồ Thể Thao Chính Hãng',
  description: 'Chuyên cung cấp đồ thể thao chính hãng, giày thể thao, quần áo tập gym, dụng cụ thể thao chất lượng cao',
  keywords: 'đồ thể thao, giày thể thao, quần áo gym, dụng cụ tập, thể hình',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SettingsProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <ChatAI />
                </div>
                <Toaster position="top-right" />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
