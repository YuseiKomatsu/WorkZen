const { contextBridge, ipcRenderer } = require('electron');

// レンダラーで使用するAPIをセキュアな方法で公開
contextBridge.exposeInMainWorld('electronAPI', {
    startTimer: () => ipcRenderer.send('start-main-timer'),
    startBreakTimer: () => ipcRenderer.send('start-break-timer'),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    pauseTimer: () => ipcRenderer.send('pause-timer'),
    updateTimer: (callback) => ipcRenderer.on('update-timer', callback),
    showNotification: (callback) => ipcRenderer.on('show-notification', callback),
    displayStretches: (callback) => ipcRenderer.on('display-stretches', callback),
});