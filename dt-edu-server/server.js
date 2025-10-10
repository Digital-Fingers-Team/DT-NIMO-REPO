const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.jpg', '.png', '.jpeg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// In-memory storage (replace with database in production)
let files = [];
let attendanceRecords = [];
let messages = [];

// Routes

// Get statistics
app.get('/api/stats', (req, res) => {
  const prepFilesCount = files.filter(f => f.type === 'preparation').length;
  const homeworkCount = files.filter(f => f.type === 'homework').length;
  
  // Calculate attendance rate (example calculation)
  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(a => a.status === 'present').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  
  res.json({
    attendanceRate: attendanceRate,
    homeworkCount: homeworkCount,
    totalHomeworks: 12, // Example total
    progressRate: 85, // Example progress rate
    prepFilesCount: prepFilesCount
  });
});

// Upload preparation file
app.post('/api/preparations', upload.single('file'), (req, res) => {
  try {
    const { subject, date, title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }
    
    const newFile = {
      id: uuidv4(),
      type: 'preparation',
      subject,
      date,
      title,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadDate: new Date().toISOString()
    };
    
    files.push(newFile);
    
    res.status(201).json({
      message: 'تم رفع ملف التحضير بنجاح',
      file: newFile
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الملف' });
  }
});

// Upload homework
app.post('/api/homeworks', upload.single('file'), (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;
    
    const newHomework = {
      id: uuidv4(),
      type: 'homework',
      title,
      subject,
      description,
      dueDate,
      fileName: req.file ? req.file.originalname : null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      uploadDate: new Date().toISOString()
    };
    
    files.push(newHomework);
    
    res.status(201).json({
      message: 'تم رفع الواجب بنجاح',
      homework: newHomework
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الواجب' });
  }
});

// Save attendance
app.post('/api/attendance', (req, res) => {
  try {
    const attendanceData = req.body;
    
    if (!Array.isArray(attendanceData)) {
      return res.status(400).json({ error: 'بيانات الحضور غير صالحة' });
    }
    
    // Add new attendance records
    attendanceRecords.push(...attendanceData);
    
    res.status(201).json({
      message: 'تم حفظ بيانات الحضور بنجاح',
      count: attendanceData.length
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حفظ بيانات الحضور' });
  }
});

// Get files
app.get('/api/files', (req, res) => {
  const { type } = req.query;
  
  let filteredFiles = files;
  
  if (type && type !== 'all') {
    filteredFiles = files.filter(file => file.type === type);
  }
  
  // Sort by upload date (newest first)
  filteredFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  
  res.json(filteredFiles);
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  
  const fileIndex = files.findIndex(file => file.id === id && file.type === type);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'الملف غير موجود' });
  }
  
  files.splice(fileIndex, 1);
  
  res.json({ message: 'تم حذف الملف بنجاح' });
});

// Send message
app.post('/api/messages', (req, res) => {
  try {
    const { recipient, subject, content, specificRecipient } = req.body;
    
    const newMessage = {
      id: uuidv4(),
      recipient,
      subject,
      content,
      specificRecipient,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    res.status(201).json({
      message: 'تم إرسال الرسالة بنجاح',
      message: newMessage
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف كبير جداً' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});