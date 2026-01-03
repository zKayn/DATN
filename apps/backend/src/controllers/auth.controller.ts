import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import emailService from '../services/email.service';

// Tạo JWT token
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hoTen, email, matKhau, soDienThoai } = req.body;

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo user mới
    const user = await User.create({
      hoTen,
      email,
      matKhau,
      soDienThoai
    });

    // Tạo token
    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        user: {
          _id: user._id,
          hoTen: user.hoTen,
          email: user.email,
          vaiTro: user.vaiTro,
          avatar: user.avatar,
          anhDaiDien: user.anhDaiDien,
          soDienThoai: user.soDienThoai,
          gioiTinh: user.gioiTinh,
          ngaySinh: user.ngaySinh
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng ký tài khoản admin
// @route   POST /api/auth/register-admin
// @access  Public
export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hoTen, email, matKhau, soDienThoai } = req.body;

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo admin user mới
    const user = await User.create({
      hoTen,
      email,
      matKhau,
      soDienThoai,
      vaiTro: 'quan-tri'
    });

    // Tạo token
    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản admin thành công',
      data: {
        token,
        user: {
          _id: user._id,
          hoTen: user.hoTen,
          email: user.email,
          vaiTro: user.vaiTro,
          avatar: user.avatar,
          anhDaiDien: user.anhDaiDien,
          soDienThoai: user.soDienThoai,
          gioiTinh: user.gioiTinh,
          ngaySinh: user.ngaySinh
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, matKhau } = req.body;

    // Validate
    if (!email || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user và lấy cả password
    const user = await User.findOne({ email }).select('+matKhau');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản bị khóa
    if (user.trangThai === 'khoa') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.soSanhMatKhau(matKhau);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = signToken(user._id.toString());

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          _id: user._id,
          hoTen: user.hoTen,
          email: user.email,
          vaiTro: user.vaiTro,
          avatar: user.avatar,
          anhDaiDien: user.anhDaiDien,
          soDienThoai: user.soDienThoai,
          gioiTinh: user.gioiTinh,
          ngaySinh: user.ngaySinh,
          diaChi: user.diaChi
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id)
      .populate('danhSachYeuThich', 'ten gia hinhAnh');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fieldsToUpdate = {
      hoTen: req.body.hoTen,
      soDienThoai: req.body.soDienThoai,
      avatar: req.body.avatar,
      anhDaiDien: req.body.anhDaiDien,
      gioiTinh: req.body.gioiTinh,
      ngaySinh: req.body.ngaySinh,
      diaChi: req.body.diaChi
    };

    const user = await User.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;

    if (!matKhauCu || !matKhauMoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const user = await User.findById(req.user?._id).select('+matKhau');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await user.soSanhMatKhau(matKhauCu);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không đúng'
      });
    }

    // Cập nhật mật khẩu mới
    user.matKhau = matKhauMoi;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm địa chỉ mới
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hoTen, soDienThoai, tinh, huyen, xa, diaChiChiTiet, macDinh } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (macDinh) {
      user.diaChi?.forEach((addr: any) => {
        addr.macDinh = false;
      });
    }

    // Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
    const isFirstAddress = !user.diaChi || user.diaChi.length === 0;

    user.diaChi = user.diaChi || [];
    user.diaChi.push({
      hoTen,
      soDienThoai,
      tinh,
      huyen,
      xa,
      diaChiChiTiet,
      macDinh: isFirstAddress ? true : (macDinh || false)
    } as any);

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công',
      data: user.diaChi
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật địa chỉ
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { addressId } = req.params;
    const { hoTen, soDienThoai, tinh, huyen, xa, diaChiChiTiet, macDinh } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const addressIndex = user.diaChi?.findIndex((addr: any) => addr._id.toString() === addressId);
    if (addressIndex === undefined || addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ'
      });
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (macDinh) {
      user.diaChi?.forEach((addr: any) => {
        addr.macDinh = false;
      });
    }

    // Cập nhật địa chỉ
    if (user.diaChi) {
      user.diaChi[addressIndex] = {
        hoTen,
        soDienThoai,
        tinh,
        huyen,
        xa,
        diaChiChiTiet,
        macDinh: macDinh || false
      } as any;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: user.diaChi
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const addressIndex = user.diaChi?.findIndex((addr: any) => addr._id.toString() === addressId);
    if (addressIndex === undefined || addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ'
      });
    }

    // Kiểm tra xem có phải địa chỉ mặc định không
    const wasDefault = user.diaChi?.[addressIndex]?.macDinh;

    // Xóa địa chỉ
    user.diaChi?.splice(addressIndex, 1);

    // Nếu xóa địa chỉ mặc định và còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
    if (wasDefault && user.diaChi && user.diaChi.length > 0) {
      (user.diaChi[0] as any).macDinh = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công',
      data: user.diaChi
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đặt địa chỉ mặc định
// @route   PUT /api/auth/addresses/:addressId/set-default
// @access  Private
export const setDefaultAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const addressIndex = user.diaChi?.findIndex((addr: any) => addr._id.toString() === addressId);
    if (addressIndex === undefined || addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ'
      });
    }

    // Bỏ mặc định của tất cả địa chỉ
    user.diaChi?.forEach((addr: any) => {
      addr.macDinh = false;
    });

    // Đặt địa chỉ được chọn làm mặc định
    if (user.diaChi) {
      (user.diaChi[addressIndex] as any).macDinh = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công',
      data: user.diaChi
    });
  } catch (error) {
    next(error);
  }
};

// Cấu hình multer cho avatar
const storage = multer.memoryStorage();
const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  }
});

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    avatarUpload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh'
        });
      }

      try {
        // Upload lên Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'sports-store/avatars',
              transformation: [
                { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(req.file!.buffer);
        });

        const avatarUrl = (result as any).secure_url;

        // Cập nhật avatar của user
        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            avatar: avatarUrl,
            anhDaiDien: avatarUrl
          },
          { new: true }
        );

        res.json({
          success: true,
          message: 'Upload ảnh đại diện thành công',
          data: {
            avatar: avatarUrl,
            user
          }
        });
      } catch (uploadError: any) {
        return res.status(500).json({
          success: false,
          message: uploadError.message || 'Lỗi khi upload ảnh'
        });
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Lấy danh sách yêu thích
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).populate(
      'danhSachYeuThich',
      'ten slug hinhAnh gia giaKhuyenMai danhGia soLuongTonKho'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Map soLuongTonKho to tonKho for frontend compatibility
    const wishlistWithStock = (user.danhSachYeuThich as any[]).map((item: any) => ({
      ...item.toObject(),
      tonKho: item.soLuongTonKho
    }));

    res.json({
      success: true,
      data: wishlistWithStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm sản phẩm vào danh sách yêu thích
// @route   POST /api/users/wishlist
// @access  Private
export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sanPham } = req.body;

    if (!sanPham) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID sản phẩm'
      });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra sản phẩm đã có trong danh sách chưa
    if (user.danhSachYeuThich.includes(sanPham)) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong danh sách yêu thích'
      });
    }

    user.danhSachYeuThich.push(sanPham);
    await user.save();

    // Populate để trả về thông tin sản phẩm
    await user.populate('danhSachYeuThich', 'ten slug hinhAnh gia giaKhuyenMai danhGia tonKho');

    res.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: user.danhSachYeuThich
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sản phẩm khỏi danh sách yêu thích
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    user.danhSachYeuThich = user.danhSachYeuThich.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    await user.populate('danhSachYeuThich', 'ten slug hinhAnh gia giaKhuyenMai danhGia tonKho');

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
      data: user.danhSachYeuThich
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Lấy giỏ hàng
// @route   GET /api/users/cart
// @access  Private
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user.gioHang || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/users/cart
// @access  Private
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sanPham, ten, slug, hinhAnh, gia, giaKhuyenMai, kichThuoc, mauSac, soLuong, tonKho } = req.body;

    if (!sanPham || !ten || !slug || !hinhAnh || !gia || !kichThuoc || !mauSac || !soLuong || !tonKho) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm'
      });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa (cùng sản phẩm, size, màu)
    const existingItemIndex = user.gioHang.findIndex(
      (item) =>
        item.sanPham.toString() === sanPham &&
        item.kichThuoc === kichThuoc &&
        item.mauSac === mauSac
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, tăng số lượng
      user.gioHang[existingItemIndex].soLuong += soLuong;
    } else {
      // Nếu chưa có, thêm mới
      user.gioHang.push({
        sanPham,
        ten,
        slug,
        hinhAnh,
        gia,
        giaKhuyenMai,
        kichThuoc,
        mauSac,
        soLuong,
        tonKho
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      data: user.gioHang
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
// @route   PUT /api/users/cart
// @access  Private
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sanPham, kichThuoc, mauSac, soLuong } = req.body;

    if (!sanPham || !kichThuoc || !mauSac || !soLuong || soLuong < 1) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin và số lượng phải lớn hơn 0'
      });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const cartItemIndex = user.gioHang.findIndex(
      (item) =>
        item.sanPham.toString() === sanPham &&
        item.kichThuoc === kichThuoc &&
        item.mauSac === mauSac
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    user.gioHang[cartItemIndex].soLuong = soLuong;
    await user.save();

    res.json({
      success: true,
      message: 'Đã cập nhật giỏ hàng',
      data: user.gioHang
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/users/cart/item
// @access  Private (body: {sanPham, kichThuoc, mauSac})
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sanPham, kichThuoc, mauSac } = req.body;

    if (!sanPham || !kichThuoc || !mauSac) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm'
      });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Sử dụng filter để xóa item khỏi mảng
    const initialLength = user.gioHang.length;
    user.gioHang = user.gioHang.filter(
      (item) =>
        !(
          item.sanPham.toString() === sanPham &&
          item.kichThuoc === kichThuoc &&
          item.mauSac === mauSac
        )
    );

    if (user.gioHang.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Đã xóa khỏi giỏ hàng',
      data: user.gioHang
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    user.gioHang = [];
    await user.save();

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng',
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quên mật khẩu - Gửi email reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    // Tạo reset token
    const resetToken = user.taoResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Trong môi trường development, trả về token để test
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Gửi email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
        ...(isDevelopment && { resetToken, resetUrl: `${process.env.CLIENT_URL || 'http://localhost:3001'}/dat-lai-mat-khau?token=${resetToken}` })
      });
    } catch (emailError) {
      console.error('Email error:', emailError);

      // Trong development, vẫn trả về thành công với token để test
      if (isDevelopment) {
        return res.json({
          success: true,
          message: 'Chế độ development: Email service không khả dụng, sử dụng link bên dưới để test',
          resetToken,
          resetUrl: `${process.env.CLIENT_URL || 'http://localhost:3001'}/dat-lai-mat-khau?token=${resetToken}`
        });
      }

      // Production: Xóa token và báo lỗi
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Đặt lại mật khẩu
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, matKhauMoi } = req.body;

    if (!token || !matKhauMoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    if (matKhauMoi.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Tìm user có resetPasswordExpire > hiện tại
    const users = await User.find({
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken');

    // Tìm user có token khớp
    let user = null;
    for (const u of users) {
      if (u.resetPasswordToken && bcrypt.compareSync(token, u.resetPasswordToken)) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Đặt mật khẩu mới
    user.matKhau = matKhauMoi;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.'
    });
  } catch (error) {
    next(error);
  }
};
