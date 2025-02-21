const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { DateTime } = require("luxon");
const app = express();
const port = 8877;
// 로컬 백엔드 서버 포트
app.use(express.json());
app.use(cors());
// SQLite 데이터베이스 연결
const db = new sqlite3.Database("../poof.db", (err) => {
  if (err) {
    console.error("DB Error:", err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL,
            track TEXT NOT NULL,
            start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    db.run(`CREATE TABLE IF NOT EXISTS murmur (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            murmur TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            done BOOLEAN DEFAULT FALSE,
            todo TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
  }
});
// 할 일 추가 API
app.post("/api/murmur", (req, res) => {
  const { murmur } = req.body;
  if (!murmur) {
    return res.status(400).json({ error: "할 일을 입력하세요." });
  }
  db.run(`INSERT INTO murmur (murmur) VALUES (?)`, [murmur], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, murmur });
  });
});
// 할 일 목록 조회 API
app.get("/api/murmur", (req, res) => {
  db.all(`SELECT * FROM murmur ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(
      rows.map((row) => ({
        ...row,
        created_at: DateTime.fromSQL(row.created_at, { zone: "utc" })
          .setZone("Asia/Seoul")
          .toFormat("yyyy-MM-dd HH:mm:ss"),
      }))
    );
  });
});

//
app.delete("/api/murmur/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM murmur WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "할 일이 삭제되었습니다." });
  });
});
// 서버 실행
app.listen(port, () => {
  console.log(`✅ Poof 백엔드 서버 실행 중! http://localhost:${port}`);
});
// ------------------------------------------------------------
// 특정 날짜의 할 일 목록 조회 API
app.get("/api/todos", (req, res) => {
  // let { date } = req.query
  // if (!date) {
    // date = DateTime.now().toFormat("yyyy-MM-dd");
    // return res.status(400).json({ error: "날짜를 입력하세요." });
  // }
  const date = DateTime.now().toFormat("yyyy-MM-dd");
  db.all(
    `SELECT * FROM todos WHERE DATE(created_at) = ? ORDER BY created_at DESC`,
    [date],
    (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(
        rows.map((row) => ({
          ...row,
          created_at: DateTime.fromSQL(row.created_at, { zone: "utc" })
            .setZone("Asia/Seoul")
            .toFormat("yyyy-MM-dd HH:mm:ss"),
        }))
      );
    }
  );
});
// 특정 날짜의 할 일 추가 API
app.post("/api/todos", (req, res) => {
  const { todo } = req.body;
  if (!todo) return res.status(400).json({ error: "할 일을 입력하세요." });
  db.all(`INSERT INTO todos (todo) VALUES (?)`, [todo]);
});
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  db.all(`DELETE FROM todos WHERE id = ?`, [id]);
});
app.patch("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { todo } = req.body;
  db.all(`UPDATE todos SET todo = ? WHERE id = ?`, [todo, id]);
});
// 앱 종료 시 SQLite 연결 종료
app.on("before-quit", () => {
  db?.close((err) => {
    if (err) console.error("DB Close Error:", err);
    else console.log("✅ SQLite 연결이 안전하게 종료되었습니다.");
  });
});
