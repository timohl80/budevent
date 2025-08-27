# 🔐 Google OAuth Setup Guide for BudEvent

## 📋 Prerequisites
- Google account
- Access to Google Cloud Console
- Your BudEvent application running locally

## 🚀 Step 1: Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable the Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity and Access Management (IAM) API"

## 🔑 Step 2: Create OAuth 2.0 Credentials

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Configure the OAuth consent screen:**
   - User Type: External
   - App name: BudEvent
   - User support email: your-email@domain.com
   - Developer contact information: your-email@domain.com
   - Add scopes: `email`, `profile`, `openid`

4. **Create OAuth 2.0 Client ID:**
   - Application type: Web application
   - Name: BudEvent Web Client
   - **Authorized redirect URIs:**
     ```
     http://localhost:3002/api/auth/callback/google
     https://budevent.se/api/auth/callback/google
     https://budevent.vercel.app/api/auth/callback/google
     ```

5. **Copy your credentials:**
   - Client ID
   - Client Secret

## ⚙️ Step 3: Update Environment Variables

### **Local Development (.env.local)**
```bash
# Add these to your .env.local file
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### **Vercel Production**
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add:
   - `GOOGLE_CLIENT_ID`: your Google client ID
   - `GOOGLE_CLIENT_SECRET`: your Google client secret

## 🧪 Step 4: Test Google Sign-In

1. **Start your local development server:**
   ```bash
   npm run dev
   ```

2. **Go to your welcome page** (`http://localhost:3002/welcome`)
3. **Click "Continue with Google"**
4. **Complete the Google OAuth flow**
5. **Verify you're redirected to the home page**

## 🔒 Step 5: Security Considerations

### **OAuth Consent Screen**
- Add your domain to authorized domains
- Set appropriate scopes (email, profile, openid)
- Configure user support information

### **Redirect URIs**
- Only include your actual domains
- Use HTTPS for production
- Test both local and production URLs

### **Client Secret**
- Keep your client secret secure
- Never commit it to version control
- Use environment variables

## 🐛 Troubleshooting

### **Common Issues:**

1. **"redirect_uri_mismatch" error:**
   - Verify redirect URIs in Google Cloud Console
   - Check for typos in URLs
   - Ensure protocol matches (http vs https)

2. **"invalid_client" error:**
   - Verify client ID and secret
   - Check environment variables are loaded
   - Restart development server after env changes

3. **"access_denied" error:**
   - Check OAuth consent screen configuration
   - Verify API is enabled
   - Check scopes are properly configured

### **Debug Steps:**
1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Google Cloud Console logs
4. Test with different browsers/incognito mode

## 📱 Features Implemented

✅ **Google OAuth Provider** - Added to NextAuth configuration  
✅ **Auto-approval** - Google users are automatically approved  
✅ **User Creation** - New Google users are created in database  
✅ **Session Management** - Proper JWT and session handling  
✅ **UI Integration** - Google buttons on all auth pages  
✅ **Error Handling** - Comprehensive error handling and validation  

## 🔄 Next Steps

After successful setup:
1. **Test with multiple Google accounts**
2. **Verify user creation in Supabase**
3. **Test production deployment**
4. **Monitor OAuth usage in Google Cloud Console**

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Verify environment variables
3. Check browser console for errors
4. Ensure all redirect URIs are correct

---

**Happy coding! 🎉**
