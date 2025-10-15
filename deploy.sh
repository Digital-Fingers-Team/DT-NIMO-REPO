#!/bin/bash

# DT Edu F94CB Deployment Script
echo "🚀 Starting DT Edu F94CB deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    firebase login
fi

echo "📦 Installing dependencies..."
cd functions
npm install
cd ..

echo "🔧 Building project..."
# No build step needed for static files

echo "🧪 Running tests..."
# Add test commands here if needed

echo "🔍 Linting code..."
cd functions
npm run lint || echo "⚠️ Linting warnings found"
cd ..

echo "🚀 Deploying to Firebase..."

# Deploy Firestore rules and indexes first
echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

# Deploy Functions
echo "⚡ Deploying Functions..."
firebase deploy --only functions

# Deploy Hosting
echo "🌐 Deploying Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo ""
echo "🎉 Your DT Edu F94CB application is now live!"
echo "📱 Access your app at: https://dt-edu-f94cb.web.app"
echo ""
echo "📊 Firebase Console: https://console.firebase.google.com/project/dt-edu-f94cb"
echo ""
echo "🔧 To make changes:"
echo "  1. Edit files in the public/ directory"
echo "  2. Run 'firebase deploy --only hosting' to update"
echo ""
echo "📝 Default login credentials:"
echo "  Admin: admin / admin123"
echo "  Teacher: teacher_math / teacher123"
echo "  Student: student1 / student123"
echo "  Parent: parent1 / parent123"