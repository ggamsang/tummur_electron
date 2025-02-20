const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let statsWindow = null;

// 백엔드 서버 실행 상태 확인 변수 추가
let isBackendRunning = false;

// 백엔드 서버 실행 함수
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

// 앱 시작 시 백엔드 서버 실행
startBackendServer();

app.whenReady().then(() => {
  // 단축키 등록 전에 이전 등록 해제
  globalShortcut.unregisterAll();

  // 단축키 등록 시도
  try {

    globalShortcut.register("F14", () => {
      if (!statsWindow) {
        statsWindow = createWindowStats(); // 오타 수정
      }
      if (statsWindow.isVisible()) {
        statsWindow.hide();
        pressAltTab();
      } else {
        statsWindow.show();
        statsWindow.focus();
      }
    });

    globalShortcut.register("F13", () => {
      if (!mainWindow) {
        createWindow();
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

function createWindowStats() {
  // 함수명 오타 수정
  try {
    statsWindow = new BrowserWindow({
      width: 800,
      height: 600,
      alwaysOnTop: true,
      webPreferences: {
        contextIsolation: true,
        sandbox: false,
      },
    });
    statsWindow.loadFile("stats.html");

    statsWindow.on("closed", () => {
      statsWindow = null;
      pressAltTab();
    });

    return statsWindow;
  } catch (error) {
    console.error("통계 창 생성 중 오류:", error);
    return null;
  }
}

function createWindow() {
  try {
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

// 모든 창이 닫혀도 앱 종료 방지
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

// 앱 종료 시 정리
app.on("will-quit", () => {
  try {
    globalShortcut.unregisterAll();
    // 백엔드 서버가 실행 중이면 종료
    stopBackendServer();
  } catch (error) {
    console.error("앱 종료 중 오류:", error);
  }
});

// 창 숨김 이벤트 처리
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

// 예기치 않은 종료 처리
process.on("uncaughtException", (err) => {
  console.error("예기치 않은 오류 발생:", err);
  // 필요한 정리 작업 수행
  stopBackendServer();
  // 앱 종료
  app.quit();
});
