# Firebase Configuration Fix

## Problem
Your Firebase config is missing the `messagingSenderId` which causes the `CONFIGURATION_NOT_FOUND` error.

## Current Config (Missing messagingSenderId)
```json
{
  "apiKey": "AIzaSyB0y_zOg1gqnyvnIpl0LFPkCLwkPxHoIvc",
  "authDomain": "quasar-5673a.firebaseapp.com",
  "projectId": "quasar-5673a",
  "appId": "1:402836024277:web:cd23841e70450441c72b5c",
  "storageBucket": "quasar-5673a.firebasestorage.app",
  "measurementId": "G-JQKKHTWL9J"
  // ❌ Missing messagingSenderId
}
```

## Solution Steps

### 1. Get Complete Firebase Config
1. Visit: https://console.firebase.google.com/project/quasar-5673a/settings/general/
2. Scroll down to "Your apps" section
3. Click on your web app (🌐 icon)
4. Copy the complete `firebaseConfig` object

### 2. Expected Complete Config
```json
{
  "apiKey": "AIzaSyB0y_zOg1gqnyvnIpl0LFPkCLwkPxHoIvc",
  "authDomain": "quasar-5673a.firebaseapp.com",
  "projectId": "quasar-5673a",
  "storageBucket": "quasar-5673a.firebasestorage.app",
  "messagingSenderId": "402836024277",  // ✅ This is missing!
  "appId": "1:402836024277:web:cd23841e70450441c72b5c",
  "measurementId": "G-JQKKHTWL9J"
}
```

### 3. Update Your Database
1. Login to your admin panel
2. Go to Firebase Configs
3. Edit your current config
4. Add the missing `messagingSenderId`: **402836024277**
5. Save the configuration

### 4. Enable Authentication Providers
In Firebase Console → Authentication → Sign-in method:
- ✅ Enable Google
- ✅ Enable Facebook  
- ✅ Enable Twitter
- ✅ Enable GitHub

## Quick Fix
The `messagingSenderId` for your project should be: **402836024277**
(You can see this in your appId: `1:402836024277:web:...`)