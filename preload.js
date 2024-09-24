const { contextBridge, ipcRenderer } = require('electron');

// レンダラーで使用するAPIをセキュアな方法で公開
contextBridge.exposeInMainWorld('electronAPI', {
    // タイマー制御
    startMainTimer: () => ipcRenderer.send('start-main-timer'),
    startBreakTimer: () => ipcRenderer.send('start-break-timer'),
    startMiniTimer: () => ipcRenderer.send('start-mini-timer'),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    pauseTimer: () => ipcRenderer.send('pause-timer'),

    // タイマー更新とイベント
    updateTimer: (callback) => ipcRenderer.on('update-timer', callback),
    onTimerPaused: (callback) => ipcRenderer.on('timer-paused', callback),

    // 設定更新
    updateTimerSettings: (type, seconds) => ipcRenderer.send('update-timer-settings', type, seconds),
    updateIntervalTime: (seconds) => ipcRenderer.send('update-interval-time', seconds),
    updateIntervalSettings: (enabled, count, intervals) => 
        ipcRenderer.send('update-interval-settings', enabled, count, intervals),

    // ストレッチ関連
    getStretches: () => ipcRenderer.invoke('get-stretches'),
    showStretch: () => ipcRenderer.send('show-stretch'),
    displayStretches: (callback) => ipcRenderer.on('display-stretches', callback),
});

console.log('preload.js loaded');