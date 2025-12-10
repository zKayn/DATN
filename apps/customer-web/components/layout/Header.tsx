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
  UserCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  _id: string;
  ten: string;
  slug: string;
  trangThai: string;
  loaiSanPham?: string[];
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <p>🔥 Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
            <div className="hidden md:flex items-center gap-4">
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
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-2 rounded-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Thể Thao Pro
              </h1>
              <p className="text-xs text-gray-500">Chuyên đồ thể thao</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
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

            {/* Cart */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="hidden md:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
                  <UserCircle className="w-6 h-6" />
                  <span className="max-w-[100px] truncate">{user.hoTen || user.ten}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 truncate">{user.hoTen || user.ten}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
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
                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-md">
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
                  className="hover:text-primary-600 transition-colors flex items-center gap-1"
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
              <Link href="/khuyen-mai" className="text-red-600 font-medium hover:text-red-700 transition-colors">
                🔥 Khuyến Mãi
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
                <Link href="/khuyen-mai" className="block py-2 text-red-600 font-medium">
                  🔥 Khuyến Mãi
                </Link>
              </li>
              <li className="border-t pt-4">
                <Link href="/tai-khoan" className="flex items-center gap-2 py-2">
                  <User className="w-5 h-5" />
                  <span>Tài khoản</span>
                </Link>
              </li>
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
