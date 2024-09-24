const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const fs = require('fs');
const path = require("path");
const stretchesFilePath = path.join(__dirname, 'stretches.json');

// 開発環境での自動リロード設定
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

// グローバル変数
let mainWindow = null;
let stretchWindow;
let mainTimerId;
let miniTimerId;

// タイマー設定
let mainTimerDefault = 52 * 60; // メインタイマーの初期値（52分）
let breakTimerDefault = 17 * 60; // ブレイクタイマーの初期値（17分）
let miniTimerDefault = 5 * 60; // ミニタイマーの初期値（5分）
let mainRemainingTime = mainTimerDefault;
let miniRemainingTime = miniTimerDefault;
let currentTimerType = "main";
let isPaused = false;

// インターバル設定
let intervalsEnabled = false;
let intervalCount = 2;
let intervalTimes = [];

// ウィンドウ作成関数
function createMainWindow() {
  if (mainWindow === null) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
      width: 448,
      height: 212,
      x: width - 450,
      y: height - 213,
      useContentSize: true,
      frame: false,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      backgroundThrottling: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
    });

    mainWindow.loadFile("index.html");

    mainWindow.webContents.on('did-finish-load', () => {
      updateTimerDisplay();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.focus();
  }
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
}

function updateTimerDisplay() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-timer", {
      mainRemainingTime,
      miniRemainingTime: intervalTimeDefault
    });
  } else {
    console.log('Main window is not available for updating timer display');
  }
}

function startMainTimer() {
  clearInterval(mainTimerId);
  console.log(`Starting main timer. intervalsEnabled: ${intervalsEnabled}, intervalCount: ${intervalCount}`);
  console.log(`Interval times: ${JSON.stringify(intervalTimes)}`);
  
  mainTimerId = setInterval(() => {
    if (isPaused) return;
    if (mainRemainingTime > 0) {
      mainRemainingTime--;
      
      if (intervalsEnabled && currentTimerType === "main") {
        console.log(`Current remaining time: ${mainRemainingTime}`);
        
        const matchingIntervalIndex = intervalTimes.findIndex(time => time === mainRemainingTime);
        if (matchingIntervalIndex !== -1) {
          console.log(`Interval match found for interval ${matchingIntervalIndex + 1}`);
          startMiniTimer();
          showNotification('Stand Up!', 'Let\'s get up and stretch! Keep your energy flowing!');
          createStretchWindow();
        }
      }
      
      if (mainRemainingTime === 0) {
        handleTimerCompletion();
      }
    }
    updateTimerDisplay();
  }, 1000);
}

function startMiniTimer() {
  currentTimerType = "mini";
  miniRemainingTime = miniTimerDefault;
  clearInterval(miniTimerId);
  miniTimerId = setInterval(() => {
    if (isPaused) return;
    if (miniRemainingTime > 0) {
      miniRemainingTime--;
      if (miniRemainingTime === 0) {
        console.log("ミニタイマー終了");
        showNotification('Back to focus!', 'Mini break is over. Let\'s get back to work!');
        currentTimerType = "main";
        clearInterval(miniTimerId);
      }
    }
    updateTimerDisplay();
  }, 1000);
}

function handleTimerCompletion() {
  if (currentTimerType === "main") {
    console.log("メインタイマー終了");
    showNotification('Break time!', 'Time for a short break! Grab some water and refresh yourself.');
  } else if (currentTimerType === "break") {
    console.log("ブレイクタイマー終了");
    showNotification('Back to work!', 'Break time\'s over! Let\'s get back to making magic happen.');
  }
  clearInterval(mainTimerId);
}

// ヘルパー関数
function showNotification(title, body) {
  new Notification({ title, body }).show();
}

function updatePauseButtonIcon() {
  mainWindow.webContents.executeJavaScript(`
    try {
      const pauseIcon = document.getElementById('pause-icon');
      const playCircleIcon = document.getElementById('play-circle-icon');
      if (!pauseIcon || !playCircleIcon) {
        throw new Error('Required elements not found');
      }
      if (${isPaused}) {
        console.log('Switching to play icon');
        pauseIcon.style.display = 'none';
        playCircleIcon.style.display = 'block';
      } else {
        console.log('Switching to pause icon');
        pauseIcon.style.display = 'block';
        playCircleIcon.style.display = 'none';
      }
      'JavaScript executed successfully.';
    } catch (error) {
      console.error('Error during icon switch:', error);
      throw error;
    }
  `).then((result) => {
    console.log(result);
  }).catch((error) => {
    console.error('Failed to execute JavaScript:', error);
  });
}

// ファイル読み込み関数
function readStretchesFile() {
  try {
    const data = fs.readFileSync(stretchesFilePath, 'utf-8');
    console.log('File data:', data);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading stretches file:', error);
    return [];
  }
}

// 設定関連関数
function loadSettings() {
  // TODO: 実際の設定読み込みロジックを実装する
  // この例では、ハードコードされた値を使用しています
  console.log('Loading settings');
  // 設定からIntervalTimeを読み込む（実際の実装ではファイルやデータベースから読み込む）
  intervalTimeDefault = 5 * 60; // 例: 5分
  miniRemainingTime = intervalTimeDefault;
}

function saveSettings() {
  // TODO: Implement saving settings to storage
  console.log('Saving settings:', { intervalsEnabled, intervalCount, intervalTimes });
}

// IPC ハンドラー
ipcMain.handle('get-stretches', async () => {
  try {
    return readStretchesFile();
  } catch (error) {
    console.error('Failed to get stretches:', error);
    return [];
  }
});

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
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(mainTimerId);
    clearInterval(miniTimerId);
    console.log("Timer paused.");
  } else {
    if (currentTimerType === "main" || currentTimerType === "break") {
      startMainTimer();
    } else if (currentTimerType === "mini") {
      startMiniTimer();
    }
    console.log("Timer Resumed");
  }
  mainWindow.webContents.send("timer-paused", isPaused);
  updatePauseButtonIcon();
});

ipcMain.on("stop-timer", () => {
  console.log("stop-timerのmain処理");
  clearInterval(mainTimerId);
  clearInterval(miniTimerId);
  mainRemainingTime = mainTimerDefault;
  miniRemainingTime = miniTimerDefault;
  currentTimerType = "main";
  updateTimerDisplay();
});

ipcMain.on('show-stretch', () => {
  createStretchWindow();
  fs.readFile(path.join(__dirname, 'stretches.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading stretches.json:', err);
      return;
    }
    try {
      const stretches = JSON.parse(data);
      stretchWindow.webContents.send('display-stretches', stretches);
    } catch (parseError) {
      console.error('Error parsing stretches.json:', parseError);
    }
  });
});

ipcMain.on('update-timer-settings', (event, type, seconds) => {
  console.log(`Updating ${type} timer to ${seconds} seconds`);
  switch(type) {
    case 'focusTime':
      mainTimerDefault = seconds;
      if (currentTimerType === 'main' && !isPaused) mainRemainingTime = seconds;
      break;
    case 'breakTime':
      breakTimerDefault = seconds;
      if (currentTimerType === 'break' && !isPaused) mainRemainingTime = seconds;
      break;
    case 'miniTimer':
      miniTimerDefault = seconds;
      if (currentTimerType === 'mini' && !isPaused) miniRemainingTime = seconds;
      break;
  }
  updateTimerDisplay();
});

ipcMain.on('update-interval-time', (event, newIntervalTime) => {
  intervalTimeDefault = newIntervalTime;
  miniRemainingTime = intervalTimeDefault;
  updateTimerDisplay();
});

ipcMain.on('update-interval-settings', (event, enabled, count, intervals) => {
  console.log(`Received interval settings: enabled=${enabled}, count=${count}, intervals=${JSON.stringify(intervals)}`);
  intervalsEnabled = enabled;
  intervalCount = Math.min(count, 10);
  intervalTimes = intervals.slice(0, intervalCount);
  console.log(`Updated interval times: ${JSON.stringify(intervalTimes)}`);
  saveSettings();
});

ipcMain.on('show-notification', (event, title, body) => {
  new Notification({ title, body }).show();
});

// アプリケーションイベントハンドラー
app.whenReady().then(() => {
  loadSettings();
  createMainWindow();
});

app.on('window-all-closed', () => {
  mainWindow = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});