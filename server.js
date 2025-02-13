const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 8877; // 로컬 백엔드 서버 포트

app.use(express.json());
app.use(cors());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database("./poof.db", (err) => {
    if (err) console.error("DB Error:", err);
    else {
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
    if (!task) return res.status(400).json({ error: "할 일을 입력하세요." });

    db.run(`INSERT INTO tasks (task) VALUES (?)`, [task], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, task });
    });
});

// 할 일 목록 조회 API
app.get("/tasks", (req, res) => {
    db.all(`SELECT * FROM tasks ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`✅ Poof 백엔드 서버 실행 중! http://localhost:${port}`);
});
