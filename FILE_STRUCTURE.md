# BiharEssence - File Structure

## 📁 Project Organization

```
BiharEssence-React/
│
├── 📂 src/
│   ├── App.js                          # Main app component with routes
│   │
│   └── 📂 components/                  # React Components
│       ├── 📂 auth/                    # Authentication components
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   └── ProtectedRoute.js
│       │
│       ├── 📂 admin/                   # Admin-only components
│       │   └── AdminDashboard.js
│       │
│       ├── 📂 customer/                # Customer-facing components
│       │   ├── Products.js
│       │   ├── ProductCard.js
│       │   ├── Cart.js
│       │   ├── Checkout.js
│       │   ├── Orders.js
│       │   └── OrderSuccess.js
│       │
│       ├── 📂 layout/                  # Layout components
│       │   └── Header.js
│       │
│       └── 📂 shared/                  # Shared/reusable components
│           ├── Shimmer.js
│           ├── Skeleton.js
│           └── Error.js
│
├── 📂 utils/                           # Utility files
│   ├── 📂 api/                         # API services
│   │   ├── api.js                      # Product APIs
│   │   ├── ordersApi.js                # Order APIs
│   │   └── authApi.js (future)
│   │
│   ├── 📂 store/                       # Redux state management
│   │   ├── appStore.js
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   ├── themeSlice.js
│   │   └── languageSlice.js
│   │
│   ├── 📂 hooks/                       # Custom React hooks
│   │   ├── useOnlineStatus.js
│   │   └── useRestaurantMenu.js
│   │
│   ├── 📂 config/                      # Configuration files
│   │   ├── constants.js                # ✅ Centralized constants
│   │   └── translations.js             # Language translations
│   │
│   └── 📂 data/                        # Static data
│       ├── mockData.js
│       └── groceryData.js
│
├── 📂 database/                        # Database scripts
│   ├── complete-schema.sql
│   ├── setup-admin.sql
│   └── insert-200-products.sql
│
├── 📂 public/                          # Static assets
│   └── Assets/
│
├── server-new.js                       # Express backend server
├── package.json                        # Dependencies
├── tailwind.config.js                  # Tailwind configuration
└── .env                                # Environment variables

```

## 🔧 Current Improvements Made

### ✅ Centralized Constants (`utils/constants.js`)

All API endpoints, categories, and configuration values are now in one place:

```javascript
// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';
export const API_ENDPOINTS = {
    LOGIN: '${API_BASE_URL}/auth/login',
    SIGNUP: '${API_BASE_URL}/auth/signup',
    PRODUCTS: '${API_BASE_URL}/products',
    ORDERS: '${API_BASE_URL}/orders',
    ADMIN_PRODUCTS: '${API_BASE_URL}/admin/products',
    ADMIN_ORDERS: '${API_BASE_URL}/admin/orders',
};

// Product Categories
export const PRODUCT_CATEGORIES = ['Food', 'Sweets', 'Handicraft', ...];

// User Roles
export const USER_ROLES = { CUSTOMER: 'customer', ADMIN: 'admin' };

// And more...
```

### ✅ Updated Components

All components now import from centralized constants:

- ✅ `Login.js` - Uses `API_ENDPOINTS.LOGIN`
- ✅ `Signup.js` - Uses `API_ENDPOINTS.SIGNUP`
- ✅ `AdminDashboard.js` - Uses `API_ENDPOINTS.ADMIN_PRODUCTS`, `PRODUCT_CATEGORIES`
- ✅ `utils/api.js` - Uses `API_ENDPOINTS.PRODUCTS`
- ✅ `utils/ordersApi.js` - Uses `API_ENDPOINTS.ORDERS`

## 📋 Recommended Next Steps

### 1. **Reorganize Components by Feature** (Optional)

Move files into feature-based folders:

```
components/
  ├── auth/       (Login, Signup, ProtectedRoute)
  ├── admin/      (AdminDashboard)
  ├── customer/   (Products, Cart, Orders)
  └── layout/     (Header)
```

### 2. **Create API Service Layer**

Group API files together:

```
utils/api/
  ├── products.api.js
  ├── orders.api.js
  ├── auth.api.js
  └── admin.api.js
```

### 3. **Environment Variables**

Move API URL to `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 Benefits

✅ **Single source of truth** - Change API URL in one place  
✅ **Easier maintenance** - No hardcoded values scattered across files  
✅ **Better developer experience** - Clear constants with autocomplete  
✅ **Production ready** - Easy to switch between dev/prod environments  
✅ **Type safety** - Can add TypeScript later with minimal changes

## 🔄 Migration Status

| File | Status | Uses Constants |
|------|--------|----------------|
| Login.js | ✅ Updated | API_ENDPOINTS.LOGIN |
| Signup.js | ✅ Updated | API_ENDPOINTS.SIGNUP |
| AdminDashboard.js | ✅ Updated | API_ENDPOINTS.ADMIN_*, PRODUCT_CATEGORIES |
| utils/api.js | ✅ Updated | API_ENDPOINTS.PRODUCTS |
| utils/ordersApi.js | ✅ Updated | API_ENDPOINTS.ORDERS |
| constants.js | ✅ Complete | All constants defined |
