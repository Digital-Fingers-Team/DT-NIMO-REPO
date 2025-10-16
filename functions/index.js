const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure default region; you can change to your preferred region
setGlobalOptions({ region: 'us-central1' });
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function allowedExt(filename) {
  const allowed = ['.pdf', '.docx', '.jpg', '.png', '.jpeg'];
  return allowed.includes(path.extname(filename).toLowerCase());
}

async function uploadBufferToBucket(buffer, originalName, mimetype) {
  const filename = `${uuidv4()}-${originalName.replace(/\s+/g,'_')}`;
  const file = bucket.file(filename);
  await file.save(buffer, { metadata: { contentType: mimetype } });
  try { await file.makePublic(); } catch (e) { /* ignore */ }
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

// health
app.get('/api/status', (req, res) => res.json({ ok: true, now: Date.now() }));

// get stats (simple)
app.get('/api/stats', async (req, res) => {
  try {
    const filesSnap = await db.collection('files').get();
    const messagesSnap = await db.collection('messages').get();
    const attendanceSnap = await db.collection('attendance').get();
    const files = filesSnap.size;
    const messages = messagesSnap.size;
    const attendance = attendanceSnap.size;
    res.json({ files, messages, attendance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// upload preparation
app.post('/api/preparations', upload.single('file'), async (req, res) => {
  try {
    const { subject, date, title } = req.body;
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    if (!allowedExt(req.file.originalname)) return res.status(400).json({ error: 'نوع الملف غير مدعوم' });

    const fileUrl = await uploadBufferToBucket(req.file.buffer, req.file.originalname, req.file.mimetype);
    const doc = {
      type: 'preparation',
      subject: subject || null,
      date: date || null,
      title: title || null,
      fileName: req.file.originalname,
      fileUrl,
      uploadDate: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('files').add(doc);
    res.status(201).json({ id: ref.id, file: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// upload homework
app.post('/api/homeworks', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;
    let fileUrl = null, fileName = null;
    if (req.file) {
      if (!allowedExt(req.file.originalname)) return res.status(400).json({ error: 'نوع الملف غير مدعوم' });
      fileUrl = await uploadBufferToBucket(req.file.buffer, req.file.originalname, req.file.mimetype);
      fileName = req.file.originalname;
    }
    const doc = {
      type: 'homework',
      title: title || null,
      subject: subject || null,
      description: description || null,
      dueDate: dueDate || null,
      fileName,
      fileUrl,
      uploadDate: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('files').add(doc);
    res.status(201).json({ id: ref.id, homework: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// save attendance (expects array)
app.post('/api/attendance', async (req, res) => {
  try {
    const attendanceData = req.body;
    if (!Array.isArray(attendanceData)) return res.status(400).json({ error: 'بيانات الحضور غير صالحة' });
    const batch = db.batch();
    attendanceData.forEach(item => {
      const ref = db.collection('attendance').doc();
      batch.set(ref, { ...item, ts: admin.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    res.status(201).json({ message: 'تم حفظ بيانات الحضور بنجاح', count: attendanceData.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// list files
app.get('/api/files', async (req, res) => {
  try {
    const type = req.query.type;
    let q = db.collection('files').orderBy('uploadDate', 'desc');
    if (type && type !== 'all') q = q.where('type', '==', type);
    const snap = await q.limit(200).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// delete file by id
app.delete('/api/files/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('files').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'الملف غير موجود' });
    const fileData = doc.data();
    if (fileData.fileUrl) {
      const filename = fileData.fileUrl.split('/').pop();
      await bucket.file(filename).delete().catch(()=>{});
    }
    await docRef.delete();
    res.json({ message: 'تم حذف الملف بنجاح' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// send message
app.post('/api/messages', async (req, res) => {
  try {
    const { recipient, subject, content, specificRecipient } = req.body;
    const doc = { recipient: recipient || null, subject: subject || null, content: content || null, specificRecipient: !!specificRecipient, ts: admin.firestore.FieldValue.serverTimestamp() };
    const ref = await db.collection('messages').add(doc);
    res.status(201).json({ id: ref.id, message: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// error handler
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'حجم الملف كبير جداً' });
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Gen2 HTTPS function
exports.api = onRequest(app);
