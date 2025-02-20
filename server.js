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
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
  }
});
// 할 일 추가 API
app.post("/tasks", (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "할 일을 입력하세요." });
  }
  db.run(`INSERT INTO tasks (task) VALUES (?)`, [task], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, task });
  });
});
// 할 일 목록 조회 API
app.get("/tasks", (req, res) => {
  db.all(`SELECT * FROM tasks ORDER BY created_at DESC`, [], (err, rows) => {
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
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE id = ?`, [id], (err) => {
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
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "날짜를 입력하세요." });
  db.all(
    `SELECT * FROM tasks WHERE DATE(created_at) = ? ORDER BY created_at DESC`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// 앱 종료 시 SQLite 연결 종료
app.on("before-quit", () => {
  db?.close((err) => {
    if (err) console.error("DB Close Error:", err);
    else console.log("✅ SQLite 연결이 안전하게 종료되었습니다.");
  });
});
