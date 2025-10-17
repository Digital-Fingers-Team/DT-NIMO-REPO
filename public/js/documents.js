// Document Management System
class DocumentsManager {
    constructor() {
        this.documents = [];
        this.folders = [];
        this.currentView = 'grid';
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedFiles = [];
        this.unsubscribeDocsListener = null;
        
        this.init();
    }
    
    init() {
        this.loadDocuments();
        this.setupEventListeners();
        this.updateStats();
        this.setupFileUpload();
    }
    
    // Load documents from storage
    async loadDocuments() {
        try {
            // Try Firebase first
            await this.initializeFirebase();
            if (this.db) {
                this.attachRealtimeDocuments();
            } else {
                // Fallback to samples
                this.documents = this.getSampleDocuments();
                this.renderDocuments();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            window.dtEduApp?.showNotification('فشل في تحميل المستندات', 'error');
        }
    }

    async initializeFirebase() {
        try {
            const { auth, onAuthStateChanged, db, collection, addDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, storage, ref, uploadBytes, getDownloadURL } = await import('../firebase.js');
            this.auth = auth;
            this.onAuthStateChanged = onAuthStateChanged;
            this.db = db;
            this.collection = collection;
            this.addDoc = addDoc;
            this.getDocs = getDocs;
            this.query = query;
            this.where = where;
            this.orderBy = orderBy;
            this.onSnapshot = onSnapshot;
            this.serverTimestamp = serverTimestamp;
            this.storage = storage;
            this.ref = ref;
            this.uploadBytes = uploadBytes;
            this.getDownloadURL = getDownloadURL;
        } catch (e) {
            // Ignore, fallback handled by caller
        }
    }

    attachRealtimeDocuments() {
        if (!this.db) return;
        if (typeof this.unsubscribeDocsListener === 'function') {
            this.unsubscribeDocsListener();
            this.unsubscribeDocsListener = null;
        }

        const docsRef = this.collection(this.db, 'documents');
        const q = this.query(docsRef, this.orderBy('uploadDate', 'desc'));
        this.unsubscribeDocsListener = this.onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
            this.documents = docs;
            this.renderDocuments();
            this.updateStats();
        });
    }
    
    // Get sample documents
    getSampleDocuments() {
        return [
            {
                id: '1',
                title: 'منهج الرياضيات - الفصل الأول',
                type: 'pdf',
                size: '2.5 MB',
                sizeBytes: 2621440,
                uploadedBy: 'أ. أحمد محمد',
                uploadDate: new Date().toISOString(),
                category: 'curriculum',
                description: 'المنهج الكامل لمادة الرياضيات للفصل الدراسي الأول',
                downloads: 45,
                isPublic: true,
                url: '#'
            },
            {
                id: '2',
                title: 'جدول الامتحانات النهائية',
                type: 'xlsx',
                size: '1.2 MB',
                sizeBytes: 1258291,
                uploadedBy: 'مدير المدرسة',
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                category: 'schedule',
                description: 'جدول مواعيد الامتحانات النهائية لجميع المراحل',
                downloads: 123,
                isPublic: true,
                url: '#'
            },
            {
                id: '3',
                title: 'نتائج اختبار العلوم',
                type: 'pdf',
                size: '800 KB',
                sizeBytes: 819200,
                uploadedBy: 'أ. فاطمة علي',
                uploadDate: new Date(Date.now() - 172800000).toISOString(),
                category: 'results',
                description: 'نتائج اختبار مادة العلوم للصف الثامن',
                downloads: 67,
                isPublic: false,
                url: '#'
            },
            {
                id: '4',
                title: 'تقرير الأنشطة الشهرية',
                type: 'docx',
                size: '1.8 MB',
                sizeBytes: 1887436,
                uploadedBy: 'أ. محمد حسن',
                uploadDate: new Date(Date.now() - 259200000).toISOString(),
                category: 'reports',
                description: 'تقرير شامل عن الأنشطة المدرسية خلال الشهر الماضي',
                downloads: 23,
                isPublic: true,
                url: '#'
            },
            {
                id: '5',
                title: 'خطة الأنشطة الصيفية',
                type: 'pptx',
                size: '3.2 MB',
                sizeBytes: 3355443,
                uploadedBy: 'أ. سارة أحمد',
                uploadDate: new Date(Date.now() - 345600000).toISOString(),
                category: 'other',
                description: 'عرض تقديمي لخطة الأنشطة الصيفية للطلاب',
                downloads: 89,
                isPublic: true,
                url: '#'
            }
        ];
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('document-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderDocuments();
            });
        }
        
        // Filter functionality
        const filterSelect = document.getElementById('document-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderDocuments();
            });
        }
        
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.setView(view);
            });
        });
        
        // Upload form
        const uploadForm = document.getElementById('upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload();
            });
        }
    }
    
    // Setup file upload
    setupFileUpload() {
        const uploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (!uploadArea || !fileInput) return;
        
        // Click to select files
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelection(e.dataTransfer.files);
        });
    }
    
    // Handle file selection
    handleFileSelection(files) {
        this.selectedFiles = Array.from(files);
        this.displayFilePreview();
        
        // Auto-fill title if single file
        if (files.length === 1) {
            const titleInput = document.getElementById('document-title');
            if (titleInput && !titleInput.value) {
                titleInput.value = files[0].name.split('.')[0];
            }
        }
    }
    
    // Display file preview
    displayFilePreview() {
        const uploadArea = document.getElementById('file-upload-area');
        if (!uploadArea) return;
        
        // Clear existing preview
        const existingPreview = uploadArea.querySelector('.files-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        if (this.selectedFiles.length === 0) return;
        
        const previewContainer = document.createElement('div');
        previewContainer.className = 'files-preview';
        previewContainer.style.marginTop = '1rem';
        
        this.selectedFiles.forEach((file, index) => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.innerHTML = `
                <div class="file-preview-icon">
                    <i class="fas fa-file-${this.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-preview-info">
                    <div class="file-preview-name">${file.name}</div>
                    <div class="file-preview-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-preview-remove" onclick="documentsManager.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewContainer.appendChild(preview);
        });
        
        uploadArea.appendChild(previewContainer);
    }
    
    // Remove file from selection
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displayFilePreview();
    }
    
    // Handle upload
    async handleUpload() {
        if (this.selectedFiles.length === 0) {
            window.dtEduApp?.showNotification('الرجاء اختيار ملف للرفع', 'warning');
            return;
        }
        
        const title = document.getElementById('document-title').value;
        const category = document.getElementById('document-category').value;
        const description = document.getElementById('document-description').value;
        const isPublic = document.getElementById('document-public').checked;
        
        if (!title || !category) {
            window.dtEduApp?.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'warning');
            return;
        }
        
        try {
            // Show progress
            this.showUploadProgress();

            if (this.db && this.storage) {
                // Upload to Firebase Storage and create Firestore entries
                for (let i = 0; i < this.selectedFiles.length; i++) {
                    const file = this.selectedFiles[i];
                    await this.uploadSingleFileFirebase(file, {
                        title: this.selectedFiles.length > 1 ? `${title} - ${i + 1}` : title,
                        category,
                        description,
                        isPublic
                    });
                }
            } else {
                // Fallback simulate upload process
                for (let i = 0; i < this.selectedFiles.length; i++) {
                    const file = this.selectedFiles[i];
                    await this.uploadSingleFileLocal(file, {
                        title: this.selectedFiles.length > 1 ? `${title} - ${i + 1}` : title,
                        category,
                        description,
                        isPublic
                    });
                }
            }

            window.dtEduApp?.showNotification('تم رفع المستندات بنجاح', 'success');
            this.hideUploadModal();
            // Listeners will refresh the list automatically
            
        } catch (error) {
            console.error('Upload error:', error);
            window.dtEduApp?.showNotification('فشل في رفع المستندات', 'error');
        }
    }
    
    // Upload single file - Firebase
    async uploadSingleFileFirebase(file, metadata) {
        const currentUser = window.dtEduApp?.currentUser || {};
        const path = `documents/${(currentUser.uid || 'anonymous')}/${Date.now()}_${file.name}`;
        const storageRef = this.ref(this.storage, path);
        await this.uploadBytes(storageRef, file);
        const url = await this.getDownloadURL(storageRef);

        const docsRef = this.collection(this.db, 'documents');
        await this.addDoc(docsRef, {
            title: metadata.title,
            type: file.name.split('.').pop().toLowerCase(),
            size: this.formatFileSize(file.size),
            sizeBytes: file.size,
            uploadedBy: currentUser.uid || currentUser.username || 'anonymous',
            uploaderName: currentUser.name || currentUser.email || 'مستخدم',
            uploadDate: this.serverTimestamp(),
            category: metadata.category,
            description: metadata.description,
            downloads: 0,
            isPublic: metadata.isPublic,
            url
        });
    }

    // Upload single file - Local fallback
    async uploadSingleFileLocal(file, metadata) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newDoc = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    title: metadata.title,
                    type: file.name.split('.').pop().toLowerCase(),
                    size: this.formatFileSize(file.size),
                    sizeBytes: file.size,
                    uploadedBy: window.dtEduApp?.currentUser?.name || 'مستخدم',
                    uploadDate: new Date().toISOString(),
                    category: metadata.category,
                    description: metadata.description,
                    downloads: 0,
                    isPublic: metadata.isPublic,
                    url: URL.createObjectURL(file)
                };
                this.documents.unshift(newDoc);
                resolve(newDoc);
            }, 800);
        });
    }
    
    // Show upload progress
    showUploadProgress() {
        // Implementation for upload progress bar
        console.log('Showing upload progress...');
    }
    
    // Render documents
    renderDocuments() {
        const container = document.getElementById('documents-grid');
        if (!container) return;
        
        const filteredDocs = this.filterDocuments();
        
        if (filteredDocs.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        // Update container class based on view
        container.className = this.currentView === 'list' ? 'documents-list' : 'documents-grid';
        
        container.innerHTML = filteredDocs
            .map(doc => this.createDocumentHTML(doc))
            .join('');
    }
    
    // Filter documents
    filterDocuments() {
        let filtered = this.documents;
        
        // Filter by category
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(doc => doc.category === this.currentFilter);
        }
        
        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(doc => 
                doc.title.toLowerCase().includes(this.searchQuery) ||
                doc.description.toLowerCase().includes(this.searchQuery) ||
                doc.uploadedBy.toLowerCase().includes(this.searchQuery)
            );
        }
        
        return filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    
    // Create document HTML
    createDocumentHTML(doc) {
        const uploadDate = window.dtEduApp?.formatDate(doc.uploadDate, 'short') || 
                          new Date(doc.uploadDate).toLocaleDateString('ar-SA');
        
        const viewClass = this.currentView === 'list' ? 'list-view' : '';
        
        return `
            <div class="document-card ${viewClass}" data-doc-id="${doc.id}">
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
                    <button class="btn btn-primary btn-sm" onclick="documentsManager.downloadDocument('${doc.id}')">
                        <i class="fas fa-download"></i>
                        تحميل
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="documentsManager.viewDocument('${doc.id}')">
                        <i class="fas fa-eye"></i>
                        عرض
                    </button>
                    ${this.canEditDocument(doc) ? `
                        <button class="btn btn-outline btn-sm" onclick="documentsManager.editDocument('${doc.id}')">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Get empty state HTML
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>لا توجد مستندات</h3>
                <p>لم يتم العثور على مستندات تطابق البحث أو الفلتر المحدد.</p>
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
            'gif': 'image',
            'zip': 'archive',
            'rar': 'archive',
            'txt': 'alt',
            'mp4': 'video',
            'mp3': 'audio'
        };
        return icons[type.toLowerCase()] || 'alt';
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Set view mode
    setView(view) {
        this.currentView = view;
        
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderDocuments();
    }
    
    // Update statistics
    updateStats() {
        const totalDocs = this.documents.length;
        const totalSize = this.documents.reduce((sum, doc) => sum + (doc.sizeBytes || 0), 0);
        const totalDownloads = this.documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0);
        
        // Update UI
        const totalDocsEl = document.getElementById('total-documents');
        const storageSizeEl = document.getElementById('storage-used');
        const totalDownloadsEl = document.getElementById('total-downloads');
        
        if (totalDocsEl) totalDocsEl.textContent = totalDocs;
        if (storageSizeEl) storageSizeEl.textContent = this.formatFileSize(totalSize);
        if (totalDownloadsEl) totalDownloadsEl.textContent = totalDownloads;
    }
    
    // Check if user can edit document
    canEditDocument(doc) {
        const currentUser = window.dtEduApp?.currentUser;
        if (!currentUser) return false;
        
        // Admin can edit all documents
        if (currentUser.type === 'admin') return true;
        
        // Teachers can edit their own documents
        if (currentUser.type === 'teacher' && doc.uploadedBy === currentUser.name) return true;
        
        return false;
    }
    
    // Download document
    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;
        
        // Increment download count
        doc.downloads = (doc.downloads || 0) + 1;
        this.updateStats();
        
        // In a real app, this would download from Firebase Storage
        console.log('Downloading document:', doc.title);
        
        // Create download link
        const link = document.createElement('a');
        link.href = doc.url || '#';
        link.download = doc.title + '.' + doc.type;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.dtEduApp?.showNotification(`جاري تحميل: ${doc.title}`, 'info');
    }
    
    // View document
    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;
        
        const modal = document.getElementById('document-viewer-modal');
        const viewer = document.getElementById('document-viewer');
        const title = document.getElementById('viewer-title');
        
        if (!modal || !viewer || !title) return;
        
        title.textContent = doc.title;
        
        // Create viewer content based on file type
        let viewerContent = '';
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(doc.type.toLowerCase())) {
            viewerContent = `<img src="${doc.url}" alt="${doc.title}">`;
        } else if (doc.type.toLowerCase() === 'pdf') {
            // Use Google Docs viewer when url is a Firebase Storage URL to improve compatibility
            const safeUrl = encodeURIComponent(doc.url);
            viewerContent = `<iframe src="https://drive.google.com/viewerng/viewer?embedded=true&url=${safeUrl}" type="application/pdf"></iframe>`;
        } else {
            viewerContent = `
                <div class="document-preview-placeholder">
                    <i class="fas fa-file-${this.getFileIcon(doc.type)} fa-4x"></i>
                    <h3>${doc.title}</h3>
                    <p>معاينة غير متاحة لهذا النوع من الملفات</p>
                    <button class="btn btn-primary" onclick="documentsManager.downloadDocument('${doc.id}')">
                        <i class="fas fa-download"></i>
                        تحميل الملف
                    </button>
                </div>
            `;
        }
        
        viewer.innerHTML = viewerContent;
        modal.classList.add('active');
    }
    
    // Edit document
    editDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;
        
        // Pre-fill form with document data
        document.getElementById('document-title').value = doc.title;
        document.getElementById('document-category').value = doc.category;
        document.getElementById('document-description').value = doc.description;
        document.getElementById('document-public').checked = doc.isPublic;
        
        // Show upload modal in edit mode
        this.showUploadModal();
        
        // Store edit mode data
        this.editingDocId = docId;
    }
    
    // Create folder
    createFolder() {
        const folderName = prompt('اسم المجلد الجديد:');
        if (!folderName) return;
        
        const newFolder = {
            id: Date.now().toString(),
            name: folderName,
            createdBy: window.dtEduApp?.currentUser?.name || 'مستخدم',
            createdDate: new Date().toISOString(),
            documents: []
        };
        
        this.folders.push(newFolder);
        window.dtEduApp?.showNotification(`تم إنشاء المجلد: ${folderName}`, 'success');
    }
}

// Modal functions
function showUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.classList.add('active');
        // Reset form
        document.getElementById('upload-form').reset();
        window.documentsManager.selectedFiles = [];
        window.documentsManager.displayFilePreview();
    }
}

function hideUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function hideDocumentViewer() {
    const modal = document.getElementById('document-viewer-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize documents manager
document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();
});

// Global helper to create a folder from HTML onclick
function createFolder() {
    if (window.documentsManager) {
        window.documentsManager.createFolder();
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});