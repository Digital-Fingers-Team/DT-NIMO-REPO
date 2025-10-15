// Real-time Chat Application with Firebase
import { 
  auth, 
  db, 
  storage, 
  database,
  onAuthStateChanged, 
  signOut,
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  dbRef,
  set,
  get,
  push,
  onValue,
  off,
  remove
} from '../firebase.js';

class ChatApp {
  constructor() {
    this.currentUser = null;
    this.currentChat = null;
    this.chats = [];
    this.messages = [];
    this.users = [];
    this.listeners = [];
    
    this.init();
  }

  async init() {
    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserData();
        await this.loadChats();
        this.setupEventListeners();
        this.render();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  async loadUserData() {
    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        this.userData = userDoc.data();
      } else {
        // Create user document if it doesn't exist
        await this.createUserDocument();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async createUserDocument() {
    try {
      const userData = {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName || 'User',
        role: 'student', // Default role
        status: 'online',
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', this.currentUser.uid), userData);
      this.userData = userData;
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }

  async loadChats() {
    try {
      // Load conversations from Firestore
      const chatsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', this.currentUser.uid)
      );
      
      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        this.chats = [];
        snapshot.forEach((doc) => {
          const chatData = { id: doc.id, ...doc.data() };
          this.chats.push(chatData);
        });
        this.renderChatList();
      });
      
      this.listeners.push(unsubscribe);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  async loadMessages(chatId) {
    try {
      // Clear existing message listeners
      this.clearMessageListeners();
      
      const messagesRef = dbRef(database, `messages/${chatId}`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        this.messages = [];
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          Object.keys(messagesData).forEach(key => {
            this.messages.push({ id: key, ...messagesData[key] });
          });
          // Sort messages by timestamp
          this.messages.sort((a, b) => a.timestamp - b.timestamp);
        }
        this.renderMessages();
      });
      
      this.listeners.push(unsubscribe);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async sendMessage(chatId, messageText, messageType = 'text') {
    try {
      const messageData = {
        text: messageText,
        type: messageType,
        senderId: this.currentUser.uid,
        senderName: this.userData.displayName,
        timestamp: Date.now(),
        status: 'sent'
      };

      const messagesRef = dbRef(database, `messages/${chatId}`);
      const newMessageRef = push(messagesRef, messageData);
      
      // Update conversation last message
      await this.updateConversationLastMessage(chatId, messageText, Date.now());
      
      return newMessageRef.key;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async updateConversationLastMessage(chatId, messageText, timestamp) {
    try {
      const conversationRef = doc(db, 'conversations', chatId);
      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageTime: timestamp,
        lastMessageSender: this.currentUser.uid
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  async createChat(participantIds, chatName = null) {
    try {
      const participants = [this.currentUser.uid, ...participantIds];
      const chatData = {
        participants,
        chatName: chatName || null,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSender: null
      };

      const docRef = await addDoc(collection(db, 'conversations'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  async uploadFile(file, chatId) {
    try {
      const storageRef = ref(storage, `message-files/${chatId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async sendFileMessage(chatId, file) {
    try {
      const fileData = await this.uploadFile(file, chatId);
      await this.sendMessage(chatId, fileData.url, 'file');
    } catch (error) {
      console.error('Error sending file message:', error);
    }
  }

  setupEventListeners() {
    // Send message on Enter key
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Send button click
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
      sendButton.addEventListener('click', () => this.handleSendMessage());
    }

    // File upload
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Attachment button
    const attachmentButton = document.getElementById('attachment-button');
    if (attachmentButton) {
      attachmentButton.addEventListener('click', () => {
        fileInput.click();
      });
    }

    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => this.handleLogout());
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  handleSendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (messageText && this.currentChat) {
      this.sendMessage(this.currentChat.id, messageText);
      messageInput.value = '';
    }
  }

  async handleFileUpload(file) {
    if (this.currentChat) {
      await this.sendFileMessage(this.currentChat.id, file);
    }
  }

  async handleLogout() {
    try {
      await signOut(auth);
      this.clearListeners();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
  }

  handleSearch(searchTerm) {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
      const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
      const lastMessage = item.querySelector('.chat-last-message').textContent.toLowerCase();
      
      if (chatName.includes(searchTerm.toLowerCase()) || lastMessage.includes(searchTerm.toLowerCase())) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  selectChat(chat) {
    this.currentChat = chat;
    this.loadMessages(chat.id);
    this.render();
  }

  render() {
    this.renderSidebar();
    this.renderChatArea();
  }

  renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="user-info">
          <div class="user-avatar">
            <div class="avatar avatar-lg">${this.getInitials(this.userData?.displayName || 'User')}</div>
            <div class="status-indicator status-online"></div>
          </div>
          <div>
            <div class="user-name">${this.userData?.displayName || 'User'}</div>
            <div class="user-status">Online</div>
          </div>
        </div>
        <div class="sidebar-actions">
          <button class="btn" id="dark-mode-toggle" title="Toggle Dark Mode">
            <i class="fas fa-moon"></i>
          </button>
          <button class="btn" id="logout-button" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
      
      <div class="search-container">
        <div class="search-input">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="search-input" placeholder="Search or start new chat...">
        </div>
      </div>
      
      <div class="chat-list" id="chat-list">
        ${this.renderChatList()}
      </div>
    `;
  }

  renderChatList() {
    if (this.chats.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">No chats yet</div>
          <div class="empty-description">Start a conversation with someone!</div>
        </div>
      `;
    }

    return this.chats.map(chat => `
      <div class="chat-item ${this.currentChat?.id === chat.id ? 'active' : ''}" 
           onclick="chatApp.selectChat(${JSON.stringify(chat).replace(/"/g, '&quot;')})">
        <div class="chat-avatar">
          <div class="avatar">${this.getInitials(chat.chatName || this.getOtherParticipantName(chat))}</div>
        </div>
        <div class="chat-info">
          <div class="chat-name">${chat.chatName || this.getOtherParticipantName(chat)}</div>
          <div class="chat-last-message">${chat.lastMessage || 'No messages yet'}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${this.formatTime(chat.lastMessageTime)}</div>
          ${chat.lastMessageSender !== this.currentUser.uid ? '<div class="unread-count">1</div>' : ''}
        </div>
      </div>
    `).join('');
  }

  renderChatArea() {
    const chatMain = document.getElementById('chat-main');
    if (!chatMain) return;

    if (!this.currentChat) {
      chatMain.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">Welcome to DT Edu Chat</div>
          <div class="empty-description">Select a chat to start messaging</div>
        </div>
      `;
      return;
    }

    chatMain.innerHTML = `
      <div class="chat-header">
        <div class="chat-info">
          <div class="chat-avatar">
            <div class="avatar">${this.getInitials(this.currentChat.chatName || this.getOtherParticipantName(this.currentChat))}</div>
            <div class="status-indicator status-online"></div>
          </div>
          <div>
            <div class="chat-name">${this.currentChat.chatName || this.getOtherParticipantName(this.currentChat)}</div>
            <div class="chat-status">Online</div>
          </div>
        </div>
        <div class="chat-actions">
          <button class="btn" title="Voice Call">
            <i class="fas fa-phone"></i>
          </button>
          <button class="btn" title="Video Call">
            <i class="fas fa-video"></i>
          </button>
          <button class="btn" title="More Options">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      
      <div class="messages-container" id="messages-container">
        ${this.renderMessages()}
      </div>
      
      <div class="message-input-container">
        <button class="attachment-btn" id="attachment-button" title="Attach File">
          <i class="fas fa-paperclip"></i>
        </button>
        <div class="message-input-wrapper">
          <textarea class="message-input" id="message-input" placeholder="Type a message..." rows="1"></textarea>
        </div>
        <button class="send-btn" id="send-button" title="Send Message">
          <i class="fas fa-paper-plane"></i>
        </button>
        <input type="file" id="file-input" style="display: none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
      </div>
    `;
  }

  renderMessages() {
    if (this.messages.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">No messages yet</div>
          <div class="empty-description">Send a message to start the conversation</div>
        </div>
      `;
    }

    return this.messages.map(message => `
      <div class="message ${message.senderId === this.currentUser.uid ? 'sent' : 'received'}">
        <div class="message-content">
          <div class="message-text">${this.formatMessage(message)}</div>
          <div class="message-time">${this.formatTime(message.timestamp)}</div>
          ${message.senderId === this.currentUser.uid ? `
            <div class="message-status">
              <i class="fas fa-check status-icon ${message.status === 'read' ? 'read' : 'delivered'}"></i>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  formatMessage(message) {
    if (message.type === 'file') {
      const fileType = this.getFileType(message.text);
      return `
        <div class="file-message">
          <i class="fas fa-${fileType.icon}"></i>
          <span>${message.fileName || 'File'}</span>
          <a href="${message.text}" target="_blank" class="btn btn-sm">Download</a>
        </div>
      `;
    }
    return message.text;
  }

  getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const fileTypes = {
      pdf: { icon: 'file-pdf', color: '#f40' },
      doc: { icon: 'file-word', color: '#2b579a' },
      docx: { icon: 'file-word', color: '#2b579a' },
      jpg: { icon: 'file-image', color: '#ff6b6b' },
      jpeg: { icon: 'file-image', color: '#ff6b6b' },
      png: { icon: 'file-image', color: '#ff6b6b' },
      gif: { icon: 'file-image', color: '#ff6b6b' },
      mp4: { icon: 'file-video', color: '#4ecdc4' },
      mp3: { icon: 'file-audio', color: '#45b7d1' },
      wav: { icon: 'file-audio', color: '#45b7d1' }
    };
    return fileTypes[extension] || { icon: 'file', color: '#666' };
  }

  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getOtherParticipantName(chat) {
    const otherParticipant = chat.participants.find(p => p !== this.currentUser.uid);
    // In a real app, you'd fetch the user data from Firestore
    return 'User';
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return Math.floor(diff / 60000) + 'm ago';
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  }

  clearListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  clearMessageListeners() {
    // Clear only message listeners, keep chat listeners
    this.listeners = this.listeners.filter(listener => {
      // This is a simplified approach - in practice you'd want to track listener types
      return true;
    });
  }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new ChatApp();
});

// Load dark mode preference
document.addEventListener('DOMContentLoaded', () => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
});
