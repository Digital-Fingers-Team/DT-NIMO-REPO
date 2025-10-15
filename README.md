# DT Edu F94CB - Dynamic Educational Web Application

A modern, responsive educational platform with real-time messaging, document management, and comprehensive dashboard features.

## 🚀 Features

### 🔐 Authentication System
- **No signup required** - Login only system
- Multiple user types: Students, Teachers, Administrators, Parents
- Pre-configured user accounts for testing

### 💬 Real-time Messaging (WhatsApp-like)
- Instant messaging between users
- Real-time message delivery and read receipts
- File attachments and emoji support
- Mobile-responsive chat interface
- Typing indicators
- Message status tracking (sent, delivered, read)

### 📁 Document Management System
- Upload and organize documents by category
- Support for multiple file types (PDF, DOC, XLS, PPT, images)
- Document sharing with access controls
- Download tracking and statistics
- Search and filter functionality
- Drag-and-drop file upload

### 📊 Comprehensive Dashboard
- User-specific statistics and analytics
- Recent activities and notifications
- Performance charts and graphs
- Quick access to all features
- Responsive design for all devices

### 🎨 Modern UI/UX
- Clean, modern design
- Fully responsive (mobile-first approach)
- Dark/Light mode toggle
- Arabic/English language support
- Smooth animations and transitions
- Accessibility features

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Functions (Node.js/Express)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Charts**: Chart.js
- **Icons**: Font Awesome 6

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥 Large screens (1200px+)

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Firebase CLI
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dt-edu-f94cb
```

### 2. Install Dependencies
```bash
# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable the following services:
   - Authentication
   - Firestore Database
   - Storage
   - Functions
   - Hosting

3. Update Firebase configuration in `public/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key-from-firebase-console",
  authDomain: "dt-edu-f94cb.firebaseapp.com",
  projectId: "dt-edu-f94cb",
  storageBucket: "dt-edu-f94cb.firebasestorage.app",
  messagingSenderId: "your-sender-id-from-firebase-console",
  appId: "your-app-id-from-firebase-console"
};
```

### 4. Deploy to Firebase
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy to Firebase
firebase deploy
```

## 👥 Default User Accounts

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Type**: Administrator/Principal

### Teachers (7 accounts)
- **Username**: `teacher_arabic` | **Password**: `teacher123` | **Subject**: Arabic Language
- **Username**: `teacher_history` | **Password**: `teacher123` | **Subject**: History
- **Username**: `teacher_math` | **Password**: `teacher123` | **Subject**: Mathematics
- **Username**: `teacher_science` | **Password**: `teacher123` | **Subject**: Science
- **Username**: `teacher_english` | **Password**: `teacher123` | **Subject**: English
- **Username**: `teacher_philosophy` | **Password**: `teacher123` | **Subject**: Philosophy
- **Username**: `teacher_social` | **Password**: `teacher123` | **Subject**: Social Specialist

### Students (12 accounts)
- **Username**: `student1` to `student12`
- **Password**: `student123`
- **Type**: Student

### Parents (12 accounts)
- **Username**: `parent1` to `parent12`
- **Password**: `parent123`
- **Type**: Parent

## 🏗 Project Structure

```
dt-edu-f94cb/
├── public/
│   ├── css/
│   │   ├── main.css           # Main styles
│   │   ├── messages.css       # Messaging system styles
│   │   ├── documents.css      # Document management styles
│   │   └── responsive.css     # Responsive design
│   ├── js/
│   │   ├── main.js           # Main application logic
│   │   ├── messaging.js      # Real-time messaging
│   │   ├── documents.js      # Document management
│   │   └── dashboard.js      # Dashboard functionality
│   ├── assets/
│   │   └── images/           # Application images
│   ├── index.html            # Login page
│   ├── dashboard.html        # Main dashboard
│   ├── messages.html         # Messaging interface
│   ├── documents.html        # Document management
│   └── firebase.js           # Firebase configuration
├── functions/
│   ├── index.js              # Firebase Functions
│   └── package.json          # Functions dependencies
├── firebase.json             # Firebase configuration
└── README.md                 # This file
```

## 🔥 Firebase Functions API

### Authentication Endpoints
- `GET /health` - Health check
- `GET /user/:userId` - Get user profile

### Messaging Endpoints
- `GET /conversations/:userId` - Get user conversations
- `GET /conversations/:conversationId/messages` - Get messages
- `POST /conversations/:conversationId/messages` - Send message
- `POST /conversations` - Create new conversation
- `POST /conversations/:conversationId/read` - Mark messages as read

### Document Endpoints
- `POST /documents/upload` - Upload document
- `GET /documents` - Get documents list
- `POST /documents/:documentId/download` - Track download

### Utility Endpoints
- `GET /users/:userId/stats` - Get user statistics
- `GET /search` - Search functionality

## 📋 Features by User Type

### 👨‍🎓 Students
- View personal dashboard with grades and assignments
- Real-time messaging with teachers and classmates
- Access to shared documents and materials
- Submit assignments and view feedback
- Track academic progress

### 👨‍🏫 Teachers
- Manage class materials and documents
- Real-time communication with students and parents
- Upload and share educational content
- Track student progress and performance
- Create and manage assignments

### 👨‍💼 Administrators/Principal
- System-wide overview and statistics
- Manage all users and content
- Access to all documents and communications
- Generate reports and analytics
- System configuration and settings

### 👨‍👩‍👧‍👦 Parents
- Monitor children's academic progress
- Communicate with teachers and staff
- Access important school documents
- View schedules and announcements
- Track attendance and grades

## 🎨 Customization

### Themes
The application supports both light and dark themes. Users can toggle between themes using the theme switcher in the header.

### Languages
Currently supports:
- Arabic (RTL)
- English (LTR)

### Colors
Main color scheme can be customized in `css/main.css`:
```css
:root {
    --primary: #4a6cf7;
    --secondary: #6c5ce7;
    --accent: #00b894;
    /* ... other colors */
}
```

## 📱 Mobile Features

- **Touch-optimized interface** - All elements are touch-friendly
- **Swipe gestures** - Navigate between conversations
- **Pull-to-refresh** - Refresh content with pull gesture
- **Offline support** - Basic functionality works offline
- **PWA ready** - Can be installed as a mobile app

## 🔒 Security Features

- **Firebase Security Rules** - Secure data access
- **Input validation** - All user inputs are validated
- **File type restrictions** - Only allowed file types can be uploaded
- **Size limitations** - File upload size limits
- **XSS protection** - Content sanitization

## 🚀 Performance Optimizations

- **Lazy loading** - Images and components load on demand
- **Code splitting** - JavaScript is split into chunks
- **Caching** - Static assets are cached
- **Compression** - Files are compressed for faster loading
- **CDN delivery** - Firebase hosting with global CDN

## 📊 Analytics & Monitoring

- **Real-time statistics** - User activity and system metrics
- **Error tracking** - Automatic error reporting
- **Performance monitoring** - Page load times and user interactions
- **Usage analytics** - Feature usage and user behavior

## 🛠 Development

### Local Development
```bash
# Serve locally
firebase serve

# Watch for changes
firebase emulators:start
```

### Testing
```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Email: support@dtedu.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔄 Updates & Changelog

### Version 1.0.0
- Initial release
- Real-time messaging system
- Document management
- Responsive design
- Multi-user support
- Firebase integration

---

**Built with ❤️ for modern education**