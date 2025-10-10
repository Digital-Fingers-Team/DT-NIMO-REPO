// التحقق من تسجيل الدخول
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// استعادة اللغة المحفوظة
let currentLanguage = localStorage.getItem('currentLanguage') || 'ar';

// استعادة وضع التصميم المحفوظ
let darkMode = localStorage.getItem('darkMode') === 'true';

// تحديث اتجاه الصفحة واللغة والوضع الداكن
document.body.className = currentLanguage === 'ar' ? 'rtl' : 'ltr';
if (darkMode) {
    document.body.classList.add('dark-mode');
}

// تحميل الشريط الجانبي
function loadSidebar() {
    fetch('components/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
            initializeSidebar();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // إذا فشل تحميل الشريط الجانبي، أنشئه يدوياً
            createFallbackSidebar();
        });
}

// إنشاء شريط جانبي احتياطي إذا فشل التحميل
function createFallbackSidebar() {
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <div class="logo">
                        <svg width="50" height="50" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#4a6cf7"/>
                                    <stop offset="100%" stop-color="#00b894"/>
                                </linearGradient>
                            </defs>
                            <circle cx="48" cy="48" r="46" fill="url(#grad)" opacity="0.15" stroke="#4a6cf7" stroke-width="2"/>
                            <path d="M28 62C28 48.745 38.745 38 52 38H60V46H52C43.163 46 36 53.163 36 62H28Z" fill="#4a6cf7"/>
                            <path d="M40 58C40 44.745 50.745 34 64 34H72V42H64C55.163 42 48 49.163 48 58H40Z" fill="#00b894" opacity="0.85"/>
                            <circle cx="60" cy="32" r="8" fill="#4a6cf7" opacity="0.75"/>
                            <circle cx="36" cy="60" r="6" fill="#00b894" opacity="0.8"/>
                        </svg>
                    </div>
                </div>
                <div class="logo-text">DT Edu</div>
                <div class="user-info">
                    <div class="user-name" id="user-name">${currentUser.name}</div>
                    <div class="user-type" id="user-type">${getUserTypeText(currentUser.type)}</div>
                </div>
            </div>
            
            <ul class="sidebar-menu">
                <li class="menu-item">
                    <a href="dashboard.html">
                        <i class="fas fa-home"></i>
                        <span id="menu-dashboard">${currentLanguage === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="schedule.html">
                        <i class="fas fa-calendar-alt"></i>
                        <span id="menu-schedule">${currentLanguage === 'ar' ? 'الجدول الدراسي' : 'Schedule'}</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="courses.html">
                        <i class="fas fa-book"></i>
                        <span id="menu-courses">${currentLanguage === 'ar' ? 'المقررات الدراسية' : 'Courses'}</span>
                    </a>
                </li>
                <li class="menu-item active">
                    <a href="progress-messages.html">
                        <i class="fas fa-chart-bar"></i>
                        <span id="menu-progress">${currentLanguage === 'ar' ? 'التقدم الدراسي' : 'Progress'}</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="progress-messages.html">
                        <i class="fas fa-comments"></i>
                        <span id="menu-messages">${currentLanguage === 'ar' ? 'الرسائل' : 'Messages'}</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="settings.html">
                        <i class="fas fa-cog"></i>
                        <span id="menu-settings">${currentLanguage === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                    </a>
                </li>
            </ul>
            
            <div class="sidebar-footer">
                <ul class="sidebar-menu">
                    <li class="menu-item">
                        <a href="#" id="dark-mode-toggle-sidebar">
                            <i class="fas ${darkMode ? 'fa-sun' : 'fa-moon'}"></i>
                            <span id="dark-mode-text">${currentLanguage === 'ar' ? (darkMode ? 'الوضع الفاتح' : 'الوضع الداكن') : (darkMode ? 'Light Mode' : 'Dark Mode')}</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#" id="logout-link">
                            <i class="fas fa-sign-out-alt"></i>
                            <span id="logout-text">${currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('sidebar-container').innerHTML = sidebarHTML;
    initializeSidebar();
}

// الحصول على نص نوع المستخدم
function getUserTypeText(type) {
    const userTypeMap = {
        principal: { ar: 'مدير', en: 'Principal' },
        teacher: { ar: 'مدرس', en: 'Teacher' },
        student: { ar: 'طالب', en: 'Student' },
        parent: { ar: 'ولي أمر', en: 'Parent' }
    };
    return userTypeMap[type][currentLanguage];
}

// تهيئة الشريط الجانبي
function initializeSidebar() {
    // إعداد زر الوضع الداكن في الشريط الجانبي
    const darkModeToggleSidebar = document.getElementById('dark-mode-toggle-sidebar');
    if (darkModeToggleSidebar) {
        darkModeToggleSidebar.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDarkMode();
        });
    }
    
    // إعداد زر تسجيل الخروج
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

// تحديث معلومات المستخدم
document.getElementById('user-name').textContent = currentUser.name;

// تحديث نوع المستخدم
document.getElementById('user-type').textContent = getUserTypeText(currentUser.type);

// إعداد زر الوضع الداكن
document.querySelectorAll('#dark-mode-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
        toggleDarkMode();
    });
});

// تبديل الوضع الداكن
function toggleDarkMode() {
    darkMode = !darkMode;
    
    // تحديث الوضع الداكن في التخزين المحلي
    localStorage.setItem('darkMode', darkMode);
    
    // تحديث الوضع الداكن في الصفحة
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // تحديث نص الزر
    updateDarkModeText();
}

// إعداد زر تسجيل الخروج
document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// إعداد زر العودة
function goBack() {
    window.location.href = 'dashboard.html';
}

// وظائف التبويبات
function showTab(tabName) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إلغاء تنشيط جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار المحتوى المطلوب
    document.getElementById(tabName + '-tab-content').classList.add('active');
    
    // تنشيط الزر المطلوب
    event.target.classList.add('active');
    
    // تحديث عنوان الصفحة
    updateHeaderTitle(tabName);
}

function updateHeaderTitle(tabName) {
    const titles = {
        'progress': currentLanguage === 'ar' ? 'التقدم الدراسي - نظام DT Edu' : 'Academic Progress - DT Edu System',
        'messages': currentLanguage === 'ar' ? 'الرسائل - نظام DT Edu' : 'Messages - DT Edu System'
    };
    document.getElementById('header-title').textContent = titles[tabName];
}

// وظائف الرسائل
function selectConversation(conversationId) {
    // إلغاء تنشيط جميع المحادثات
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // تنشيط المحادثة المحددة
    event.target.classList.add('active');
    
    // تحديث نافذة المحادثة (هنا يمكن جلب البيانات من الخادم)
    updateChatWindow(conversationId);
}

function updateChatWindow(conversationId) {
    // في التطبيق الحقيقي، هنا يتم جلب بيانات المحادثة من الخادم
    const conversations = {
        1: {
            name: currentLanguage === 'ar' ? 'أ. أحمد محمد' : 'Mr. Ahmed Mohammed',
            status: currentLanguage === 'ar' ? 'مدرس الرياضيات - متصل الآن' : 'Math Teacher - Online Now',
            messages: [
                { type: 'received', text: currentLanguage === 'ar' ? 'مرحباً محمد، هل انتهيت من حل تمارين الواجب؟' : 'Hello Mohammed, have you finished the homework exercises?', time: '10:15 AM' },
                { type: 'sent', text: currentLanguage === 'ar' ? 'نعم أستاذ، انتهيت من معظم التمارين ولكن لدي سؤال في التمرين رقم ٥' : 'Yes teacher, I finished most exercises but I have a question about exercise number 5', time: '10:20 AM' },
                { type: 'received', text: currentLanguage === 'ar' ? 'أهلاً وسهلاً، ما هو السؤال الذي تواجهك؟' : 'You are welcome, what is the question you are facing?', time: '10:25 AM' }
            ]
        },
        2: {
            name: currentLanguage === 'ar' ? 'أ. فاطمة علي' : 'Ms. Fatima Ali',
            status: currentLanguage === 'ar' ? 'مدرسة العلوم' : 'Science Teacher',
            messages: [
                { type: 'received', text: currentLanguage === 'ar' ? 'نتيجة اختبار العلوم جاهزة، يمكنك الاطلاع عليها' : 'The science test results are ready, you can check them', time: 'Yesterday' }
            ]
        }
    };
    
    const conversation = conversations[conversationId] || conversations[1];
    
    document.getElementById('current-chat-name').textContent = conversation.name;
    document.getElementById('current-chat-status').textContent = conversation.status;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    conversation.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}`;
        messageDiv.innerHTML = `
            <div>${msg.text}</div>
            <div class="message-time">${msg.time}</div>
        `;
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function newMessage() {
    alert(currentLanguage === 'ar' ? 'سيتم فتح نافذة لإنشاء رسالة جديدة' : 'A new message window will open');
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        
        const now = new Date();
        const time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        
        messageDiv.innerHTML = `
            <div>${message}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // محاكاة رد تلقائي بعد ثانيتين
        setTimeout(() => {
            const autoReply = document.createElement('div');
            autoReply.className = 'message received';
            autoReply.innerHTML = `
                <div>${currentLanguage === 'ar' ? 'شكراً على رسالتك، سأرد عليك قريباً' : 'Thank you for your message, I will reply to you soon'}</div>
                <div class="message-time">${time}</div>
            `;
            chatMessages.appendChild(autoReply);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }
}

// إدخال الرسالة عند الضغط على Enter
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// تحديث النصوص حسب اللغة الحالية
function updateLanguage() {
    const translations = {
        'ar': {
            'header-title': 'التقدم الدراسي - نظام DT Edu',
            'menu-dashboard': 'لوحة التحكم',
            'menu-schedule': 'الجدول الدراسي',
            'menu-courses': 'المقررات الدراسية',
            'menu-progress': 'التقدم الدراسي',
            'menu-messages': 'الرسائل',
            'menu-settings': 'الإعدادات',
            'progress-tab': 'التقدم الدراسي',
            'messages-tab': 'الرسائل',
            'overall-progress-label': 'التقدم الدراسي العام',
            'average-grade-label': 'المعدل التراكمي',
            'completed-tasks-label': 'الواجبات المكتملة',
            'achievements-label': 'الإنجازات',
            'subjects-chart-title': 'التقدم في المواد الدراسية',
            'monthly-progress-title': 'التقدم الشهري',
            'math-label': 'رياضيات',
            'science-label': 'علوم',
            'arabic-label': 'عربية',
            'english-label': 'إنجليزية',
            'history-label': 'تاريخ',
            'jan-label': 'يناير',
            'feb-label': 'فبراير',
            'mar-label': 'مارس',
            'apr-label': 'أبريل',
            'may-label': 'مايو',
            'detailed-progress-title': 'التقدم التفصيلي في المواد',
            'subject-header': 'المادة',
            'progress-header': 'التقدم',
            'grade-header': 'التقييم',
            'assignments-header': 'الواجبات',
            'exams-header': 'الاختبارات',
            'status-header': 'الحالة',
            'math-row': 'الرياضيات',
            'science-row': 'العلوم',
            'arabic-row': 'اللغة العربية',
            'english-row': 'اللغة الإنجليزية',
            'history-row': 'التاريخ',
            'math-status': 'ممتاز',
            'science-status': 'جيد جداً',
            'arabic-status': 'ممتاز',
            'english-status': 'جيد',
            'history-status': 'جيد جداً',
            'conversations-title': 'المحادثات',
            'new-message-text': 'رسالة جديدة',
            'teacher1-name': 'أ. أحمد محمد',
            'teacher1-preview': 'هل انتهيت من حل تمارين الواجب؟',
            'teacher1-time': '10:30 ص',
            'teacher2-name': 'أ. فاطمة علي',
            'teacher2-preview': 'نتيجة اختبار العلوم جاهزة',
            'teacher2-time': 'أمس',
            'principal-name': 'مدير المدرسة',
            'principal-preview': 'اجتماع أولياء الأمور يوم الخميس',
            'principal-time': '١٥ مايو',
            'friend1-name': 'زميل الدراسة',
            'friend1-preview': 'هل يمكنك مساعدتي في فهم هذا الدرس؟',
            'friend1-time': '١٤ مايو',
            'logout-text': 'تسجيل الخروج',
            'dark-mode-text': 'الوضع الداكن',
            'dark-mode-btn-text': 'الوضع الداكن',
            'back-text': 'العودة'
        },
        'en': {
            'header-title': 'Academic Progress - DT Edu System',
            'menu-dashboard': 'Dashboard',
            'menu-schedule': 'Schedule',
            'menu-courses': 'Courses',
            'menu-progress': 'Progress',
            'menu-messages': 'Messages',
            'menu-settings': 'Settings',
            'progress-tab': 'Academic Progress',
            'messages-tab': 'Messages',
            'overall-progress-label': 'Overall Academic Progress',
            'average-grade-label': 'Average Grade',
            'completed-tasks-label': 'Completed Assignments',
            'achievements-label': 'Achievements',
            'subjects-chart-title': 'Progress in Subjects',
            'monthly-progress-title': 'Monthly Progress',
            'math-label': 'Math',
            'science-label': 'Science',
            'arabic-label': 'Arabic',
            'english-label': 'English',
            'history-label': 'History',
            'jan-label': 'Jan',
            'feb-label': 'Feb',
            'mar-label': 'Mar',
            'apr-label': 'Apr',
            'may-label': 'May',
            'detailed-progress-title': 'Detailed Progress in Subjects',
            'subject-header': 'Subject',
            'progress-header': 'Progress',
            'grade-header': 'Grade',
            'assignments-header': 'Assignments',
            'exams-header': 'Exams',
            'status-header': 'Status',
            'math-row': 'Mathematics',
            'science-row': 'Science',
            'arabic-row': 'Arabic',
            'english-row': 'English',
            'history-row': 'History',
            'math-status': 'Excellent',
            'science-status': 'Very Good',
            'arabic-status': 'Excellent',
            'english-status': 'Good',
            'history-status': 'Very Good',
            'conversations-title': 'Conversations',
            'new-message-text': 'New Message',
            'teacher1-name': 'Mr. Ahmed Mohammed',
            'teacher1-preview': 'Have you finished the homework exercises?',
            'teacher1-time': '10:30 AM',
            'teacher2-name': 'Ms. Fatima Ali',
            'teacher2-preview': 'Science test results are ready',
            'teacher2-time': 'Yesterday',
            'principal-name': 'School Principal',
            'principal-preview': 'Parents meeting on Thursday',
            'principal-time': 'May 15',
            'friend1-name': 'Study Colleague',
            'friend1-preview': 'Can you help me understand this lesson?',
            'friend1-time': 'May 14',
            'logout-text': 'Logout',
            'dark-mode-text': 'Dark Mode',
            'dark-mode-btn-text': 'Dark Mode',
            'back-text': 'Back'
        }
    };
    
    // تطبيق الترجمات
    Object.keys(translations[currentLanguage]).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // تحديث placeholder في حقل الرسالة
    document.getElementById('message-input').placeholder = 
        currentLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...';
}

// تحديث نص زر الوضع الداكن
function updateDarkModeText() {
    const darkModeText = currentLanguage === 'ar' 
        ? (darkMode ? 'الوضع الفاتح' : 'الوضع الداكن')
        : (darkMode ? 'Light Mode' : 'Dark Mode');
    
    const darkModeTextElement = document.getElementById('dark-mode-text');
    const darkModeBtnTextElement = document.getElementById('dark-mode-btn-text');
    
    if (darkModeTextElement) darkModeTextElement.textContent = darkModeText;
    if (darkModeBtnTextElement) darkModeBtnTextElement.textContent = darkModeText;
    
    // تحديث الأيقونة
    const icons = document.querySelectorAll('#dark-mode-toggle i, #dark-mode-toggle-sidebar i');
    icons.forEach(icon => {
        if (icon) {
            icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// تحديث اللغة والوضع الداكن عند تحميل الصفحة
updateLanguage();
updateDarkModeText();

// تحميل الشريط الجانبي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
    
    // تهيئة نافذة المحادثة
    updateChatWindow(1);
});