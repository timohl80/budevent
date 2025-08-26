# 🔐 Authorization System Setup Guide

## Overview

Your BudEvent application now includes a comprehensive authorization system where new users must be approved by an admin before they can access the platform.

## 🚀 Quick Setup

### 1. Update Database Schema

Run the SQL script in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `add-approval-fields.sql`
4. Click **Run** to execute the script

### 2. Configure Admin Users

The system automatically sets `timohl@hotmail.com` as an admin. To add more admins:

```sql
UPDATE users 
SET role = 'ADMIN',
    is_approved = true,
    approved_at = created_at
WHERE email = 'your-admin-email@example.com';
```

### 3. Test the System

1. **Register a new account** with a different email
2. **Try to log in** - you should see "Account pending approval" message
3. **Log in as admin** (timohl@hotmail.com)
4. **Go to Admin Dashboard** (`/admin`)
5. **Approve the new user**
6. **Test login** with the approved account

## 🔧 How It Works

### User Registration Flow
1. **User registers** → Account created with `is_approved = false`
2. **User tries to login** → Blocked with approval message
3. **Admin reviews** → Approves or rejects in admin dashboard
4. **User receives email** → Notification of approval/rejection
5. **User can login** → Only after approval

### Admin Dashboard Features
- **Pending Approvals** - Review new registrations
- **User Management** - View all approved users
- **Approval Actions** - Approve, reject, or delete users
- **Statistics** - Overview of user counts

## 📧 Email Notifications

The system automatically sends emails for:
- **Account Approval** - User notified when approved
- **Account Rejection** - User notified with reason (optional)

## 🛡️ Security Features

- **Role-based access** - Only admins can access admin dashboard
- **Approval required** - New users cannot access platform without approval
- **Audit trail** - Track who approved/rejected users and when
- **Rate limiting** - Prevent registration spam

## 🔄 Customization Options

### Change Admin Emails
Update the admin email list in:
- `src/components/TopNav.tsx` (line ~45)
- `src/app/admin/page.tsx` (line ~60)
- All admin API routes

### Modify Approval Process
- Add additional approval criteria
- Implement multi-level approval
- Add approval workflow steps

### Custom Email Templates
- Modify approval/rejection email content
- Add branding to notification emails
- Include additional information

## 🚨 Troubleshooting

### Common Issues

1. **"Access Denied" on admin page**
   - Ensure your email is in the admin list
   - Check if you're logged in

2. **Users can't login after approval**
   - Verify `is_approved` is set to `true` in database
   - Check if approval timestamp is set

3. **Admin dashboard not loading**
   - Verify database schema is updated
   - Check browser console for errors

### Database Verification

Check if the new columns exist:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_approved', 'role', 'approved_at');
```

## 📱 User Experience

### For New Users
- Clear messaging about approval process
- Professional appearance builds trust
- Email notifications keep users informed

### For Admins
- Intuitive dashboard interface
- Quick approval/rejection actions
- Comprehensive user management

## 🔮 Future Enhancements

Consider adding:
- **Bulk user operations** - Approve/reject multiple users
- **User import/export** - CSV upload for user management
- **Advanced filtering** - Search and filter users
- **Approval workflows** - Multi-step approval process
- **User analytics** - Registration and approval metrics

## ✅ System Requirements

- **Supabase** - For database and authentication
- **NextAuth.js** - For session management
- **Next.js 13+** - For API routes and components
- **TypeScript** - For type safety

## 🎯 Benefits

- **Quality Control** - Only approved users can access platform
- **Security** - Prevent unauthorized access
- **Professional Image** - Controlled user base
- **Scalability** - Easy to manage as user base grows
- **Compliance** - Meet regulatory requirements if needed

---

**Your BudEvent platform now has enterprise-grade user management!** 🎉
