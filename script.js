// DOM要素の取得
const mainDisplay = document.getElementById('timer-display');
const miniDisplay = document.getElementById('timer-display-mini');
const startButton = document.getElementById('start-timer');
const stopButton = document.getElementById('stop-timer');
const pauseButton = document.getElementById('pause-timer');
const breakButton = document.getElementById('break-timer');

let isIntervalsEnabled = true;
let intervalCount = 2;
let isAutoCalcEnabled = true;

// 初期化関数
async function initializeApp() {
    console.log('Initializing app');
    initializeTimerDisplay();
    initializeIntervalControls();
    initializeTimerSettings();
    initializeBackButton();
    initializeTabs();
    initializeNavigation();
    fetchStretches();
    await loadCurrentSettings();
    await loadSettings();
}

// タイマー表示を初期化する関数
function initializeTimerDisplay() {
    updateTimerDisplay(0, 0);
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

async function updateMainScreenDisplay() {
    try {
        const settings = await window.electronAPI.getSettings();
        if (settings && typeof settings.focusTime !== 'undefined' && typeof settings.intervalTime !== 'undefined') {
            updateTimerDisplay(settings.focusTime, settings.intervalTime);
        } else {
            console.warn('Invalid settings received:', settings);
            updateTimerDisplay(0, 0);  // デフォルト値を表示
        }
    } catch (error) {
        console.error('Failed to update main screen display:', error);
        updateTimerDisplay(0, 0);  // エラー時もデフォルト値を表示
    }
}

// 秒数を MM:SS 形式の文字列に変換する関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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

// メインプロセスからタイマー更新情報を受け取った際の処理
window.electronAPI.updateTimer((data) => {
    console.log('Received timer update:', data);
    updateTimerDisplay(data.mainRemainingTime, data.miniRemainingTime);
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
window.electronAPI.onTimerPaused((isPaused) => {
    console.log('Timer paused state:', isPaused);
    updatePauseButtonUI(isPaused);
});

window.electronAPI.onUpdatePauseResumeButton((isPaused, isTimerRunning) => {
    updatePauseResumeButton(isPaused, isTimerRunning);
});

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateMainScreenDisplay();
});

// タブの初期化
function initializeTabs() {
    console.log('Initializing tabs');
    const tabs = document.querySelectorAll(".tabbar .tab");
    const tabContents = document.querySelectorAll(".tab-content");
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        console.log('Tab clicked:', tab.getAttribute("data-tab"));
        const targetId = tab.getAttribute("data-tab");
        activateTab(tab, targetId, tabs, tabContents);
      });
    });
  
    // 初期状態でBasicタブをアクティブにする
    if (tabs.length > 0) {
      const initialTab = tabs[0];
      const initialTargetId = initialTab.getAttribute("data-tab");
      activateTab(initialTab, initialTargetId, tabs, tabContents);
    }
}

// タブのアクティブ化
function activateTab(clickedTab, targetId, allTabs, allContents) {
    console.log('Activating tab:', targetId);
  
    allTabs.forEach(t => t.classList.remove("active"));
    clickedTab.classList.add("active");
  
    allContents.forEach(content => {
      if (content.id === targetId) {
        content.classList.remove("hidden");
        content.classList.add("active");
        console.log('Activating content:', content.id);
      } else {
        content.classList.add("hidden");
        content.classList.remove("active");
      }
    });
  
    if (targetId === "intervals-content") {
      updateIntervalList();
    }
}

// ナビゲーションの初期化
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');
    const settingsContents = document.querySelectorAll('.settings-content');
  
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        setActiveNavButton(button, navButtons);
        showSettingsContent(targetId, settingsContents);
        updateNavIcons();
      });
    });
  
    // 初期状態のアイコンを設定
    updateNavIcons();
}

// アクティブなナビゲーションボタンの設定
function setActiveNavButton(activeButton, allButtons) {
    allButtons.forEach((button) => {
      button.classList.toggle("active", button === activeButton);
      button.style.color = button === activeButton ? "#FFFFFF" : "#6C757D";
    });
}

// 設定コンテンツの表示
function showSettingsContent(targetId, allContents) {
    allContents.forEach((content) => {
      content.classList.toggle("hidden", content.id !== targetId);
    });
}

function updateNavIcons() {
    const timerSettingsIcon = document.querySelector('.nav-icons [data-target="timer-settings"] svg');
    const windowSettingsIcon = document.querySelector('.nav-icons [data-target="window-settings"] svg');
    const activeContent = document.querySelector('.settings-content:not(.hidden)');
  
    if (activeContent) {
      if (activeContent.id === 'timer-settings') {
        timerSettingsIcon.style.fill = '#FFFFFF';
        windowSettingsIcon.style.fill = '#6C757D';
      } else {
        timerSettingsIcon.style.fill = '#6C757D';
        windowSettingsIcon.style.fill = '#FFFFFF';
      }
    }
}

// 戻るボタンの初期化
function initializeBackButton() {
    const backButton = document.getElementById("back-button");
    const mainWrapper = document.getElementById("main-wrapper");
    const settingWrapper = document.getElementById("setting-wrapper");
  
    if (backButton) {
      backButton.addEventListener("click", () => {
        mainWrapper.classList.remove("hidden");
        settingWrapper.classList.add("hidden");
      });
    }
  
    const settingsIcon = document.querySelector(".setting-toggle");
    if (settingsIcon) {
      settingsIcon.addEventListener("click", () => {
        mainWrapper.classList.add("hidden");
        settingWrapper.classList.remove("hidden");
      });
    }
}

// インターバル制御の初期化
function initializeIntervalControls() {
    const enableIntervalsSwitch = document.getElementById('enable-intervals');
    const decrementButton = document.querySelector(".number-input .decrement");
    const incrementButton = document.querySelector(".number-input .increment");
    const autoCalcSwitch = document.getElementById('auto-calc-switch');
    const countDisplay = document.getElementById("interval-count-display");
  
    if (countDisplay) {
      countDisplay.textContent = intervalCount;
    }
  
    if (enableIntervalsSwitch) {
      enableIntervalsSwitch.checked = isIntervalsEnabled;
      enableIntervalsSwitch.addEventListener("change", (e) => {
        isIntervalsEnabled = e.target.checked;
        updateIntervalList();
        saveSettings();
      });
    }
  
    if (autoCalcSwitch) {
        autoCalcSwitch.checked = isAutoCalcEnabled;
        autoCalcSwitch.addEventListener("change", (e) => {
          isAutoCalcEnabled = e.target.checked;
          updateIntervalList();  // This will handle both auto-calc and manual modes
          updateDisplay();
          saveSettings();
        });
      }
  
    if (decrementButton && incrementButton) {
      // 既存のイベントリスナーを削除
      decrementButton.removeEventListener("click", decrementHandler);
      incrementButton.removeEventListener("click", incrementHandler);
  
      // 新しいイベントリスナーを追加
      decrementButton.addEventListener("click", decrementHandler);
      incrementButton.addEventListener("click", incrementHandler);
    }
  
    updateButtonColors();
}

// ハンドラー関数を定義
function decrementHandler() {
    updateIntervalCount(-1);
}

function incrementHandler() {
    updateIntervalCount(1);
}

// インターバル数の更新
function updateIntervalCount(change) {
    const newCount = Math.min(Math.max(intervalCount + change, 1), 10);
    if (newCount !== intervalCount) {
      intervalCount = newCount;
      updateDisplay();
      updateButtonColors();
      if (isAutoCalcEnabled) {
        recalculateIntervals();
      }
      saveSettings();
    }
}

// ボタンの色更新
function updateButtonColors() {
    const decrementButton = document.querySelector(".number-input .decrement");
    const incrementButton = document.querySelector(".number-input .increment");
    const decrementSvg = decrementButton?.querySelector("svg path");
    const incrementSvg = incrementButton?.querySelector("svg path");
  
    if (decrementSvg && incrementSvg) {
      decrementSvg.setAttribute(
        "fill",
        intervalCount === 1 ? "#6C757D" : "#FFFFFF"
      );
      incrementSvg.setAttribute(
        "fill",
        intervalCount === 10 ? "#6C757D" : "#FFFFFF"
      );
    }
}

// インターバルリストの更新
function updateIntervalList() {
    const intervalList = document.getElementById("interval-list");
    if (!intervalList) return;
  
    intervalList.innerHTML = "";
  
    if (!isIntervalsEnabled) return;
  
    let intervalTimes;
    if (isAutoCalcEnabled) {
      intervalTimes = recalculateIntervals();
    } else {
      intervalTimes = getIntervalTimes();
    }
  
    // Sort intervals in descending order
    intervalTimes.sort((a, b) => b - a);
  
    intervalTimes.forEach((time, index) => {
      const intervalItem = createIntervalItem(index + 1, time);
      intervalList.appendChild(intervalItem);
    });
  
    updateIntervalSettings();
  }

// 設定の保存
async function saveSettings() {
    try {
      const settings = {
        focusTime: getTimeInSeconds(document.getElementById('focus-time-minutes'), document.getElementById('focus-time-seconds')),
        breakTime: getTimeInSeconds(document.getElementById('break-time-minutes'), document.getElementById('break-time-seconds')),
        intervalTime: getTimeInSeconds(document.getElementById('interval-time-minutes'), document.getElementById('interval-time-seconds')),
        intervalsEnabled: isIntervalsEnabled,
        intervalCount: intervalCount,
        isAutoCalcEnabled: isAutoCalcEnabled,
        intervalTimes: getIntervalTimes()
      };
  
      const success = await window.electronAPI.saveSettings(settings);
      if (success) {
        console.log('Settings saved successfully:', settings);
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
}

// 設定の読み込み
async function loadSettings() {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings) {
        updateTimerInputs("focus-time", settings.focusTime);
        updateTimerInputs("break-time", settings.breakTime);
        updateTimerInputs("interval-time", settings.intervalTime);
        isIntervalsEnabled = settings.intervalsEnabled;
        intervalCount = settings.intervalCount;
        isAutoCalcEnabled = settings.isAutoCalcEnabled;
  
        updateDisplay();
        updateIntervalList();
  
        if (isAutoCalcEnabled) {
          recalculateIntervals();
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
}

function recalculateIntervals() {
    if (!isAutoCalcEnabled) return;
  
    const focusTime = getTimeInSeconds(document.getElementById('focus-time-minutes'), document.getElementById('focus-time-seconds'));
    const intervalTime = getTimeInSeconds(document.getElementById('interval-time-minutes'), document.getElementById('interval-time-seconds'));
  
    const totalIntervalTime = intervalTime * intervalCount;
    const remainingTime = focusTime - totalIntervalTime;
    const segmentTime = Math.floor(remainingTime / (intervalCount + 1));
  
    let intervalTimes = [];
    for (let i = 0; i < intervalCount; i++) {
      const intervalStart = focusTime - (segmentTime * (i + 1) + intervalTime * i);
      intervalTimes.push(intervalStart);
    }
  
    // Sort intervals in descending order
    intervalTimes.sort((a, b) => b - a);
  
    return intervalTimes;
  }

// 現在の設定の読み込み
async function loadCurrentSettings() {
    try {
        const settings = await window.electronAPI.getCurrentSettings();
        if (settings) {
            // 設定を適用
            updateTimerInputs("focus-time", settings.focusTime);
            updateTimerInputs("break-time", settings.breakTime);
            updateTimerInputs("interval-time", settings.intervalTime);

            isIntervalsEnabled = settings.intervalsEnabled;
            intervalCount = settings.intervalCount;
            isAutoCalcEnabled = settings.isAutoCalcEnabled;

            updateDisplay();
            updateIntervalList();
            updateIntervalTimes(settings.intervalTimes);

            updateSwitches();
        } else {
            console.warn('No settings received from getCurrentSettings');
        }
    } catch (error) {
        console.error("Failed to load current settings:", error);
    }
}

// タイマー入力の更新
function updateTimerInputs(id, seconds) {
    const minutesElement = document.getElementById(`${id}-minutes`);
    const secondsElement = document.getElementById(`${id}-seconds`);
  
    if (minutesElement) {
      minutesElement.value = Math.floor(seconds / 60).toString().padStart(2, '0');
    }
    if (secondsElement) {
      secondsElement.value = (seconds % 60).toString().padStart(2, '0');
    }
}

// インターバル時間の更新
function updateIntervalTimes(intervalTimes) {
    const intervalItems = document.querySelectorAll(".interval-item");
    intervalTimes.forEach((time, index) => {
      if (intervalItems[index]) {
        const inputs = intervalItems[index].querySelectorAll(".time-input");
        inputs[0].value = Math.floor(time / 60)
          .toString()
          .padStart(2, "0");
        inputs[1].value = (time % 60).toString().padStart(2, "0");
      }
    });
}

// スイッチの更新
function updateSwitches() {
    const enableIntervalsSwitch = document.querySelector(
      '.setting:first-child input[type="checkbox"]'
    );
    if (enableIntervalsSwitch) {
      enableIntervalsSwitch.checked = isIntervalsEnabled;
    }
  
    const autoCalcSwitch = document.querySelector(
      '.setting:nth-child(4) input[type="checkbox"]'
    );
    if (autoCalcSwitch) {
      autoCalcSwitch.checked = isAutoCalcEnabled;
    }
}

// 表示の更新
function updateDisplay() {
    const countDisplay = document.getElementById("interval-count-display");
    if (countDisplay) {
      countDisplay.textContent = intervalCount;
    }
    updateIntervalList();
}

// タイマー設定の初期化
function initializeTimerSettings() {
    const timeInputs = document.querySelectorAll(".time-input");
    timeInputs.forEach((input) => {
      input.addEventListener("input", handleTimeInput);
      input.addEventListener("focus", handleTimeFocus);
      input.addEventListener("blur", handleTimeBlur);
    });
}

// 時間入力の処理
function handleTimeInput(event) {
    let value = event.target.value.replace(/[^\d]/g, "");
    if (value.length > 2) {
      value = value.slice(0, 2);
    }
    const numValue = parseInt(value, 10);
    if (numValue > 59) {
      value = "59";
    }
    event.target.value = value;
  
    if (event.target.closest(".interval-item")) {
      isAutoCalcEnabled = false;
      const autoCalcSwitch = document.querySelector(
        '.setting:nth-child(4) input[type="checkbox"]'
      );
      if (autoCalcSwitch) {
        autoCalcSwitch.checked = false;
      }
    }
}

// インターバルアイテムの作成
function createIntervalItem(index, time) {
    const intervalItem = document.createElement("div");
    intervalItem.classList.add("setting", "interval-item");
  
    const label = document.createElement("label");
    label.textContent = `${index}${getOrdinalSuffix(index)} Interval at`;
  
    const timeInputContainer = document.createElement("div");
    timeInputContainer.classList.add("time-input-container");
  
    const minutesInput = createTimeInput("minutes", Math.floor(time / 60).toString().padStart(2, '0'));
    const separator = createSeparator();
    const secondsInput = createTimeInput("seconds", (time % 60).toString().padStart(2, '0'));
  
    timeInputContainer.append(minutesInput, separator, secondsInput);
    intervalItem.append(label, timeInputContainer);
  
    [minutesInput, secondsInput].forEach((input) => {
      input.addEventListener("input", handleTimeInput);
      input.addEventListener("focus", handleTimeFocus);
      input.addEventListener("blur", handleIntervalTimeBlur);
    });
  
    return intervalItem;
  }

  function handleIntervalTimeBlur(event) {
    let value = event.target.value.replace(/[^\d]/g, "");
    event.target.value = value.padStart(2, "0");
    
    if (isAutoCalcEnabled) {
      isAutoCalcEnabled = false;
      const autoCalcSwitch = document.getElementById('auto-calc-switch');
      if (autoCalcSwitch) {
        autoCalcSwitch.checked = false;
      }
    }
    
    updateIntervalList();  // Add this line to ensure the list is updated
    saveSettings();
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

// インターバル設定の更新
function updateIntervalSettings() {
    const intervals = Array.from(document.querySelectorAll(".interval-item")).map(
      (item) => {
        const inputs = item.querySelectorAll(".time-input");
        const minutes = parseInt(inputs[0].value, 10) || 0;
        const seconds = parseInt(inputs[1].value, 10) || 0;
        return minutes * 60 + seconds;
      }
    );
  
    window.electronAPI.updateIntervalSettings(
      isIntervalsEnabled,
      intervalCount,
      intervals
    );
}

// 序数接尾辞の取得
function getOrdinalSuffix(i) {
    const j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}

// インターバル時間の取得
function getIntervalTimes() {
    return Array.from(document.querySelectorAll(".interval-item")).map((item) => {
      const inputs = item.querySelectorAll(".time-input");
      return getTimeInSeconds(inputs[0], inputs[1]);
    });
}

// 秒単位での時間取得
function getTimeInSeconds(minutesElement, secondsElement) {
    const minutes = minutesElement ? parseInt(minutesElement.value, 10) || 0 : 0;
    const seconds = secondsElement ? parseInt(secondsElement.value, 10) || 0 : 0;
    return minutes * 60 + seconds;
}

// 時間入力フォーカス時の処理
function handleTimeFocus(event) {
    if (typeof event.target.select === "function") {
      event.target.select();
    }
}

// 時間入力ブラー時の処理
function handleTimeBlur(event) {
    let value = event.target.value.replace(/[^\d]/g, "");
    event.target.value = value.padStart(2, "0");
    saveSettings();
}

console.log('script.js loaded');