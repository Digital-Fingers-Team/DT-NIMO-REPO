// Real-time Messaging System
class MessagingSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        this.conversations = new Map();
        this.activeConversation = null;
        this.unsubscribeMessagesListener = null;
        this.initialMessagesLoaded = false;
        this.socket = null;
        this.typingTimer = null;
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.loadConversations();
        this.setupEventListeners();
        this.initializeFirebase();
        this.setupRealTimeListeners();
    }
    
    // Initialize Firebase for real-time messaging
    async initializeFirebase() {
        try {
            // Import Firebase modules
            const { 
                auth,
                onAuthStateChanged,
                db, 
                collection, 
                addDoc, 
                getDocs, 
                getDoc,
                setDoc,
                updateDoc,
                doc,
                query, 
                where, 
                orderBy, 
                onSnapshot, 
                serverTimestamp 
            } = await import('../firebase.js');
            
            this.auth = auth;
            this.onAuthStateChanged = onAuthStateChanged;
            this.db = db;
            this.collection = collection;
            this.addDoc = addDoc;
            this.getDocs = getDocs;
            this.getDoc = getDoc;
            this.setDoc = setDoc;
            this.updateDoc = updateDoc;
            this.doc = doc;
            this.query = query;
            this.where = where;
            this.orderBy = orderBy;
            this.onSnapshot = onSnapshot;
            this.serverTimestamp = serverTimestamp;
            
            // Watch auth and then load conversations
            this.onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    // Prefer Firebase auth user
                    this.currentUser = {
                        ...this.currentUser,
                        uid: user.uid,
                        email: user.email,
                        name: this.currentUser.name || user.email,
                        username: this.currentUser.username || user.email
                    };
                }
                await this.loadFirebaseConversations();
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Fallback to local storage if Firebase fails
            this.loadLocalConversations();
        }
    }
    
    // Load conversations from Firebase
    async loadFirebaseConversations() {
        try {
            const conversationsRef = this.collection(this.db, 'conversations');
            const participantTokens = [];
            if (this.currentUser.uid) participantTokens.push(this.currentUser.uid);
            if (this.currentUser.username) participantTokens.push(this.currentUser.username);
            const q = this.query(
                conversationsRef,
                this.where('participants', 'array-contains-any', participantTokens.length ? participantTokens : ['public'])
            );
            
            const snapshot = await this.getDocs(q);
            this.conversations.clear();
            snapshot.forEach(d => {
                const conversation = { id: d.id, ...d.data() };
                this.conversations.set(d.id, conversation);
            });
            
            this.renderConversations();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }
    
    // Setup real-time listeners
    setupRealTimeListeners() {
        if (!this.db || !this.activeConversation?.id) return;

        // Tear down previous listener if any
        if (typeof this.unsubscribeMessagesListener === 'function') {
            this.unsubscribeMessagesListener();
            this.unsubscribeMessagesListener = null;
        }

        const messagesRef = this.collection(this.db, 'messages');
        const q = this.query(
            messagesRef,
            this.where('conversationId', '==', this.activeConversation.id),
            this.orderBy('timestamp', 'asc')
        );

        // Reset state and container for new conversation
        this.initialMessagesLoaded = false;
        const container = document.getElementById('chat-messages') || document.querySelector('.chat-messages');
        if (container) container.innerHTML = '';

        this.unsubscribeMessagesListener = this.onSnapshot(q, (snapshot) => {
            if (!this.initialMessagesLoaded) {
                const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                this.displayMessages(messages);
                this.initialMessagesLoaded = true;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = { id: change.doc.id, ...change.doc.data() };
                    this.displayMessage(message);
                }
            });
        });
    }
    
    // Load conversations (fallback to local data)
    loadConversations() {
        // Sample conversations for demo
        const sampleConversations = [
            {
                id: '1',
                name: 'أ. أحمد محمد',
                avatar: 'أ.أ',
                lastMessage: 'هل انتهيت من حل تمارين الواجب؟',
                timestamp: new Date().toISOString(),
                unreadCount: 2,
                participants: [this.currentUser.username, 'teacher_arabic'],
                type: 'teacher'
            },
            {
                id: '2',
                name: 'أ. فاطمة علي',
                avatar: 'أ.ف',
                lastMessage: 'نتيجة اختبار العلوم جاهزة',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                unreadCount: 0,
                participants: [this.currentUser.username, 'teacher_science'],
                type: 'teacher'
            },
            {
                id: '3',
                name: 'مدير المدرسة',
                avatar: 'م.ح',
                lastMessage: 'اجتماع أولياء الأمور يوم الخميس',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                unreadCount: 0,
                participants: [this.currentUser.username, 'admin'],
                type: 'admin'
            }
        ];
        
        sampleConversations.forEach(conv => {
            this.conversations.set(conv.id, conv);
        });
        
        this.renderConversations();
    }
    
    // Load local conversations
    loadLocalConversations() {
        const saved = localStorage.getItem('conversations');
        if (saved) {
            const conversations = JSON.parse(saved);
            conversations.forEach(conv => {
                this.conversations.set(conv.id, conv);
            });
        } else {
            this.loadConversations();
        }
        this.renderConversations();
    }
    
    // Render conversations list
    renderConversations() {
        const container = document.querySelector('.conversations-scroll') || 
                         document.querySelector('.conversations-list');
        
        if (!container) return;
        
        // Clear existing conversations except header
        const existingItems = container.querySelectorAll('.conversation-item');
        existingItems.forEach(item => item.remove());
        
        // Create conversations HTML
        const conversationsHTML = Array.from(this.conversations.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(conv => this.createConversationHTML(conv))
            .join('');
        
        // Insert conversations
        const header = container.querySelector('.conversations-header');
        if (header) {
            header.insertAdjacentHTML('afterend', conversationsHTML);
        } else {
            container.innerHTML = conversationsHTML;
        }
        
        // Select first conversation if none selected
        if (!this.activeConversation && this.conversations.size > 0) {
            const firstConv = Array.from(this.conversations.values())[0];
            this.selectConversation(firstConv.id);
        }
    }
    
    // Create conversation HTML
    createConversationHTML(conversation) {
        const time = this.formatTime(conversation.timestamp);
        const unreadBadge = conversation.unreadCount > 0 ? 
            `<div class="unread-badge">${conversation.unreadCount}</div>` : '';
        
        return `
            <div class="conversation-item ${this.activeConversation?.id === conversation.id ? 'active' : ''}" 
                 onclick="messagingSystem.selectConversation('${conversation.id}')">
                <div class="conversation-avatar">${conversation.avatar}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.name}</div>
                    <div class="conversation-preview">${conversation.lastMessage}</div>
                </div>
                <div class="conversation-time">${time}</div>
                ${unreadBadge}
            </div>
        `;
    }
    
    // Select conversation
    selectConversation(conversationId) {
        this.activeConversation = this.conversations.get(conversationId);
        
        if (!this.activeConversation) return;
        
        // Update UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[onclick*="${conversationId}"]`)?.classList.add('active');
        
        // Attach real-time listener for this conversation
        this.setupRealTimeListeners();
        
        // Update chat header
        this.updateChatHeader();
        
        // Mark as read
        this.markAsRead(conversationId);
    }
    
    // Load messages for conversation
    async loadMessages(conversationId) {
        try {
            if (this.db) {
                // Real-time listener will handle rendering
                return;
            } else {
                // Load from local storage
                this.loadLocalMessages(conversationId);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.loadLocalMessages(conversationId);
        }
    }
    
    // Load local messages
    loadLocalMessages(conversationId) {
        // Sample messages for demo
        const sampleMessages = [
            {
                id: '1',
                conversationId: conversationId,
                senderId: 'teacher_arabic',
                senderName: 'أ. أحمد محمد',
                content: 'مرحباً، هل انتهيت من حل تمارين الواجب؟',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                type: 'text',
                status: 'read'
            },
            {
                id: '2',
                conversationId: conversationId,
                senderId: this.currentUser.username,
                senderName: this.currentUser.name,
                content: 'نعم أستاذ، انتهيت من معظم التمارين ولكن لدي سؤال في التمرين رقم ٥',
                timestamp: new Date(Date.now() - 3300000).toISOString(),
                type: 'text',
                status: 'read'
            },
            {
                id: '3',
                conversationId: conversationId,
                senderId: 'teacher_arabic',
                senderName: 'أ. أحمد محمد',
                content: 'أهلاً وسهلاً، ما هو السؤال الذي يواجهك؟',
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                type: 'text',
                status: 'delivered'
            }
        ];
        
        this.displayMessages(sampleMessages);
    }
    
    // Display messages
    displayMessages(messages) {
        const container = document.getElementById('chat-messages') || 
                         document.querySelector('.chat-messages');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        messages.forEach(message => {
            this.displayMessage(message, false);
        });
        
        this.scrollToBottom();
    }
    
    // Display single message
    displayMessage(message, scroll = true) {
        const container = document.getElementById('chat-messages') || 
                         document.querySelector('.chat-messages');
        
        if (!container) return;
        
        const isOwn = message.senderId === this.currentUser.username;
        const messageHTML = this.createMessageHTML(message, isOwn);
        
        container.insertAdjacentHTML('beforeend', messageHTML);
        
        if (scroll) {
            this.scrollToBottom();
        }
    }
    
    // Create message HTML
    createMessageHTML(message, isOwn) {
        const time = this.formatTime(message.timestamp);
        const statusIcon = this.getStatusIcon(message.status);
        
        return `
            <div class="message ${isOwn ? 'sent' : 'received'}" data-message-id="${message.id}">
                <div class="message-content">
                    ${message.content}
                </div>
                <div class="message-time">${time}</div>
                ${isOwn ? `<div class="message-status">${statusIcon}</div>` : ''}
            </div>
        `;
    }
    
    // Send message
    async sendMessage() {
        const input = document.getElementById('message-input') || 
                     document.querySelector('.message-input');
        
        if (!input || !input.value.trim() || !this.activeConversation) return;
        
        const content = input.value.trim();
        input.value = '';
        
        const message = {
            conversationId: this.activeConversation.id,
            senderId: this.currentUser.uid || this.currentUser.username,
            senderName: this.currentUser.name || this.currentUser.email || 'مستخدم',
            content: content,
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
        };
        
        try {
            if (this.db) {
                // Send to Firebase
                const messagesRef = this.collection(this.db, 'messages');
                await this.addDoc(messagesRef, {
                    ...message,
                    timestamp: this.serverTimestamp()
                });

                // Update conversation last message
                try {
                    const convRef = this.doc(this.db, 'conversations', this.activeConversation.id);
                    await this.updateDoc(convRef, {
                        lastMessage: content,
                        timestamp: this.serverTimestamp()
                    });
                } catch (_) {}
            } else {
                // Store locally
                this.displayMessage(message);
                this.saveMessageLocally(message);
            }
            
            // Update conversation last message
            this.updateConversationLastMessage(content);
            
        } catch (error) {
            console.error('Error sending message:', error);
            // Fallback to local storage
            this.displayMessage(message);
            this.saveMessageLocally(message);
        }
        
        // Stop typing indicator
        this.stopTyping();
    }
    
    // Save message locally
    saveMessageLocally(message) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    // Update conversation last message
    updateConversationLastMessage(content) {
        if (this.activeConversation) {
            this.activeConversation.lastMessage = content;
            this.activeConversation.timestamp = new Date().toISOString();
            this.renderConversations();
        }
    }
    
    // Mark conversation as read
    markAsRead(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (conversation && conversation.unreadCount > 0) {
            conversation.unreadCount = 0;
            this.renderConversations();
        }
    }
    
    // Update chat header
    updateChatHeader() {
        if (!this.activeConversation) return;
        
        const nameElement = document.getElementById('current-chat-name') || 
                           document.querySelector('.chat-header .conversation-name');
        const statusElement = document.getElementById('current-chat-status') || 
                             document.querySelector('.chat-header .online-status');
        const avatarElement = document.querySelector('.chat-header .conversation-avatar');
        
        if (nameElement) nameElement.textContent = this.activeConversation.name;
        if (statusElement) statusElement.innerHTML = '<span class="online-indicator"></span>متصل الآن';
        if (avatarElement) avatarElement.textContent = this.activeConversation.avatar;
    }
    
    // Handle typing indicator
    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            // Send typing indicator to other participants
            this.sendTypingIndicator(true);
        }
        
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 2000);
    }
    
    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendTypingIndicator(false);
        }
        clearTimeout(this.typingTimer);
    }
    
    sendTypingIndicator(isTyping) {
        // Implementation for real-time typing indicator
        // This would typically use WebSocket or Firebase real-time database
        console.log(`${this.currentUser.name} is ${isTyping ? 'typing' : 'not typing'}`);
    }
    
    // Utility functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diff < 604800000) { // Less than 7 days
            return date.toLocaleDateString('ar-SA', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('ar-SA', { 
                day: 'numeric', 
                month: 'long' 
            });
        }
    }
    
    getStatusIcon(status) {
        switch (status) {
            case 'sent':
                return '<i class="fas fa-check status-icon status-sent"></i>';
            case 'delivered':
                return '<i class="fas fa-check-double status-icon status-delivered"></i>';
            case 'read':
                return '<i class="fas fa-check-double status-icon status-read"></i>';
            default:
                return '';
        }
    }
    
    scrollToBottom() {
        const container = document.getElementById('chat-messages') || 
                         document.querySelector('.chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Send message on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('message-input')) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Send message on button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.send-btn')) {
                this.sendMessage();
            }
        });
        
        // Typing indicator
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('message-input')) {
                this.handleTyping();
            }
        });
        
        // Mobile conversation list toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-conversations-toggle')) {
                document.querySelector('.conversations-list')?.classList.toggle('active');
            }
        });
    }
    
    // Create new conversation
    async createConversation(participantId, participantName) {
        const baseConversation = {
            name: participantName,
            avatar: participantName.substring(0, 2),
            lastMessage: '',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
            participants: [
                this.currentUser.uid || this.currentUser.username,
                participantId
            ].filter(Boolean),
            type: 'user'
        };

        try {
            if (this.db) {
                const conversationsRef = this.collection(this.db, 'conversations');
                const newDocRef = await this.addDoc(conversationsRef, {
                    ...baseConversation,
                    timestamp: this.serverTimestamp()
                });
                const conversation = { id: newDocRef.id, ...baseConversation };
                this.conversations.set(conversation.id, conversation);
                this.renderConversations();
                this.selectConversation(conversation.id);
            } else {
                const conversationId = `conv_${Date.now()}`;
                const conversation = { id: conversationId, ...baseConversation };
                this.conversations.set(conversationId, conversation);
                this.renderConversations();
                this.selectConversation(conversationId);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    }
}

// Initialize messaging system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.messagingSystem = new MessagingSystem();
});

// Global functions for backward compatibility
function selectConversation(id) {
    if (window.messagingSystem) {
        window.messagingSystem.selectConversation(id);
    }
}

function sendMessage() {
    if (window.messagingSystem) {
        window.messagingSystem.sendMessage();
    }
}

function newMessage() {
    const participantId = prompt('أدخل معرف المستخدم (UID أو اسم المستخدم):');
    if (!participantId) return;
    const participantName = prompt('أدخل اسم المستخدم الظاهر:') || participantId;
    if (window.messagingSystem) {
        window.messagingSystem.createConversation(participantId.trim(), participantName.trim());
    }
}