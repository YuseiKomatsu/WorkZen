// グローバル変数
// let isIntervalsEnabled = true;
// let intervalCount = 2;
// let isAutoCalcEnabled = true;

// DOMコンテンツロード時の初期化
// document.addEventListener("DOMContentLoaded", () => {
//   console.log('DOM fully loaded');
//   initializeTabs();
//   initializeNavigation();
//   initializeIntervalControls();
//   initializeTimerSettings();
//   initializeBackButton();
//   loadSettings();
//   loadCurrentSettings();
// });

// タブの初期化
// function initializeTabs() {
//   console.log('Initializing tabs');
//   const tabs = document.querySelectorAll(".tabbar .tab");
//   const tabContents = document.querySelectorAll(".tab-content");

//   tabs.forEach((tab) => {
//     tab.addEventListener("click", () => {
//       console.log('Tab clicked:', tab.getAttribute("data-tab"));
//       const targetId = tab.getAttribute("data-tab");
//       activateTab(tab, targetId, tabs, tabContents);
//     });
//   });

//   // 初期状態でBasicタブをアクティブにする
//   if (tabs.length > 0) {
//     const initialTab = tabs[0];
//     const initialTargetId = initialTab.getAttribute("data-tab");
//     activateTab(initialTab, initialTargetId, tabs, tabContents);
//   }
// }

// タブのアクティブ化
// function activateTab(clickedTab, targetId, allTabs, allContents) {
//   console.log('Activating tab:', targetId);

//   allTabs.forEach(t => t.classList.remove("active"));
//   clickedTab.classList.add("active");

//   allContents.forEach(content => {
//     if (content.id === targetId) {
//       content.classList.remove("hidden");
//       content.classList.add("active");
//       console.log('Activating content:', content.id);
//     } else {
//       content.classList.add("hidden");
//       content.classList.remove("active");
//     }
//   });

//   if (targetId === "intervals-content") {
//     updateIntervalList();
//   }
// }

// ナビゲーションの初期化
// function initializeNavigation() {
//   const navButtons = document.querySelectorAll('.nav-button');
//   const settingsContents = document.querySelectorAll('.settings-content');

//   navButtons.forEach(button => {
//     button.addEventListener('click', () => {
//       const targetId = button.getAttribute('data-target');
//       setActiveNavButton(button, navButtons);
//       showSettingsContent(targetId, settingsContents);
//       updateNavIcons();
//     });
//   });

//   // 初期状態のアイコンを設定
//   updateNavIcons();
// }

// // アクティブなナビゲーションボタンの設定
// function setActiveNavButton(activeButton, allButtons) {
//   allButtons.forEach((button) => {
//     button.classList.toggle("active", button === activeButton);
//     button.style.color = button === activeButton ? "#FFFFFF" : "#6C757D";
//   });
// }

// // 設定コンテンツの表示
// function showSettingsContent(targetId, allContents) {
//   allContents.forEach((content) => {
//     content.classList.toggle("hidden", content.id !== targetId);
//   });
// }

// インターバル制御の初期化
// function initializeIntervalControls() {
//   const enableIntervalsSwitch = document.querySelector(
//     '.setting:first-child input[type="checkbox"]'
//   );
//   const decrementButton = document.querySelector(".number-input .decrement");
//   const incrementButton = document.querySelector(".number-input .increment");
//   const autoCalcSwitch = document.querySelector(
//     '.setting:nth-child(4) input[type="checkbox"]'
//   );
//   const countDisplay = document.getElementById("interval-count-display");

//   if (countDisplay) {
//     countDisplay.textContent = intervalCount;
//   }

//   if (enableIntervalsSwitch) {
//     enableIntervalsSwitch.checked = isIntervalsEnabled;
//     enableIntervalsSwitch.addEventListener("change", (e) => {
//       isIntervalsEnabled = e.target.checked;
//       updateIntervalList();
//       saveSettings();
//     });
//   }

//   if (autoCalcSwitch) {
//     autoCalcSwitch.checked = isAutoCalcEnabled;
//     autoCalcSwitch.addEventListener("change", (e) => {
//       isAutoCalcEnabled = e.target.checked;
//       if (isAutoCalcEnabled) {
//         recalculateIntervals();
//       }
//       updateIntervalList();
//       saveSettings();
//     });
//   }

//   if (decrementButton && incrementButton) {
//     // 既存のイベントリスナーを削除
//     decrementButton.removeEventListener("click", decrementHandler);
//     incrementButton.removeEventListener("click", incrementHandler);

//     // 新しいイベントリスナーを追加
//     decrementButton.addEventListener("click", decrementHandler);
//     incrementButton.addEventListener("click", incrementHandler);
//   }

//   updateButtonColors();
// }

// ハンドラー関数を定義
// function decrementHandler() {
//   updateIntervalCount(-1);
// }

// function incrementHandler() {
//   updateIntervalCount(1);
// }


// タイマー設定の初期化
// function initializeTimerSettings() {
//   const timeInputs = document.querySelectorAll(".time-input");
//   timeInputs.forEach((input) => {
//     input.addEventListener("input", handleTimeInput);
//     input.addEventListener("focus", handleTimeFocus);
//     input.addEventListener("blur", handleTimeBlur);
//   });
// }

// 戻るボタンの初期化
// function initializeBackButton() {
//   const backButton = document.getElementById("back-button");
//   const mainWrapper = document.getElementById("main-wrapper");
//   const settingWrapper = document.getElementById("setting-wrapper");

//   if (backButton) {
//     backButton.addEventListener("click", () => {
//       mainWrapper.classList.remove("hidden");
//       settingWrapper.classList.add("hidden");
//     });
//   }

//   const settingsIcon = document.querySelector(".setting-toggle");
//   if (settingsIcon) {
//     settingsIcon.addEventListener("click", () => {
//       mainWrapper.classList.add("hidden");
//       settingWrapper.classList.remove("hidden");
//     });
//   }
// }

// // インターバル数の更新
// function updateIntervalCount(change) {
//   const newCount = Math.min(Math.max(intervalCount + change, 1), 10);
//   if (newCount !== intervalCount) {
//     intervalCount = newCount;
//     updateDisplay();
//     updateButtonColors();
//     if (isAutoCalcEnabled) {
//       recalculateIntervals();
//     }
//     saveSettings();
//   }
// }

// function recalculateIntervals() {

//   const focusTime = getTimeInSeconds(document.getElementById('focus-time-minutes'), document.getElementById('focus-time-seconds'));
//   const intervalTime = getTimeInSeconds(document.getElementById('interval-time-minutes'), document.getElementById('interval-time-seconds'));

//   const totalIntervalTime = intervalTime * intervalCount;
//   const remainingTime = focusTime - totalIntervalTime;
//   const segmentTime = Math.floor(remainingTime / (intervalCount + 1));

//   const intervalItems = document.querySelectorAll('.interval-item');
//   intervalItems.forEach((item, index) => {
//     const inputs = item.querySelectorAll('.time-input');
//     const intervalStart = segmentTime * (index + 1) + intervalTime * index;
//     inputs[0].value = Math.floor(intervalStart / 60).toString().padStart(2, '0');
//     inputs[1].value = (intervalStart % 60).toString().padStart(2, '0');
//   });

//   updateIntervalSettings();
// }

// ボタンの色更新
// function updateButtonColors() {
//   const decrementButton = document.querySelector(".number-input .decrement");
//   const incrementButton = document.querySelector(".number-input .increment");
//   const decrementSvg = decrementButton?.querySelector("svg path");
//   const incrementSvg = incrementButton?.querySelector("svg path");

//   if (decrementSvg && incrementSvg) {
//     decrementSvg.setAttribute(
//       "fill",
//       intervalCount === 1 ? "#6C757D" : "#FFFFFF"
//     );
//     incrementSvg.setAttribute(
//       "fill",
//       intervalCount === 10 ? "#6C757D" : "#FFFFFF"
//     );
//   }
// }

// 時間入力の処理
// function handleTimeInput(event) {
//   let value = event.target.value.replace(/[^\d]/g, "");
//   if (value.length > 2) {
//     value = value.slice(0, 2);
//   }
//   const numValue = parseInt(value, 10);
//   if (numValue > 59) {
//     value = "59";
//   }
//   event.target.value = value;

//   if (event.target.closest(".interval-item")) {
//     isAutoCalcEnabled = false;
//     const autoCalcSwitch = document.querySelector(
//       '.setting:nth-child(4) input[type="checkbox"]'
//     );
//     if (autoCalcSwitch) {
//       autoCalcSwitch.checked = false;
//     }
//   }
// }

// // 時間入力フォーカス時の処理
// function handleTimeFocus(event) {
//   if (typeof event.target.select === "function") {
//     event.target.select();
//   }
// }

// // 時間入力ブラー時の処理
// function handleTimeBlur(event) {
//   let value = event.target.value.replace(/[^\d]/g, "");
//   event.target.value = value.padStart(2, "0");
//   saveSettings();
// }

// インターバルリストの更新
// function updateIntervalList() {
//   const intervalList = document.getElementById("interval-list");
//   if (!intervalList) return;

//   intervalList.innerHTML = "";

//   if (!isIntervalsEnabled) return;

//   for (let i = 1; i <= intervalCount; i++) {
//     const intervalItem = createIntervalItem(i);
//     intervalList.appendChild(intervalItem);
//   }

//   updateIntervalSettings();
// }

// インターバルアイテムの作成
// function createIntervalItem(index) {
//   const intervalItem = document.createElement("div");
//   intervalItem.classList.add("setting", "interval-item");

//   const label = document.createElement("label");
//   label.textContent = `${index}${getOrdinalSuffix(index)} Interval`;

//   const timeInputContainer = document.createElement("div");
//   timeInputContainer.classList.add("time-input-container");

//   const minutesInput = createTimeInput("minutes", "00");
//   const separator = createSeparator();
//   const secondsInput = createTimeInput("seconds", "00");

//   timeInputContainer.append(minutesInput, separator, secondsInput);
//   intervalItem.append(label, timeInputContainer);

//   [minutesInput, secondsInput].forEach((input) => {
//     input.addEventListener("input", handleTimeInput);
//     input.addEventListener("focus", handleTimeFocus);
//     input.addEventListener("blur", handleTimeBlur);
//   });

//   return intervalItem;
// }

// // 時間入力要素の作成
// function createTimeInput(className, value) {
//   const input = document.createElement("input");
//   input.type = "text";
//   input.inputMode = "numeric";
//   input.pattern = "[0-9]*";
//   input.classList.add("time-input", className);
//   input.value = value;
//   return input;
// }

// // セパレーターの作成
// function createSeparator() {
//   const separator = document.createElement("span");
//   separator.classList.add("time-separator");
//   separator.textContent = ":";
//   return separator;
// }

// // インターバル設定の更新
// function updateIntervalSettings() {
//   const intervals = Array.from(document.querySelectorAll(".interval-item")).map(
//     (item) => {
//       const inputs = item.querySelectorAll(".time-input");
//       const minutes = parseInt(inputs[0].value, 10) || 0;
//       const seconds = parseInt(inputs[1].value, 10) || 0;
//       return minutes * 60 + seconds;
//     }
//   );

//   window.electronAPI.updateIntervalSettings(
//     isIntervalsEnabled,
//     intervalCount,
//     intervals
//   );
// }

// // 序数接尾辞の取得
// function getOrdinalSuffix(i) {
//   const j = i % 10,
//     k = i % 100;
//   if (j == 1 && k != 11) return "st";
//   if (j == 2 && k != 12) return "nd";
//   if (j == 3 && k != 13) return "rd";
//   return "th";
// }

// // 設定の保存
// async function saveSettings() {
//   try {
//     const settings = {
//       focusTime: getTimeInSeconds(document.getElementById('focus-time-minutes'), document.getElementById('focus-time-seconds')),
//       breakTime: getTimeInSeconds(document.getElementById('break-time-minutes'), document.getElementById('break-time-seconds')),
//       intervalTime: getTimeInSeconds(document.getElementById('interval-time-minutes'), document.getElementById('interval-time-seconds')),
//       intervalsEnabled: isIntervalsEnabled,
//       intervalCount: intervalCount,
//       isAutoCalcEnabled: isAutoCalcEnabled,
//       intervalTimes: getIntervalTimes()
//     };

//     const success = await window.electronAPI.saveSettings(settings);
//     if (success) {
//       console.log('Settings saved successfully:', settings);
//       await window.electronAPI.updateSettings(settings);
//     } else {
//       console.error('Failed to save settings');
//     }
//   } catch (error) {
//     console.error('Failed to save settings:', error);
//   }
// }

// // インターバル時間の取得
// function getIntervalTimes() {
//   return Array.from(document.querySelectorAll(".interval-item")).map((item) => {
//     const inputs = item.querySelectorAll(".time-input");
//     return getTimeInSeconds(inputs[0], inputs[1]);
//   });
// }

// // 設定の読み込み
// async function loadSettings() {
//   try {
//     const settings = await window.electronAPI.getSettings();
//     if (settings) {
//       updateTimerInputs("focus-time", settings.focusTime);
//       updateTimerInputs("break-time", settings.breakTime);
//       updateTimerInputs("interval-time", settings.intervalTime);
//       isIntervalsEnabled = settings.intervalsEnabled;
//       intervalCount = settings.intervalCount;
//       isAutoCalcEnabled = settings.isAutoCalcEnabled;

//       updateDisplay();
//       updateIntervalList();

//                   // Auto Calc がオンの場合、再計算を行う
//                   if (isAutoCalcEnabled) {
//                     recalculateIntervals();
//                 }
//     }
//   } catch (error) {
//     console.error("Failed to load settings:", error);
//   }
// }

// 現在の設定の読み込み
// async function loadCurrentSettings() {
//   try {
//     const settings = await window.electronAPI.getCurrentSettings();

//     updateTimerInputs("focus-time", settings.focusTime);
//     updateTimerInputs("break-time", settings.breakTime);
//     updateTimerInputs("interval-time", settings.intervalTime);

//     isIntervalsEnabled = settings.intervalsEnabled;
//     intervalCount = settings.intervalCount;
//     isAutoCalcEnabled = settings.isAutoCalcEnabled;

//     updateDisplay();
//     updateIntervalList();
//     updateIntervalTimes(settings.intervalTimes);

//     updateSwitches();
//   } catch (error) {
//     console.error("Failed to load current settings:", error);
//   }
// }

// タイマー入力の更新
// function updateTimerInputs(id, seconds) {
//   const minutesElement = document.getElementById(`${id}-minutes`);
//   const secondsElement = document.getElementById(`${id}-seconds`);

//   if (minutesElement) {
//     minutesElement.value = Math.floor(seconds / 60).toString().padStart(2, '0');
//   }
//   if (secondsElement) {
//     secondsElement.value = (seconds % 60).toString().padStart(2, '0');
//   }
// }

// // インターバル時間の更新
// function updateIntervalTimes(intervalTimes) {
//   const intervalItems = document.querySelectorAll(".interval-item");
//   intervalTimes.forEach((time, index) => {
//     if (intervalItems[index]) {
//       const inputs = intervalItems[index].querySelectorAll(".time-input");
//       inputs[0].value = Math.floor(time / 60)
//         .toString()
//         .padStart(2, "0");
//       inputs[1].value = (time % 60).toString().padStart(2, "0");
//     }
//   });
// }

// // スイッチの更新
// function updateSwitches() {
//   const enableIntervalsSwitch = document.querySelector(
//     '.setting:first-child input[type="checkbox"]'
//   );
//   if (enableIntervalsSwitch) {
//     enableIntervalsSwitch.checked = isIntervalsEnabled;
//   }

//   const autoCalcSwitch = document.querySelector(
//     '.setting:nth-child(4) input[type="checkbox"]'
//   );
//   if (autoCalcSwitch) {
//     autoCalcSwitch.checked = isAutoCalcEnabled;
//   }
// }

// 現在のタイマー値を読み込む
// async function loadCurrentTimerValues() {
//   try {
//     const timerValues = await window.electronAPI.getCurrentTimerValues();
//     window.electronAPI.updateTimer(timerValues);
//   } catch (error) {
//     console.error("Failed to load current timer values:", error);
//   }
// }

// // 秒単位での時間取得
// function getTimeInSeconds(minutesElement, secondsElement) {
//   const minutes = minutesElement ? parseInt(minutesElement.value, 10) || 0 : 0;
//   const seconds = secondsElement ? parseInt(secondsElement.value, 10) || 0 : 0;
//   return minutes * 60 + seconds;
// }

// // 表示の更新
// function updateDisplay() {
//   const countDisplay = document.getElementById("interval-count-display");
//   if (countDisplay) {
//     countDisplay.textContent = intervalCount;
//   }
//   updateIntervalList();
// }

// function updateNavIcons() {
//   const timerSettingsIcon = document.querySelector('.nav-icons [data-target="timer-settings"] svg');
//   const windowSettingsIcon = document.querySelector('.nav-icons [data-target="window-settings"] svg');
//   const activeContent = document.querySelector('.settings-content:not(.hidden)');

//   if (activeContent) {
//     if (activeContent.id === 'timer-settings') {
//       timerSettingsIcon.style.fill = '#FFFFFF';
//       windowSettingsIcon.style.fill = '#6C757D';
//     } else {
//       timerSettingsIcon.style.fill = '#6C757D';
//       windowSettingsIcon.style.fill = '#FFFFFF';
//     }
//   }
// }

console.log("settings.js loaded");