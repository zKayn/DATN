export const MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công',
    REGISTER: 'Đăng ký thành công',
    LOGOUT: 'Đăng xuất thành công',
    ADD_TO_CART: 'Đã thêm vào giỏ hàng',
    ADD_TO_WISHLIST: 'Đã thêm vào danh sách yêu thích',
    REMOVE_FROM_WISHLIST: 'Đã xóa khỏi danh sách yêu thích',
    UPDATE_PROFILE: 'Cập nhật thông tin thành công',
    ORDER_CREATED: 'Đặt hàng thành công',
    REVIEW_SUBMITTED: 'Gửi đánh giá thành công',
  },

  // Error messages
  ERROR: {
    NETWORK: 'Lỗi kết nối. Vui lòng kiểm tra internet',
    SERVER: 'Lỗi máy chủ. Vui lòng thử lại sau',
    UNAUTHORIZED: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
    NOT_FOUND: 'Không tìm thấy dữ liệu',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin',
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_PHONE: 'Số điện thoại không hợp lệ',
    PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
    PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
    OUT_OF_STOCK: 'Sản phẩm đã hết hàng',
    CART_EMPTY: 'Giỏ hàng trống',
    UNKNOWN: 'Đã có lỗi xảy ra. Vui lòng thử lại',
  },

  // Confirmation messages
  CONFIRM: {
    LOGOUT: 'Bạn có chắc muốn đăng xuất?',
    DELETE_CART_ITEM: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
    CLEAR_CART: 'Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?',
    CANCEL_ORDER: 'Bạn có chắc muốn hủy đơn hàng này?',
    DELETE_REVIEW: 'Bạn có chắc muốn xóa đánh giá này?',
  },

  // Info messages
  INFO: {
    LOADING: 'Đang tải...',
    PROCESSING: 'Đang xử lý...',
    SEARCHING: 'Đang tìm kiếm...',
    NO_PRODUCTS: 'Không có sản phẩm nào',
    NO_RESULTS: 'Không tìm thấy kết quả',
    NO_ORDERS: 'Chưa có đơn hàng nào',
    NO_REVIEWS: 'Chưa có đánh giá nào',
    LOGIN_REQUIRED: 'Vui lòng đăng nhập để tiếp tục',
  },

  // Validation messages
  VALIDATION: {
    REQUIRED: 'Trường này là bắt buộc',
    EMAIL_INVALID: 'Email không hợp lệ',
    PHONE_INVALID: 'Số điện thoại không hợp lệ',
    MIN_LENGTH: (min: number) => `Tối thiểu ${min} ký tự`,
    MAX_LENGTH: (max: number) => `Tối đa ${max} ký tự`,
    MIN_VALUE: (min: number) => `Giá trị tối thiểu là ${min}`,
    MAX_VALUE: (max: number) => `Giá trị tối đa là ${max}`,
  },

  // Order status
  ORDER_STATUS: {
    'cho-xac-nhan': 'Chờ xác nhận',
    'dang-xu-ly': 'Đang xử lý',
    'dang-giao': 'Đang giao hàng',
    'hoan-thanh': 'Hoàn thành',
    'da-huy': 'Đã hủy',
  },

  // Payment methods
  PAYMENT_METHOD: {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay',
  },
};

export default MESSAGES;
