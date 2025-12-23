// API Configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,

  // Auth
  AUTH: `${API_BASE_URL}/auth`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products`,

  // Orders
  ORDERS: `${API_BASE_URL}/orders`,

  // Addresses
  ADDRESSES: `${API_BASE_URL}/addresses`,

  // Admin
  ADMIN_PRODUCTS: `${API_BASE_URL}/admin/products`,
  ADMIN_ORDERS: `${API_BASE_URL}/admin/orders`,
  ADMIN_ON_DEMAND: `${API_BASE_URL}/admin/on-demand-requests`,

  // Analytics
  ANALYTICS_VISIT: `${API_BASE_URL}/analytics/visit`,
  ANALYTICS_SIGNUP: `${API_BASE_URL}/analytics/signup`,
  ANALYTICS_LOGIN: `${API_BASE_URL}/analytics/login`,
  ANALYTICS_STATS: `${API_BASE_URL}/analytics/stats`,
};

export { API_BASE_URL };

// Swiggy API (Legacy)
export const CDN_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";
export const LOGO_URL = "";
export const MENU_API =
  "https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=12.951868&lng=77.7076577&restaurantId=";

// Product Categories
export const PRODUCT_CATEGORIES = [
  "Food",
  "Sweets",
  "Handicraft",
  "Art",
  "Beverages",
  "Dry Fruits",
  "Other",
];

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 8,
  DEFAULT_PAGE: 1,
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: "cod",
  CARD: "card",
  UPI: "upi",
  NET_BANKING: "netbanking",
};
