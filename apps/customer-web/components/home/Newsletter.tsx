'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubscribed(true)
        toast.success(data.message || 'Đăng ký thành công! Vui lòng kiểm tra email của bạn.')
        setEmail('')
      } else {
        toast.error(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Không thể kết nối đến server. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-600 py-16 overflow-hidden">
      {/* Festive pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15l-3 9h-9l7.5 5.5-3 9 7.5-5.5 7.5 5.5-3-9 7.5-5.5h-9z' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-glow-gold">
            <Mail className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🎄 Đăng Ký Nhận Ưu Đãi Mùa Lễ Hội 🧧
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Nhận ngay voucher giảm giá đặc biệt cho mùa Giáng Sinh & Tết 2025!
            Cùng thông tin sản phẩm mới và mẹo tập luyện hữu ích. Đừng bỏ lỡ!
          </p>

          {/* Subscribe Form */}
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-accent-600 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-glow-gold"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    🎁 Đăng Ký
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md rounded-lg p-6 max-w-xl mx-auto">
              <CheckCircle className="w-8 h-8 text-green-300" />
              <p className="text-white text-lg font-medium">
                Bạn đã đăng ký thành công! Kiểm tra email của bạn.
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-white/90">
              <div className="text-3xl font-bold mb-2">🎅</div>
              <h3 className="font-semibold mb-1">Quà Tặng Giáng Sinh</h3>
              <p className="text-sm text-white/75">Voucher giảm giá đến 50% cho thành viên</p>
            </div>
            <div className="text-white/90">
              <div className="text-3xl font-bold mb-2">🧧</div>
              <h3 className="font-semibold mb-1">Lì Xì May Mắn</h3>
              <p className="text-sm text-white/75">Nhận lì xì đặc biệt mùa Tết 2025</p>
            </div>
            <div className="text-white/90">
              <div className="text-3xl font-bold mb-2">✨</div>
              <h3 className="font-semibold mb-1">Ưu Đãi Đặc Biệt</h3>
              <p className="text-sm text-white/75">Sản phẩm mới & deals hot mùa lễ hội</p>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-white/60 text-sm mt-8">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Thông tin của bạn sẽ được bảo mật tuyệt đối.
          </p>
        </div>
      </div>
    </section>
  )
}
