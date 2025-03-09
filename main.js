const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require('fs');

let mainWindow = null;
let todosWindow = null;
let isBackendRunning = false;
let tray = null;

function createTray() {
  if (tray !== null) {
    console.log('트레이가 이미 존재합니다.');
    return;
  }

  try {
    // .icns 파일 사용
    const iconPath = path.join(__dirname, 'assets', 'IconTemplate.icns');
    
    if (!fs.existsSync(iconPath)) {
      throw new Error(`아이콘 파일이 없습니다: ${iconPath}`);
    }

    const icon = nativeImage.createFromPath(iconPath);
    icon.setTemplateImage(true);
    
    tray = new Tray(icon);
    console.log('트레이 아이콘이 생성되었습니다.');
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Murmurs 열기', 
        click: () => {
          if (!mainWindow) {
            createWindowMurmurs();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { 
        label: 'Todos 열기', 
        click: () => {
          if (!todosWindow) {
            todosWindow = createWindowTodos();
          } else {
            todosWindow.show();
            todosWindow.focus();
          }
        }
      },
      { type: 'separator' },
      { 
        label: '종료', 
        click: () => {
          if (tray) {
            tray.destroy();
            tray = null;
          }
          stopBackendServer();
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Turmur');
    tray.setContextMenu(contextMenu);

  } catch (error) {
    console.error('트레이 아이콘 생성 중 오류:', error);
    console.error('상세 에러:', error.stack);
  }
}

async function initApp() {
  try {
    // Dock 숨기기
    if (app.dock) {
      app.dock.hide();
    }

    // 백엔드 서버 시작
    if (!isBackendRunning) {
      await startBackendServer();
    }

    // 트레이 생성
    createTray();

    // 단축키 등록
    globalShortcut.unregisterAll();
    
    globalShortcut.register("F14", () => {
      if (!todosWindow) {
        todosWindow = createWindowTodos();
      }
      if (todosWindow.isVisible()) {
        todosWindow.hide();
        //pressAltTab();
      } else {
        todosWindow.show();
        todosWindow.focus();
      }
    });

    globalShortcut.register("F15", () => {
      if (!mainWindow) {
        createWindowMurmurs();
      }
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        //pressAltTab();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error("앱 초기화 중 오류 발생:", error);
  }
}

// 앱 종료 시 정리
app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

// 앱이 준비되면 초기화 실행
app.whenReady().then(initApp).catch(error => {
  console.error("앱 초기화 중 오류:", error);
});

function startBackendServer() {
  // hide from dock
  app.dock.hide();

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
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        sandbox: false,
      },
      frame: false,
      title: "Spiral",
      skipTaskbar: true,
    });
    todosWindow.loadFile(path.join(__dirname, "spiral.html"));

    todosWindow.on("closed", () => {
      todosWindow = null;
      //pressAltTab();
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
      skipTaskbar: true,
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    mainWindow.on("closed", () => {
      mainWindow = null;
      //pressAltTab();
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

// 임시로 파일 생성
const iconData = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA
                 UklEQVR4nGNgGAXUBv///2dgYGD4z8DA8J+JgYGBgfE/EGMDTAwMDAyM/4EYHfxnYGBgYqAQ/Gdg
                 YGBiIFG/IE7TMTQwMDIyMjAwMDAwj4YhdQEAuK4PNB9q8XwAAAAASUVORK5CYII=`;

fs.writeFileSync(path.join(__dirname, 'assets', 'IconTemplate.png'), 
                 Buffer.from(iconData, 'base64'));

const icon2xData = `iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA
                    hklEQVR4nO2UQQqAMAwEd8X/P8YfqXjwIlKkNt0kVHDhXgOZJKRJQwgBwBjgBKAk5ZwXSYqZGUn
                    RzIwk5ZyXJOWcF0lKKS2SFGNckiQzW5KUUlokKcY4M7MlM1tSSosk5ZxnZraUc54lKed8k6Qc4
                    yxJOcZZkqKZGUmKZmYkKZqZkSRlM6sP8AJ6TiNgwHyqxwAAAABJRU5ErkJggg==`;

fs.writeFileSync(path.join(__dirname, 'assets', 'IconTemplate@2x.png'), 
                 Buffer.from(icon2xData, 'base64'));

