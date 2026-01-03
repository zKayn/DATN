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
    <section className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600
                      bg-[length:200%_200%] animate-gradient-shift
                      py-20 md:py-28 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-success-400/20 to-primary-400/20 rounded-full blur-3xl animate-float-particle" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float-particle" style={{ animationDelay: '2s' }} />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23ffffff'/%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />

      <div className="relative container mx-auto px-4">
        {/* 3D Card Container */}
        <div className="max-w-5xl mx-auto transform-3d perspective-1000">
          <div className="glass-vibrant rounded-3xl p-8 md:p-12
                       transform transition-all duration-500
                       hover:scale-105
                       shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
            <div className="text-center">
              {/* Icon with glow */}
              <div className="inline-flex items-center justify-center w-24 h-24
                            bg-gradient-to-br from-accent-500 to-secondary-500
                            rounded-2xl mb-8 shadow-[0_0_40px_rgba(56,249,215,0.6)]
                            transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                <Mail className="w-12 h-12 text-white" />
              </div>

              {/* Heading with gradient */}
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)]"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)' }}>
                  Đăng Ký Nhận
                </span>
                <br />
                <span className="text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)]"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)' }}>
                  Ưu Đãi Đặc Biệt
                </span>
              </h2>

              <p className="text-lg md:text-xl text-white mb-10 max-w-3xl mx-auto leading-relaxed font-semibold"
                 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)' }}>
                Nhận ngay thông tin sản phẩm mới, voucher giảm giá và mẹo tập luyện hữu ích.
                Đăng ký ngay để không bỏ lỡ các ưu đãi hấp dẫn!
              </p>

              {/* Subscribe Form */}
              {!subscribed ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <div className="flex-1 relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400
                                   group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn..."
                      className="w-full pl-14 pr-5 py-5 rounded-2xl
                               text-gray-900 placeholder-gray-500 font-medium
                               bg-white border-2 border-transparent
                               transition-all duration-300
                               focus:outline-none
                               focus:border-primary-500
                               focus:shadow-[0_0_30px_rgba(67,233,123,0.4)]
                               focus:scale-105"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group/btn relative overflow-hidden
                             px-10 py-5 rounded-2xl font-accent font-bold text-lg
                             bg-gradient-to-r from-accent-500 to-secondary-500
                             text-white
                             transition-all duration-500
                             hover:shadow-[0_20px_60px_rgba(56,249,215,0.5)]
                             hover:scale-110 active:scale-95
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-3 whitespace-nowrap
                             focus:outline-none focus:ring-4 focus:ring-accent-500/30"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                  transform -translate-x-full group-hover/btn:translate-x-full
                                  transition-transform duration-1000" />

                    {loading ? (
                      <>
                        <div className="relative z-10 w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="relative z-10">Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Send className="relative z-10 w-6 h-6" />
                        <span className="relative z-10">Đăng Ký</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-4
                             bg-gradient-to-r from-success-500/30 to-primary-500/30
                             backdrop-blur-md border-2 border-success-400/50
                             rounded-2xl p-8 max-w-2xl mx-auto
                             shadow-[0_0_40px_rgba(67,233,123,0.3)]
                             animate-bounce-in">
                  <CheckCircle className="w-10 h-10 text-success-400 animate-bounce-subtle" />
                  <p className="text-white text-xl font-accent font-bold">
                    Bạn đã đăng ký thành công! Kiểm tra email của bạn.
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
                <div className="group relative p-8 rounded-2xl
                             bg-white
                             border border-gray-200
                             transition-all duration-500
                             hover:border-accent-400
                             hover:shadow-[0_20px_60px_rgba(56,249,215,0.3)]
                             hover:scale-105 hover:-translate-y-2">
                  <div className="w-16 h-16 mb-6
                               bg-gradient-to-br from-accent-500 to-secondary-500
                               rounded-2xl flex items-center justify-center
                               shadow-[0_0_30px_rgba(56,249,215,0.4)]
                               transform group-hover:scale-110 group-hover:rotate-12
                               transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">Giảm Giá Đặc Biệt</h3>
                  <p className="text-base text-gray-600 leading-relaxed">Voucher giảm giá đến 50% cho thành viên</p>
                </div>

                <div className="group relative p-8 rounded-2xl
                             bg-white
                             border border-gray-200
                             transition-all duration-500
                             hover:border-primary-400
                             hover:shadow-[0_20px_60px_rgba(67,233,123,0.3)]
                             hover:scale-105 hover:-translate-y-2">
                  <div className="w-16 h-16 mb-6
                               bg-gradient-to-br from-primary-500 to-success-500
                               rounded-2xl flex items-center justify-center
                               shadow-[0_0_30px_rgba(67,233,123,0.4)]
                               transform group-hover:scale-110 group-hover:rotate-12
                               transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">Cập Nhật Nhanh</h3>
                  <p className="text-base text-gray-600 leading-relaxed">Thông tin sản phẩm mới và khuyến mãi hot</p>
                </div>

                <div className="group relative p-8 rounded-2xl
                             bg-white
                             border border-gray-200
                             transition-all duration-500
                             hover:border-success-400
                             hover:shadow-[0_20px_60px_rgba(67,233,123,0.3)]
                             hover:scale-105 hover:-translate-y-2">
                  <div className="w-16 h-16 mb-6
                               bg-gradient-to-br from-success-500 to-primary-500
                               rounded-2xl flex items-center justify-center
                               shadow-[0_0_30px_rgba(67,233,123,0.4)]
                               transform group-hover:scale-110 group-hover:rotate-12
                               transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">Ưu Tiên Đặc Biệt</h3>
                  <p className="text-base text-gray-600 leading-relaxed">Ưu tiên mua sắm và hỗ trợ tận tâm</p>
                </div>
              </div>

              {/* Privacy Note */}
              <p className="text-white text-base mt-10 font-semibold"
                 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                🔒 Chúng tôi tôn trọng quyền riêng tư của bạn. Thông tin của bạn sẽ được bảo mật tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
