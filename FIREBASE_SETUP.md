# Firebase Setup for DT Edu (Project: dt-edu-f94cb)

## 🔥 Your Firebase Project Configuration

**Project ID**: `dt-edu-f94cb`
**Project URL**: https://dt-edu-f94cb.web.app

## 🚀 Quick Setup Steps

### Step 1: Get Your Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/project/dt-edu-f94cb)
2. Click on "Project Settings" (gear icon)
3. Scroll down to "Your apps" section
4. Click "Add app" → "Web" (</>) if you haven't created one
5. Copy the configuration object

### Step 2: Update Firebase Config
Replace the configuration in `public/firebase.js`:

```javascript
// Replace this configuration with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-actual-api-key-here",
  authDomain: "dt-edu-f94cb.firebaseapp.com",
  projectId: "dt-edu-f94cb",
  storageBucket: "dt-edu-f94cb.firebasestorage.app",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-measurement-id" // Optional for Analytics
};
```

### Step 3: Enable Firebase Services
In your Firebase Console (https://console.firebase.google.com/project/dt-edu-f94cb), enable:

#### 🔐 Authentication
1. Go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" provider
3. **Important**: Disable "Email link (passwordless sign-in)" for now

#### 🗄️ Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll apply security rules later)
4. Select your preferred location

#### 📁 Storage
1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore

#### ⚡ Functions
1. Go to "Functions"
2. Click "Get started"
3. Follow the setup instructions

#### 🌐 Hosting
1. Go to "Hosting"
2. Click "Get started"
3. Follow the setup instructions

### Step 4: Deploy Your Application
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy everything
./deploy.sh
```

## 🎯 Expected Results

After successful deployment:
- **Live URL**: https://dt-edu-f94cb.web.app
- **Admin Panel**: https://console.firebase.google.com/project/dt-edu-f94cb

## 👥 Test User Accounts

Once deployed, you can test with these accounts:

### 👨‍💼 Administrator
- **Username**: `admin`
- **Password**: `admin123`

### 👨‍🏫 Teachers
- **Username**: `teacher_math`
- **Password**: `teacher123`

### 👨‍🎓 Students  
- **Username**: `student1`
- **Password**: `student123`

### 👨‍👩‍👧‍👦 Parents
- **Username**: `parent1`
- **Password**: `parent123`

## 🔧 Troubleshooting

### Common Issues:

**Q: "Firebase project not found"**
A: Make sure you're logged into the correct Google account that owns the `dt-edu-f94cb` project.

**Q: "Permission denied" errors**
A: Check that all Firebase services are enabled and security rules are deployed.

**Q: "Configuration not found"**
A: Ensure you've updated the `firebaseConfig` object in `public/firebase.js` with your actual values.

**Q: "Functions deployment failed"**
A: Make sure you've run `npm install` in the `functions/` directory.

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Verify all services are enabled
3. Ensure your Firebase configuration is correct
4. Test with the provided user accounts

## 🎉 Success Indicators

Your setup is successful when:
- ✅ You can access https://dt-edu-f94cb.web.app
- ✅ Login works with test accounts
- ✅ Real-time messaging functions
- ✅ Document upload/download works
- ✅ All pages load without errors

---

**Your DT Edu application is ready to go live! 🚀**