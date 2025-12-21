# BiharEssence Database Setup Script
Write-Host "🚀 BiharEssence - Database Setup Started" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Install new NPM dependencies
Write-Host "`n📦 Installing required dependencies..." -ForegroundColor Yellow
npm install bcryptjs jsonwebtoken dotenv

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies. Please run: npm install --legacy-peer-deps" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Step 2: Check if PostgreSQL is installed
Write-Host "`n🔍 Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 3: Prompt for database credentials
Write-Host "`n📝 Please provide your PostgreSQL credentials:" -ForegroundColor Cyan
$dbPassword = Read-Host "Enter PostgreSQL password for user 'postgres'"

# Step 4: Create database
Write-Host "`n🗄️  Creating 'biharessence' database..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
$createDb = "CREATE DATABASE biharessence;" | psql -U postgres 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'biharessence' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database may already exist, continuing..." -ForegroundColor Yellow
}

# Step 5: Run schema
Write-Host "`n📋 Creating database tables..." -ForegroundColor Yellow
psql -U postgres -d biharessence -f database/complete-schema.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database schema" -ForegroundColor Red
    exit 1
}

# Step 6: Update .env file
Write-Host "`n🔧 Updating environment variables..." -ForegroundColor Yellow
$envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biharessence
DB_USER=postgres
DB_PASSWORD=$dbPassword
PORT=5000
NODE_ENV=development
JWT_SECRET=$(New-Guid)
FRONTEND_URL=http://localhost:1234
"@

$envContent | Set-Content -Path ".env"
Write-Host "✅ Environment variables configured!" -ForegroundColor Green

# Step 7: Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 Database Tables Created:" -ForegroundColor Cyan
Write-Host "  • users (User accounts)" -ForegroundColor White
Write-Host "  • products (Product catalog)" -ForegroundColor White
Write-Host "  • orders (Customer orders)" -ForegroundColor White
Write-Host "  • order_items (Order details)" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start the backend server:  npm run server" -ForegroundColor White
Write-Host "  2. In another terminal, start frontend:  npm start" -ForegroundColor White
Write-Host "  3. Go to http://localhost:1234" -ForegroundColor White
Write-Host "  4. Click 'Sign Up' to create an account" -ForegroundColor White
Write-Host "  5. Login and start shopping!" -ForegroundColor White

Write-Host "`n🌟 Your BiharEssence application is ready!" -ForegroundColor Green
