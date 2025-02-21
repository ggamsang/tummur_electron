const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let todosWindow = null;
let isBackendRunning = false;

function startBackendServer() {
  // 이미 실행 중이면 리턴
  if (isBackendRunning) {
    console.log("⚠️ 백엔드 서버가 이미 실행 중입니다.");
    return;
  }

  console.log("🔄 백엔드 서버 실행 중...");
  try {
    const backend = spawn("node", [path.join(__dirname, "server.js")], {
      detached: true,
      stdio: "pipe", // 로그 확인을 위해 pipe로 변경
    });

    backend.stdout.on("data", (data) => {
      console.log(`백엔드 출력: ${data}`);
    });

    backend.stderr.on("data", (data) => {
      console.error(`백엔드 에러: ${data}`);
    });

    backend.on("error", (err) => {
      console.error("백엔드 서버 실행 실패:", err);
      isBackendRunning = false;
    });

    backend.on("exit", (code) => {
      console.log(`백엔드 서버 종료. 종료 코드: ${code}`);
      isBackendRunning = false;
    });

    backend.unref();
    isBackendRunning = true;
    console.log("✅ 백엔드 서버 실행됨");
  } catch (error) {
    console.error("백엔드 서버 실행 중 오류 발생:", error);
    isBackendRunning = false;
  }
}

startBackendServer();

app.whenReady().then(() => {
  // 단축키 등록 전에 이전 등록 해제
  globalShortcut.unregisterAll();

  // 단축키 등록 시도
  try {
    globalShortcut.register("F14", () => {
      if (!todosWindow) {
        todosWindow = createWindowTodos(); // 오타 수정
      }
      if (todosWindow.isVisible()) {
        todosWindow.hide();
        pressAltTab();
      } else {
        todosWindow.show();
        todosWindow.focus();
      }
    });

    globalShortcut.register("F13", () => {
      if (!mainWindow) {
        createWindowMurmurs();
      }
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        pressAltTab();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error("단축키 등록 중 오류 발생:", error);
  }
});

function pressAltTab() {
  const { exec } = require("child_process");
  exec(
    "osascript -e 'tell application \"System Events\" to key code 48 using {command down}'",
    (error) => {
      if (error) {
        console.error("Alt+Tab 실행 중 오류:", error);
      }
    }
  );
}

function createWindowTodos() {
  try {
    todosWindow = new BrowserWindow({
      width: 800,
      height: 600,
      // alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        sandbox: false,
      },
      title: "Spiral",
      frame: false,
    });
    todosWindow.loadFile(path.join(__dirname, "spiral.html"));

    todosWindow.on("closed", () => {
      todosWindow = null;
      pressAltTab();
    });

    return todosWindow;
  } catch (error) {
    console.error("통계 창 생성 중 오류:", error);
    return null;
  }
}

function createWindowMurmurs() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      // alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        sandbox: false,
      },
      frame: false,
      title: "Murmurs",
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    mainWindow.on("closed", () => {
      mainWindow = null;
      pressAltTab();
    });

    mainWindow.on("ready-to-show", () => {
      mainWindow.show();
      // textarea 포커스 설정
      mainWindow.webContents
        .executeJavaScript(
          `
        document.querySelector('textarea').focus();
      `
        )
        .catch((err) => console.error("textarea 포커스 설정 실패:", err));
    });

    // 에러 이벤트 처리 추가
    mainWindow.webContents.on("crashed", () => {
      console.error("창이 충돌했습니다.");
    });

    mainWindow.on("unresponsive", () => {
      console.error("창이 응답하지 않습니다.");
    });
  } catch (error) {
    console.error("메인 창 생성 중 오류:", error);
  }
}

app.on("window-all-closed", (e) => {
  e.preventDefault();
});

function stopBackendServer() {
  if (isBackendRunning) {
    const { exec } = require("child_process");
    exec('pkill -f "node server.js"');
    console.log("백엔드 서버 종료");
    isBackendRunning = false; // 상태 업데이트
  }
}

app.on("will-quit", () => {
  try {
    globalShortcut.unregisterAll();
    // 백엔드 서버가 실행 중이면 종료
    stopBackendServer();
  } catch (error) {
    console.error("앱 종료 중 오류:", error);
  }
});

ipcMain.on("hide-window", () => {
  if (mainWindow && mainWindow.isVisible()) {
    mainWindow.hide();

    // cmd+tab 자동으로 한 번 누르기
    const { exec } = require("child_process");
    exec(
      "osascript -e 'tell application \"System Events\" to key code 48 using {command down}'",
      (err) => {
        if (err) console.error("포커스 이동 실패:", err);
      }
    );
  }
});

process.on("uncaughtException", (err) => {
  console.error("예기치 않은 오류 발생:", err);
  // 필요한 정리 작업 수행
  stopBackendServer();
  // 앱 종료
  app.quit();
});
