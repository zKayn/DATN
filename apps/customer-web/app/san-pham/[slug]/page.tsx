'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ImageGallery from '@/components/product/ImageGallery';
import ReviewSection from '@/components/product/ReviewSection';
import ProductCard from '@/components/ui/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  ten: string;
  slug?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  daBan: number;
  thuongHieu: string;
  danhMuc: any;
  moTa: string;
  moTaChiTiet?: string;
  dacDiem: string[];
  thongSoKyThuat?: Record<string, string>;
  kichThuoc: string[];
  mauSac: { ten: string; ma: string }[];
  soLuongTonKho: number;
  noiBat: boolean;
  sanPhamMoi: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Try to get product by slug first, fallback to ID
      let response;
      try {
        response = await api.getProductBySlug(slug);
      } catch (error) {
        // If slug doesn't work, try ID
        response = await api.getProductById(slug);
      }

      if (response.success && response.data) {
        const productData = response.data.product || response.data;
        setProduct(productData);

        // Load related products from same category
        if (productData.danhMuc) {
          const categoryId = typeof productData.danhMuc === 'object'
            ? productData.danhMuc._id
            : productData.danhMuc;

          const relatedResponse = await api.getProducts({
            danhMuc: categoryId,
            limit: 4
          });

          if (relatedResponse.success && relatedResponse.data) {
            let related = Array.isArray(relatedResponse.data)
              ? relatedResponse.data
              : relatedResponse.data.products || [];

            // Filter out current product
            related = related.filter((p: Product) => p._id !== productData._id);
            setRelatedProducts(related.slice(0, 4));
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate size selection
    if (product.kichThuoc && product.kichThuoc.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }

    // Validate color selection
    if (product.mauSac && product.mauSac.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    // Add to cart
    addToCart({
      productId: product._id,
      name: product.ten,
      slug: product.slug || product._id,
      image: product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      price: product.gia,
      salePrice: product.giaKhuyenMai || null,
      size: selectedSize || product.kichThuoc?.[0] || 'Free Size',
      color: selectedColor || product.mauSac?.[0]?.ten || 'Mặc định',
      quantity: quantity,
      stock: product.soLuongTonKho
    });

    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Validate size selection
    if (product.kichThuoc && product.kichThuoc.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }

    // Validate color selection
    if (product.mauSac && product.mauSac.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    // Add to cart
    addToCart({
      productId: product._id,
      name: product.ten,
      slug: product.slug || product._id,
      image: product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      price: product.gia,
      salePrice: product.giaKhuyenMai || null,
      size: selectedSize || product.kichThuoc?.[0] || 'Free Size',
      color: selectedColor || product.mauSac?.[0]?.ten || 'Mặc định',
      quantity: quantity,
      stock: product.soLuongTonKho
    });

    // Navigate to cart
    router.push('/gio-hang');
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const isWishlisted = isInWishlist(product._id);

    if (isWishlisted) {
      removeFromWishlist(product._id);
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } else {
      addToWishlist({
        _id: product._id,
        ten: product.ten,
        slug: product.slug || product._id,
        hinhAnh: product.hinhAnh,
        gia: product.gia,
        giaKhuyenMai: product.giaKhuyenMai,
        danhGia: {
          trungBinh: product.danhGiaTrungBinh,
          soLuong: product.soLuongDanhGia
        },
        tonKho: product.soLuongTonKho
      });
      toast.success('Đã thêm vào danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <a href="/san-pham" className="text-primary-500 hover:underline">
            Quay lại danh sách sản phẩm
          </a>
        </div>
      </div>
    );
  }

  const discountPercent = product.giaKhuyenMai
    ? Math.round((1 - product.giaKhuyenMai / product.gia) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Sản phẩm', href: '/san-pham' },
              { label: product.ten }
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <ImageGallery images={product.hinhAnh.length > 0 ? product.hinhAnh : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800']} />

          {/* Product Details */}
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              <span className="text-sm text-primary-500 font-medium">{product.thuongHieu}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.ten}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.danhGiaTrungBinh) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-medium">{product.danhGiaTrungBinh}</span>
              </div>
              <span className="text-sm text-gray-600">({product.soLuongDanhGia} đánh giá)</span>
              <span className="text-sm text-gray-600">Đã bán: {product.daBan || 0}</span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                {product.giaKhuyenMai ? (
                  <>
                    <span className="text-3xl font-bold text-orange-600">
                      ₫{product.giaKhuyenMai.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ₫{product.gia.toLocaleString('vi-VN')}
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm font-medium">
                      -{discountPercent}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ₫{product.gia.toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.mauSac && product.mauSac.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Màu sắc: {selectedColor && <span className="text-primary-500">{selectedColor}</span>}
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.mauSac.map((color) => (
                    <button
                      key={color.ten}
                      onClick={() => setSelectedColor(color.ten)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.ten
                          ? 'border-primary-500 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color.ma,
                        boxShadow: selectedColor === color.ten ? '0 0 0 2px white, 0 0 0 4px rgb(51, 65, 85)' : 'none'
                      }}
                      title={color.ten}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.kichThuoc && product.kichThuoc.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Kích thước: {selectedSize && <span className="text-primary-500">{selectedSize}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.kichThuoc.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-500'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-4">
              {product.soLuongTonKho > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Còn hàng</span>
                  <span className="text-gray-600">({product.soLuongTonKho} sản phẩm có sẵn)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Hết hàng</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            {product.soLuongTonKho > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">Số lượng</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.soLuongTonKho, parseInt(e.target.value) || 1)))}
                    max={product.soLuongTonKho}
                    min={1}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.soLuongTonKho, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= product.soLuongTonKho}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {product.soLuongTonKho > 0 ? (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-primary-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Thêm Vào Giỏ Hàng
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`w-14 h-14 rounded-lg transition-colors flex items-center justify-center ${
                        product && isInWishlist(product._id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-6 h-6" fill={product && isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Mua Ngay
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-6 py-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Sản Phẩm Đã Hết Hàng
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      product && isInWishlist(product._id)
                        ? 'bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={product && isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {product && isInWishlist(product._id) ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
                  </button>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-yellow-800">
                        Sản phẩm tạm thời hết hàng. Vui lòng liên hệ shop để được tư vấn về thời gian nhập hàng hoặc sản phẩm thay thế.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {product.dacDiem && product.dacDiem.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Đặc điểm nổi bật</h3>
                <ul className="space-y-2">
                  {product.dacDiem.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product Description & Specs */}
        <div className="bg-white rounded-lg p-6 mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô Tả Sản Phẩm</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.moTaChiTiet || product.moTa}
            </p>
          </div>

          {product.thongSoKyThuat && Object.keys(product.thongSoKyThuat).length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thông Số Kỹ Thuật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.thongSoKyThuat).map(([key, value]) => (
                  <div key={key} className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm font-medium text-gray-600">{key}</span>
                    <span className="flex-1 text-sm text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <ReviewSection
          productId={product._id}
          productSlug={product.slug}
          productName={product.ten}
          averageRating={product.danhGiaTrungBinh}
          totalReviews={product.soLuongDanhGia}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản Phẩm Liên Quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  id={relatedProduct._id}
                  name={relatedProduct.ten}
                  slug={relatedProduct.slug || relatedProduct._id}
                  price={relatedProduct.gia}
                  salePrice={relatedProduct.giaKhuyenMai}
                  image={relatedProduct.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'}
                  rating={relatedProduct.danhGiaTrungBinh}
                  reviewCount={relatedProduct.soLuongDanhGia}
                  isNew={relatedProduct.sanPhamMoi}
                  isFeatured={relatedProduct.noiBat}
                  soldCount={relatedProduct.daBan}
                  stock={relatedProduct.soLuongTonKho}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
