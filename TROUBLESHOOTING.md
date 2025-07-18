# Troubleshooting Guide for Schools Issues

## Issues Fixed

### 1. Schools Not Saving
**Problem**: Schools were not being saved to Firebase
**Solutions Implemented**:
- Added better error handling with specific error messages
- Added input validation (file size limits, required fields)
- Added retry logic for network issues
- Improved error reporting to show exact Firebase errors

### 2. Slow Performance
**Problem**: Schools page was loading slowly
**Solutions Implemented**:
- Added fallback query when Firestore index is missing
- Added manual sorting when orderBy fails
- Added loading spinners and better UX
- Added auto-retry with exponential backoff for network issues

## How to Test the Fixes

### 1. Test School Addition
1. Go to the Admin page (`/admin`)
2. Fill out the school form with:
   - School Name: "Test School"
   - Location: "Test Location"
   - Logo: (optional, max 5MB)
3. Click "Add School"
4. Check the browser console for detailed logs
5. Verify the school appears in the list

### 2. Test Performance
1. Go to the Schools page (`/schools`)
2. Check if schools load quickly
3. If there are errors, check the browser console
4. Try the "Try Again" button if needed

## Common Issues and Solutions

### Issue: "Permission denied" error
**Solution**: Check Firebase security rules in `firestore.rules` - they should allow read/write access

### Issue: "Index missing" error
**Solution**: 
1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Add Index"
3. Collection ID: `schools`
4. Fields: `createdAt` (Descending)
5. Click "Create Index"

### Issue: Network errors
**Solution**: The app now auto-retries up to 3 times with exponential backoff

### Issue: File upload errors
**Solution**: 
- Ensure file is under 5MB
- Ensure file is an image (jpg, png, gif, etc.)
- Check internet connection

## Debugging Steps

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Try to add a school**
4. **Look for error messages** - they now provide specific details
5. **Check Network tab** for failed requests

## Firebase Configuration Check

Ensure your `src/firebase.ts` has the correct configuration:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Performance Monitoring

The app now includes:
- Loading spinners
- Progress indicators
- Auto-retry logic
- Better error messages
- Input validation

## If Issues Persist

1. Check browser console for specific error messages
2. Verify Firebase project settings
3. Check network connectivity
4. Try in incognito/private browsing mode
5. Clear browser cache and cookies 