# 🚀 BudEvent Deployment Guide - Vercel

## 📋 **Prerequisites**
- [ ] Vercel account created
- [ ] GitHub repository with your code
- [ ] Supabase project set up
- [ ] Resend API key (for emails)

## 🔑 **Environment Variables for Vercel**

You'll need to add these in your Vercel dashboard:

### **Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **NextAuth Configuration**
```
NEXTAUTH_SECRET=your_long_random_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
```

### **Email Service**
```
RESEND_API_KEY=your_resend_api_key_here
```

## 🚀 **Deployment Steps**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### **Step 2: Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js app
5. Add your environment variables
6. Click "Deploy"

### **Step 3: Configure Domain**
- Vercel will give you a `.vercel.app` domain
- You can add a custom domain later

## 🔧 **Post-Deployment Setup**

### **Update Supabase Auth Settings**
1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Add your Vercel domain to:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/api/auth/callback/credentials`

### **Test Your App**
- ✅ Authentication works
- ✅ Events load properly
- ✅ RSVP functionality works
- ✅ Emails are sent

## 📱 **Custom Domain (Optional)**
1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` to match
5. Update Supabase auth settings

## 🆘 **Troubleshooting**

### **Common Issues:**
- **Environment variables not set** - Check Vercel dashboard
- **Supabase connection fails** - Verify URLs and keys
- **Authentication redirects** - Check Supabase auth settings
- **Build errors** - Check Vercel build logs

### **Need Help?**
- Vercel has excellent documentation
- Check build logs in Vercel dashboard
- Verify all environment variables are set

## 🎉 **You're Live!**
Once deployed, your BudEvent app will be accessible at:
`https://your-project.vercel.app`

---

**Happy Deploying! 🚀**
