# Email Setup Instructions for Beyryl Website

## Overview
The website uses **Formspree** for secure email functionality that sends access requests to mo@beyryl.com when users submit the forms. This approach is secure for public repositories.

## ⚠️ Security Notice
This implementation uses Formspree instead of EmailJS to avoid exposing API credentials in a public GitHub repository. Formspree endpoints are safe to expose publicly.

## Setup Required (Formspree - Recommended)

### 1. Create Formspree Account
1. Go to [Formspree.io](https://formspree.io/)
2. Sign up for a free account (allows 50 submissions/month)
3. Create a new form
4. Set the target email to: **mo@beyryl.com**

### 2. Configure Form Settings
In your Formspree dashboard:
- **Name**: Beyryl Access Requests
- **Email**: mo@beyryl.com
- **Spam filtering**: Enable
- **Send confirmation emails**: Optional

### 3. Update Configuration
1. Copy your Formspree form ID from the dashboard
2. In `assets/email-handler.js`, replace:
   ```javascript
   this.formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
   With your actual form ID:
   ```javascript
   this.formspreeEndpoint = 'https://formspree.io/f/xyzabc123'; // Your real form ID
   ```

### 4. Alternative: EmailJS (Less Secure for Public Repos)
⚠️ **Not recommended for public repositories** as it requires exposing API keys.

If using a private repository, you could use EmailJS with environment variables or build-time replacements.

## Current Functionality

### Forms That Send Emails:
1. **Hero Section Form** - Top of page email signup
2. **Call-to-Action Form** - Contact section email signup

### What Happens:
1. User enters email and clicks "Request Access"
2. Form validates email address
3. Email is sent to mo@beyryl.com with:
   - User's email address
   - Which form was used
   - Timestamp of request
4. User sees success/error message
5. Form resets on success

### Features:
- ✅ **Secure** - No API credentials exposed in public repository
- ✅ **Email validation** - Client-side validation before submission
- ✅ **Loading states** - Button shows "Sending..." during submission
- ✅ **Success/error feedback** - User-friendly messages with proper styling  
- ✅ **Automatic message removal** - Messages disappear after 5 seconds
- ✅ **Form reset** - Clears form after successful submission
- ✅ **Spam protection** - Formspree includes built-in spam filtering
- ✅ **Mobile responsive** - Works on both mobile and desktop

## Testing
1. Complete the Formspree setup above
2. Test both forms on your website
3. Check mo@beyryl.com for incoming emails
4. Check Formspree dashboard for submission logs
5. Verify success messages appear to users

## Troubleshooting
- Check browser console for JavaScript errors
- Verify Formspree form ID is correct in email-handler.js
- Test with different email addresses
- Check Formspree dashboard for failed submissions
- Ensure forms have proper IDs (#hero, #contact)

## Why Formspree?
- ✅ **Secure for public repos** - No credentials to expose
- ✅ **Simple setup** - Just need form endpoint
- ✅ **Built-in spam protection**
- ✅ **Free tier available** (50 submissions/month)
- ✅ **No server required** - Works with static sites
- ✅ **Reliable delivery** - Professional email service
