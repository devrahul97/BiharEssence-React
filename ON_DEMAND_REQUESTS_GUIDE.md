# On-Demand Product Requests - Complete Guide

## Overview
The On-Demand Requests feature allows customers to request custom products not available in the regular catalog. Admins can view, manage, and update the status of these requests.

---

## 🗄️ **DATABASE SETUP**

### Step 1: Run the SQL Migration

You need to create the `on_demand_requests` table in your PostgreSQL database.

#### Option A: Using PowerShell
```powershell
cd backend/database
psql -U postgres -d biharessence -f add-on-demand-requests.sql
```

#### Option B: Using pgAdmin or any PostgreSQL client
1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to your `biharessence` database
3. Run the SQL from `backend/database/add-on-demand-requests.sql`

#### Option C: Manual SQL Execution
Connect to PostgreSQL and run:
```sql
CREATE TABLE IF NOT EXISTS on_demand_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    mobile_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    estimated_price DECIMAL(10, 2),
    payment_preference VARCHAR(50) NOT NULL,
    additional_requirements TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_on_demand_requests_user_id ON on_demand_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_on_demand_requests_status ON on_demand_requests(status);
```

---

## 👨‍💼 **FOR ADMIN - View On-Demand Requests**

### Access the Admin Dashboard
1. Login as admin (email: admin@biharessence.com)
2. Navigate to: `http://localhost:1234/admin/dashboard`
3. Click on the **"On-Demand Requests"** tab
4. You'll see all customer requests with:
   - Customer name and contact details
   - Product name and description
   - Mobile number
   - Delivery address
   - Estimated price (if provided)
   - Current status
   - Request date

### Update Request Status
1. Click the **status dropdown** for any request
2. Select a new status:
   - **Pending** - New request, not yet processed
   - **Contacted** - Customer has been contacted
   - **Processing** - Working on fulfilling the request
   - **Fulfilled** - Request completed successfully
   - **Cancelled** - Request was cancelled
3. Add admin notes when prompted (optional)
4. The status will update automatically

### View Full Details
1. Click the **"View Details"** button on any request
2. See complete information including:
   - All customer details
   - Product specifications
   - Payment preferences
   - Additional requirements
   - Admin notes
   - Request timeline

---

## 👨‍💻 **FOR DEVELOPERS - View Requests in Database**

### Option 1: Using psql Command Line
```powershell
# Connect to database
psql -U postgres -d biharessence

# View all on-demand requests
SELECT * FROM on_demand_requests ORDER BY created_at DESC;

# View requests with customer details
SELECT 
    odr.id,
    odr.product_name,
    odr.customer_name,
    odr.mobile_number,
    odr.status,
    u.email as user_email,
    odr.created_at
FROM on_demand_requests odr
LEFT JOIN users u ON odr.user_id = u.id
ORDER BY odr.created_at DESC;

# Count requests by status
SELECT status, COUNT(*) as count
FROM on_demand_requests
GROUP BY status;

# Exit psql
\q
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Navigate to: Servers > PostgreSQL > Databases > biharessence > Schemas > public > Tables
3. Right-click on `on_demand_requests` table
4. Select "View/Edit Data" > "All Rows"

### Option 3: Using DBeaver
1. Open DBeaver
2. Connect to your PostgreSQL database
3. Expand: biharessence > public > Tables
4. Double-click `on_demand_requests`
5. Click "Data" tab to view all records

---

## 🔍 **API ENDPOINTS**

### Customer Endpoints (Requires Authentication)

#### Submit On-Demand Request
```http
POST /api/orders/on-demand-request
Authorization: Bearer {token}
Content-Type: application/json

{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "productName": "Special Bihar Mango",
    "productDescription": "Fresh Dussehri mangoes from Darbhanga",
    "mobileNumber": "9876543210",
    "address": "123 Street, City, Bihar - 800001",
    "estimatedPrice": "500",
    "paymentPreference": "later",
    "additionalRequirements": "Pack in eco-friendly material"
}
```

#### View My Requests
```http
GET /api/orders/on-demand-requests
Authorization: Bearer {token}
```

### Admin Endpoints (Requires Admin Role)

#### View All Requests
```http
GET /api/admin/on-demand-requests
Authorization: Bearer {admin_token}
```

#### Update Request Status
```http
PATCH /api/admin/on-demand-requests/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "status": "contacted",
    "adminNotes": "Called customer, will arrange delivery by Friday"
}
```

---

## 🧪 **TESTING THE FEATURE**

### Test as Customer:
1. Login as a regular user
2. Navigate to: `http://localhost:1234/on-demand`
3. Fill out the on-demand request form:
   - Product Name: "Test Product"
   - Description: "Testing the feature"
   - Mobile Number: Your number
   - Address: Test address
   - Estimated Price: 100
   - Payment Preference: "later"
4. Submit the request
5. You should see: "✅ Request submitted successfully!"

### Test as Admin:
1. Login as admin
2. Go to Admin Dashboard > On-Demand Requests tab
3. You should see the test request
4. Try updating the status
5. View the full details

### Verify in Database:
```sql
-- Check if your test request was saved
SELECT * FROM on_demand_requests 
WHERE product_name = 'Test Product';
```

---

## 📊 **STATUS VALUES**

| Status | Description |
|--------|-------------|
| `pending` | New request, awaiting review |
| `contacted` | Admin has reached out to customer |
| `processing` | Actively working on the request |
| `fulfilled` | Request completed successfully |
| `cancelled` | Request was cancelled |

---

## 🔧 **TROUBLESHOOTING**

### Issue: Can't see on-demand requests in Admin Dashboard
**Solution:**
1. Make sure the database table is created (run the SQL migration)
2. Restart the backend server: `node backend/server-new.js`
3. Clear browser cache and refresh
4. Check browser console for errors

### Issue: "Table doesn't exist" error
**Solution:**
```powershell
# Run the migration
cd backend/database
psql -U postgres -d biharessence -f add-on-demand-requests.sql
```

### Issue: 403 Forbidden when accessing admin endpoints
**Solution:**
1. Make sure you're logged in as admin
2. Check that your token is valid
3. Verify admin role in database:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@biharessence.com';
```

---

## 📝 **SUMMARY**

✅ **Database Table Created**: `on_demand_requests`  
✅ **Customer Interface**: `/on-demand` page  
✅ **Admin Interface**: `/admin/dashboard` (On-Demand Requests tab)  
✅ **Backend APIs**: All endpoints implemented  
✅ **Status Management**: Dropdown with 5 statuses  
✅ **Full Details View**: View complete request information

---

**Need Help?**
- Check server logs: Look at terminal running `node backend/server-new.js`
- Check browser console: Press F12 > Console tab
- Verify database connection: Ensure PostgreSQL is running
- Test API endpoints: Use Postman or curl to test directly
