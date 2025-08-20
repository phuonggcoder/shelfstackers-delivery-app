// App Configuration
export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://server-shelf-stacker-w1ds.onrender.com',
  
  // JWT Configuration
  JWT_SECRET: process.env.EXPO_PUBLIC_JWT_SECRET || 'phuongduynguyen_secret',
  
  // App Info
  APP_NAME: 'ShelfStacker Delivery',
  APP_VERSION: '1.0.0',
  
  // OTP Configuration
  OTP_LENGTH: 4,
  OTP_EXPIRY: 3 * 60 * 1000, // 3 minutes in milliseconds
  
  // Token Configuration
  ACCESS_TOKEN_EXPIRY: 4 * 60 * 60, // 4 hours in seconds
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days in seconds
};

// API Endpoints - Updated to match userRouter.js structure exactly
export const API_ENDPOINTS = {
  // Authentication endpoints - using /auth prefix (from userRouter.js)
  REQUEST_OTP: '/auth/request-otp',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  VALIDATE_TOKEN: '/auth/validate-token',
  GOOGLE_SIGNIN: '/auth/google-signin',
  GOOGLE_AUTH_STATUS: '/auth/google-auth-status',
  TEST_GOOGLE_TOKEN: '/auth/test-google-token',
  
  // User Management - using /api/users prefix (from userRouter.js)
  GET_CURRENT_USER: '/api/users/me',
  UPDATE_PROFILE: '/api/users/update',
  CHANGE_PASSWORD: '/api/users/change-password',
  GET_USERS: '/api/users/users',
  GET_USER_BY_ID: '/api/users/users',
  CREATE_USER_ADMIN: '/api/users/admin/create',
  LOCK_USER: '/api/users/users',
  DELETE_USER: '/api/users',
  
  // Device Management - using /api/users prefix
  REGISTER_DEVICE_TOKEN: '/api/users/register-device-token',
  UNREGISTER_DEVICE_TOKEN: '/api/users/unregister-device-token',
  GET_DEVICE_TOKENS: '/api/users/device-tokens',
  
  // Session Management - using /api/users prefix
  CREATE_SESSION: '/api/users/session',
  UPDATE_SESSION_FCM: '/api/users/session/fcm',
  GET_MY_SESSIONS: '/api/users/session/my',
  DELETE_SESSION: '/api/users/session',
  
  // Shipper Endpoints - using /api/shipper prefix
  GET_ORDERS: '/api/shipper/orders',
  GET_ORDER: '/api/shipper/orders',
  ACCEPT_ORDER: '/api/shipper/orders',
  REJECT_ORDER: '/api/shipper/orders',
  UPDATE_STATUS: '/api/shipper/orders',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác.',
  INVALID_OTP: 'Mã OTP không đúng hoặc đã hết hạn.',
  EMAIL_EXISTS: 'Email đã tồn tại. Vui lòng sử dụng email khác.',
  PHONE_EXISTS: 'Số điện thoại đã tồn tại.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.',
  GOOGLE_ACCOUNT_EXISTS: 'Email đã tồn tại với tài khoản Google. Vui lòng sử dụng Google login.',
  SMS_ACCOUNT_EXISTS: 'Email đã tồn tại với tài khoản SMS. Vui lòng sử dụng SMS login.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'Mã OTP đã được gửi đến số điện thoại của bạn.',
  OTP_VERIFIED: 'Xác thực OTP thành công.',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  REGISTER_SUCCESS: 'Tài khoản đã được tạo thành công.',
  GOOGLE_LOGIN_SUCCESS: 'Đăng nhập Google thành công.',
  PROFILE_UPDATED: 'Thông tin cá nhân đã được cập nhật.',
  PASSWORD_CHANGED: 'Mật khẩu đã được thay đổi thành công.',
  DEVICE_TOKEN_REGISTERED: 'Thiết bị đã được đăng ký thành công.',
  TOKEN_REFRESHED: 'Token đã được làm mới thành công.',
  SESSION_CREATED: 'Phiên làm việc đã được tạo.',
};
