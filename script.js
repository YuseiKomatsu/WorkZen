// DOM要素の取得
const mainDisplay = document.getElementById('timer-display');
const miniDisplay = document.getElementById('timer-display-mini');
const startButton = document.getElementById('start-timer');
const stopButton = document.getElementById('stop-timer');
const pauseButton = document.getElementById('pause-timer');
const breakButton = document.getElementById('break-timer');

// 初期化関数
function initializeTimerDisplay() {
    updateTimerDisplay(0, 0);
}

// タイマー表示を更新する関数
function updateTimerDisplay(mainTime, miniTime) {
    mainDisplay.innerText = formatTime(mainTime);
    miniDisplay.innerText = formatTime(miniTime);
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

// ボタンのクリックイベントリスナー
startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    window.electronAPI.startMainTimer();
});

stopButton.addEventListener('click', () => {
    console.log('Stop button clicked');
    window.electronAPI.stopTimer();
});

pauseButton.addEventListener('click', () => {
    console.log('Pause button clicked');
    window.electronAPI.pauseTimer();
});

breakButton.addEventListener('click', () => {
    console.log('Break button clicked');
    window.electronAPI.startBreakTimer();
});

// タイマーの一時停止状態を監視
window.electronAPI.onTimerPaused((event, isPaused) => {
    console.log('Timer paused state:', isPaused);
    // ここでUIの更新を行う（例：ボタンの表示を切り替えるなど）
});

// ストレッチデータの取得
async function fetchStretches() {
    try {
        const stretches = await window.electronAPI.getStretches();
        console.log('Fetched stretches:', stretches);
        // ここでストレッチデータを使用してUIを更新する
    } catch (error) {
        console.error('Error fetching stretches:', error);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    initializeTimerDisplay();
    fetchStretches();
});

// デバッグ用
console.log('script.js loaded');