const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Kết nối MySQL qua mysql2/promise
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // Load .env file
const app = express();

// CORS để cho phép frontend truy cập
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true for HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + path.basename(file.originalname, ext) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File type is not supported'), false);
    }
    cb(null, true);
  }
});

// Hàm kiểm tra trùng lặp file
async function isDuplicateFile(filePath, connection) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  const [rows] = await connection.execute(
    'SELECT 1 FROM documents WHERE filehash = ? LIMIT 1',
    [fileHash]
  );

  return rows.length > 0;
}

// Gemini API endpoint
app.post('/gemini', async (req, res) => {
  const { prompt } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error in /gemini:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: error.response?.data?.error?.message || 'Gemini API error' });
  }
});

// lưu đoạn tin nhắn
app.post('/chat/:documentId', async (req, res) => {
  const { documentId } = req.params;
  const { userId, role, content } = req.body;
  const user = req.session.user;

  if (!user || user.id !== parseInt(userId)) {
    return res.status(401).json({ error: 'Unauthorized or invalid session' });
  }

  if (!['user', 'assistant'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [docRows] = await db.execute('SELECT 1 FROM documents WHERE id = ?', [documentId]);
    if (docRows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const [chatRows] = await db.execute(
      'SELECT messages FROM chats WHERE document_id = ? AND user_id = ?',
      [documentId, userId]
    );

    // Initialize messages as an array
    let messages = [];
    if (chatRows.length > 0 && chatRows[0].messages) {
      try {
        // Parse JSON string to array
        messages = JSON.parse(chatRows[0].messages);
        // Ensure messages is an array
        if (!Array.isArray(messages)) {
          console.warn(`Messages is not an array for document_id=${documentId}, user_id=${userId}:`, messages);
          messages = [];
        }
      } catch (parseError) {
        console.error(`Failed to parse messages JSON for document_id=${documentId}, user_id=${userId}:`, parseError);
        messages = [];
      }
    }

    // Append new message
    messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    if (chatRows.length > 0) {
      await db.execute(
        'UPDATE chats SET messages = ?, updated_at = NOW() WHERE document_id = ? AND user_id = ?',
        [JSON.stringify(messages), documentId, userId]
      );
    } else {
      await db.execute(
        'INSERT INTO chats (document_id, user_id, messages) VALUES (?, ?, ?)',
        [documentId, userId, JSON.stringify(messages)]
      );
    }

    res.json({ message: 'Message saved' });
  } catch (error) {
    console.error('Error in /chat/:documentId:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to save message' });
  }
});
// Get chat history
app.get('/chat/:documentId/:userId', async (req, res) => {
  const { documentId, userId } = req.params;
  const user = req.session.user;

  if (!user || user.id !== parseInt(userId)) {
    return res.status(401).json({ error: 'Unauthorized or invalid session' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT messages FROM chats WHERE document_id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (rows.length === 0) {
      return res.json({ messages: [] });
    }

    res.json({ messages: rows[0].messages });
  } catch (error) {
    console.error('Error in /chat/:documentId/:userId:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// lấy tất cả đoạn chat từ user
app.get('/chats/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = req.session.user;

  if (!user || user.id !== parseInt(userId)) {
    return res.status(401).json({ error: 'Unauthorized or invalid session' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT c.document_id, d.title 
       FROM chats c 
       JOIN documents d ON c.document_id = d.id 
       WHERE c.user_id = ?`,
      [userId]
    );

    res.json({ chats: rows });
  } catch (error) {
    console.error('Error in /chats/:userId:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});
// Route: Đăng ký
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email hoặc tên đăng nhập đã tồn tại!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

    return res.status(200).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Error in /register:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// Route: Đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập không tồn tại!' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Mật khẩu không đúng!' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    return res.status(200).json({ message: 'Đăng nhập thành công!', user: req.session.user });
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// Route: Kiểm tra phiên đăng nhập
app.get('/session', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    return res.status(401).json({ loggedIn: false });
  }
});

// Route: Đăng xuất
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error in /logout:', err);
      return res.status(500).json({ error: 'Lỗi khi đăng xuất' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Đăng xuất thành công!' });
  });
});

// Route: Tải lên nhiều tài liệu
function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

app.post('/upload-multiple', upload.array('files'), async (req, res) => {
  const { title, description, visibility, category } = req.body;
  const files = req.files;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }
  if (!files || !files.length || !title) {
    return res.status(400).json({ error: 'Thiếu thông tin file hoặc tiêu đề' });
  }
  if (!['public', 'private'].includes(visibility)) {
    return res.status(400).json({ error: 'Chế độ truy cập không hợp lệ. Phải là "public" hoặc "private"' });
  }

  try {
    const connection = await db.getConnection();
    const documents = [];

    try {
      for (const file of files) {
        const filePath = path.join(__dirname, 'Uploads', file.filename);
        const isDuplicate = await isDuplicateFile(filePath, connection);
        if (isDuplicate) {
          fs.unlinkSync(filePath);
          throw new Error('Tài liệu đã tồn tại trên hệ thống');
        }

        const fileHash = await generateFileHash(filePath);

        const [result] = await connection.execute(
          `INSERT INTO documents (user_id, title, description, filename, visibility, upload_date, category, filehash, view_count, download_count)
           VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 0, 0)`,
          [user.id, title, description || null, file.filename, visibility, category || 'Khác', fileHash]
        );

        const [rows] = await connection.execute('SELECT * FROM documents WHERE id = ?', [result.insertId]);
        const insertedDoc = rows[0];

        documents.push({
          id: insertedDoc.id,
          userId: insertedDoc.user_id,
          title: insertedDoc.title,
          description: insertedDoc.description || '',
          filename: insertedDoc.filename,
          visibility: insertedDoc.visibility,
          uploadDate: insertedDoc.upload_date ? new Date(insertedDoc.upload_date).toISOString() : null,
          category: insertedDoc.category || 'Khác',
          favorite: 0,
          fileHash: insertedDoc.filehash,
          viewCount: insertedDoc.view_count || 0,
          downloadCount: insertedDoc.download_count || 0
        });
      }

      res.status(201).json({ message: 'Upload thành công', documents });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error in /upload-multiple:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: err.message || 'Lỗi máy chủ khi upload tài liệu' });
  }
});

// Route: Lấy danh sách tài liệu (có phân trang)
app.get('/documents', async (req, res) => {
  const user = req.session.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         d.id,
         d.user_id,
         d.title,
         d.description,
         d.filename,
         d.visibility,
         d.upload_date,
         d.category,
         d.view_count,
         d.download_count,
         IF(uf.user_id IS NOT NULL, 1, 0) AS favorite
       FROM documents d
       LEFT JOIN user_favorites uf ON d.id = uf.document_id AND uf.user_id = ?
       WHERE d.user_id = ?
       LIMIT ? OFFSET ?`,
      [user.id, user.id, limit, offset]
    );

    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS total FROM documents WHERE user_id = ?',
      [user.id]
    );

    const formattedRows = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || '',
      filename: row.filename,
      visibility: row.visibility,
      uploadDate: row.upload_date ? new Date(row.upload_date).toISOString() : null,
      category: row.category || 'Khác',
      favorite: row.favorite,
      viewCount: row.view_count || 0,
      downloadCount: row.download_count || 0
    }));

    res.json({
      documents: formattedRows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    });
  } catch (err) {
    console.error('Error fetching documents:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Không thể lấy danh sách tài liệu' });
  }
});

// Route: Lấy thông tin tài liệu (chỉ cho chủ sở hữu)
app.get('/document/:id', async (req, res) => {
  const documentId = req.params.id;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         d.id,
         d.user_id,
         d.title,
         d.description,
         d.filename,
         d.visibility,
         d.upload_date,
         d.category,
         d.view_count,
         d.download_count,
         IF(uf.user_id IS NOT NULL, 1, 0) AS favorite
       FROM documents d
       LEFT JOIN user_favorites uf ON d.id = uf.document_id AND uf.user_id = ?
       WHERE d.id = ? AND d.user_id = ?`,
      [user.id, documentId, user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại hoặc bạn không có quyền' });
    }

    const document = {
      id: rows[0].id,
      userId: rows[0].user_id,
      title: rows[0].title,
      description: rows[0].description || '',
      filename: rows[0].filename,
      visibility: rows[0].visibility,
      uploadDate: rows[0].upload_date ? new Date(rows[0].upload_date).toISOString() : null,
      category: rows[0].category || 'Khác',
      favorite: rows[0].favorite,
      viewCount: rows[0].view_count || 0,
      downloadCount: rows[0].download_count || 0
    };

    res.json({ document });
  } catch (err) {
    console.error('Error in /document/:id:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy thông tin tài liệu' });
  }
});

// Route: Tăng lượt xem
app.post('/documents/:id/view', async (req, res) => {
  const documentId = req.params.id;

  try {
    const [result] = await db.execute(
      `UPDATE documents SET view_count = view_count + 1 WHERE id = ?`,
      [documentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại' });
    }

    const [rows] = await db.execute(
      `SELECT view_count FROM documents WHERE id = ?`,
      [documentId]
    );

    res.status(200).json({ message: 'Đã tăng lượt xem', viewCount: rows[0].view_count });
  } catch (err) {
    console.error('Error in /documents/:id/view:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi tăng lượt xem' });
  }
});

// Route: Tải xuống tài liệu
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const [rows] = await db.execute(
      `SELECT id FROM documents WHERE filename = ?`,
      [filename]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại' });
    }

    const documentId = rows[0].id;

    // Tăng download_count
    await db.execute(
      `UPDATE documents SET download_count = download_count + 1 WHERE id = ?`,
      [documentId]
    );

    const filePath = path.join(__dirname, 'Uploads', filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download Error:', err);
          res.status(500).json({ error: 'Lỗi khi tải xuống' });
        }
      });
    } else {
      res.status(404).json({ error: 'File không tồn tại' });
    }
  } catch (err) {
    console.error('Error in /download/:filename:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi tải tài liệu' });
  }
});

// Route: Xóa tài liệu
app.delete('/documents/:id', async (req, res) => {
  const documentId = req.params.id;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM documents WHERE id = ? AND user_id = ?', [documentId, user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại hoặc bạn không có quyền xóa' });
    }

    const document = rows[0];
    const filePath = path.join(__dirname, 'Uploads', document.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.execute('DELETE FROM documents WHERE id = ?', [documentId]);

    res.status(200).json({ message: 'Tài liệu đã được xóa' });
  } catch (err) {
    console.error('Error in /documents/:id DELETE:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa tài liệu' });
  }
});

// Route: Cập nhật quyền riêng tư
app.put('/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  if (!['public', 'private'].includes(visibility)) {
    return res.status(400).json({ error: 'Chế độ truy cập không hợp lệ. Phải là "public" hoặc "private"' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại hoặc bạn không có quyền' });
    }

    await db.execute('UPDATE documents SET visibility = ? WHERE id = ?', [visibility, id]);
    res.status(200).json({ message: 'Cập nhật quyền truy cập thành công' });
  } catch (err) {
    console.error('Error in /documents/:id PUT:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật quyền truy cập' });
  }
});

// Route: Cập nhật trạng thái yêu thích
app.put('/documents/:id/favorite', async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  if (favorite !== 0 && favorite !== 1) {
    return res.status(400).json({ error: 'Giá trị yêu thích không hợp lệ. Phải là 0 hoặc 1' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tài liệu không tồn tại' });
    }

    if (favorite === 1) {
      await db.execute(
        'INSERT IGNORE INTO user_favorites (user_id, document_id) VALUES (?, ?)',
        [user.id, id]
      );
    } else {
      await db.execute(
        'DELETE FROM user_favorites WHERE user_id = ? AND document_id = ?',
        [user.id, id]
      );
    }

    res.status(200).json({ message: 'Cập nhật yêu thích thành công' });
  } catch (err) {
    console.error('Error in /documents/:id/favorite:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật yêu thích' });
  }
});

// Route: Lấy danh sách tài liệu yêu thích
app.get('/documents/favorites', async (req, res) => {
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên không hợp lệ' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT 
        d.id,
        d.user_id,
        d.title,
        d.description,
        d.filename,
        d.visibility,
        d.upload_date,
        d.category,
        d.view_count,
        d.download_count
      FROM documents d
      JOIN user_favorites uf ON d.id = uf.document_id
      WHERE uf.user_id = ?`,
      [user.id]
    );

    const formattedRows = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || '',
      filename: row.filename,
      visibility: row.visibility,
      uploadDate: row.upload_date ? new Date(row.upload_date).toISOString() : null,
      category: row.category || 'Khác',
      viewCount: row.view_count || 0,
      downloadCount: row.download_count || 0
    }));

    res.status(200).json({ documents: formattedRows });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài liệu yêu thích:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy tài liệu yêu thích' });
  }
});

// Route: Lấy danh sách tài liệu công khai
app.get("/public-documents", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        d.id AS document_id,
        d.title AS document_title,
        d.description AS document_description,
        d.filename AS document_filename,
        d.visibility AS document_visibility,
        d.upload_date AS document_upload_date,
        d.category AS document_category,
        d.view_count,
        d.download_count,
        u.username AS user_name,
        u.email AS user_email
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.visibility = 'public'
    `);

    const formattedRows = rows.map(row => ({
      documentId: row.document_id,
      documentTitle: row.document_title,
      documentDescription: row.document_description || '',
      documentFilename: row.document_filename,
      documentVisibility: row.document_visibility,
      documentUploadDate: row.document_upload_date ? new Date(row.document_upload_date).toISOString() : null,
      documentCategory: row.document_category || 'Khác',
      viewCount: row.view_count || 0,
      downloadCount: row.download_count || 0,
      userName: row.user_name,
      userEmail: row.user_email
    }));

    res.status(200).json({ documents: formattedRows });
  } catch (err) {
    console.error("Lỗi khi lấy tài liệu công khai:", {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: "Lỗi máy chủ khi lấy tài liệu công khai" });
  }
});

// Route: Lấy chi tiết tài liệu
app.get("/document-detail/:id", async (req, res) => {
  const documentId = req.params.id;
  const user = req.session.user;

  try {
    const [rows] = await db.execute(`
      SELECT 
        d.id AS document_id,
        d.title AS document_title,
        d.description AS document_description,
        d.filename AS document_filename,
        d.upload_date AS document_upload_date,
        d.category AS document_category,
        d.view_count,
        d.download_count,
        u.username AS user_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?`,
      [documentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tài liệu không tồn tại" });
    }

    const document = rows[0];
    let isFavorite = false;

    if (user && user.id) {
      const [favoriteRows] = await db.execute(
        'SELECT * FROM user_favorites WHERE user_id = ? AND document_id = ?',
        [user.id, documentId]
      );
      isFavorite = favoriteRows.length > 0;
    }

    res.status(200).json({
      document: {
        documentId: document.document_id,
        documentTitle: document.document_title,
        documentDescription: document.document_description || '',
        documentFilename: document.document_filename,
        documentUploadDate: document.document_upload_date ? new Date(document.document_upload_date).toISOString() : null,
        documentCategory: document.document_category || 'Khác',
        viewCount: document.view_count || 0,
        downloadCount: document.download_count || 0,
        userName: document.user_name,
        favorite: isFavorite
      }
    });
  } catch (err) {
    console.error("Error fetching document details:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết tài liệu" });
  }
});

// Xử lý lỗi cho multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err.message === 'File type is not supported') {
    return res.status(400).json({ error: 'Loại file không được hỗ trợ' });
  }
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Lỗi máy chủ không xác định' });
});

// Chạy server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
