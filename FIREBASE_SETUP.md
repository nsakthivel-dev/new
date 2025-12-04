# Firebase Setup Guide

## Prerequisites
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database in your Firebase project

## Configuration Steps

### 1. Update Firebase Configuration
Open `client/src/lib/firebase.ts` and replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};
```

You can find these values in your Firebase project settings.

### 2. Enable Required Services
In the Firebase Console:
1. Go to Firestore Database and create the following collections:
   - `adminContent` (for existing content)
   - `cropLibrary` (for new crop library content)

### 3. Set Up Authentication (Optional)
If you want to secure your database:
1. Go to Firebase Authentication
2. Enable the sign-in methods you want to use
3. Set up security rules in Firestore

### 4. Install Dependencies
Make sure Firebase dependencies are installed:
```bash
cd client
npm install firebase
```

### 5. Test the Setup
1. Start the development server:
```bash
npm run dev
```

2. Navigate to the Admin Panel → Crop Library
3. Try adding a new crop library item
4. Check that it appears on the public Crop Library page

## Security Rules (Recommended)
For production, update your Firestore rules in the Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to crop library for everyone
    match /cropLibrary/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow read/write access to adminContent for authenticated users only
    match /adminContent/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues:
1. **Firebase not initialized**: Make sure you've replaced all placeholder values in firebase.ts
2. **Permission denied**: Check your Firestore security rules
3. **Network errors**: Ensure you have internet connectivity and Firebase services are enabled

### Debugging Tips:
1. Check the browser console for Firebase-related errors
2. Verify your Firebase project settings are correct
3. Ensure your collections exist in Firestore

## Next Steps
Once Firebase is configured:
1. Add content through the Admin Panel → Crop Library
2. View content on the public Crop Library page
3. Customize the UI as needed for your specific crop information