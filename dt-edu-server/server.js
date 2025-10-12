// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp(); // يستخدم إعدادات Firebase الافتراضية
const bucket = admin.storage().bucket(); // الافتراضي للمشروع

const app = express();
app.use(cors());
app.use(express.json());

// multer في الذاكرة لتحميل الملفات ثم رفعها للـ Cloud Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// in-memory storage (استبدال لاحقًا بقاعدة بيانات حقيقية)
let files = [];
let attendanceRecords = [];
let messages = [];

// Helpers
function allowedExt(filename) {
  const allowed = ['.pdf', '.docx', '.jpg', '.png', '.jpeg'];
  return allowed.includes(path.extname(filename).toLowerCase());
}

async function uploadBufferToBucket(buffer, originalName, mimetype) {
  const filename = `${uuidv4()}-${originalName}`;
  const file = bucket.file(filename);
  await file.save(buffer, { metadata: { contentType: mimetype } });
  try {
    await file.makePublic(); // يجعل الملف قابلاً للوصول عبر رابط عام
  } catch (e) {
    // تجاهل إذا لم تسمح الإعدادات بالـ makePublic
  }
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

// Routes (نفس منطق السيرفر اللي أرسلته مع تعديل الرفع للـ Storage)

// Get statistics
app.get('/api/stats', (req, res) => {
  const prepFilesCount = files.filter(f => f.type === 'preparation').length;
  const homeworkCount = files.filter(f => f.type === 'homework').length;
  const totalRecords = attendanceRecords.length;
  const presentRecords = totalRecords ? attendanceRecords.filter(a => a.status === 'present').length : 0;
  const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  res.json({
    attendanceRate,
    homeworkCount,
    totalHomeworks: 12,
    progressRate: 85,
    prepFilesCount
  });
});

// Upload preparation file
app.post('/api/preparations', upload.single('file'), async (req, res) => {
  try {
    const { subject, date, title } = req.body;
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي ملف' });

    if (!allowedExt(req.file.originalname)) {
      return res.status(400).json({ error: 'نوع الملف غير مدعوم' });
    }

    const fileUrl = await uploadBufferToBucket(req.file.buffer, req.file.originalname, req.file.mimetype);

    const newFile = {
      id: uuidv4(),
      type: 'preparation',
      subject,
      date,
      title,
      fileName: req.file.originalname,
      fileUrl,
      uploadDate: new Date().toISOString()
    };
    files.push(newFile);
    res.status(201).json({ message: 'تم رفع ملف التحضير بنجاح', file: newFile });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الملف' });
  }
});

// Upload homework
app.post('/api/homeworks', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;
    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      if (!allowedExt(req.file.originalname)) {
        return res.status(400).json({ error: 'نوع الملف غير مدعوم' });
      }
      fileUrl = await uploadBufferToBucket(req.file.buffer, req.file.originalname, req.file.mimetype);
      fileName = req.file.originalname;
    }

    const newHomework = {
      id: uuidv4(),
      type: 'homework',
      title,
      subject,
      description,
      dueDate,
      fileName,
      fileUrl,
      uploadDate: new Date().toISOString()
    };

    files.push(newHomework);
    res.status(201).json({ message: 'تم رفع الواجب بنجاح', homework: newHomework });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الواجب' });
  }
});

// Save attendance
app.post('/api/attendance', (req, res) => {
  try {
    const attendanceData = req.body;
    if (!Array.isArray(attendanceData)) return res.status(400).json({ error: 'بيانات الحضور غير صالحة' });
    attendanceRecords.push(...attendanceData);
    res.status(201).json({ message: 'تم حفظ بيانات الحضور بنجاح', count: attendanceData.length });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حفظ بيانات الحضور' });
  }
});

// Get files
app.get('/api/files', (req, res) => {
  const { type } = req.query;
  let filteredFiles = files;
  if (type && type !== 'all') filteredFiles = files.filter(file => file.type === type);
  filteredFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  res.json(filteredFiles);
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  const idx = files.findIndex(file => file.id === id && file.type === type);
  if (idx === -1) return res.status(404).json({ error: 'الملف غير موجود' });

  // محاولة حذف من الـ bucket إن وجد fileUrl
  const file = files[idx];
  if (file.fileUrl) {
    try {
      const filename = file.fileUrl.split('/').pop();
      await bucket.file(filename).delete().catch(()=>{});
    } catch(e) { /* ignore */ }
  }

  files.splice(idx, 1);
  res.json({ message: 'تم حذف الملف بنجاح' });
});

// Send message
app.post('/api/messages', (req, res) => {
  try {
    const { recipient, subject, content, specificRecipient } = req.body;
    const newMessage = { id: uuidv4(), recipient, subject, content, specificRecipient, timestamp: new Date().toISOString() };
    messages.push(newMessage);
    res.status(201).json({ message: 'تم إرسال الرسالة بنجاح', message: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error && error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'حجم الملف كبير جداً' });
  res.status(500).json({ error: error.message || 'Internal Server Error' });
});

// Export as Cloud Function
exports.api = functions.https.onRequest(app);
