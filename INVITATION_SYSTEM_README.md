# Event Invitation System

This document describes the event invitation system that has been added to BudEvent, allowing event creators to invite specific users from the database and send them email notifications.

## Features

### 🎯 Core Functionality
- **User Selection**: Event creators can select specific users from the approved user database to invite
- **Email Notifications**: Invited users receive beautiful HTML emails with event details and calendar links
- **Personal Messages**: Optional personal messages can be included with invitations
- **Invitation Tracking**: Database tracks invitation status (pending, accepted, declined, cancelled)
- **Automatic RSVP**: Accepting an invitation automatically creates an RSVP

### 📧 Email Features
- **Beautiful HTML Design**: Professional email templates with event branding
- **Calendar Integration**: One-click add to Google Calendar, Outlook, and Apple Calendar
- **Event Details**: Complete event information including date, time, location, and description
- **Personal Touch**: Custom messages from the event organizer
- **Mobile Responsive**: Emails look great on all devices

## Database Schema

### New Table: `event_invitations`
```sql
CREATE TABLE public.event_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    message TEXT, -- Optional personal message from inviter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, invited_user_id) -- One invitation per user per event
);
```

## API Endpoints

### 1. Get Approved Users
**GET** `/api/users/approved`
- Returns list of approved users for invitation selection
- Excludes current user from results
- Used by the user selection component

### 2. Send Event Invitations
**POST** `/api/events/invite`
```json
{
  "eventId": "event-uuid",
  "invitedUserIds": ["user-uuid-1", "user-uuid-2"],
  "message": "Optional personal message"
}
```
- Creates invitation records in database
- Sends email notifications to all invited users
- Returns success/failure status for each email

### 3. Get User Invitations
**GET** `/api/events/invitations`
- Returns all invitations for the current user
- Includes event details and inviter information
- Ordered by invitation date (newest first)

### 4. Respond to Invitation
**POST** `/api/events/invitations/[invitationId]/respond`
```json
{
  "status": "accepted" | "declined"
}
```
- Updates invitation status
- Automatically creates RSVP if accepted
- Only allows responding to pending invitations

## Components

### UserInvitationSelector
- **Location**: `src/components/UserInvitationSelector.tsx`
- **Purpose**: User selection interface for event creation form
- **Features**:
  - Search and filter users by name/email
  - Select all/deselect all functionality
  - Personal message input
  - Collapsible interface
  - Real-time selection feedback

## User Interface

### Event Creation Form
The event creation form now includes:
1. **Invite Users Section**: Collapsible section with user selection
2. **User Search**: Real-time search through approved users
3. **Selection Interface**: Checkbox-based user selection with avatars
4. **Personal Message**: Optional textarea for custom invitation message
5. **Selection Summary**: Shows count of selected users

### Test Page
- **Location**: `/test-invitations`
- **Purpose**: View and respond to invitations
- **Features**:
  - List all user invitations
  - Accept/decline buttons for pending invitations
  - Event details display
  - Status tracking

## Email Templates

### Invitation Email
- **Subject**: "🎉 You're invited to [Event Name]!"
- **Features**:
  - Event details with icons
  - Personal message from organizer
  - Calendar integration buttons
  - Direct link to event page
  - Mobile-responsive design
  - Professional branding

## Setup Instructions

### 1. Database Setup
Run the SQL script to create the invitation system:
```bash
# In Supabase SQL Editor
# Run the contents of add-event-invitations.sql
```

### 2. Environment Variables
Ensure these are set:
- `RESEND_API_KEY`: For sending emails
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

### 3. Testing
1. Create a test event with the invitation system
2. Select users to invite
3. Check email delivery
4. Test invitation responses at `/test-invitations`

## Security Features

### Row Level Security (RLS)
- Users can only view their own invitations
- Event creators can only invite to their own events
- Invited users can only respond to their own invitations
- Proper authentication checks on all endpoints

### Data Validation
- Email format validation
- User existence checks
- Event ownership verification
- Status validation for responses

## Error Handling

### Graceful Degradation
- Event creation succeeds even if invitations fail
- Email failures don't prevent invitation records from being created
- Clear error messages for users
- Comprehensive logging for debugging

### User Feedback
- Success messages with invitation counts
- Warning messages for partial failures
- Loading states during operations
- Clear error states with retry options

## Future Enhancements

### Potential Features
1. **Bulk Invitations**: Invite entire user groups
2. **Invitation Templates**: Pre-saved message templates
3. **Reminder Emails**: Automatic reminders before events
4. **Invitation Analytics**: Track invitation response rates
5. **Social Features**: See who else is invited (with privacy controls)

### Technical Improvements
1. **Email Queue**: Background job processing for large invitation batches
2. **Email Templates**: More template options and customization
3. **Push Notifications**: Real-time notifications for invitations
4. **Calendar Sync**: Two-way calendar synchronization

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check RESEND_API_KEY configuration
2. **Users not appearing**: Verify user approval status
3. **Invitations not saving**: Check database permissions and RLS policies
4. **Calendar links not working**: Verify event date format

### Debug Endpoints
- `/api/debug-email`: Test email service
- `/api/debug-session`: Check user session
- `/test-invitations`: Test invitation interface

## Support

For issues or questions about the invitation system:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the provided test endpoints
4. Review the database RLS policies if permissions are failing
