const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const fs = require('fs');
const path = require("path");
const stretchesFilePath = path.join(__dirname, 'stretches.json');

//開発中のファイルの変更を監視して自動的にアプリをリロードする。開発環境でのみ行う分岐を使用。
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

let mainWindow;
let stretchWindow;
let mainTimerId;
let miniTimerId;

// タイマー設定
const mainTimerDefault = 52 * 60; // メインタイマーの初期値（52分）
const breakTimerDefault = 17 * 60; // ブレイクタイマーの初期値（17分）
const miniTimerDefault = 5 * 60; // ミニタイマーの初期値（5分）
const firstStandingTimerDefault = 14 * 60; // 第一スタンディングタイマー
const secondStandingTimerDefault = 33 * 60; // 第二スタンディングタイマー

// // デバッグ用タイマー設定
// const mainTimerDefault = 50; // デバッグ用メインタイマーの初期値
// const breakTimerDefault = 17; // デバッグ用ブレイクタイマーの初期値
// const miniTimerDefault = 5; // デバッグ用ミニタイマーの初期値
// const firstStandingTimerDefault = 48; // デバッグ用第一スタンディングタイマー
// const secondStandingTimerDefault = 33; // デバッグ用第二スタンディングタイマー

let mainRemainingTime = mainTimerDefault; // メインタイマーの残り時間
let miniRemainingTime = miniTimerDefault; // ミニタイマーの残り時間
let currentTimerType = "main"; // 現在のタイマータイプ
let isPaused = false;
let hasShownMiniTimerEndedMessage = false;

// ファイルの読み込み
function readStretchesFile() {
    try {
        const data = fs.readFileSync(stretchesFilePath, 'utf-8');
        console.log('File data:', data);  // コンソールに読み込んだファイルの内容を表示
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading stretches file:', error);
        return [];
    }
}

// 読み込んだデータを送信する関数
ipcMain.handle('get-stretches', () => {
    return readStretchesFile();
});

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 444,
    height: 220,
    x: width - 445,
    y: height - 221,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: false,
    backgroundThrottling: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("index.html");

  // 開発者ツールを開く
  // mainWindow.webContents.openDevTools();
}

function createStretchWindow() {
  stretchWindow = new BrowserWindow({
      width: 430,
      height: 518,
      resizable: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          enableRemoteModule: false,
          webSecurity: true,
          allowRunningInsecureContent: false
      }
  });

  stretchWindow.loadFile('stretch.html');

  // 開発者ツールを開く
  // stretchWindow.webContents.openDevTools();
}

function showNotification(title, body) {
  new Notification({ title, body }).show();
}

function startMainTimer() {
  clearInterval(mainTimerId);
  mainTimerId = setInterval(() => {
    if (isPaused) return;
    if (mainRemainingTime > 0) {
      mainRemainingTime--;
      if (
        (mainRemainingTime === firstStandingTimerDefault &&
          currentTimerType !=="break") ||
        (mainRemainingTime === secondStandingTimerDefault &&
          currentTimerType !=="break")
      ) {
        currentTimerType = "mini";
        startMiniTimer();
        console.log("スタンディングタイマー開始");
        showNotification('Stand Up!','Let\'s get up and stretch! Keep your energy flowing!');
        createStretchWindow();
        hasShownMiniTimerEndedMessage = false;
      }
      if (miniRemainingTime === 0 && !hasShownMiniTimerEndedMessage) {
        clearTimeout(miniTimerId);
        console.log("スタンディングタイマー終了");
        showNotification('Good job!', 'Great job taking a moment to stretch! Now, let\'s dive back in.');
        miniRemainingTime = miniTimerDefault;
        hasShownMiniTimerEndedMessage = true;
      }
      if (mainRemainingTime === 0 && currentTimerType === "main") {
        clearTimeout(mainTimerId);
        console.log("メインタイマー終了");
        showNotification('Break time!', 'Time for a short break! Grab some water and refresh yourself.');
      }
      if (mainRemainingTime === 0 && currentTimerType === "break") {
        clearTimeout(mainTimerId);
        showNotification('Back to work!', 'Break time\'s over! Let\'s get back to making magic happen.');
      }
    }
    mainWindow.webContents.send("update-timer", {
      mainRemainingTime,
      miniRemainingTime,
    });
    if (currentTimerType === "main" || currentTimerType === "break") {
      startMainTimer();
    }
  }, 1000);
}

function startMiniTimer() {
  clearInterval(miniTimerId);
  miniTimerId = setInterval(() => {
    if (isPaused) return;
    if (miniRemainingTime > 0) {
      miniRemainingTime--;
      if (miniRemainingTime === 0) {
        mainWindow.webContents.send("mini-timer-ended");
        currentTimerType = "main";
        startMiniTimer();
      }
    }
    mainWindow.webContents.send("update-timer", {
      mainRemainingTime,
      miniRemainingTime,
    });
    if (currentTimerType === "mini") {
      startMiniTimer();
    }
  }, 1000);
}

ipcMain.on("start-main-timer", () => {
  mainRemainingTime = mainTimerDefault;
  miniRemainingTime = miniTimerDefault;
  isPaused = false;
  currentTimerType = "main";
  startMainTimer();
});

ipcMain.on("start-mini-timer", () => {
  miniRemainingTime = miniTimerDefault;
  currentTimerType = "mini";
  startMiniTimer();
});

ipcMain.on("start-break-timer", () => {
  mainRemainingTime = breakTimerDefault;
  miniRemainingTime = miniTimerDefault;
  isPaused = false;
  currentTimerType = "break";
  startMainTimer();
});

ipcMain.on("pause-timer", () => {
  if (!isPaused) {
    // タイマーが一時停止されていない場合、タイマーを一時停止する
    clearInterval(mainTimerId);
    clearInterval(miniTimerId);
    isPaused = true;
    console.log("タイマーが一時停止されました。");
  } else {
    // タイマーが一時停止されている場合、タイマーを再開する
    isPaused = false;
    if (currentTimerType === "main" || currentTimerType === "break") {
      startMainTimer();
    } else if (currentTimerType === "mini") {
      startMainTimer();
      startMiniTimer();
    }
    console.log("タイマーが再開されました。");
  }
  // フロントエンドにタイマーの状態を更新させるためのメッセージを送信する
  mainWindow.webContents.send("timer-paused", isPaused);
});

ipcMain.on("stop-timer", () => {
  console.log("stop-timerのmain処理");
  clearInterval(mainTimerId);
  clearInterval(miniTimerId);
  mainRemainingTime = mainTimerDefault;
  miniRemainingTime = miniTimerDefault;
  currentTimerType = "main";
  mainWindow.webContents.send("update-timer", {
    mainRemainingTime,
    miniRemainingTime,
  });
});

ipcMain.on('show-stretch', () => {
  createStretchWindow();
  fs.readFile(path.join(__dirname, 'stretches.json'), 'utf-8', (err, data) => {
      if (err) {
          console.error('Error reading stretches.json:', err);
          return;
      }
      const stretches = JSON.parse(data);
      stretchWindow.webContents.send('display-stretches', stretches);
  });
});

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

