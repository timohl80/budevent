# ✅ Vercel Deployment Checklist

## 🔐 **Account Setup**
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub (recommended)

## 📁 **Code Preparation**
- [ ] Push latest code to GitHub
- [ ] Ensure all changes are committed

## 🔑 **Environment Variables to Add in Vercel**
Copy these from your local `.env.local` file:

### **Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **NextAuth**
- `NEXTAUTH_SECRET` (use: `1plRcGQvSWJ0P4cMmuQiJIgA8rykYbrAKnBkZqObvgM=`)
- `NEXTAUTH_URL` (will be: `https://your-project.vercel.app`)

### **Email**
- `RESEND_API_KEY`

## 🚀 **Deploy Steps**
1. [ ] Go to Vercel dashboard
2. [ ] Click "New Project"
3. [ ] Import your GitHub repo
4. [ ] Add environment variables
5. [ ] Click "Deploy"
6. [ ] Wait for build (2-3 minutes)

## 🔧 **Post-Deploy Setup**
- [ ] Update Supabase auth settings with your Vercel URL
- [ ] Test authentication
- [ ] Test event creation/RSVP
- [ ] Test email functionality

## 🎯 **Your App Will Be Live At:**
`https://your-project-name.vercel.app`

---

**Ready to deploy? Let's go! 🚀**
