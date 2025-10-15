// Dashboard Management System
class Dashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        this.stats = {
            totalStudents: 0,
            totalCourses: 0,
            completedAssignments: 0,
            averageGrade: 0
        };
        this.chart = null;
        
        this.init();
    }
    
    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.initializeChart();
        this.loadRecentActivities();
        this.loadRecentMessages();
        this.loadTodaySchedule();
        this.loadUpcomingAssignments();
    }
    
    // Load dashboard data
    async loadDashboardData() {
        try {
            // In a real app, this would fetch from Firebase
            await this.loadStats();
            this.updateStatsDisplay();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            window.dtEduApp?.showNotification('فشل في تحميل بيانات لوحة التحكم', 'error');
        }
    }
    
    // Load statistics
    async loadStats() {
        // Sample data based on user type
        if (this.currentUser.type === 'teacher') {
            this.stats = {
                totalStudents: 156,
                totalCourses: 8,
                completedAssignments: 45,
                averageGrade: 87
            };
        } else if (this.currentUser.type === 'student') {
            this.stats = {
                totalStudents: 0, // Not applicable for students
                totalCourses: 6,
                completedAssignments: 23,
                averageGrade: 92
            };
        } else if (this.currentUser.type === 'admin') {
            this.stats = {
                totalStudents: 1250,
                totalCourses: 45,
                completedAssignments: 892,
                averageGrade: 85
            };
        } else if (this.currentUser.type === 'parent') {
            this.stats = {
                totalStudents: 2, // Children
                totalCourses: 12,
                completedAssignments: 18,
                averageGrade: 89
            };
        }
    }
    
    // Update stats display
    updateStatsDisplay() {
        const elements = {
            totalStudents: document.getElementById('total-students'),
            totalCourses: document.getElementById('total-courses'),
            completedAssignments: document.getElementById('completed-assignments'),
            averageGrade: document.getElementById('average-grade')
        };
        
        // Animate numbers
        Object.keys(this.stats).forEach(key => {
            const element = elements[key];
            if (element) {
                const value = this.stats[key];
                const suffix = key === 'averageGrade' ? '%' : '';
                this.animateNumber(element, 0, value, suffix);
            }
        });
        
        // Update labels based on user type
        this.updateStatsLabels();
    }
    
    // Update stats labels based on user type
    updateStatsLabels() {
        const labels = {
            'teacher': {
                totalStudents: 'طلابي',
                totalCourses: 'موادي الدراسية',
                completedAssignments: 'الواجبات المصححة',
                averageGrade: 'متوسط درجات الطلاب'
            },
            'student': {
                totalStudents: 'زملاء الصف',
                totalCourses: 'موادي الدراسية',
                completedAssignments: 'الواجبات المكتملة',
                averageGrade: 'متوسط درجاتي'
            },
            'admin': {
                totalStudents: 'إجمالي الطلاب',
                totalCourses: 'إجمالي المواد',
                completedAssignments: 'الواجبات المكتملة',
                averageGrade: 'متوسط المدرسة'
            },
            'parent': {
                totalStudents: 'أطفالي',
                totalCourses: 'موادهم الدراسية',
                completedAssignments: 'واجباتهم المكتملة',
                averageGrade: 'متوسط درجاتهم'
            }
        };
        
        const userLabels = labels[this.currentUser.type] || labels['student'];
        
        Object.keys(userLabels).forEach(key => {
            const labelElement = document.querySelector(`#${key.replace(/([A-Z])/g, '-$1').toLowerCase()} + .stat-label`);
            if (labelElement) {
                labelElement.textContent = userLabels[key];
            }
        });
    }
    
    // Animate number counting
    animateNumber(element, start, end, suffix = '') {
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOut);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Chart period selector
        const chartPeriod = document.getElementById('chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateChart(e.target.value);
            });
        }
        
        // Refresh data button (if exists)
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }
    }
    
    // Initialize chart
    initializeChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
                datasets: [{
                    label: 'الأداء الأكاديمي',
                    data: [75, 82, 88, 92],
                    borderColor: '#4a6cf7',
                    backgroundColor: 'rgba(74, 108, 247, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'معدل الحضور',
                    data: [90, 88, 95, 93],
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Tajawal, sans-serif'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            font: {
                                family: 'Tajawal, sans-serif'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Tajawal, sans-serif'
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update chart data
    updateChart(period) {
        if (!this.chart) return;
        
        const data = {
            'week': {
                labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                performance: [85, 78, 92, 88, 95, 82, 90],
                attendance: [95, 90, 98, 92, 96, 88, 94]
            },
            'month': {
                labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
                performance: [75, 82, 88, 92],
                attendance: [90, 88, 95, 93]
            },
            'semester': {
                labels: ['الشهر 1', 'الشهر 2', 'الشهر 3', 'الشهر 4'],
                performance: [70, 78, 85, 90],
                attendance: [88, 90, 92, 94]
            }
        };
        
        const periodData = data[period] || data['month'];
        
        this.chart.data.labels = periodData.labels;
        this.chart.data.datasets[0].data = periodData.performance;
        this.chart.data.datasets[1].data = periodData.attendance;
        this.chart.update();
    }
    
    // Load recent activities
    loadRecentActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) return;
        
        const activities = this.getSampleActivities();
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Get sample activities
    getSampleActivities() {
        const baseActivities = [
            {
                title: 'تم رفع واجب جديد في مادة الرياضيات',
                time: 'منذ 5 دقائق',
                icon: 'fas fa-file-upload',
                color: '#4a6cf7'
            },
            {
                title: 'تم تصحيح اختبار العلوم',
                time: 'منذ 30 دقيقة',
                icon: 'fas fa-check-circle',
                color: '#00b894'
            },
            {
                title: 'رسالة جديدة من أ. أحمد محمد',
                time: 'منذ ساعة',
                icon: 'fas fa-envelope',
                color: '#6c5ce7'
            },
            {
                title: 'تم تحديث الجدول الدراسي',
                time: 'منذ ساعتين',
                icon: 'fas fa-calendar-alt',
                color: '#fdcb6e'
            }
        ];
        
        // Customize based on user type
        if (this.currentUser.type === 'student') {
            return [
                {
                    title: 'واجب جديد في مادة الرياضيات',
                    time: 'منذ 10 دقائق',
                    icon: 'fas fa-tasks',
                    color: '#4a6cf7'
                },
                {
                    title: 'نتيجة اختبار العلوم متاحة',
                    time: 'منذ ساعة',
                    icon: 'fas fa-chart-bar',
                    color: '#00b894'
                },
                ...baseActivities.slice(2)
            ];
        }
        
        return baseActivities;
    }
    
    // Load recent messages
    loadRecentMessages() {
        const container = document.getElementById('recent-messages');
        if (!container) return;
        
        const messages = [
            {
                sender: 'أ. أحمد محمد',
                avatar: 'أ.أ',
                preview: 'هل انتهيت من حل تمارين الواجب؟',
                time: '10:30 ص'
            },
            {
                sender: 'أ. فاطمة علي',
                avatar: 'أ.ف',
                preview: 'نتيجة اختبار العلوم جاهزة',
                time: 'أمس'
            },
            {
                sender: 'مدير المدرسة',
                avatar: 'م.ح',
                preview: 'اجتماع أولياء الأمور يوم الخميس',
                time: '15 مايو'
            }
        ];
        
        container.innerHTML = messages.map(message => `
            <div class="message-item" onclick="window.location.href='messages.html'">
                <div class="message-avatar">${message.avatar}</div>
                <div class="message-content">
                    <div class="message-sender">${message.sender}</div>
                    <div class="message-preview">${message.preview}</div>
                </div>
                <div class="message-time">${message.time}</div>
            </div>
        `).join('');
    }
    
    // Load today's schedule
    loadTodaySchedule() {
        const container = document.getElementById('today-schedule');
        if (!container) return;
        
        const schedule = [
            {
                time: '08:00',
                subject: 'الرياضيات',
                room: 'قاعة 101'
            },
            {
                time: '09:30',
                subject: 'العلوم',
                room: 'مختبر العلوم'
            },
            {
                time: '11:00',
                subject: 'اللغة العربية',
                room: 'قاعة 205'
            },
            {
                time: '12:30',
                subject: 'التاريخ',
                room: 'قاعة 103'
            }
        ];
        
        container.innerHTML = schedule.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-subject">${item.subject}</div>
                <div class="schedule-room">${item.room}</div>
            </div>
        `).join('');
    }
    
    // Load upcoming assignments
    loadUpcomingAssignments() {
        const container = document.getElementById('upcoming-assignments');
        if (!container) return;
        
        const assignments = [
            {
                title: 'واجب الرياضيات - الفصل الثالث',
                due: 'يستحق غداً',
                status: 'pending'
            },
            {
                title: 'تقرير العلوم - النباتات',
                due: 'يستحق في 3 أيام',
                status: 'pending'
            },
            {
                title: 'مشروع اللغة العربية',
                due: 'يستحق الأسبوع القادم',
                status: 'completed'
            },
            {
                title: 'اختبار التاريخ',
                due: 'متأخر بيوم واحد',
                status: 'overdue'
            }
        ];
        
        container.innerHTML = assignments.map(assignment => `
            <div class="assignment-item">
                <div class="assignment-status ${assignment.status}"></div>
                <div class="assignment-content">
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-due">${assignment.due}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Refresh dashboard
    refresh() {
        this.loadDashboardData();
        this.loadRecentActivities();
        this.loadRecentMessages();
        this.loadTodaySchedule();
        this.loadUpcomingAssignments();
        
        window.dtEduApp?.showNotification('تم تحديث لوحة التحكم', 'success');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        window.dashboard.refresh();
    }, 300000);
});