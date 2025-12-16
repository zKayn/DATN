// User & Auth Types
export interface User {
  _id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  vaiTro: string;
  anhDaiDien?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diemTichLuy?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product Types
export interface Product {
  _id: string;
  ten: string;
  moTa: string;
  slug: string;
  anhChinh: string;
  anhPhu: string[];
  giaBan: number;
  giaGoc?: number;
  danhMuc: {
    _id: string;
    ten: string;
    slug: string;
  };
  thuongHieu?: string;
  soLuongTon: number;
  daBan?: number;
  danhGiaTrungBinh?: number;
  soLuongDanhGia?: number;
  noiBat?: boolean;
  sanPhamMoi?: boolean;
  trangThai: string;
  bienThe: ProductVariant[];
  dacDiem?: string[];
  thongSoKyThuat?: { [key: string]: string };
}

export interface ProductVariant {
  _id: string;
  mauSac: string;
  kichThuoc: string;
  soLuongTon: number;
  anhBienThe?: string;
}

export interface Category {
  _id: string;
  ten: string;
  moTa?: string;
  slug: string;
  hinhAnh?: string;
  thuTu?: number;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice: number | null;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

// Order Types
export interface Order {
  _id: string;
  maDonHang: string;
  khachHang: string;
  sanPham: OrderItem[];
  tongTien: number;
  phiVanChuyen: number;
  giamGia: number;
  thanhTien: number;
  trangThai: OrderStatus;
  phuongThucThanhToan: string;
  thongTinGiaoHang: ShippingInfo;
  ghiChu?: string;
  ngayDat: string;
  ngayCapNhat: string;
  lyDoHuy?: string;
}

export interface OrderItem {
  sanPham: {
    _id: string;
    ten: string;
    anhChinh: string;
    slug: string;
  };
  bienThe?: {
    mauSac: string;
    kichThuoc: string;
  };
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface ShippingInfo {
  hoTen: string;
  soDienThoai: string;
  email?: string;
  tinh: string;
  huyen: string;
  xa: string;
  diaChiChiTiet: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
