# BiharEssence - Database Setup Guide

## Prerequisites
1. PostgreSQL installed on your system
2. Node.js and npm installed

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port is 5432

### Mac:
```bash
brew install postgresql
brew services start postgresql
```

### Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE biharessence;
```

Or use command line:
```bash
# Windows/Mac/Linux
psql -U postgres
CREATE DATABASE biharessence;
\q
```

## Step 3: Run Database Schema

Navigate to your project folder and run:

```bash
psql -U postgres -d biharessence -f database/complete-schema.sql
```

This will create all tables and insert sample products.

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` file and update your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biharessence
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
JWT_SECRET=change_this_to_random_secret_key
```

## Step 5: Install Dependencies

```bash
npm install bcryptjs jsonwebtoken dotenv
```

## Step 6: Start the Server

```bash
# Start backend server
npm run server

# In another terminal, start frontend
npm start
```

## Verify Database Connection

Check server logs for:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

## Database Tables Created:

1. **users** - User accounts (signup/login)
2. **products** - All products with stock management
3. **orders** - Customer orders
4. **order_items** - Items in each order

## Test the Setup:

1. Go to: http://localhost:1234/login
2. Click "Sign Up" (if signup component is created)
3. Register a new account
4. Login and browse products
5. Place an order - it will be saved in database!

## Troubleshooting:

### Connection Error:
- Check if PostgreSQL is running
- Verify database name and credentials in `.env`
- Make sure port 5432 is not blocked

### Tables Not Created:
- Run the SQL file again
- Check for errors in psql output

### Cannot Install bcryptjs:
```bash
npm install --legacy-peer-deps
```

## Next Steps:
- Create Signup component in frontend
- Update Login to use real API
- Test order creation
- Ready for production deployment!
