const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  // 上り通信（レンダラー → メイン）

    // 設定関連
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
    updateIntervalSettings: (enabled, count, intervals, isAutoCalcEnabled) => 
        ipcRenderer.send('update-interval-settings', enabled, count, intervals, isAutoCalcEnabled),
    setAlwaysOnTop: (value) => ipcRenderer.send('set-always-on-top', value),

    // タイマー制御
    startMainTimer: () => ipcRenderer.send('start-main-timer'),
    startBreakTimer: () => ipcRenderer.send('start-break-timer'),
    startMiniTimer: () => ipcRenderer.send('start-mini-timer'),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    pauseTimer: () => ipcRenderer.send('pause-timer'),
    resumeTimer: () => ipcRenderer.send('resume-timer'),

    // 通知
    showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),

    // ストレッチ関連
    getStretches: () => ipcRenderer.invoke('get-stretches'),
    showStretch: () => ipcRenderer.send('show-stretch'),


  // 下り通信（メイン → レンダラー）
  
    // 設定更新
    onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', (event, settings) => callback(settings)),

    // タイマー更新とイベント
    updateTimer: (callback) => {
        ipcRenderer.on('update-timer', (event, data) => callback(data));
    },
    onTimerPaused: (callback) => {
        ipcRenderer.on('timer-paused', (event, isPaused) => callback(isPaused));
    },
    onTimerResumed: (callback) => {
        ipcRenderer.on('timer-resumed', (event, isPaused) => callback(isPaused));
    },
    onTimerStopped: (callback) => {
        ipcRenderer.on('timer-stopped', () => callback());
    },

    // ストレッチ表示
    displayStretches: (callback) => {
        ipcRenderer.on('display-stretches', (event, stretches) => callback(stretches));
    }
};

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('preload.js loaded');