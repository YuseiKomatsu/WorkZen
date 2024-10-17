// グローバル設定オブジェクト
let appSettings = {
    focusTime: 52 * 60,
    breakTime: 17 * 60,
    intervalTime: 5 * 60,
    intervalsEnabled: true,
    intervalCount: 2,
    isAutoCalcEnabled: true,
    intervalTimes: []
};

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
    await loadCurrentSettings();
    initializeIntervalControls();
    initializeIntervalCountControls();
    initializeTimerSettings();
    initializeBackButton();
    initializeTabs();
    initializeNavigation();
    fetchStretches();
    await loadSettings();
    updateUIFromSettings();
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

// タイマーが停止されたときの処理を追加
window.electronAPI.onTimerStopped(() => {
  console.log('Timer stopped');
  updateMainScreenDisplay();
});

// ボタンのクリックイベントリスナー
stopButton.addEventListener('click', () => {
  console.log('Stop button clicked');
  window.electronAPI.stopTimer();
});

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateMainScreenDisplay();
    initializeNavigation();
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
    allButtons.forEach(button => {
      button.classList.toggle('active', button === activeButton);
      button.style.color = button === activeButton ? "#FFFFFF" : "#6C757D";
    });
  }

// 設定コンテンツの表示
function showSettingsContent(targetId, allContents) {
    allContents.forEach((content) => {
      content.classList.toggle("hidden", content.id !== targetId);
    });
}

function updateNavIcons(activeContentId) {
    const timerSettingsIcon = document.querySelector('.nav-icons [data-target="timer-settings"] svg');
    const windowSettingsIcon = document.querySelector('.nav-icons [data-target="window-settings"] svg');
  
    if (timerSettingsIcon && windowSettingsIcon) {
      if (activeContentId === 'timer-settings') {
        timerSettingsIcon.style.fill = '#FFFFFF';
        windowSettingsIcon.style.fill = '#6C757D';
      } else {
        timerSettingsIcon.style.fill = '#6C757D';
        windowSettingsIcon.style.fill = '#FFFFFF';
      }
    }
  }  

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');
    const settingsContents = document.querySelectorAll('.settings-content');
  
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        setActiveNavButton(button, navButtons);
        showSettingsContent(targetId, settingsContents);
        updateNavIcons(targetId);
      });
    });
  
    // 初期状態でタイマー設定を選択状態にする
    const initialButton = document.querySelector('.nav-button[data-target="timer-settings"]');
    if (initialButton) {
      setActiveNavButton(initialButton, navButtons);
      showSettingsContent('timer-settings', settingsContents);
      updateNavIcons('timer-settings');
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
    const autoCalcSwitch = document.getElementById('auto-calc-switch');
    const countDisplay = document.getElementById("interval-count-display");

    if (countDisplay) {
        countDisplay.textContent = appSettings.intervalCount;
    }

    if (enableIntervalsSwitch) {
        enableIntervalsSwitch.checked = appSettings.intervalsEnabled;
        enableIntervalsSwitch.addEventListener("change", (e) => {
            appSettings.intervalsEnabled = e.target.checked;
            updateIntervalList();
            updateSettings();
        });
    }

    if (autoCalcSwitch) {
        autoCalcSwitch.checked = appSettings.isAutoCalcEnabled;
        autoCalcSwitch.addEventListener("change", handleAutoCalcToggle);
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
  console.log('Updating interval count', appSettings.intervalCount, change);
  const newCount = Math.min(Math.max(appSettings.intervalCount + change, 1), 10);
  if (newCount !== appSettings.intervalCount) {
      appSettings.intervalCount = newCount;
      if (appSettings.isAutoCalcEnabled) {
          recalculateIntervals();
      } else {
          // AutoCalcがFalseの場合、intervalTimesの長さを調整
          appSettings.intervalTimes = appSettings.intervalTimes.slice(0, newCount);
          while (appSettings.intervalTimes.length < newCount) {
              appSettings.intervalTimes.push(0);
          }
      }
      updateDisplay();
      updateButtonColors();
      saveSettings();
  }
}

function initializeIntervalCountControls() {
  const decrementButton = document.querySelector('.number-input .decrement');
  const incrementButton = document.querySelector('.number-input .increment');

  if (decrementButton) {
      decrementButton.addEventListener('click', () => updateIntervalCount(-1));
  } else {
      console.error('Decrement button not found');
  }

  if (incrementButton) {
      incrementButton.addEventListener('click', () => updateIntervalCount(1));
  } else {
      console.error('Increment button not found');
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
      appSettings.intervalCount === 1 ? "#6C757D" : "#FFFFFF"
    );
    incrementSvg.setAttribute(
      "fill",
      appSettings.intervalCount === 10 ? "#6C757D" : "#FFFFFF"
    );
  }
}

// インターバルリストの更新
function updateIntervalList() {
  const intervalList = document.getElementById("interval-list");
  if (!intervalList) return;

  intervalList.innerHTML = "";

  if (!appSettings.intervalsEnabled) {
      intervalList.style.visibility = 'hidden';
      return;
  }

  intervalList.style.visibility = 'visible';

  let intervalTimes = appSettings.intervalTimes || [];
  if (appSettings.isAutoCalcEnabled || !Array.isArray(intervalTimes) || intervalTimes.length === 0) {
      intervalTimes = recalculateIntervals();
      appSettings.intervalTimes = intervalTimes;  // 自動計算結果を保存
  }

  // インターバル数に合わせてリストを更新
  for (let i = 0; i < appSettings.intervalCount; i++) {
      const time = intervalTimes[i] || 0; // インターバル時間が未定義の場合は0を使用
      const intervalItem = createIntervalItem(i + 1, time);
      intervalList.appendChild(intervalItem);
  }

  console.log(`Updated interval list. Count: ${appSettings.intervalCount}, Times: ${JSON.stringify(intervalTimes)}`);
}


// UIからintervalTimesを取得する関数
function getIntervalTimesFromUI() {
    const intervalItems = document.querySelectorAll(".interval-item");
    return Array.from(intervalItems).map(item => {
        const inputs = item.querySelectorAll(".time-input");
        const minutes = parseInt(inputs[0].value, 10) || 0;
        const seconds = parseInt(inputs[1].value, 10) || 0;
        return minutes * 60 + seconds;
    });
}

// 設定の保存
async function saveSettings() {
  try {
      const updatedSettings = await window.electronAPI.saveSettings(appSettings);
      appSettings = updatedSettings;
      updateUIFromSettings();
      console.log('Settings saved successfully:', updatedSettings);
  } catch (error) {
      console.error('Failed to save settings:', error);
  }
}

// 設定の読み込み
async function loadSettings() {
    try {
        const settings = await window.electronAPI.getSettings();
        if (settings) {
            appSettings = { ...appSettings, ...settings };
            updateDisplay();
        }
    } catch (error) {
        console.error("Failed to load settings:", error);
    }
}

// 設定を更新する関数
function updateSettings() {
  const settings = {
      ...appSettings,
      focusTime: getTimeInSeconds(document.getElementById('focus-time-minutes'), document.getElementById('focus-time-seconds')),
      breakTime: getTimeInSeconds(document.getElementById('break-time-minutes'), document.getElementById('break-time-seconds')),
      intervalTime: getTimeInSeconds(document.getElementById('interval-time-minutes'), document.getElementById('interval-time-seconds')),
  };

  if (settings.isAutoCalcEnabled) {
      settings.intervalTimes = recalculateIntervals();
  }

  window.electronAPI.saveSettings(settings).then(updatedSettings => {
      appSettings = updatedSettings;
      updateUIFromSettings();
      console.log('Settings saved successfully:', updatedSettings);
  }).catch(error => {
      console.error('Failed to save settings:', error);
  });
}

function recalculateIntervals() {
    const focusTime = appSettings.focusTime;
    const intervalTime = appSettings.intervalTime;
    const intervalCount = appSettings.intervalCount;

    const totalIntervalTime = intervalTime * intervalCount;
    const remainingTime = focusTime - totalIntervalTime;
    const segmentTime = Math.floor(remainingTime / (intervalCount + 1));

    return Array.from({length: intervalCount}, (_, i) => {
        return focusTime - (segmentTime * (i + 1) + intervalTime * i);
    }).sort((a, b) => b - a);
}

// 現在の設定の読み込み
async function loadCurrentSettings() {
    try {
        const settings = await window.electronAPI.getCurrentSettings();
        if (settings) {
            appSettings = { ...appSettings, ...settings };
            isIntervalsEnabled = appSettings.intervalsEnabled;
            intervalCount = appSettings.intervalCount;
            isAutoCalcEnabled = appSettings.isAutoCalcEnabled;
            updateDisplay();
        }
    } catch (error) {
        console.error("Failed to load current settings:", error);
    }
}

// UIを設定から更新する関数
function updateUIFromSettings() {
  updateTimerDisplay(appSettings.focusTime, appSettings.intervalTime);
  updateTimerInputs("focus-time", appSettings.focusTime);
  updateTimerInputs("break-time", appSettings.breakTime);
  updateTimerInputs("interval-time", appSettings.intervalTime);

  const enableIntervalsSwitch = document.getElementById('enable-intervals');
  if (enableIntervalsSwitch) {
      enableIntervalsSwitch.checked = appSettings.intervalsEnabled;
  }

  const autoCalcSwitch = document.getElementById('auto-calc-switch');
  if (autoCalcSwitch) {
      autoCalcSwitch.checked = appSettings.isAutoCalcEnabled;
  }

  updateIntervalList();
  updateDisplay();
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

function handleAutoCalcToggle(event) {
    appSettings.isAutoCalcEnabled = event.target.checked;
    if (appSettings.isAutoCalcEnabled) {
        appSettings.intervalTimes = recalculateIntervals();
    }
    updateIntervalList();
    updateSettings();
}

// 表示の更新
function updateDisplay() {
  console.log('Updating display', appSettings.intervalCount);
  const countDisplay = document.getElementById("interval-count-display");
  if (countDisplay) {
      countDisplay.textContent = appSettings.intervalCount;
  } else {
      console.error('Count display element not found');
  }
  updateIntervalList();
  updateButtonColors();
}

// タイマー設定の初期化
function initializeTimerSettings() {
  const timeInputs = document.querySelectorAll(".time-input");
  timeInputs.forEach((input) => {
      input.addEventListener("input", handleTimeInput);
      input.addEventListener("focus", handleTimeFocus);
      input.addEventListener("blur", handleTimeBlur);
  });

  // フォーカス時間の入力フィールドにイベントリスナーを追加
  const focusTimeInputs = document.querySelectorAll("#focus-time-minutes, #focus-time-seconds");
  focusTimeInputs.forEach(input => {
      input.addEventListener("blur", handleFocusTimeBlur);
  });

  // ブレイク時間の入力フィールドにイベントリスナーを追加
  const breakTimeInputs = document.querySelectorAll("#break-time-minutes, #break-time-seconds");
  breakTimeInputs.forEach(input => {
      input.addEventListener("blur", handleBreakTimeBlur);
  });

  // インターバル時間の入力フィールドにイベントリスナーを追加
  const intervalTimeInputs = document.querySelectorAll("#interval-time-minutes, #interval-time-seconds");
  intervalTimeInputs.forEach(input => {
      input.addEventListener("blur", handleGlobalIntervalTimeBlur);
  });

  // インターバルアイテムの時間入力フィールドにイベントリスナーを追加
  document.getElementById('interval-list').addEventListener('blur', (event) => {
      if (event.target.classList.contains('time-input')) {
          handleIntervalItemBlur(event);
      }
  }, true);
}

function handleGlobalIntervalTimeBlur() {
  const minutes = parseInt(document.getElementById("interval-time-minutes").value, 10) || 0;
  const seconds = parseInt(document.getElementById("interval-time-seconds").value, 10) || 0;
  appSettings.intervalTime = minutes * 60 + seconds;
  updateSettings();
}

function handleFocusTimeBlur() {
    const minutes = parseInt(document.getElementById("focus-time-minutes").value, 10) || 0;
    const seconds = parseInt(document.getElementById("focus-time-seconds").value, 10) || 0;
    appSettings.focusTime = minutes * 60 + seconds;
    updateSettings();
}

function handleBreakTimeBlur() {
    const minutes = parseInt(document.getElementById("break-time-minutes").value, 10) || 0;
    const seconds = parseInt(document.getElementById("break-time-seconds").value, 10) || 0;
    appSettings.breakTime = minutes * 60 + seconds;
    updateSettings();
}

function handleIntervalItemBlur(event) {
  const intervalItem = event.target.closest('.interval-item');
  if (intervalItem) {
      const inputs = intervalItem.querySelectorAll('.time-input');
      const minutes = parseInt(inputs[0].value, 10) || 0;
      const seconds = parseInt(inputs[1].value, 10) || 0;
      const totalSeconds = minutes * 60 + seconds;

      const index = Array.from(intervalItem.parentNode.children).indexOf(intervalItem);
      if (index !== -1) {
          appSettings.intervalTimes[index] = totalSeconds;
          appSettings.isAutoCalcEnabled = false;
          updateAutoCalcSwitch();
          updateSettings();
      }
  }
}

function updateAutoCalcSwitch() {
  const autoCalcSwitch = document.getElementById('auto-calc-switch');
  if (autoCalcSwitch) {
      autoCalcSwitch.checked = appSettings.isAutoCalcEnabled;
  }
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
    let value;
    if (event && event.target) {
        value = event.target.value.replace(/[^\d]/g, "");
        event.target.value = value.padStart(2, "0");
    }
    
    if (appSettings.isAutoCalcEnabled) {
        appSettings.isAutoCalcEnabled = false;
        const autoCalcSwitch = document.getElementById('auto-calc-switch');
        if (autoCalcSwitch) {
            autoCalcSwitch.checked = false;
        }
    }
    
    // 現在のインターバルタイムを取得して更新
    appSettings.intervalTimes = getIntervalTimesFromUI();
    
    updateSettings();
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
async function updateIntervalSettings() {
    const intervals = Array.from(document.querySelectorAll(".interval-item")).map(
        (item) => {
            const inputs = item.querySelectorAll(".time-input");
            const minutes = parseInt(inputs[0].value, 10) || 0;
            const seconds = parseInt(inputs[1].value, 10) || 0;
            return minutes * 60 + seconds;
        }
    );

    try {
        await window.electronAPI.updateIntervalSettings(
            isIntervalsEnabled,
            intervalCount,
            intervals,
            isAutoCalcEnabled
        );
        console.log('Interval settings updated successfully');
    } catch (error) {
        console.error('Failed to update interval settings:', error);
    }
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
  if (!event || !event.target) return;

  let value = event.target.value.replace(/[^\d]/g, "");
  event.target.value = value.padStart(2, "0");

  if (event.target.closest("#focus-time-minutes, #focus-time-seconds")) {
      handleFocusTimeBlur();
  } else if (event.target.closest("#break-time-minutes, #break-time-seconds")) {
      handleBreakTimeBlur();
  } else if (event.target.closest("#interval-time-minutes, #interval-time-seconds")) {
      handleGlobalIntervalTimeBlur();
  } else if (event.target.closest(".interval-item")) {
      handleIntervalItemBlur(event);
  }
}

// Auto Calc スイッチのイベントリスナーを設定
const autoCalcSwitch = document.getElementById('auto-calc-switch');
if (autoCalcSwitch) {
    autoCalcSwitch.addEventListener("change", handleAutoCalcToggle);
}

console.log('script.js loaded');