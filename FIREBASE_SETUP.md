# Firebase Setup Guide for DT Edu F94CB

## 🔥 Quick Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. **Project name**: `dt-edu-f94cb` (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Required Services

#### Authentication
1. Go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll deploy security rules later)
3. Select your preferred location
4. Click **Done**

#### Storage
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Select the same location as Firestore
4. Click **Done**

#### Functions (Optional but recommended)
1. Go to **Functions** → **Get started**
2. Follow the setup instructions
3. This will be configured automatically when you deploy

### Step 3: Get Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (`</>`)
4. **App nickname**: `dt-edu-f94cb-web`
5. Check **"Also set up Firebase Hosting"**
6. Click **Register app**
7. **Copy the config object**

### Step 4: Update Configuration
Replace the config in `public/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "dt-edu-f94cb.firebaseapp.com",
  projectId: "dt-edu-f94cb",
  storageBucket: "dt-edu-f94cb.firebasestorage.app",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-actual-measurement-id"
};
```

### Step 5: Deploy
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if needed)
firebase init

# Deploy everything
./deploy.sh
```

## 🔒 Security Rules

The project includes pre-configured security rules:
- **Firestore rules**: `firestore.rules`
- **Storage rules**: `storage.rules`
- **Database indexes**: `firestore.indexes.json`

These will be deployed automatically when you run `./deploy.sh`

## 🎯 Project Structure in Firebase

After deployment, your Firebase project will have:

### Collections in Firestore:
- `users` - User profiles and settings
- `conversations` - Chat conversations
- `messages` - Real-time messages
- `documents` - Document metadata
- `notifications` - User notifications
- `activities` - Activity logs

### Storage Buckets:
- `documents/` - Uploaded documents
- `profiles/` - User profile pictures
- `temp/` - Temporary uploads

### Functions:
- API endpoints for messaging
- Document management
- User statistics
- Search functionality

## 🚀 Live URL

After deployment, your app will be available at:
**https://dt-edu-f94cb.web.app**

## 📊 Firebase Console Links

Quick access to your Firebase services:
- **Console**: https://console.firebase.google.com/project/dt-edu-f94cb
- **Hosting**: https://console.firebase.google.com/project/dt-edu-f94cb/hosting
- **Firestore**: https://console.firebase.google.com/project/dt-edu-f94cb/firestore
- **Storage**: https://console.firebase.google.com/project/dt-edu-f94cb/storage
- **Functions**: https://console.firebase.google.com/project/dt-edu-f94cb/functions

## 🛠 Troubleshooting

### Common Issues:

**"Project not found"**
- Make sure the project ID in `.firebaserc` matches your Firebase project
- Run `firebase use dt-edu-f94cb` to set the correct project

**"Permission denied"**
- Check that you're logged in: `firebase login`
- Verify you have access to the project

**"Functions deployment failed"**
- Make sure Node.js version is 18 or higher
- Run `cd functions && npm install` to install dependencies

**"Hosting deployment failed"**
- Check that `firebase.json` is properly configured
- Verify `public` folder exists and contains `index.html`

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Review the browser console for client-side errors
3. Verify all Firebase services are enabled
4. Ensure security rules are properly deployed

---

**Your DT Edu F94CB project is ready for Firebase! 🎉**