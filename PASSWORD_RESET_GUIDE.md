# PostgreSQL Password Reset Guide

## Quick Fix - Use pgAdmin (Easiest Method)

### Option 1: Reset via pgAdmin (Recommended)

1. **Open pgAdmin** (came with PostgreSQL installation)
2. **Connect to server** using your original password
3. **Right-click on "postgres" user** → Properties
4. **Go to "Definition" tab**
5. **Set new password**: `postgres` (simple for development)
6. **Click Save**

### Option 2: Set Environment Password

If you don't remember the password, use this method:

1. **Stop trying to connect to PostgreSQL**
2. **Use SQLite instead** (no password needed):

```bash
npm install better-sqlite3
```

I can modify the server to use SQLite which doesn't require any password!

### Option 3: Manual PostgreSQL Reset (Advanced)

1. Open as Administrator: `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`
2. Find: `host    all             all             127.0.0.1/32            scram-sha-256`
3. Change to: `host    all             all             127.0.0.1/32            trust`
4. Open `services.msc` → Restart "postgresql-x64-17"
5. Run: `psql -U postgres`
6. Execute: `ALTER USER postgres WITH PASSWORD 'postgres';`
7. Change pg_hba.conf back to `scram-sha-256`
8. Restart service again

### Option 4: Use Default Password

Try these common default passwords in `.env`:
- `postgres`
- `admin`
- `root`
- (blank - empty string)

Update `.env`:
```
DB_PASSWORD=siemens
```

Then try connecting again!

## Easiest Solution: Let me know if you want to switch to SQLite!

SQLite requires:
- ❌ No password
- ❌ No installation
- ❌ No server running
- ✅ Just works!

Perfect for development and can easily migrate to PostgreSQL later for production.
