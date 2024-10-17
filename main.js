const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

// 設定のデフォルト値
const defaultSettings = {
  focusTime: 52 * 60,
  breakTime: 17 * 60,
  intervalTime: 5 * 60,
  intervalsEnabled: true,
  intervalCount: 2,
  isAutoCalcEnabled: true,
  intervalTimes: []
};

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
let mainTimerDefault = 52 * 60;
let breakTimerDefault = 17 * 60;
let miniTimerDefault = 5 * 60;
let mainRemainingTime = mainTimerDefault;
let miniRemainingTime = miniTimerDefault;
let currentTimerType = "main";
let isPaused = false;
let isTimerRunning = false;
let pausedMainRemainingTime = 0;
let pausedMiniRemainingTime = 0;

// インターバル設定
let intervalsEnabled = false;
let intervalCount = 2;
let intervalTimes = [];

// メインウィンドウの作成
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
      alwaysOnTop: false,
      backgroundThrottling: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
    });

    mainWindow.loadFile("index.html");
    
    // if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    // }

    mainWindow.webContents.on('did-finish-load', () => {
      const settings = loadSettings();
      mainWindow.webContents.send('settings-updated', settings);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } else {
    mainWindow.focus();
  }
}

// ストレッチウィンドウの作成
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

// タイマー表示の更新
function updateTimerDisplay() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const settings = loadSettings();
    mainWindow.webContents.send("update-timer", {
      mainRemainingTime,
      miniRemainingTime,
      settings
    });
  }
}

// メインタイマーの開始
function startMainTimer() {
  const settings = loadSettings();
  clearInterval(mainTimerId);
  console.log(`Starting main timer. intervalsEnabled: ${intervalsEnabled}, intervalCount: ${intervalCount}`);
  console.log(`Interval times: ${JSON.stringify(intervalTimes)}`);
  
  mainTimerId = setInterval(() => {
    if (!isPaused) {
      if (mainRemainingTime > 0) {
        mainRemainingTime--;
        
        if (intervalsEnabled && currentTimerType === "main" && Array.isArray(intervalTimes)) {
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
    }
  }, 1000);
  isTimerRunning = true;
  updatePauseResumeButton();
}

// ミニタイマーの開始
function startMiniTimer() {
  const settings = loadSettings();
  currentTimerType = "mini";
  if (miniRemainingTime === 0) {
    miniRemainingTime = settings.miniTimerDefault;
  }
  clearInterval(miniTimerId);
  miniTimerId = setInterval(() => {
    if (!isPaused) {
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
    }
  }, 1000);
  isTimerRunning = true;
  updatePauseResumeButton();
}

function stopTimer() {
  const settings = loadSettings();
  clearInterval(mainTimerId);
  clearInterval(miniTimerId);
  isTimerRunning = false;
  isPaused = false;
  mainRemainingTime = settings.focusTime;
  miniRemainingTime = settings.intervalTime;
  currentTimerType = "main";
  updateTimerDisplay();
  updatePauseResumeButton();
}

function pauseResumeTimer() {
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(mainTimerId);
    clearInterval(miniTimerId);
  } else {
    if (currentTimerType === "main" || currentTimerType === "break") {
      startMainTimer();
    } else if (currentTimerType === "mini") {
      startMiniTimer();
    }
  }
  updatePauseResumeButton();
}

function updatePauseResumeButton() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-pause-resume-button", isPaused, isTimerRunning);
  }
}

// タイマー完了時の処理
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

// 通知の表示
function showNotification(title, body) {
  new Notification({ title, body }).show();
}

// ストレッチファイルの読み込み
function readStretchesFile() {
  try {
    const stretches = store.get('stretches');
    console.log('Stretches data:', stretches);
    return stretches || [];
  } catch (error) {
    console.error('Error reading stretches:', error);
    return [];
  }
}

// 設定の読み込み
function loadSettings() {
  const settings = store.get('settings', defaultSettings);
  isAutoCalcEnabled = settings.isAutoCalcEnabled; // グローバル変数を更新
  return settings;
}

// 設定の保存
function saveSettings(settings) {
  // 既存の設定を読み込む
  const existingSettings = store.get('settings', defaultSettings);
  
  // 新しい設定で上書きする
  const updatedSettings = {
      ...existingSettings,
      ...settings,
      // intervalTimesは常に新しい値で更新する
      intervalTimes: settings.intervalTimes || existingSettings.intervalTimes
  };

  store.set('settings', updatedSettings);
  return updatedSettings;
}

// タイマーをリセットせずに設定を読み込む
function loadSettingsWithoutResettingTimer(settings) {
  mainTimerDefault = settings.focusTime;
  breakTimerDefault = settings.breakTime;
  miniTimerDefault = settings.intervalTime;
  intervalsEnabled = settings.intervalsEnabled;
  intervalCount = settings.intervalCount;
  isAutoCalcEnabled = settings.isAutoCalcEnabled;
  intervalTimes = settings.intervalTimes || [];

  updateTimerDisplay();
}

// IPC ハンドラーの設定

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('get-current-settings', () => {
  return loadSettings(); 
});

ipcMain.handle('get-stretches', async () => {
  try {
    return readStretchesFile();
  } catch (error) {
    console.error('Failed to get stretches:', error);
    return [];
  }
});

ipcMain.on("start-main-timer", () => {
  const settings = loadSettings();
  mainRemainingTime = settings.focusTime;
  miniRemainingTime = settings.intervalTime;
  isPaused = false;
  currentTimerType = "main";
  startMainTimer();
});

ipcMain.on("start-mini-timer", () => {
  const settings = loadSettings();
  miniRemainingTime = settings.miniTimerDefault;
  currentTimerType = "mini";
  startMiniTimer();
});

ipcMain.on("start-break-timer", () => {
  const settings = loadSettings();
  mainRemainingTime = settings.breakTimerDefault;
  miniRemainingTime = settings.miniTimerDefault;
  isPaused = false;
  currentTimerType = "break";
  startMainTimer();
});

ipcMain.on("pause-timer", () => {
  const settings = loadSettings();
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(mainTimerId);
    clearInterval(miniTimerId);
    pausedMainRemainingTime = settings.mainRemainingTime;
    pausedMiniRemainingTime = settings.miniRemainingTime;
    console.log("Timer paused. Main:", pausedMainRemainingTime, "Mini:", pausedMiniRemainingTime);
  } else {
    console.log("Resuming timer. Main:", pausedMainRemainingTime, "Mini:", pausedMiniRemainingTime);
    mainRemainingTime = settings.pausedMainRemainingTime;
    miniRemainingTime = settings.pausedMiniRemainingTime;
    if (currentTimerType === "main" || currentTimerType === "break") {
      startMainTimer();
    } else if (currentTimerType === "mini") {
      startMiniTimer();
    }
  }
  mainWindow.webContents.send("timer-paused", isPaused);
  updateTimerDisplay();
});

ipcMain.on("stop-timer", () => {
  stopTimer();
  mainWindow.webContents.send("timer-stopped");
});

ipcMain.on('show-stretch', () => {
  createStretchWindow();
  try {
    const stretches = readStretchesFile();
    stretchWindow.webContents.send('display-stretches', stretches);
  } catch (error) {
    console.error('Error displaying stretches:', error);
  }
});

ipcMain.on('update-interval-settings', (event, enabled, count, intervals) => {
  console.log(`Received interval settings: enabled=${enabled}, count=${count}, intervals=${JSON.stringify(intervals)}`);
  const settings = loadSettings();
  settings.intervalsEnabled = enabled;
  settings.intervalCount = Math.min(count, 10);
  settings.intervalTimes = intervals.slice(0, settings.intervalCount);
  settings.isAutoCalcEnabled = isAutoCalcEnabled;
  console.log(`Updated settings: ${JSON.stringify(settings)}`);
  saveSettings(settings);
});

ipcMain.handle('save-settings', async (event, settings) => {
  const updatedSettings = saveSettings(settings);
  mainWindow.webContents.send('settings-updated', updatedSettings);
  return updatedSettings;
});

ipcMain.handle('get-current-timer-values', () => {
  return {
    mainRemainingTime,
    miniRemainingTime
  };
});

ipcMain.handle('update-settings', async (event, settings) => {
  loadSettingsWithoutResettingTimer(settings);
  return true;
});

ipcMain.on("pause-resume-timer", pauseResumeTimer);

// アプリケーションのイベントハンドラー
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

ipcMain.on('show-notification', (event, title, body) => {
  new Notification({ title, body }).show();
});