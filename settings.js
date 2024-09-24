let intervalCount = 2;
let isIntervalsEnabled = true;
let isAutoCalcEnabled = true;

document.addEventListener("DOMContentLoaded", () => {
  initializeTabs();
  initializeNavigation();
  initializeIntervalControls();
  initializeTimerDisplay();
  initializeTimerSettings();
  initializeBackButton();
  initializeTimerButtons();
  updateDisplay();
});

function initializeTabs() {
  const tabs = document.querySelectorAll(".tabbar .tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");
      activateTab(tab, targetId, tabs, tabContents);
    });
  });
}

function activateTab(clickedTab, targetId, allTabs, allContents) {
  allTabs.forEach(t => t.classList.remove("active"));
  clickedTab.classList.add("active");

  allContents.forEach(content => {
    if (content.id === targetId) {
      content.classList.remove("hidden");
      content.classList.add("active");
      if (targetId === "intervals-content") {
        updateIntervalList();
      }
    } else {
      content.classList.add("hidden");
      content.classList.remove("active");
    }
  });
}

function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-button');
  const settingsContents = document.querySelectorAll('.settings-content');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      setActiveNavButton(button, navButtons);
      showSettingsContent(targetId, settingsContents);
    });
  });

  if (navButtons.length > 0) {
    const initialActiveButton = navButtons[0];
    setActiveNavButton(initialActiveButton, navButtons);
    const initialTargetId = initialActiveButton.getAttribute('data-target');
    if (initialTargetId) {
      showSettingsContent(initialTargetId, settingsContents);
    }
  }
}

function setActiveNavButton(activeButton, allButtons) {
  allButtons.forEach(button => {
    if (button === activeButton) {
      button.classList.add('active');
      button.style.color = '#FFFFFF';
    } else {
      button.classList.remove('active');
      button.style.color = '#6C757D';
    }
  });
}

function showSettingsContent(targetId, allContents) {
  allContents.forEach(content => {
    content.classList.toggle('hidden', content.id !== targetId);
  });
}

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

function updateIntervalCount(change) {
  const newCount = Math.min(Math.max(intervalCount + change, 1), 10);
  if (newCount !== intervalCount) {
    intervalCount = newCount;
    updateDisplay();
    updateButtonColors();
  }
}

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

function initializeTimerButtons() {
  const startButton = document.getElementById('start-timer');
  const stopButton = document.getElementById('stop-timer');
  const pauseButton = document.getElementById('pause-timer');
  const breakButton = document.getElementById('break-timer');

  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Start button clicked');
      window.electronAPI.startMainTimer();
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      console.log('Stop button clicked');
      window.electronAPI.stopTimer();
    });
  }

  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      console.log('Pause button clicked');
      window.electronAPI.pauseTimer();
    });
  }

  if (breakButton) {
    breakButton.addEventListener('click', () => {
      console.log('Break button clicked');
      window.electronAPI.startBreakTimer();
    });
  }
}

function initializeTimerSettings() {
  document.addEventListener('input', handleTimeInput, true);
  document.addEventListener('focus', handleTimeFocus, true);
  document.addEventListener('blur', handleTimeBlur, true);
}

function handleTimeInput(event) {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 2) {
    value = value.slice(0, 2);
  }
  const numValue = parseInt(value, 10);
  if (numValue > 59) {
    value = '59';
  }
  event.target.value = value; // パディングを適用せずにそのまま表示
}

function handleTimeFocus(event) {
  event.target.select();
}

function handleTimeBlur(event) {
  let value = event.target.value.replace(/\D/g, '');
  event.target.value = value.padStart(2, '0');
}

function getInputType(element) {
  if (element.closest('.time-setting')) {
    return element.closest('.time-setting').querySelector('.time-input:first-child') === element ? 'focusTime' : 'breakTime';
  } else if (element.closest('.interval-item')) {
    return 'intervalItem';
  } else {
    return 'intervalTime';
  }
}

function handleTimeSettingChange(inputType) {
  let selector, updateFunction;
  
  switch(inputType) {
    case 'focusTime':
      selector = '#basic-content .time-setting:first-child .time-input';
      updateFunction = (totalSeconds) => window.electronAPI.updateTimerSettings('focusTime', totalSeconds);
      break;
    case 'breakTime':
      selector = '#basic-content .time-setting:nth-child(2) .time-input';
      updateFunction = (totalSeconds) => window.electronAPI.updateTimerSettings('breakTime', totalSeconds);
      break;
    case 'intervalTime':
      selector = '.interval-time-input-container .time-input';
      updateFunction = (totalSeconds) => {
        window.electronAPI.updateIntervalTime(totalSeconds);
        updateTimerDisplay(null, totalSeconds);
      };
      break;
    case 'intervalItem':
      updateIntervalSettings();
      return;
  }
  
  const inputs = document.querySelectorAll(selector);
  const totalSeconds = getTimeInSeconds(inputs[0], inputs[1]);
  updateFunction(totalSeconds);
}

function getTimeInSeconds(minutesInput, secondsInput) {
  const minutes = parseInt(minutesInput.value, 10) || 0;
  const seconds = parseInt(secondsInput.value, 10) || 0;
  return minutes * 60 + seconds;
}

function initializeBackButton() {
  const backButton = document.getElementById('back-button');
  const mainWrapper = document.getElementById('main-wrapper');
  const settingWrapper = document.getElementById('setting-wrapper');

  backButton.addEventListener('click', () => {
    mainWrapper.classList.remove('hidden');
    settingWrapper.classList.add('hidden');
  });

  const settingsIcon = document.querySelector('.setting-toggle');
  if (settingsIcon) {
    settingsIcon.addEventListener('click', () => {
      mainWrapper.classList.add('hidden');
      settingWrapper.classList.remove('hidden');
    });
  }
}

function updateDisplay() {
  const countDisplay = document.getElementById("interval-count-display");
  if (countDisplay) {
    countDisplay.textContent = intervalCount;
  }
  updateIntervalList();
}

function updateTimerDisplay(mainTime, miniTime) {
  const mainDisplay = document.getElementById('timer-display');
  const miniDisplay = document.getElementById('timer-display-mini');
  
  if (mainTime !== null && mainDisplay) {
    mainDisplay.innerText = formatTime(mainTime);
  }
  if (miniTime !== null && miniDisplay) {
    miniDisplay.innerText = formatTime(miniTime);
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

window.electronAPI.updateTimer((event, { mainRemainingTime, miniRemainingTime }) => {
  updateTimerDisplay(mainRemainingTime, miniRemainingTime);
});

function updateIntervalList() {
  console.log('Updating interval list');
  const intervalList = document.getElementById('interval-list');
  if (!intervalList) {
    console.error('Interval list element not found');
    return;
  }

  const currentIntervals = Array.from(document.querySelectorAll('.interval-item')).map(item => {
    const inputs = item.querySelectorAll('.time-input');
    return {
      minutes: parseInt(inputs[0].value, 10) || 0,
      seconds: parseInt(inputs[1].value, 10) || 0
    };
  });

  console.log('Current intervals:', currentIntervals);

  intervalList.innerHTML = '';

  if (!isIntervalsEnabled) {
    console.log('Intervals are disabled');
    return;
  }

  for (let i = 1; i <= intervalCount; i++) {
    const currentTime = currentIntervals[i-1] || { minutes: 0, seconds: 0 };
    console.log(`Creating interval item ${i} with time:`, currentTime);
    const intervalItem = createIntervalItem(i, currentTime);
    intervalList.appendChild(intervalItem);
  }

  updateIntervalSettings();
}

function createIntervalItem(index, time = { minutes: 0, seconds: 0 }) {
  console.log('Creating interval item', index, time);
  const intervalItem = document.createElement("div");
  intervalItem.classList.add("setting", "interval-item");

  const label = document.createElement("label");
  label.textContent = `${index}${getOrdinalSuffix(index)} Interval`;

  const timeInputContainer = document.createElement("div");
  timeInputContainer.classList.add("time-input-container");

  const minutesInput = document.createElement("input");
  minutesInput.type = "text";
  minutesInput.classList.add("time-input", "interval-item-input", "minutes");
  minutesInput.maxLength = 2;
  minutesInput.value = time.minutes.toString().padStart(2, "0");

  const separator = document.createElement("span");
  separator.classList.add("time-separator");
  separator.textContent = ":";

  const secondsInput = document.createElement("input");
  secondsInput.type = "text";
  secondsInput.classList.add("time-input", "interval-item-input", "seconds");
  secondsInput.maxLength = 2;
  secondsInput.value = time.seconds.toString().padStart(2, "0");

  timeInputContainer.append(minutesInput, separator, secondsInput);
  intervalItem.append(label, timeInputContainer);

  // Interval Item固有の処理を追加
  [minutesInput, secondsInput].forEach(input => {
    input.addEventListener('input', handleIntervalItemInput);
    input.addEventListener('focus', handleTimeFocus);
    input.addEventListener('blur', handleIntervalItemBlur);
  });

  console.log('Interval item created', intervalItem);
  return intervalItem;
}

function handleIntervalItemInput(event) {
  handleTimeInput(event);
  setAutoCalcEnabled(false);
}

function handleIntervalItemBlur(event) {
  handleTimeBlur(event);
  updateIntervalSettings();
}

function createTimeInput(className, value) {
  console.log('Creating time input', className, value);
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.classList.add("time-input", className);
  input.value = value.toString().padStart(2, "0");

  input.addEventListener('keypress', (event) => {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  });

  input.addEventListener('input', (event) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2);
    }
    const numValue = parseInt(value, 10);
    if (numValue > 59) {
      value = '59';
    }
    event.target.value = value.padStart(2, '0');
  });

  input.addEventListener('focus', (event) => {
    event.target.select();
  });

  return input;
}


function createSeparator() {
  const separator = document.createElement("span");
  separator.classList.add("time-separator");
  separator.textContent = ":";
  return separator;
}

function setAutoCalcEnabled(enabled) {
  isAutoCalcEnabled = enabled;
  const autoCalcSwitch = document.querySelector('.setting:nth-child(4) input[type="checkbox"]');
  if (autoCalcSwitch) {
    autoCalcSwitch.checked = enabled;
  }
}

function recalculateIntervals() {
  const focusTimeInputs = document.querySelectorAll('#basic-content .time-setting:first-child .time-input');
  const intervalTimeInputs = document.querySelectorAll('.interval-time-input-container .time-input');

  const mainTimer = getTimeInSeconds(focusTimeInputs[0], focusTimeInputs[1]);
  const intervalTime = getTimeInSeconds(intervalTimeInputs[0], intervalTimeInputs[1]);

  const focusSessionTimeSeconds = calculateFocusSessionTime(mainTimer, intervalTime, intervalCount);
  let remainingTime = mainTimer;

  const intervalItems = document.querySelectorAll('.interval-item');
  intervalItems.forEach((item, index) => {
    if (index < intervalCount) {
      remainingTime -= focusSessionTimeSeconds;
      const intervalStart = secondsToMinutesAndSeconds(remainingTime);
      
      const minutesInput = item.querySelector('.time-input.minutes');
      const secondsInput = item.querySelector('.time-input.seconds');
      
      minutesInput.value = intervalStart.minutes.toString().padStart(2, '0');
      secondsInput.value = intervalStart.seconds.toString().padStart(2, '0');
      
      remainingTime -= intervalTime;
      if (remainingTime < 0) remainingTime = 0;
    }
  });
}

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

function calculateFocusSessionTime(mainTimerSeconds, intervalTimeSeconds, intervalCount) {
  return (mainTimerSeconds - intervalTimeSeconds * intervalCount) / (intervalCount + 1);
}

function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return { minutes, seconds: remainingSeconds };
}

function getOrdinalSuffix(i) {
  const j = i % 10, k = i % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
}

function initializeTimerDisplay() {
  updateTimerDisplay(0, 0);
}

console.log('settings.js loaded');