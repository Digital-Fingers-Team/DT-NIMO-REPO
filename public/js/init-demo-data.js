// Initialize Demo Data for Testing
// This file creates sample conversations and documents for demonstration

class DemoDataInitializer {
    constructor() {
        this.initialized = false;
    }
    
    // Check if demo data should be initialized
    shouldInitialize() {
        const lastInit = localStorage.getItem('demoDataInitialized');
        
        // Initialize if never done before or if more than 7 days ago
        if (!lastInit) return true;
        
        const lastInitDate = new Date(lastInit);
        const daysSinceInit = (new Date() - lastInitDate) / (1000 * 60 * 60 * 24);
        
        return daysSinceInit > 7;
    }
    
    // Initialize demo conversations
    async initializeConversations() {
        try {
            const { collection, addDoc, serverTimestamp, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
            const firebaseModule = await import('./firebase.js');
            const db = firebaseModule.db;
            
            const conversationsRef = collection(db, 'conversations');
            
            // Check if conversations already exist
            const snapshot = await getDocs(conversationsRef);
            if (snapshot.size > 0) {
                console.log('Conversations already exist, skipping initialization');
                return;
            }
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) return;
            
            // Sample conversations
            const conversations = [
                {
                    name: 'أ. أحمد محمد',
                    avatar: 'أ.أ',
                    participants: [currentUser.username, 'teacher_arabic'],
                    lastMessage: 'مرحباً، كيف يمكنني مساعدتك؟',
                    timestamp: serverTimestamp(),
                    type: 'teacher'
                },
                {
                    name: 'أ. فاطمة علي',
                    avatar: 'أ.ف',
                    participants: [currentUser.username, 'teacher_science'],
                    lastMessage: 'لا تنسى حل الواجب!',
                    timestamp: serverTimestamp(),
                    type: 'teacher'
                },
                {
                    name: 'مدير المدرسة',
                    avatar: 'م.ح',
                    participants: [currentUser.username, 'admin'],
                    lastMessage: 'مرحباً بك في نظام DT Edu',
                    timestamp: serverTimestamp(),
                    type: 'admin'
                }
            ];
            
            // Add conversations to Firestore
            for (const conv of conversations) {
                await addDoc(conversationsRef, conv);
            }
            
            console.log('Demo conversations initialized successfully');
            
        } catch (error) {
            console.error('Error initializing conversations:', error);
        }
    }
    
    // Initialize demo documents
    async initializeDocuments() {
        try {
            const { collection, addDoc, serverTimestamp, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
            const firebaseModule = await import('./firebase.js');
            const db = firebaseModule.db;
            
            const documentsRef = collection(db, 'documents');
            
            // Check if documents already exist
            const snapshot = await getDocs(documentsRef);
            if (snapshot.size > 0) {
                console.log('Documents already exist, skipping initialization');
                return;
            }
            
            // Sample documents
            const documents = [
                {
                    title: 'دليل استخدام نظام DT Edu',
                    type: 'pdf',
                    size: '2.5 MB',
                    sizeBytes: 2621440,
                    uploadedBy: 'مدير النظام',
                    uploaderId: 'admin',
                    uploadDate: serverTimestamp(),
                    category: 'other',
                    description: 'دليل شامل لاستخدام جميع ميزات نظام DT Edu التعليمي',
                    downloads: 0,
                    isPublic: true,
                    url: '#'
                },
                {
                    title: 'منهج الرياضيات - الفصل الأول',
                    type: 'pdf',
                    size: '3.2 MB',
                    sizeBytes: 3355443,
                    uploadedBy: 'أ. أحمد محمد',
                    uploaderId: 'teacher_arabic',
                    uploadDate: serverTimestamp(),
                    category: 'curriculum',
                    description: 'المنهج الكامل لمادة الرياضيات للفصل الدراسي الأول',
                    downloads: 0,
                    isPublic: true,
                    url: '#'
                },
                {
                    title: 'جدول الامتحانات',
                    type: 'xlsx',
                    size: '1.2 MB',
                    sizeBytes: 1258291,
                    uploadedBy: 'مدير المدرسة',
                    uploaderId: 'admin',
                    uploadDate: serverTimestamp(),
                    category: 'schedule',
                    description: 'جدول مواعيد الامتحانات لجميع المراحل الدراسية',
                    downloads: 0,
                    isPublic: true,
                    url: '#'
                }
            ];
            
            // Add documents to Firestore
            for (const doc of documents) {
                await addDoc(documentsRef, doc);
            }
            
            console.log('Demo documents initialized successfully');
            
        } catch (error) {
            console.error('Error initializing documents:', error);
        }
    }
    
    // Initialize all demo data
    async initialize() {
        if (this.initialized || !this.shouldInitialize()) {
            return;
        }
        
        try {
            console.log('Initializing demo data...');
            
            await this.initializeConversations();
            await this.initializeDocuments();
            
            // Mark as initialized
            localStorage.setItem('demoDataInitialized', new Date().toISOString());
            this.initialized = true;
            
            console.log('Demo data initialization completed');
            
        } catch (error) {
            console.error('Error during demo data initialization:', error);
        }
    }
}

// Initialize demo data when user logs in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser && window.location.pathname.includes('dashboard.html')) {
        const initializer = new DemoDataInitializer();
        
        // Wait a bit to ensure Firebase is initialized
        setTimeout(() => {
            initializer.initialize();
        }, 2000);
    }
});
