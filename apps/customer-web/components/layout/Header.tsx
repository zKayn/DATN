'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  User,
  Search,
  Heart,
  Menu,
  X,
  LogOut,
  Package,
  UserCircle,
  Bell
} from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useNotification } from '@/contexts/NotificationContext'

interface Category {
  _id: string;
  ten: string;
  slug: string;
  trangThai: string;
  loaiSanPham?: string[];
}

interface Product {
  _id: string;
  ten: string;
  slug?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()
  const { settings } = useSettings()
  const { unreadCount } = useNotification()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Real-time search khi người dùng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.categories || []
        const activeCategories = data.filter((cat: Category) => cat.trangThai === 'active')
        setCategories(activeCategories.slice(0, 5)) // Limit to 5 categories in header
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error)
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const response = await api.searchProducts(query)
      if (response.success && response.data) {
        setSearchResults(response.data.slice(0, 5)) // Giới hạn 5 kết quả
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error)
      setSearchResults([])
    }
    setSearchLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchResults(false)
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleProductClick = (slug: string) => {
    setShowSearchResults(false)
    setSearchQuery('')
    window.location.href = `/san-pham/${slug}`
  }

  return (
    <header className="glass-card sticky top-0 z-50 transition-all duration-300">
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.storeLogo ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden
                            bg-gradient-to-br from-primary-500 to-accent-500
                            transform group-hover:scale-110 group-hover:rotate-6
                            transition-all duration-300
                            shadow-lg group-hover:shadow-[0_8px_30px_rgba(26,117,255,0.4)]">
                <Image
                  src={settings.storeLogo}
                  alt={settings.storeName || 'Store Logo'}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl
                            bg-gradient-to-br from-primary-500 to-accent-500
                            flex items-center justify-center
                            transform group-hover:scale-110 group-hover:rotate-6
                            transition-all duration-300
                            shadow-lg group-hover:shadow-[0_8px_30px_rgba(26,117,255,0.4)]">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
              </div>
            )}
            <div className="hidden md:block">
              <h1 className="text-xl font-heading font-bold text-gradient-primary">
                {settings?.storeName || 'Thể Thao Pro'}
              </h1>
              <p className="text-xs text-gray-500">{settings?.storeDescription || 'Chuyên đồ thể thao'}</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl relative">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full px-6 py-4 pr-14 rounded-2xl
                         border-2 border-gray-200
                         focus:border-transparent
                         focus-ring-vibrant
                         transition-all duration-300
                         group-focus-within:shadow-[0_8px_30px_rgba(26,117,255,0.2)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2
                         w-10 h-10 rounded-xl
                         bg-gradient-to-br from-primary-500 to-accent-500
                         text-white
                         hover:scale-110 hover:rotate-12
                         transition-all duration-300
                         shadow-lg hover:shadow-[0_8px_30px_rgba(26,117,255,0.4)]
                         flex items-center justify-center
                         active:scale-95"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-400 border-t-transparent mx-auto"></div>
                      <p className="mt-2">Đang tìm kiếm...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product.slug || product._id)}
                          className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <img
                            src={product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                            alt={product.ten}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-clamp-1">{product.ten}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {product.giaKhuyenMai ? (
                                <>
                                  <span className="text-primary-500 font-semibold">
                                    {product.giaKhuyenMai.toLocaleString('vi-VN')}₫
                                  </span>
                                  <span className="text-gray-400 line-through text-sm">
                                    {product.gia.toLocaleString('vi-VN')}₫
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-900 font-semibold">
                                  {product.gia.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 text-center border-t bg-gray-50">
                        <button
                          type="submit"
                          className="text-primary-500 hover:text-primary-700 font-medium text-sm"
                        >
                          Xem tất cả kết quả cho "{searchQuery}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Overlay to close dropdown when clicking outside */}
            {showSearchResults && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
            )}
          </form>

          {/* Icons */}
          <div className="flex items-center gap-3">
            {/* Search mobile */}
            <button
              className="lg:hidden p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-colors focus-ring-vibrant"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            <Link
              href="/yeu-thich"
              className="hidden md:flex items-center gap-2 p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-all relative group focus-ring-vibrant"
              aria-label={`Sản phẩm yêu thích${wishlistCount > 0 ? ` (${wishlistCount} sản phẩm)` : ''}`}
            >
              <Heart className="w-6 h-6 group-hover:text-secondary-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6
                               bg-gradient-to-br from-secondary-500 to-secondary-600
                               text-white text-xs font-bold
                               flex items-center justify-center rounded-full
                               shadow-lg animate-bounce-subtle" aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                href="/thong-bao"
                className="hidden md:flex items-center gap-2 p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-all relative group focus-ring-vibrant"
                aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
              >
                <Bell className="w-6 h-6 group-hover:text-accent-500 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6
                                 bg-gradient-to-br from-accent-500 to-accent-600
                                 text-white text-xs font-bold
                                 flex items-center justify-center rounded-full
                                 shadow-lg animate-pulse-subtle" aria-hidden="true">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-2 p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-all relative group focus-ring-vibrant"
              aria-label={`Giỏ hàng${cartCount > 0 ? ` (${cartCount} sản phẩm)` : ''}`}
            >
              <ShoppingCart className="w-6 h-6 group-hover:text-primary-500 transition-colors" />
              <span className="hidden md:inline font-medium">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6
                               bg-gradient-to-br from-primary-500 to-primary-600
                               text-white text-xs font-bold
                               flex items-center justify-center rounded-full
                               shadow-lg animate-bounce-subtle" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated && user ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-colors focus-ring-vibrant"
                  aria-label="Menu tài khoản"
                  aria-expanded={showUserMenu}
                >
                  {user.anhDaiDien ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary-500 shadow-md">
                      <Image
                        src={user.anhDaiDien}
                        alt={user.hoTen || user.ten || 'Avatar'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-8 h-8 text-primary-500" />
                  )}
                  <span className="max-w-[100px] truncate font-medium">{user.hoTen || user.ten}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-vibrant rounded-2xl shadow-2xl py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        {user.anhDaiDien ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500 flex-shrink-0 shadow-md">
                            <Image
                              src={user.anhDaiDien}
                              alt={user.hoTen || user.ten || 'Avatar'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                            {(user.hoTen || user.ten || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.hoTen || user.ten}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/tai-khoan"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Thông tin cá nhân</span>
                    </Link>
                    <Link
                      href="/tai-khoan/don-hang"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Đơn hàng của tôi</span>
                    </Link>
                    <Link
                      href="/thong-bao"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-colors relative"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Thông báo</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/yeu-thich"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Sản phẩm yêu thích</span>
                    </Link>
                    <div className="border-t border-gray-200/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left rounded-lg mx-2"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all focus-ring-vibrant"
                aria-label="Đăng nhập"
              >
                <User className="w-5 h-5" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 rounded-xl transition-colors focus-ring-vibrant"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search bar - Mobile */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="lg:hidden mt-4 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:border-transparent focus-ring-vibrant"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-primary-500 to-accent-500 text-white p-2 rounded-xl hover:scale-110 transition-all shadow-lg"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-200/50 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-3">
            <li>
              <Link href="/san-pham" className="font-medium animated-underline">
                Tất Cả Sản Phẩm
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category._id} className="relative group">
                <Link
                  href={`/danh-muc/${category.slug}`}
                  className="hover:text-accent-600 transition-colors flex items-center gap-1 animated-underline"
                >
                  {category.ten}
                  {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown menu for product types */}
                {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                  <div className="absolute left-0 top-full mt-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
                    <div className="glass-vibrant rounded-xl shadow-xl py-2 min-w-[200px] mt-1 animate-slide-down">
                      {category.loaiSanPham.map((type, index) => (
                        <Link
                          key={index}
                          href={`/danh-muc/${category.slug}?loaiSanPham=${encodeURIComponent(type)}`}
                          className="block px-4 py-2 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:text-primary-500 transition-colors text-sm"
                        >
                          {type}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link href="/khuyen-mai" className="text-warning-600 font-medium hover:text-warning-700 transition-colors animated-underline">
                Khuyến Mãi
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 glass-vibrant animate-slide-down">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link href="/san-pham" className="block py-2 font-medium hover:text-primary-500">
                  Tất Cả Sản Phẩm
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <Link href={`/danh-muc/${category.slug}`} className="block py-2 hover:text-primary-500 font-medium">
                    {category.ten}
                  </Link>
                  {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {category.loaiSanPham.map((type, index) => (
                        <li key={index}>
                          <Link
                            href={`/danh-muc/${category.slug}?loaiSanPham=${encodeURIComponent(type)}`}
                            className="block py-1.5 text-sm text-gray-600 hover:text-primary-500"
                          >
                            • {type}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <Link href="/khuyen-mai" className="block py-2 text-warning-600 font-medium">
                  Khuyến Mãi
                </Link>
              </li>
              <li className="border-t pt-4">
                {isAuthenticated && user ? (
                  <Link href="/tai-khoan" className="flex items-center gap-3 py-2">
                    {user.anhDaiDien ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500 flex-shrink-0">
                        <Image
                          src={user.anhDaiDien}
                          alt={user.hoTen || user.ten || 'Avatar'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(user.hoTen || user.ten || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.hoTen || user.ten}</p>
                      <p className="text-sm text-gray-500">Xem tài khoản</p>
                    </div>
                  </Link>
                ) : (
                  <Link href="/dang-nhap" className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium">
                    <User className="w-5 h-5" />
                    <span>Đăng nhập</span>
                  </Link>
                )}
              </li>
              {isAuthenticated && (
                <li>
                  <Link href="/thong-bao" className="flex items-center gap-2 py-2 relative">
                    <Bell className="w-5 h-5" />
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/yeu-thich" className="flex items-center gap-2 py-2">
                  <Heart className="w-5 h-5" />
                  <span>Yêu thích</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
