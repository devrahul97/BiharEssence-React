# Firebase Phone Authentication Setup Instructions

## Step 1: Install Firebase
```bash
npm install firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name (e.g., "BiharEssence")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 3: Enable Phone Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started" if first time
3. Go to **Sign-in method** tab
4. Click on **Phone** provider
5. Click **Enable** toggle
6. Click **Save**

## Step 4: Get Firebase Configuration

1. In Firebase Console, click ⚙️ (Settings) → **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web** icon `</>`
4. Register your app with a nickname (e.g., "BiharEssence Web")
5. Copy the `firebaseConfig` object
6. Paste it in `utils/firebaseConfig.js` (replace the placeholder values)

Example config:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "biharessence-xxxxx.firebaseapp.com",
    projectId: "biharessence-xxxxx",
    storageBucket: "biharessence-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

## Step 5: Add Authorized Domain

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domain (for development, `localhost` is already added)
4. For production, add your actual domain (e.g., `biharessence.com`)

## Step 6: Configure Phone Numbers for Testing (Optional)

For testing without using real SMS:

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test phone number (e.g., `+919999999999`) and test code (e.g., `123456`)
4. These numbers won't send real SMS but will accept the test code

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to login page
3. Click "📱 Mobile OTP" tab
4. Enter a valid Indian mobile number (+91)
5. Click "Send OTP"
6. Check your phone for SMS with OTP
7. Enter OTP and verify

## Important Notes

### Free Tier Limits
- **10,000 verifications/month** - FREE
- After 10K, charges apply (check Firebase pricing)

### Phone Number Format
- Must include country code: `+91` for India
- Example: `+919876543210`

### Security Best Practices
1. Never commit `firebaseConfig.js` with real credentials to public repos
2. Use environment variables for production
3. Enable App Check for additional security
4. Monitor usage in Firebase Console

### Troubleshooting

**"reCAPTCHA verification failed"**
- Make sure domain is authorized in Firebase Console
- Check browser console for errors
- Clear browser cache

**"Too many requests"**
- Firebase has rate limits
- Wait a few minutes before retrying
- Use test phone numbers for development

**SMS not received**
- Check phone number format (+91XXXXXXXXXX)
- Verify phone authentication is enabled
- Check Firebase Console logs
- Try test phone numbers first

### Production Deployment

1. Add production domain to Authorized domains
2. Consider using environment variables:
   ```javascript
   const firebaseConfig = {
       apiKey: process.env.FIREBASE_API_KEY,
       authDomain: process.env.FIREBASE_AUTH_DOMAIN,
       // ... other config
   };
   ```

3. Enable App Check for additional security
4. Monitor usage and costs in Firebase Console

## Support

- [Firebase Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing](https://firebase.google.com/pricing)
