// グローバル変数
let isIntervalsEnabled = true;
let intervalCount = 2;
let isAutoCalcEnabled = true;

// DOM要素の取得
const mainDisplay = document.getElementById('timer-display');
const miniDisplay = document.getElementById('timer-display-mini');
const startButton = document.getElementById('start-timer');
const stopButton = document.getElementById('stop-timer');
const pauseButton = document.getElementById('pause-timer');
const breakButton = document.getElementById('break-timer');

// 初期化関数
function initializeApp() {
    console.log('Initializing app');
    initializeTimerDisplay();
    initializeIntervalControls();
    initializeTimerSettings();
    initializeBackButton();
    fetchStretches();
    loadCurrentTimerValues(); 
}

// タイマー表示を初期化する関数
function initializeTimerDisplay() {
    updateTimerDisplay(0, 0);
}

// 現在のタイマー値を読み込む関数を追加
async function loadCurrentTimerValues() {
    try {
      const timerValues = await window.electronAPI.getCurrentTimerValues();
      updateTimerDisplay(timerValues.mainRemainingTime, timerValues.miniRemainingTime);
    } catch (error) {
      console.error('Failed to load current timer values:', error);
    }
  }

// タイマー表示を更新する関数
function updateTimerDisplay(mainTime, miniTime) {
    console.log('Updating timer display:', mainTime, miniTime);
    if (mainDisplay) {
        mainDisplay.innerText = formatTime(mainTime);
    } else {
        console.error('Main display element not found');
    }
    if (miniDisplay) {
        miniDisplay.innerText = formatTime(miniTime);
    } else {
        console.error('Mini display element not found');
    }
}


// 設定更新関数
function updateTimerSetting(type, minutes) {
    const seconds = minutes * 60;
    window.electronAPI.updateTimerSettings(type, seconds);
}

// 通知を表示する関数
function showNotification(title, message) {
    if (window.electronAPI && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, message);
    } else {
        console.error('showNotification function is not available');
    }
}

// 秒数を MM:SS 形式の文字列に変換する関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// インターバル制御の初期化
function initializeIntervalControls() {
    const enableIntervalsSwitch = document.querySelector('.setting:first-child input[type="checkbox"]');
    const decrementButton = document.querySelector(".number-input .decrement");
    const incrementButton = document.querySelector(".number-input .increment");
    const autoCalcSwitch = document.querySelector('.setting:nth-child(4) input[type="checkbox"]');
    
    if (enableIntervalsSwitch) {
        enableIntervalsSwitch.checked = isIntervalsEnabled;
        enableIntervalsSwitch.addEventListener("change", (e) => {
            isIntervalsEnabled = e.target.checked;
            updateIntervalList();
        });
    }

    if (autoCalcSwitch) {
        autoCalcSwitch.checked = isAutoCalcEnabled;
        autoCalcSwitch.addEventListener("change", (e) => {
            setAutoCalcEnabled(e.target.checked);
            if (isAutoCalcEnabled) {
                recalculateIntervals();
            }
            updateIntervalList();
        });
    }

    if (decrementButton && incrementButton) {
        decrementButton.addEventListener("click", () => updateIntervalCount(-1));
        incrementButton.addEventListener("click", () => updateIntervalCount(1));
    }
}

// タイマー設定の初期化
function initializeTimerSettings() {
    document.addEventListener('input', handleTimeInput, true);
    document.addEventListener('focus', handleTimeFocus, true);
    document.addEventListener('blur', handleTimeBlur, true);
}

// 戻るボタンの初期化
function initializeBackButton() {
    const backButton = document.getElementById('back-button');
    const mainWrapper = document.getElementById('main-wrapper');
    const settingWrapper = document.getElementById('setting-wrapper');

    if (backButton) {
        backButton.addEventListener('click', () => {
            mainWrapper.classList.remove('hidden');
            settingWrapper.classList.add('hidden');
        });
    }

    const settingsIcon = document.querySelector('.setting-toggle');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            mainWrapper.classList.add('hidden');
            settingWrapper.classList.remove('hidden');
        });
    }
}

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

// インターバル数の更新
function updateIntervalCount(change) {
    const newCount = Math.min(Math.max(intervalCount + change, 1), 10);
    if (newCount !== intervalCount) {
        intervalCount = newCount;
        updateDisplay();
        updateButtonColors();
    }
}

// ボタンの色更新
function updateButtonColors() {
    const decrementButton = document.querySelector(".number-input .decrement");
    const incrementButton = document.querySelector(".number-input .increment");
    const decrementSvg = decrementButton?.querySelector("svg path");
    const incrementSvg = incrementButton?.querySelector("svg path");

    if (decrementSvg && incrementSvg) {
        decrementSvg.setAttribute("fill", intervalCount === 1 ? "#6C757D" : "#FFFFFF");
        incrementSvg.setAttribute("fill", intervalCount === 10 ? "#6C757D" : "#FFFFFF");
    }
}

// 時間入力の処理
function handleTimeInput(event) {
    let value = event.target.value.replace(/[^\d]/g, '');
    if (value.length > 2) {
        value = value.slice(0, 2);
    }
    const numValue = parseInt(value, 10);
    if (numValue > 59) {
        value = '59';
    }
    event.target.value = value;
    
    if (event.target.closest('.interval-item')) {
        setAutoCalcEnabled(false);
    }
}

// 時間入力フォーカス時の処理
function handleTimeFocus(event) {
    if (typeof event.target.select === 'function') {
        event.target.select();
    }
}

// 時間入力ブラー時の処理
function handleTimeBlur(event) {
    let value = event.target.value.replace(/[^\d]/g, '');
    event.target.value = value.padStart(2, '0');
    saveSettings().catch(error => console.error('Error in handleTimeBlur:', error));
}

// 自動計算の有効/無効設定
function setAutoCalcEnabled(enabled) {
    isAutoCalcEnabled = enabled;
    const autoCalcSwitch = document.querySelector('.setting:nth-child(4) input[type="checkbox"]');
    if (autoCalcSwitch) {
        autoCalcSwitch.checked = enabled;
    }
}

// インターバルの再計算
function recalculateIntervals() {
    // この関数の実装は現在のコードには含まれていないので、必要に応じて実装してください
    console.log('Recalculating intervals');
}

// インターバルリストの更新
function updateIntervalList() {
    console.log('Updating interval list');
    const intervalList = document.getElementById('interval-list');
    if (!intervalList) {
        console.error('Interval list element not found');
        return;
    }

    intervalList.innerHTML = '';

    if (!isIntervalsEnabled) {
        console.log('Intervals are disabled');
        return;
    }

    for (let i = 1; i <= intervalCount; i++) {
        const intervalItem = createIntervalItem(i);
        intervalList.appendChild(intervalItem);
    }

    updateIntervalSettings();
}

// インターバルアイテムの作成
function createIntervalItem(index) {
    console.log('Creating interval item', index);
    const intervalItem = document.createElement("div");
    intervalItem.classList.add("setting", "interval-item");

    const label = document.createElement("label");
    label.textContent = `${index}${getOrdinalSuffix(index)} Interval`;

    const timeInputContainer = document.createElement("div");
    timeInputContainer.classList.add("time-input-container");

    const minutesInput = createTimeInput("minutes", "00");
    const separator = createSeparator();
    const secondsInput = createTimeInput("seconds", "00");

    timeInputContainer.append(minutesInput, separator, secondsInput);
    intervalItem.append(label, timeInputContainer);

    [minutesInput, secondsInput].forEach(input => {
        input.addEventListener('input', handleIntervalItemInput);
        input.addEventListener('focus', handleTimeFocus);
        input.addEventListener('blur', handleIntervalItemBlur);
    });

    return intervalItem;
}

// 時間入力要素の作成
function createTimeInput(className, value) {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.classList.add("time-input", className);
    input.value = value;
    return input;
}

// セパレーターの作成
function createSeparator() {
    const separator = document.createElement("span");
    separator.classList.add("time-separator");
    separator.textContent = ":";
    return separator;
}

// インターバルアイテムの入力処理
function handleIntervalItemInput(event) {
    handleTimeInput(event);
    setAutoCalcEnabled(false);
}

// インターバルアイテムのブラー処理
function handleIntervalItemBlur(event) {
    handleTimeBlur(event);
    updateIntervalSettings();
}

// インターバル設定の更新
function updateIntervalSettings() {
    console.log('Updating interval settings');
    const isEnabled = document.querySelector('.setting:first-child input[type="checkbox"]').checked;
    console.log('Intervals enabled:', isEnabled);

    const intervals = Array.from(document.querySelectorAll('.interval-item')).map(item => {
        const inputs = item.querySelectorAll('.time-input');
        const minutes = parseInt(inputs[0].value, 10) || 0;
        const seconds = parseInt(inputs[1].value, 10) || 0;
        console.log('Interval item values:', minutes, seconds);
        return minutes * 60 + seconds;
    });

    console.log('Interval count:', intervalCount);
    console.log('Intervals:', intervals);

    window.electronAPI.updateIntervalSettings(isEnabled, intervalCount, intervals);
}

// 序数接尾辞の取得
function getOrdinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}

// 設定の保存
async function saveSettings() {
    try {
        const focusTimeMinutes = document.getElementById('focus-time-minutes');
        const focusTimeSeconds = document.getElementById('focus-time-seconds');
        const breakTimeMinutes = document.getElementById('break-time-minutes');
        const breakTimeSeconds = document.getElementById('break-time-seconds');
        const intervalTimeMinutes = document.getElementById('interval-time-minutes');
        const intervalTimeSeconds = document.getElementById('interval-time-seconds');

        if (!focusTimeMinutes || !focusTimeSeconds || !breakTimeMinutes || !breakTimeSeconds || !intervalTimeMinutes || !intervalTimeSeconds) {
            console.warn('Some elements are missing. Using current values.');
        }

        const settings = {
            focusTime: getTimeInSeconds(focusTimeMinutes, focusTimeSeconds),
            breakTime: getTimeInSeconds(breakTimeMinutes, breakTimeSeconds),
            intervalTime: getTimeInSeconds(intervalTimeMinutes, intervalTimeSeconds),
            intervalsEnabled: isIntervalsEnabled,
            intervalCount: intervalCount,
            isAutoCalcEnabled: isAutoCalcEnabled
        };

        const success = await window.electronAPI.saveSettings(settings);
        if (success) {
            console.log('Settings saved successfully');
        } else {
            console.error('Failed to save settings');
        }
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

// 秒単位での時間取得
function getTimeInSeconds(minutesElement, secondsElement) {
    const minutes = minutesElement ? parseInt(minutesElement.value, 10) || 0 : 0;
    const seconds = secondsElement ? parseInt(secondsElement.value, 10) || 0 : 0;
    return minutes * 60 + seconds;
}

function updatePauseButtonUI(isPaused) {
    const pauseIcon = document.getElementById('pause-icon');
    const playCircleIcon = document.getElementById('play-circle-icon');
    
    if (pauseIcon && playCircleIcon) {
        if (isPaused) {
            pauseIcon.style.display = 'none';
            playCircleIcon.style.display = 'block';
        } else {
            pauseIcon.style.display = 'block';
            playCircleIcon.style.display = 'none';
        }
    } else {
        console.error('Pause or play icon elements not found');
    }
}

function updatePauseResumeButton(isPaused, isTimerRunning) {
    const pauseIcon = document.getElementById('pause-icon');
    const playCircleIcon = document.getElementById('play-circle-icon');
    
    if (isTimerRunning) {
      if (isPaused) {
        pauseIcon.style.display = 'none';
        playCircleIcon.style.display = 'block';
      } else {
        pauseIcon.style.display = 'block';
        playCircleIcon.style.display = 'none';
      }
    } else {
      pauseIcon.style.display = 'block';
      playCircleIcon.style.display = 'none';
    }
  }

window.electronAPI.onUpdatePauseResumeButton((isPaused, isTimerRunning) => {
updatePauseResumeButton(isPaused, isTimerRunning);
});

// メインプロセスからタイマー更新情報を受け取った際の処理
window.electronAPI.updateTimer((data) => {
    console.log('Received timer update:', data); // デバッグ用ログ
    updateTimerDisplay(data.mainRemainingTime, data.miniRemainingTime);
});

// メイン画面初期化時に設定値を読み込んでタイマー表示を更新
async function initializeMainDisplay() {
    const settings = await window.electronAPI.getSettings();
    updateTimerDisplay(settings.focusTime, settings.intervalTime);
  }
  
  document.addEventListener('DOMContentLoaded', initializeMainDisplay);

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
window.electronAPI.onTimerPaused((isPaused) => {
    console.log('Timer paused state:', isPaused);
    updatePauseButtonUI(isPaused);
});

window.electronAPI.getCurrentTimerValues = () => ipcRenderer.invoke('get-current-timer-values');

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', initializeApp);

// デバッグ用
console.log('script.js loaded');