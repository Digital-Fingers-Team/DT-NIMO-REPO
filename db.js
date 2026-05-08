// Dexie Unified Database Management
(function(){
  if (!window.Dexie) {
    console.error('Dexie.js not loaded. Please include Dexie before db.js');
    return;
  }

  // --- Main School Database ---
  const db = new Dexie('SchoolDB');
  db.version(7).stores({
    users: '++id, name, email, type, class, status, registrationDate, avatar, password',
    logs: '++id, userId, action, details, timestamp',
    statistics: 'id, value',
    fees: '++id, studentName, amount, description, dueDate',
    payments: '++id, studentName, amountPaid, datePaid, parentName',
    homework: '++id, childId, title, subject, desc, teacher, assigned, due, submitted, grade, feedback',
    homeworkStats: 'childId, pending, submitted, overdue, completion',
    calendarMarks: '++id, childId, day',
    calendarUpcoming: '++id, childId, type, title, time, desc',
    attendanceStats: 'childId, rate, presentDays, absentDays, lateDays',
    attendanceRecords: '++id, childId, date, checkIn, checkOut, status, dayAr, dayEn, noteAr, noteEn',
    gradesGpa: 'childName, gpa',
    gradesSubjects: '++id, childName, key, total, exam, homework, participation',
    reportSummary: 'childName, overall, rank, attendance, behavior',
    reportSubjects: '++id, childName, key, exam, mid, final, total',
    reportSkills: 'childName, math, language, critical, teamwork, creativity',
    reportAchievements: '++id, childName, icon, titleAr, titleEn, descAr, descEn',
    onlineClasses: '++id, title, subject, date, startTime, endTime, teacherName, status',
    'admin-schedule': 'classId, updatedAt',
    classroomMessages: '++id, classId, sender, text, time, timestamp',
    notifications: '++id, title, message, type, timestamp, status'
  }).upgrade(async (tx) => {
    try {
      const statsTable = tx.table('statistics');
      const count = await statsTable.count();
      if (count === 0) {
        await statsTable.bulkAdd([
          { id: 'students', value: 0 }, { id: 'teachers', value: 0 },
          { id: 'parents', value: 0 }, { id: 'admins', value: 0 },
          { id: 'totalUsers', value: 0 }, { id: 'pendingPreps', value: 0 }
        ]);
      }
    } catch (e) { console.error('Stats upgrade error:', e); }
  });
  window.db = db;

  // --- Messaging Database ---
  const messagingDB = new Dexie('messagingDB');
  messagingDB.version(1).stores({
    messages: "++id,sender,receiver,timestamp,status"
  });
  window.messagingDB = messagingDB;

  // --- Course Videos Database ---
  const courseVideosDB = new Dexie('courseVideosDB');
  courseVideosDB.version(1).stores({
    videos: "++id, title, subject, description, filename, fileBlob, createdAt, teacherName"
  });
  window.courseVideosDB = courseVideosDB;

  // --- Payments Database ---
  const paymentsDB = new Dexie('PaymentsDB');
  paymentsDB.version(2).stores({
    payments: '++id, parentName, studentName, amount, status, date, invoiceId, description, paymentMethod, timestamp'
  });
  window.paymentsDB = paymentsDB;

})();
