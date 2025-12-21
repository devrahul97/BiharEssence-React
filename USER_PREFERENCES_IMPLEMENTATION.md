# User-Specific Theme & Language Implementation

## Overview
Theme and language preferences are now **user-specific** instead of browser-specific. Each user's preferences are stored in their profile on the backend and synchronized across all their sessions.

## What Changed

### 1. Database Schema
Added two new columns to the `users` table:
- `theme VARCHAR(20) DEFAULT 'light'` - Stores 'light' or 'dark'
- `language VARCHAR(20) DEFAULT 'en'` - Stores 'english' or 'hindi'

### 2. Backend API (server-new.js)

#### New Endpoint
**PATCH `/api/auth/preferences`** (requires authentication)
- Updates user's theme and/or language preferences
- Request body: `{ theme: 'dark', language: 'hindi' }`
- Returns updated user object

#### Updated Endpoints
- **POST `/api/auth/login`** - Now returns theme and language in user object
- **POST `/api/auth/signup`** - Now returns theme and language in user object  
- **GET `/api/auth/me`** - Now includes theme and language fields

### 3. Frontend Changes

#### Redux Slices
**utils/themeSlice.js**
- Removed localStorage dependency
- Default theme: `light` for all users (guests and logged out)
- Theme only changes when user logs in (loaded from backend) or toggles theme

**utils/languageSlice.js**
- Removed localStorage dependency
- Default language: `english` for all users (guests and logged out)
- Language only changes when user logs in (loaded from backend) or changes language

**utils/authSlice.js**
- Logout now clears token and cart (as before)
- Theme and language reset to defaults handled by their respective slices

#### New Utility
**utils/preferencesApi.js**
- `updateUserPreferences({ theme, language })` - Saves preferences to backend
- Automatically includes auth token from localStorage
- Called when user toggles theme or changes language

#### Component Updates
**src/components/Login.js**
- On successful login, loads user's theme and language preferences
- `dispatch(setTheme(data.user.theme))`
- `dispatch(setLanguage(data.user.language))`

**src/components/Signup.js**
- On successful signup, loads user's theme and language preferences
- New users get default preferences ('light' theme, 'english' language)

**src/components/Header.js**
- `handleThemeToggle()` - Toggles theme locally AND saves to backend
- `handleLanguageChange()` - Changes language locally AND saves to backend
- Only saves to backend if user is authenticated
- Guests can toggle theme/language but changes aren't saved

## How It Works

### Guest Users
1. See default light theme and English language
2. Can toggle theme/language, but changes are **not saved**
3. On page refresh, resets to defaults
4. On login, gets their saved preferences

### Authenticated Users
1. **On Login:**
   - Backend sends user's saved theme and language
   - Frontend applies these preferences immediately
   
2. **On Theme Toggle:**
   - Redux state updates (instant UI change)
   - Backend API called to save preference
   - If API fails, preference still works for current session
   
3. **On Language Change:**
   - Redux state updates (instant UI change)
   - Backend API called to save preference
   - If API fails, preference still works for current session

4. **On Logout:**
   - Theme resets to light
   - Language resets to English
   - Next login loads that user's preferences again

### Multi-User Scenario (Same Computer)
**Before Fix:**
- User A sets dark theme
- User A logs out
- User B logs in
- User B sees User A's dark theme ❌

**After Fix:**
- User A sets dark theme (saved to User A's profile)
- User A logs out (theme resets to light)
- User B logs in
- User B sees their own theme preference ✅

## Testing Instructions

### Test 1: User-Specific Theme
1. Login as User A (e.g., rahul@gmail.com)
2. Toggle theme to dark
3. Logout
4. Login as User B (different account)
5. ✅ User B should see their own theme preference (not User A's dark theme)

### Test 2: Theme Persistence
1. Login as any user
2. Toggle theme to dark
3. Refresh page
4. ✅ Theme should still be dark (loaded from backend)
5. Open in different browser
6. Login as same user
7. ✅ Theme should be dark there too

### Test 3: Guest User Theme
1. Logout (or open incognito window)
2. Toggle theme to dark
3. Refresh page
4. ✅ Theme should reset to light (not saved for guests)

### Test 4: Language Preferences
1. Login as any user
2. Change language to हिंदी
3. Logout and login again
4. ✅ Language should still be हिंदी

## Database Migration
If you have existing users, run this SQL to add the new columns:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'en';
```

This is already included in `backend/database/complete-schema.sql` for new installations.

## API Examples

### Update Theme
```bash
curl -X PATCH http://localhost:5000/api/auth/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"theme": "dark"}'
```

### Update Language
```bash
curl -X PATCH http://localhost:5000/api/auth/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"language": "hindi"}'
```

### Update Both
```bash
curl -X PATCH http://localhost:5000/api/auth/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"theme": "dark", "language": "hindi"}'
```

## Benefits

✅ **Privacy:** Users' preferences don't leak to other users  
✅ **Consistency:** Same preferences across all devices  
✅ **Better UX:** Users get their preferences immediately on login  
✅ **Security:** No sensitive data in browser localStorage  
✅ **Multi-user friendly:** Perfect for shared/office computers

## Files Modified
- `backend/database/complete-schema.sql` - Added theme/language columns
- `backend/server-new.js` - New preferences endpoint, updated auth responses
- `utils/themeSlice.js` - Removed localStorage, simplified
- `utils/languageSlice.js` - Removed localStorage, simplified
- `utils/authSlice.js` - Updated logout comment
- `utils/preferencesApi.js` - NEW FILE: API helper for saving preferences
- `src/components/Login.js` - Load preferences on login
- `src/components/Signup.js` - Load preferences on signup
- `src/components/Header.js` - Save preferences to backend on change
