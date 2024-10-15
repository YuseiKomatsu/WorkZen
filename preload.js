const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスで使用するAPIをセキュアな方法で公開
contextBridge.exposeInMainWorld('electronAPI', {
    // タイマー制御
    startMainTimer: () => ipcRenderer.send('start-main-timer'),
    startBreakTimer: () => ipcRenderer.send('start-break-timer'),
    startMiniTimer: () => ipcRenderer.send('start-mini-timer'),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    pauseTimer: () => ipcRenderer.send('pause-timer'),

    // タイマー更新とイベント
    updateTimer: (callback) => ipcRenderer.on('update-timer', (event, data) => {
        console.log('Preload received timer update:', data); // デバッグ用ログ
        callback(data);
    }),
    onTimerPaused: (callback) => ipcRenderer.on('timer-paused', (event, isPaused) => callback(isPaused)),
    onUpdatePauseResumeButton: (callback) => ipcRenderer.on('update-pause-resume-button', (event, isPaused, isTimerRunning) => callback(isPaused, isTimerRunning)),

    // 通知
    showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),

    // 設定更新
    updateTimerSettings: (type, seconds) => ipcRenderer.send('update-timer-settings', type, seconds),
    updateIntervalSettings: (enabled, count, intervals) => 
        ipcRenderer.send('update-interval-settings', enabled, count, intervals),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getCurrentTimerValues: () => ipcRenderer.invoke('get-current-timer-values'),
    getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
    updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

    // ストレッチ関連
    getStretches: () => ipcRenderer.invoke('get-stretches'),
    showStretch: () => ipcRenderer.send('show-stretch'),
    displayStretches: (callback) => ipcRenderer.on('display-stretches', (event, stretches) => callback(stretches))
});

console.log('preload.js loaded');