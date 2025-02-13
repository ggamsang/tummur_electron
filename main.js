const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;

// 백엔드 서버 실행 (디버깅을 위해 로그 추가)
console.log("🔄 백엔드 서버 실행 중...");
const backend = spawn("node", [path.join(__dirname, "server.js")], {
    detached: true,
    stdio: "ignore",
});
backend.unref();
console.log("✅ 백엔드 서버 실행됨.");

app.whenReady().then(() => {
    globalShortcut.register("F13", () => {
        if (!mainWindow) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            sandbox: false,
        },
    });

    mainWindow.loadFile("index.html");

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("window-all-closed", (e) => {
    e.preventDefault();
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});
