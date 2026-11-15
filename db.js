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

  // --- Uploads Database (lesson preps / homework / exams) ---
  // Finds the intended recipient on the same device and keeps the actual file
  // as a Blob. IndexedDB (Dexie) is used instead of localStorage because a
  // localStorage quota (~5MB) cannot reliably hold real file contents.
  const uploadsDB = new Dexie('uploadsDB');
  uploadsDB.version(1).stores({
    files: '++id, type, subject, class, teacherName, teacherId, recipient, status, uploadDate'
  });
  window.uploadsDB = uploadsDB;

  // --- Shared upload helpers ---
  // Saves the real file as a Blob in IndexedDB so it actually reaches the
  // recipient instead of failing when localStorage runs out of quota.
  window.saveUploadFile = function (record, blob) {
    const data = Object.assign({}, record, { fileBlob: blob || null });
    delete data.id;
    return window.uploadsDB.files.add(data);
  };
  // Reads uploads back (optionally filtered by type) for the recipient page.
  window.getUploadFiles = function (type) {
    const table = window.uploadsDB.files;
    return type ? table.where('type').equals(type).toArray() : table.toArray();
  };
  // Deletes a single stored upload by its primary key.
  window.deleteUploadFile = function (id) {
    return window.uploadsDB.files.delete(id);
  };

  // --- Payments Database ---
  const paymentsDB = new Dexie('PaymentsDB');
  paymentsDB.version(2).stores({
    payments: '++id, parentName, studentName, amount, status, date, invoiceId, description, paymentMethod, timestamp'
  });
  window.paymentsDB = paymentsDB;

  // --- Shared user identity key (used by messaging so sender/receiver match) ---
  // SchoolDB stores every user's email as <username>@dtedu.com, so we derive the
  // same key from the logged-in user regardless of how they signed in.
  window.getUserKey = function (user) {
    if (!user) return "";
    if (user.email) return user.email;
    if (user.username) {
      return user.username.indexOf("@") !== -1
        ? user.username
        : user.username + "@dtedu.com";
    }
    return user.name || "";
  };

})();
