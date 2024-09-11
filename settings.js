let count = 2;
let isIntervalsEnabled = false;
let isAutoCalcEnabled = true; // Auto Calc を初期状態でオンに設定

document.addEventListener("DOMContentLoaded", () => {
  const timeInputs = document.querySelectorAll(".time-input");

  timeInputs.forEach((input) => {
    input.addEventListener("focus", handleTimeFocus);
    input.addEventListener("keydown", handleTimeKeydown);
    input.addEventListener("blur", handleTimeBlur);
  });

  // タブ切り替えの機能
  const tabs = document.querySelectorAll(".tabbar > *");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.textContent.trim().toLowerCase() + "-content";
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === targetId) {
          content.classList.add("active");
        }
      });
    });
  });

  // Interval Count の機能
  const decrementButton = document.querySelector(".number-input .decrement");
  const incrementButton = document.querySelector(".number-input .increment");
  const countDisplay = document.getElementById("interval-count-display");

  const decrementSvg = decrementButton.querySelector("svg path");
  const incrementSvg = incrementButton.querySelector("svg path");

  const minCount = 1;
  const maxCount = 10;
  const minColor = "#6C757D";
  const normalColor = "#FFFFFF";

  function updateButtonColors() {
    decrementSvg.setAttribute(
      "fill",
      count === minCount ? minColor : normalColor
    );
    incrementSvg.setAttribute(
      "fill",
      count === maxCount ? minColor : normalColor
    );
  }

  if (decrementButton && incrementButton && countDisplay) {
    decrementButton.addEventListener("click", () => {
      if (count > minCount) {
        count--;
        updateDisplay();
        updateButtonColors();
      }
    });

    incrementButton.addEventListener("click", () => {
      if (count < maxCount) {
        count++;
        updateDisplay();
        updateButtonColors();
      }
    });
  }

  // Enable Intervals の切り替え機能
  const enableIntervalsSwitch = document.querySelector(
    '.setting:first-child input[type="checkbox"]'
  );

  if (enableIntervalsSwitch) {
    enableIntervalsSwitch.addEventListener("change", (e) => {
      isIntervalsEnabled = e.target.checked;
      updateIntervalList();
    });
  }

  // Auto Calc. Intervals の切り替え機能
  const autoCalcSwitch = document.querySelector(
    '.setting:nth-child(4) input[type="checkbox"]'
  );

  if (autoCalcSwitch) {
    autoCalcSwitch.checked = isAutoCalcEnabled; // 初期状態を設定
    autoCalcSwitch.addEventListener("change", (e) => {
      isAutoCalcEnabled = e.target.checked;
      updateIntervalList();
    });
  }

  // Basicタブのタイマー設定が変更されたときにインターバルリストを更新
  const basicTimerInputs = document.querySelectorAll(
    "#basic-content .time-input"
  );
  basicTimerInputs.forEach((input) => {
    input.addEventListener("change", updateIntervalList);
  });

  // 初期表示を設定
  updateIntervalList(); // 初期表示時にインターバルリストを更新
  updateDisplay();
  updateButtonColors();
});

function handleIntervalTimeInput(e) {
    if (isAutoCalcEnabled) {
      isAutoCalcEnabled = false;
      const autoCalcSwitch = document.querySelector(
        '.setting:nth-child(4) input[type="checkbox"]'
      );
      if (autoCalcSwitch) {
        autoCalcSwitch.checked = false;
      }
      // すべてのインターバル時間入力フィールドを有効化
      const allIntervalInputs = document.querySelectorAll('.interval-item .time-input');
      allIntervalInputs.forEach(input => {
        input.disabled = false;
      });
    }
    // 既存の handleTimeInput 関数を呼び出す
    handleTimeInput.call(this, e);
  }

function updateDisplay() {
  const countDisplay = document.getElementById("interval-count-display");
  if (countDisplay) {
    countDisplay.textContent = count;
  }
  updateIntervalList();
}

function updateIntervalList() {
  const intervalList = document.getElementById("interval-list");
  if (!intervalList) {
    console.error("Interval list element not found");
    return;
  }
  intervalList.innerHTML = "";

  if (!isIntervalsEnabled) {
    return;
  }

  const focusTimeInputs = document.querySelectorAll(
    "#basic-content .time-setting:first-child .time-input"
  );
  const intervalTimeInputs = document.querySelectorAll(
    ".interval-time-input-container .time-input"
  );

  const mainTimer = {
    minutes: parseInt(focusTimeInputs[0].value, 10) || 0,
    seconds: parseInt(focusTimeInputs[1].value, 10) || 0,
  };

  let intervalTime;
  if (isAutoCalcEnabled) {
    // Auto Calc がオンの場合、既定の間隔時間を使用（例: 5分）
    intervalTime = { minutes: 5, seconds: 0 };
    // インターバル時間入力フィールドを更新
    intervalTimeInputs[0].value = "05";
    intervalTimeInputs[1].value = "00";
  } else {
    intervalTime = {
      minutes: parseInt(intervalTimeInputs[0].value, 10) || 0,
      seconds: parseInt(intervalTimeInputs[1].value, 10) || 0,
    };
  }

  const focusSessionTimeSeconds = calculateFocusSessionTime(
    mainTimer,
    intervalTime,
    count
  );
  const focusSessionTime = secondsToMinutesAndSeconds(focusSessionTimeSeconds);

  let remainingTime = mainTimer.minutes * 60 + mainTimer.seconds;

  for (let i = 1; i <= count; i++) {
    const intervalItem = document.createElement("div");
    intervalItem.classList.add("interval-item");

    const label = document.createElement("span");
    label.textContent = `${i}${getOrdinalSuffix(i)} Interval`;

    const timeInputContainer = document.createElement("div");
    timeInputContainer.classList.add("time-input-container");

    const minutesInput = document.createElement("input");
    minutesInput.type = "text";
    minutesInput.classList.add("time-input", "minutes");

    const separator = document.createElement("span");
    separator.classList.add("time-separator");
    separator.textContent = ":";

    const secondsInput = document.createElement("input");
    secondsInput.type = "text";
    secondsInput.classList.add("time-input", "seconds");

    // 各インターバルの時間入力フィールドにイベントリスナーを追加
    [minutesInput, secondsInput].forEach(input => {
        input.addEventListener("input", handleIntervalTimeInput);
    });

    remainingTime -= focusSessionTimeSeconds;
    const intervalStart = secondsToMinutesAndSeconds(remainingTime);

    minutesInput.value = intervalStart.minutes.toString().padStart(2, "0");
    secondsInput.value = intervalStart.seconds.toString().padStart(2, "0");

    if (isAutoCalcEnabled) {
      minutesInput.disabled = true;
      secondsInput.disabled = true;
    } else {
      minutesInput.disabled = false;
      secondsInput.disabled = false;
    }

    timeInputContainer.appendChild(minutesInput);
    timeInputContainer.appendChild(separator);
    timeInputContainer.appendChild(secondsInput);

    intervalItem.appendChild(label);
    intervalItem.appendChild(timeInputContainer);
    intervalList.appendChild(intervalItem);

    remainingTime -= intervalTime.minutes * 60 + intervalTime.seconds;
    if (remainingTime < 0) remainingTime = 0;
  }
}

function calculateFocusSessionTime(mainTimer, intervalTime, intervalCount) {
  const mainTimerSeconds = mainTimer.minutes * 60 + mainTimer.seconds;
  const intervalTimeSeconds = intervalTime.minutes * 60 + intervalTime.seconds;

  const focusSessionTime =
    (mainTimerSeconds - intervalTimeSeconds * intervalCount) /
    (intervalCount + 1);

  return focusSessionTime;
}

function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return { minutes, seconds: remainingSeconds };
}

function getOrdinalSuffix(i) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return "st";
  }
  if (j == 2 && k != 12) {
    return "nd";
  }
  if (j == 3 && k != 13) {
    return "rd";
  }
  return "th";
}

function handleTimeFocus(e) {
  this.select();
}

function handleTimeInput(e) {
  let value = this.value.replace(/\D/g, "");

  if (value.length > 2) {
    value = value.slice(0, 2);
  }

  let max = 59;
  let numValue = parseInt(value, 10);
  if (numValue > max) {
    value = max.toString();
  }

  this.value = value.padStart(2, "0");
  updateIntervalList();
}

function handleTimeKeydown(e) {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    let value = parseInt(this.value, 10) || 0;
    let max = 59;
    if (e.key === "ArrowUp") {
      value = (value + 1) % (max + 1);
    } else {
      value = (value - 1 + max + 1) % (max + 1);
    }
    this.value = value.toString().padStart(2, "0");
    updateIntervalList();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const direction = e.key === "ArrowLeft" ? -1 : 1;
    const container = this.closest(".time-input-container");
    if (container) {
      const inputs = Array.from(container.querySelectorAll(".time-input"));
      const currentIndex = inputs.indexOf(this);
      const nextIndex =
        (currentIndex + direction + inputs.length) % inputs.length;
      inputs[nextIndex].focus();
    }
  } else if (/^\d$/.test(e.key)) {
    e.preventDefault();
    let newValue = (this.value + e.key).slice(-2);
    let numValue = parseInt(newValue, 10);
    if (numValue > 59) {
      newValue = "59";
    }
    this.value = newValue.padStart(2, "0");
    updateIntervalList();
  } else if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    this.value = "00";
    updateIntervalList();
  }
}

function handleTimeBlur(e) {
  this.value = this.value.padStart(2, "0");
  updateIntervalList();
}

// インターバル計算コード
function calculateFocusSessionTime(mainTimer, intervalTime, intervalCount) {
  const mainTimerSeconds = mainTimer.minutes * 60 + mainTimer.seconds;
  const intervalTimeSeconds = intervalTime.minutes * 60 + intervalTime.seconds;

  const focusSessionTime =
    (mainTimerSeconds - intervalTimeSeconds * intervalCount) /
    (intervalCount + 1);

  return focusSessionTime;
}

function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return { minutes, seconds: remainingSeconds };
}

function updateIntervalList() {
  const intervalList = document.getElementById("interval-list");
  if (!intervalList) {
    console.error("Interval list element not found");
    return;
  }
  intervalList.innerHTML = "";

  if (!isIntervalsEnabled) {
    return;
  }

  const focusTimeInputs = document.querySelectorAll(
    "#basic-content .time-setting:first-child .time-input"
  );
  const intervalTimeInputs = document.querySelectorAll(
    ".interval-time-input-container .time-input"
  );

  const mainTimer = {
    minutes: parseInt(focusTimeInputs[0].value, 10) || 0,
    seconds: parseInt(focusTimeInputs[1].value, 10) || 0,
  };
  const intervalTime = {
    minutes: parseInt(intervalTimeInputs[0].value, 10) || 0,
    seconds: parseInt(intervalTimeInputs[1].value, 10) || 0,
  };

  const focusSessionTimeSeconds = calculateFocusSessionTime(
    mainTimer,
    intervalTime,
    count
  );
  const focusSessionTime = secondsToMinutesAndSeconds(focusSessionTimeSeconds);

  let remainingTime = mainTimer.minutes * 60 + mainTimer.seconds;

  for (let i = 1; i <= count; i++) {
    const intervalItem = document.createElement("div");
    intervalItem.classList.add("interval-item");

    const label = document.createElement("span");
    label.textContent = `${i}${getOrdinalSuffix(i)} Interval`;

    const timeInputContainer = document.createElement("div");
    timeInputContainer.classList.add("time-input-container");

    const minutesInput = document.createElement("input");
    minutesInput.type = "text";
    minutesInput.classList.add("time-input", "minutes");

    const separator = document.createElement("span");
    separator.classList.add("time-separator");
    separator.textContent = ":";

    const secondsInput = document.createElement("input");
    secondsInput.type = "text";
    secondsInput.classList.add("time-input", "seconds");

    remainingTime -= focusSessionTimeSeconds;
    const intervalStart = secondsToMinutesAndSeconds(remainingTime);

    minutesInput.value = intervalStart.minutes.toString().padStart(2, "0");
    secondsInput.value = intervalStart.seconds.toString().padStart(2, "0");

    timeInputContainer.appendChild(minutesInput);
    timeInputContainer.appendChild(separator);
    timeInputContainer.appendChild(secondsInput);

    intervalItem.appendChild(label);
    intervalItem.appendChild(timeInputContainer);
    intervalList.appendChild(intervalItem);

    remainingTime -= intervalTime.minutes * 60 + intervalTime.seconds;
    if (remainingTime < 0) remainingTime = 0;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
