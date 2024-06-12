// DOM要素の取得
const mainDisplay = document.getElementById('timer-display');
const miniDisplay = document.getElementById('timer-display-mini');
const startButton = document.getElementById('start-timer');
const stopButton = document.getElementById('stop-timer');
const pauseButton = document.getElementById('pause-timer');
const breakButton = document.getElementById('break-timer');

// タイマー表示を更新する関数
function updateTimerDisplay(mainTime, miniTime) {
    mainDisplay.textContent = formatTime(mainTime);
    miniDisplay.textContent = formatTime(miniTime);
}

// 秒数を MM:SS 形式の文字列に変換する関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// メインプロセスからタイマー更新情報を受け取った際の処理
window.electronAPI.updateTimer((event, { mainRemainingTime, miniRemainingTime }) => {
    updateTimerDisplay(mainRemainingTime, miniRemainingTime);
});

// メインプロセスからの通知を受け取って表示する
window.electronAPI.showNotification((event, title, message) => {
    new Notification(title, { body: message });
});

// スタートボタンのクリックイベントリスナー
startButton.addEventListener('click', () => {
    window.electronAPI.startTimer();
});

// ストップボタンのクリックイベントリスナー
stopButton.addEventListener('click', () => {
    window.electronAPI.stopTimer();
});

// ポーズボタンのクリックイベントリスナー
pauseButton.addEventListener('click', () => {
    window.electronAPI.pauseTimer();
});

// ブレイクボタンのクリックイベントリスナー
breakButton.addEventListener('click', () => {
    window.electronAPI.startBreakTimer();
});

// 初期化
document.addEventListener('DOMContentLoaded', fetchStretches);
