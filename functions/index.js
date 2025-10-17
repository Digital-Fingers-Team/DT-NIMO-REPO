const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get user profile
app.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: userDoc.data() });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversations for a user
app.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTime', 'desc')
      .get();
    
    const conversations = [];
    conversationsSnapshot.forEach(doc => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
app.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    
    let query = db
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    if (before) {
      const beforeDoc = await db.collection('messages').doc(before).get();
      if (beforeDoc.exists) {
        query = query.startAfter(beforeDoc);
      }
    }
    
    const messagesSnapshot = await query.get();
    const messages = [];
    
    messagesSnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
app.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, content, type = 'text' } = req.body;
    
    if (!senderId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const message = {
      conversationId,
      senderId,
      content,
      type,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent'
    };
    
    // Add message to Firestore
    const messageRef = await db.collection('messages').add(message);
    
    // Update conversation last message
    await db.collection('conversations').doc(conversationId).update({
      lastMessage: content,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageSender: senderId
    });
    
    res.json({ messageId: messageRef.id, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new conversation
app.post('/conversations', async (req, res) => {
  try {
    const { participants, title, type = 'direct' } = req.body;
    
    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'At least 2 participants required' });
    }
    
    const conversation = {
      participants,
      title: title || `محادثة ${participants.join(', ')}`,
      type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const conversationRef = await db.collection('conversations').add(conversation);
    
    res.json({ conversationId: conversationRef.id, conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload document
app.post('/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { title, category, description, uploadedBy, isPublic = false } = req.body;
    
    if (!title || !category || !uploadedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `documents/${fileName}`;
    
    // Upload file to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    
    // Make file publicly accessible if needed
    if (isPublic === 'true') {
      await file.makePublic();
    }
    
    // Get download URL
    const [downloadURL] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Far future date
    });
    
    // Save document metadata to Firestore
    const document = {
      title,
      category,
      description: description || '',
      uploadedBy,
      isPublic: isPublic === 'true',
      fileName: req.file.originalname,
      filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      downloadURL,
      uploadDate: admin.firestore.FieldValue.serverTimestamp(),
      downloads: 0
    };
    
    const docRef = await db.collection('documents').add(document);
    
    res.json({ documentId: docRef.id, document, downloadURL });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents
app.get('/documents', async (req, res) => {
  try {
    const { category, uploadedBy, isPublic, limit = 20 } = req.query;
    
    let query = db.collection('documents');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (uploadedBy) {
      query = query.where('uploadedBy', '==', uploadedBy);
    }
    
    if (isPublic !== undefined) {
      query = query.where('isPublic', '==', isPublic === 'true');
    }
    
    query = query.orderBy('uploadDate', 'desc').limit(parseInt(limit));
    
    const documentsSnapshot = await query.get();
    const documents = [];
    
    documentsSnapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ documents });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document (increment download count)
app.post('/documents/:documentId/download', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Increment download count
    await db.collection('documents').doc(documentId).update({
      downloads: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
app.get('/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's conversations count
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .get();
    
    // Get user's messages count
    const messagesSnapshot = await db
      .collection('messages')
      .where('senderId', '==', userId)
      .get();
    
    // Get user's documents count
    const documentsSnapshot = await db
      .collection('documents')
      .where('uploadedBy', '==', userId)
      .get();
    
    const stats = {
      conversationsCount: conversationsSnapshot.size,
      messagesCount: messagesSnapshot.size,
      documentsCount: documentsSnapshot.size,
      lastActive: new Date().toISOString()
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
app.post('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Update all unread messages in the conversation
    const batch = db.batch();
    
    const unreadMessagesSnapshot = await db
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('senderId', '!=', userId)
      .where('status', '!=', 'read')
      .get();
    
    unreadMessagesSnapshot.forEach(doc => {
      batch.update(doc.ref, { status: 'read' });
    });
    
    await batch.commit();
    
    res.json({ success: true, updatedCount: unreadMessagesSnapshot.size });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search functionality
app.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', userId } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }
    
    const results = {
      messages: [],
      documents: [],
      conversations: []
    };
    
    // Search messages
    if (type === 'all' || type === 'messages') {
      const messagesSnapshot = await db
        .collection('messages')
        .where('content', '>=', q)
        .where('content', '<=', q + '\uf8ff')
        .limit(10)
        .get();
      
      messagesSnapshot.forEach(doc => {
        results.messages.push({ id: doc.id, ...doc.data() });
      });
    }
    
    // Search documents
    if (type === 'all' || type === 'documents') {
      const documentsSnapshot = await db
        .collection('documents')
        .where('title', '>=', q)
        .where('title', '<=', q + '\uf8ff')
        .limit(10)
        .get();
      
      documentsSnapshot.forEach(doc => {
        results.documents.push({ id: doc.id, ...doc.data() });
      });
    }
    
    res.json({ results, query: q });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Export the Express app as a Firebase Function (Gen 2)
exports.api = onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, app);

// Real-time triggers (Gen 2)

// Trigger when a new message is added
exports.onMessageCreated = onDocumentCreated('messages/{messageId}', async (event) => {
  const message = event.data.data();
  const messageId = event.params.messageId;
  
  console.log('New message created:', messageId, message);
  
  // Here you could add push notifications, email notifications, etc.
  
  return null;
});

// Trigger when a document is uploaded
exports.onDocumentCreated = onDocumentCreated('documents/{documentId}', async (event) => {
  const document = event.data.data();
  const documentId = event.params.documentId;
  
  console.log('New document uploaded:', documentId, document);
  
  // Here you could add notifications to relevant users
  
  return null;
});

// Cleanup old messages (runs daily)
exports.cleanupOldMessages = onSchedule({
  schedule: '0 2 * * *', // Run at 2 AM daily
  timeZone: 'Asia/Riyadh',
  region: 'us-central1'
}, async (event) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep messages for 90 days
  
  const oldMessagesSnapshot = await db
    .collection('messages')
    .where('timestamp', '<', cutoffDate)
    .get();
  
  const batch = db.batch();
  let deleteCount = 0;
  
  oldMessagesSnapshot.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });
  
  if (deleteCount > 0) {
    await batch.commit();
    console.log(`Deleted ${deleteCount} old messages`);
  }
  
  return null;
});