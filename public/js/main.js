// Main Application JavaScript
class DTEduApp {
    constructor() {
        this.currentUser = null;
        this.currentLanguage = 'ar';
        this.theme = 'light';
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.checkAuthentication();
    }
    
    // Load user data from localStorage
    loadUserData() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
        
        const language = localStorage.getItem('currentLanguage');
        if (language) {
            this.currentLanguage = language;
        }
        
        const theme = localStorage.getItem('theme');
        if (theme) {
            this.theme = theme;
        }
    }
    
    // Load application settings
    loadSettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Apply language
        document.documentElement.setAttribute('lang', this.currentLanguage);
        document.body.classList.toggle('rtl', this.currentLanguage === 'ar');
        
        // Update UI text based on language
        this.updateLanguageText();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Dark mode toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#dark-mode-toggle') || e.target.closest('#dark-mode-toggle-sidebar')) {
                this.toggleTheme();
            }
        });
        
        // Language toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.language-toggle')) {
                this.toggleLanguage();
            }
        });
        
        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-link')) {
                e.preventDefault();
                this.logout();
            }
        });
        
        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-toggle')) {
                this.toggleMobileMenu();
            }
        });
        
        // Back button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#back-btn')) {
                this.goBack();
            }
        });
        
        // Handle responsive sidebar
        this.handleResponsiveSidebar();
    }
    
    // Check authentication
    checkAuthentication() {
        if (!this.currentUser && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
    
    // Update UI elements
    updateUI() {
        if (this.currentUser) {
            this.updateUserInfo();
        }
        this.updateThemeIcons();
    }
    
    // Update user information in UI
    updateUserInfo() {
        const userNameElements = document.querySelectorAll('#user-name, .user-name');
        const userTypeElements = document.querySelectorAll('#user-type, .user-type');
        
        userNameElements.forEach(el => {
            if (el) el.textContent = this.currentUser.name || this.currentUser.username;
        });
        
        userTypeElements.forEach(el => {
            if (el) el.textContent = this.getUserTypeText(this.currentUser.type);
        });
    }
    
    // Get user type text based on language
    getUserTypeText(type) {
        const types = {
            'ar': {
                'student': 'طالب',
                'teacher': 'معلم',
                'admin': 'مدير',
                'parent': 'ولي أمر'
            },
            'en': {
                'student': 'Student',
                'teacher': 'Teacher',
                'admin': 'Principal',
                'parent': 'Parent'
            }
        };
        
        return types[this.currentLanguage][type] || type;
    }
    
    // Toggle theme
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeIcons();
    }
    
    // Update theme icons
    updateThemeIcons() {
        const themeButtons = document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-sidebar');
        const themeIcons = document.querySelectorAll('#dark-mode-toggle i, #dark-mode-toggle-sidebar i');
        const themeTexts = document.querySelectorAll('#dark-mode-text, #dark-mode-btn-text');
        
        const isDark = this.theme === 'dark';
        const icon = isDark ? 'fa-sun' : 'fa-moon';
        const text = isDark ? 
            (this.currentLanguage === 'ar' ? 'الوضع الفاتح' : 'Light Mode') :
            (this.currentLanguage === 'ar' ? 'الوضع الداكن' : 'Dark Mode');
        
        themeIcons.forEach(iconEl => {
            if (iconEl) {
                iconEl.className = `fas ${icon}`;
            }
        });
        
        themeTexts.forEach(textEl => {
            if (textEl) textEl.textContent = text;
        });
    }
    
    // Toggle language
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        localStorage.setItem('currentLanguage', this.currentLanguage);
        
        // Apply language changes
        document.documentElement.setAttribute('lang', this.currentLanguage);
        document.body.classList.toggle('rtl', this.currentLanguage === 'ar');
        
        this.updateLanguageText();
        this.updateUI();
    }
    
    // Update language text
    updateLanguageText() {
        const translations = {
            'ar': {
                'menu-dashboard': 'لوحة التحكم',
                'menu-schedule': 'الجدول الدراسي',
                'menu-courses': 'المقررات الدراسية',
                'menu-progress': 'التقدم الدراسي',
                'menu-messages': 'الرسائل',
                'menu-settings': 'الإعدادات',
                'logout-text': 'تسجيل الخروج',
                'back-text': 'العودة',
                'conversations-title': 'المحادثات',
                'new-message-text': 'رسالة جديدة'
            },
            'en': {
                'menu-dashboard': 'Dashboard',
                'menu-schedule': 'Schedule',
                'menu-courses': 'Courses',
                'menu-progress': 'Progress',
                'menu-messages': 'Messages',
                'menu-settings': 'Settings',
                'logout-text': 'Logout',
                'back-text': 'Back',
                'conversations-title': 'Conversations',
                'new-message-text': 'New Message'
            }
        };
        
        const currentTranslations = translations[this.currentLanguage];
        
        Object.keys(currentTranslations).forEach(key => {
            const elements = document.querySelectorAll(`#${key}, .${key}`);
            elements.forEach(el => {
                if (el) el.textContent = currentTranslations[key];
            });
        });
    }
    
    // Handle responsive sidebar
    handleResponsiveSidebar() {
        const handleResize = () => {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            
            if (window.innerWidth <= 768) {
                // Mobile view
                if (sidebar) sidebar.classList.add('mobile');
                if (mainContent) mainContent.classList.add('mobile');
            } else {
                // Desktop view
                if (sidebar) sidebar.classList.remove('mobile', 'active');
                if (mainContent) mainContent.classList.remove('mobile');
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }
    
    // Toggle mobile menu
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
    
    // Logout function
    logout() {
        const confirmLogout = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من تسجيل الخروج؟' : 
            'Are you sure you want to logout?';
            
        if (confirm(confirmLogout)) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentLanguage');
            window.location.href = 'index.html';
        }
    }
    
    // Go back function
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // Format date
    formatDate(date, format = 'full') {
        const d = new Date(date);
        const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        
        switch (format) {
            case 'short':
                return d.toLocaleDateString(locale);
            case 'time':
                return d.toLocaleTimeString(locale, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            case 'full':
            default:
                return d.toLocaleString(locale);
        }
    }
    
    // API helper functions
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification(
                this.currentLanguage === 'ar' ? 
                'حدث خطأ في الاتصال' : 
                'Connection error occurred',
                'error'
            );
            throw error;
        }
    }
}

// Document management functions
class DocumentManager {
    constructor() {
        this.documents = [];
        this.currentFilter = 'all';
    }
    
    // Load documents
    async loadDocuments() {
        try {
            // In a real app, this would fetch from Firebase
            this.documents = this.getSampleDocuments();
            this.renderDocuments();
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }
    
    // Get sample documents
    getSampleDocuments() {
        return [
            {
                id: '1',
                title: 'منهج الرياضيات - الفصل الأول',
                type: 'pdf',
                size: '2.5 MB',
                uploadedBy: 'أ. أحمد محمد',
                uploadDate: new Date().toISOString(),
                category: 'curriculum',
                description: 'المنهج الكامل لمادة الرياضيات للفصل الدراسي الأول'
            },
            {
                id: '2',
                title: 'جدول الامتحانات النهائية',
                type: 'xlsx',
                size: '1.2 MB',
                uploadedBy: 'مدير المدرسة',
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                category: 'schedule',
                description: 'جدول مواعيد الامتحانات النهائية لجميع المراحل'
            },
            {
                id: '3',
                title: 'نتائج اختبار العلوم',
                type: 'pdf',
                size: '800 KB',
                uploadedBy: 'أ. فاطمة علي',
                uploadDate: new Date(Date.now() - 172800000).toISOString(),
                category: 'results',
                description: 'نتائج اختبار مادة العلوم للصف الثامن'
            }
        ];
    }
    
    // Render documents
    renderDocuments() {
        const container = document.querySelector('.documents-grid') || 
                         document.querySelector('.documents-container');
        
        if (!container) return;
        
        const filteredDocs = this.filterDocuments();
        
        container.innerHTML = filteredDocs.map(doc => this.createDocumentHTML(doc)).join('');
    }
    
    // Filter documents
    filterDocuments() {
        if (this.currentFilter === 'all') {
            return this.documents;
        }
        return this.documents.filter(doc => doc.category === this.currentFilter);
    }
    
    // Create document HTML
    createDocumentHTML(doc) {
        const app = window.dtEduApp;
        const uploadDate = app ? app.formatDate(doc.uploadDate, 'short') : new Date(doc.uploadDate).toLocaleDateString();
        
        return `
            <div class="document-card" data-doc-id="${doc.id}">
                <div class="document-icon">
                    <i class="fas fa-file-${this.getFileIcon(doc.type)}"></i>
                </div>
                <div class="document-info">
                    <h4 class="document-title">${doc.title}</h4>
                    <p class="document-description">${doc.description}</p>
                    <div class="document-meta">
                        <span class="document-size">${doc.size}</span>
                        <span class="document-date">${uploadDate}</span>
                    </div>
                    <div class="document-uploader">
                        <i class="fas fa-user"></i>
                        ${doc.uploadedBy}
                    </div>
                </div>
                <div class="document-actions">
                    <button class="btn btn-primary btn-sm" onclick="documentManager.downloadDocument('${doc.id}')">
                        <i class="fas fa-download"></i>
                        تحميل
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="documentManager.viewDocument('${doc.id}')">
                        <i class="fas fa-eye"></i>
                        عرض
                    </button>
                </div>
            </div>
        `;
    }
    
    // Get file icon
    getFileIcon(type) {
        const icons = {
            'pdf': 'pdf',
            'doc': 'word',
            'docx': 'word',
            'xls': 'excel',
            'xlsx': 'excel',
            'ppt': 'powerpoint',
            'pptx': 'powerpoint',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image'
        };
        return icons[type.toLowerCase()] || 'alt';
    }
    
    // Download document
    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
            // In a real app, this would download from Firebase Storage
            console.log('Downloading document:', doc.title);
            window.dtEduApp?.showNotification(
                `جاري تحميل: ${doc.title}`,
                'info'
            );
        }
    }
    
    // View document
    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
            // In a real app, this would open document viewer
            console.log('Viewing document:', doc.title);
            window.dtEduApp?.showNotification(
                `عرض: ${doc.title}`,
                'info'
            );
        }
    }
    
    // Upload document
    async uploadDocument(file, metadata) {
        try {
            // In a real app, this would upload to Firebase Storage
            const newDoc = {
                id: Date.now().toString(),
                title: metadata.title || file.name,
                type: file.name.split('.').pop(),
                size: this.formatFileSize(file.size),
                uploadedBy: window.dtEduApp?.currentUser?.name || 'مستخدم',
                uploadDate: new Date().toISOString(),
                category: metadata.category || 'other',
                description: metadata.description || ''
            };
            
            this.documents.unshift(newDoc);
            this.renderDocuments();
            
            window.dtEduApp?.showNotification(
                'تم رفع الملف بنجاح',
                'success'
            );
        } catch (error) {
            console.error('Error uploading document:', error);
            window.dtEduApp?.showNotification(
                'فشل في رفع الملف',
                'error'
            );
        }
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.dtEduApp = new DTEduApp();
    window.documentManager = new DocumentManager();
    
    // Load documents if on documents page
    if (document.querySelector('.documents-container')) {
        window.documentManager.loadDocuments();
    }
});

// Global utility functions
function goBack() {
    window.dtEduApp?.goBack();
}

function toggleMobileMenu() {
    window.dtEduApp?.toggleMobileMenu();
}