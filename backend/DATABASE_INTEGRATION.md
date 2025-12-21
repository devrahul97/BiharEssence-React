# 🚀 BiharEssence - Complete Database Integration Guide

## ✅ What's Been Set Up

I've integrated a **full PostgreSQL database** system into your BiharEssence application with:

### 🔐 Authentication System
- **User Signup** - New users can create accounts
- **User Login** - Secure JWT-based authentication  
- **Password Encryption** - Using bcryptjs
- **Token Management** - 7-day JWT tokens

### 🗄️ Database Tables
1. **users** - User accounts with encrypted passwords
2. **products** - Product catalog with stock management
3. **orders** - All customer orders linked to users
4. **order_items** - Detailed items in each order

### 📁 New Files Created
- `server-new.js` - Complete backend API with PostgreSQL
- `database/complete-schema.sql` - Database structure with sample products
- `src/components/Signup.js` - User registration page
- `.env` - Environment configuration
- `DATABASE_SETUP.md` - Detailed setup instructions
- `setup-database.ps1` - Automated setup script

---

## 🛠️ Quick Setup (5 Minutes)

### Option 1: Automated Setup (Recommended)

1. **Install PostgreSQL** (if not installed):
   - Download: https://www.postgresql.org/download/windows/
   - During installation, remember the password for 'postgres' user

2. **Run Setup Script**:
   ```powershell
   ./setup-database.ps1
   ```
   - Enter your PostgreSQL password when prompted
   - Script will create database, tables, and configure everything!

### Option 2: Manual Setup

1. **Create Database**:
   ```powershell
   psql -U postgres
   CREATE DATABASE biharessence;
   \q
   ```

2. **Run Schema**:
   ```powershell
   psql -U postgres -d biharessence -f database/complete-schema.sql
   ```

3. **Configure `.env`**:
   - Update `DB_PASSWORD` with your PostgreSQL password
   - Change `JWT_SECRET` to a random string

---

## 🎯 How to Run

1. **Start Backend Server**:
   ```bash
   node server-new.js
   ```
   You should see:
   ```
   ✅ Database connected successfully
   🚀 Server running on http://localhost:5000
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   npm start
   ```

3. **Open Application**:
   - Go to: http://localhost:1234
   - You'll be redirected to login

---

## 🎨 User Flow

### For New Users:
1. Click "**Sign Up**" on login page
2. Fill registration form:
   - Full Name (letters only)
   - Email
   - Phone (optional, numbers only)
   - Password (min 6 characters)
3. Click "**Sign Up**" button
4. Automatically logged in → Products page

### For Existing Users:
1. Enter email and password
2. Click "**Login**"
3. Browse products and shop!

### Shopping:
1. Browse products (50+ Bihar products in database)
2. Add to cart
3. Checkout with delivery details
4. Place order → **Saved in database!**
5. View "**My Orders**" → See your complete order history

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories

### Orders
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:orderId` - Get single order (requires auth)

---

## 🔍 Testing the Database

### Test User Signup:
```bash
# Using curl or Postman
POST http://localhost:5000/api/auth/signup
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Verify in Database:
```sql
psql -U postgres -d biharessence
SELECT * FROM users;
SELECT * FROM products LIMIT 5;
SELECT * FROM orders;
```

---

## 🚀 Ready for Production?

Your app is now database-ready! When you want to deploy:

1. **Use Supabase** (Free PostgreSQL):
   - Go to supabase.com
   - Create project → Get connection string
   - Update `.env` with Supabase credentials

2. **Deploy to Vercel**:
   - Connect GitHub repo
   - Add environment variables
   - Deploy!

3. **Custom Domain**:
   - Buy domain (biharessence.in)
   - Add to Vercel
   - Done!

---

## 📝 What Changed in Your Code

### Updated Files:
- `package.json` - Added bcryptjs, jsonwebtoken, dotenv
- `src/App.js` - Added /signup route
- `src/components/Login.js` - Now uses real API instead of hardcoded credentials
- `utils/translations.js` - Added signup translations

### New Components:
- `src/components/Signup.js` - Complete registration form with validation

---

## ⚠️ Important Notes

1. **Server File**: Use `server-new.js` (the old `server.js` used JSON files)
2. **Environment**: Never commit `.env` to Git (contains passwords)
3. **Security**: Change `JWT_SECRET` in production to a strong random string
4. **Stock Management**: Orders automatically decrease product stock

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check if PostgreSQL is running
- Verify password in `.env`
- Ensure database `biharessence` exists

### "Cannot find module bcryptjs"
```bash
npm install --legacy-peer-deps
```

### "Port 5000 already in use"
- Change `PORT=5001` in `.env`
- Update API calls in frontend if needed

---

## 🎉 Success!

You now have a **production-ready e-commerce application** with:
- ✅ User authentication
- ✅ Database integration
- ✅ Order management
- ✅ Stock tracking
- ✅ Complete order history
- ✅ Ready for deployment

**Start the servers and try creating an account!** 🚀
