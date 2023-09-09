const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mysql = require('mysql2');
const db = require('./database');
const port = 4000;
const app = express();

app.use(express.json());

// 파일 업로드를 위한 Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 토큰 검증을 위한 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}
app.get("/hello", (req, res) => {
  res.send("Hello world!");
});

// 로그인 라우트
app.post('/login', (req, res) => {
  const { user_id, password } = req.body;

  // MySQL에서 사용자 정보를 확인합니다.
  const query = `SELECT * FROM user WHERE user_id = ? AND password = ?`;
  db.query(query, [user_id, password], (err, results) => {
    if (err) {
      console.error('MySQL 쿼리 에러:', err);
      res.status(500).json({ message: '서버 오류!' });
    } else {
      if (results.length > 0) {
        // 토큰 생성
        const token = jwt.sign({ user_id: results[0].user_id }, 'secret_key', { expiresIn: '1h' });
        res.json({ token: token });
      } else {
        res.status(401).json({ message: '로그인 실패!' });
      }
    }
  });
});

app.post('/join', (req, res) => {
  const { user_id, password } = req.body;

  // MySQL에 사용자 정보를 저장합니다.
  const query = `INSERT INTO user (user_id, password) VALUES (?, ?)`;
  db.query(query, [user_id, password], (err, results) => {
    if (err) {
      console.error('MySQL 쿼리 에러:', err);
      res.status(500).json({ message: '서버 오류!' });
    } else {
      res.json({ message: '사용자가 생성되었습니다!' });
    }
  });
});

// 인증이 필요한 API 예시
app.post('/post', authenticateToken, upload.single('photo'), (req, res) => {
  const { post_name } = req.file;

  // 파일 정보를 데이터베이스에 저장합니다.
  const query = `INSERT INTO post (post_name) VALUES (?)`;
  db.query(query, [post_name], (err, results) => {
    if (err) {
      console.error('MySQL 쿼리 에러:', err);
      res.status(500).json({ message: '서버 오류!' });
    } else {
      res.json({ message: '사진이 등록되었습니다!' });
    }
  });
});

app.post('/place', (req, res) => {
  const { place_name } = req.body;

  // MySQL에서 place 데이터 조회
  const query = `SELECT x, y, z FROM place WHERE place_name = ?`;
  db.query(query, [place_name], (err, results) => {
    if (err) {
      console.error('MySQL 쿼리 에러:', err);
      res.status(500).json({ message: '서버 오류!' });
    } else {
      if (results.length > 0) {
        const placeData = {
          x: results[0].x,
          y: results[0].y,
          z: results[0].z
        };
        res.json(placeData);
      } else {
        res.status(404).json({ message: '장소를 찾을 수 없습니다!' });
      }
    }
  });
});
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});