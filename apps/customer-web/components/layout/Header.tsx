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
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <p>🎁 Miễn phí vận chuyển cho đơn hàng từ {settings?.freeShippingThreshold?.toLocaleString('vi-VN') || '500,000'}₫</p>
            <div className="hidden md:flex items-center gap-4">
              {settings?.storePhone && (
                <a href={`tel:${settings.storePhone}`} className="hover:underline">
                  📞 {settings.storePhone}
                </a>
              )}
              <Link href="/lien-he" className="hover:underline">Liên hệ</Link>
              <Link href="/theo-doi-don-hang" className="hover:underline">Theo dõi đơn hàng</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {settings?.storeLogo ? (
              <div className="relative w-12 h-12">
                <Image
                  src={settings.storeLogo}
                  alt={settings.storeName || 'Store Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-600 to-accent-600 text-white p-2 rounded-lg shadow-glow-red">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
              </div>
            )}
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {settings?.storeName || 'Thể Thao Pro'}
              </h1>
              <p className="text-xs text-gray-500">{settings?.storeDescription || 'Chuyên đồ thể thao'}</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 transition-colors shadow-glow-red">
                <Search className="w-5 h-5" />
              </button>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2">Đang tìm kiếm...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product.slug || product._id)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <img
                            src={product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                            alt={product.ten}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-clamp-1">{product.ten}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {product.giaKhuyenMai ? (
                                <>
                                  <span className="text-primary-600 font-semibold">
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
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
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
          <div className="flex items-center gap-4">
            {/* Search mobile */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            <Link
              href="/yeu-thich"
              className="hidden md:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                href="/thong-bao"
                className="hidden md:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-glow-gold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="hidden md:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-glow-red">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated && user ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {user.anhDaiDien ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary-600">
                      <Image
                        src={user.anhDaiDien}
                        alt={user.hoTen || user.ten || 'Avatar'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-8 h-8 text-primary-600" />
                  )}
                  <span className="max-w-[100px] truncate">{user.hoTen || user.ten}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        {user.anhDaiDien ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary-600 flex-shrink-0">
                            <Image
                              src={user.anhDaiDien}
                              alt={user.hoTen || user.ten || 'Avatar'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-glow-gold">
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
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Thông tin cá nhân</span>
                    </Link>
                    <Link
                      href="/tai-khoan/don-hang"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Đơn hàng của tôi</span>
                    </Link>
                    <Link
                      href="/thong-bao"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors relative"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Thông báo</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-accent-600 text-white text-xs rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/yeu-thich"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Sản phẩm yêu thích</span>
                    </Link>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-red-600">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="hidden md:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-6 h-6" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-md shadow-glow-red">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-3">
            <li>
              <Link href="/san-pham" className="font-medium hover:text-primary-600 transition-colors">
                Tất Cả Sản Phẩm
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category._id} className="relative group">
                <Link
                  href={`/danh-muc/${category.slug}`}
                  className="hover:text-accent-600 transition-colors flex items-center gap-1"
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
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] mt-1">
                      {category.loaiSanPham.map((type, index) => (
                        <Link
                          key={index}
                          href={`/danh-muc/${category.slug}?loaiSanPham=${encodeURIComponent(type)}`}
                          className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition-colors text-sm"
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
              <Link href="/khuyen-mai" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                🎁 Khuyến Mãi
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-down">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link href="/san-pham" className="block py-2 font-medium hover:text-primary-600">
                  Tất Cả Sản Phẩm
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <Link href={`/danh-muc/${category.slug}`} className="block py-2 hover:text-primary-600 font-medium">
                    {category.ten}
                  </Link>
                  {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {category.loaiSanPham.map((type, index) => (
                        <li key={index}>
                          <Link
                            href={`/danh-muc/${category.slug}?loaiSanPham=${encodeURIComponent(type)}`}
                            className="block py-1.5 text-sm text-gray-600 hover:text-primary-600"
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
                <Link href="/khuyen-mai" className="block py-2 text-primary-600 font-medium">
                  🎁 Khuyến Mãi
                </Link>
              </li>
              <li className="border-t pt-4">
                {isAuthenticated && user ? (
                  <Link href="/tai-khoan" className="flex items-center gap-3 py-2">
                    {user.anhDaiDien ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-600 flex-shrink-0">
                        <Image
                          src={user.anhDaiDien}
                          alt={user.hoTen || user.ten || 'Avatar'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow-gold">
                        {(user.hoTen || user.ten || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.hoTen || user.ten}</p>
                      <p className="text-sm text-gray-500">Xem tài khoản</p>
                    </div>
                  </Link>
                ) : (
                  <Link href="/dang-nhap" className="flex items-center gap-2 py-2">
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
                      <span className="ml-auto px-2 py-0.5 bg-accent-600 text-white text-xs rounded-full">
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
