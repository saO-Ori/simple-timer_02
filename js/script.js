// 要素の取得
const timeWrapper = document.getElementById('timeWrapper');
const timeDisplay = document.getElementById('time');
const timeInput = document.getElementById('inputTime');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const alarm = document.getElementById('alarmSound');
const stopHint = document.getElementById('stopHint');

let countdownInterval;
let remainingTime = 0;
let isRunning = false;

// ------------------------------
// 入力欄の表示切替（時間表示タップ）
// ------------------------------
timeWrapper.addEventListener('click', () => {
  if (isRunning) return;
  timeWrapper.classList.add('editing'); // 凹み視覚効果
  timeInput.style.display = 'inline-block';
  timeInput.focus();
});

// ------------------------------
// 入力確定（Enter or 他エリアクリック）
// ------------------------------
function confirmInput() {
  const raw = timeInput.value;
  const newTime = parseSmartTime(raw);
  remainingTime = newTime;
  updateDisplay(remainingTime);
  timeInput.blur();
  timeWrapper.classList.remove('editing');
}

timeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    confirmInput();
  }
});

document.addEventListener('click', (e) => {
  if (!timeWrapper.contains(e.target) && timeInput.style.display === 'inline-block') {
    confirmInput();
  }
});

// ------------------------------
// リアルタイムプレビュー
// ------------------------------
timeInput.addEventListener('input', () => {
  const raw = timeInput.value;
  const temp = parseSmartTime(raw);
  updateDisplay(temp);
});

// ------------------------------
// スタート / 一時停止 / 再開切替
// ------------------------------
startButton.addEventListener('click', () => {
  if (!isRunning) {
    if (remainingTime === 0) {
      const raw = timeInput.value;
      remainingTime = parseSmartTime(raw);
      if (remainingTime <= 0) {
        alert('1秒以上の時間を入力してください');
        return;
      }
    }
    startCountdown();
    startButton.textContent = '一時停止';
  } else {
    pauseCountdown();
    startButton.textContent = '再開';
  }
});

// ------------------------------
// リセット
// ------------------------------
resetButton.addEventListener('click', resetTimer);

function resetTimer() {
  clearInterval(countdownInterval);
  isRunning = false;
  remainingTime = 0;
  timeInput.value = '';
  updateDisplay(0);
  startButton.textContent = 'スタート';
  stopHint.classList.remove('show');
  alarm.currentTime = 0;
  document.body.removeEventListener('click', stopAlarm);
  document.body.removeEventListener('touchstart', stopAlarm);
}

// ------------------------------
// カウントダウン開始
// ------------------------------
function startCountdown() {
  isRunning = true;
  countdownInterval = setInterval(() => {
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      updateDisplay(0);
      alarm.play();
      isRunning = false;
      remainingTime = 0;
      startButton.textContent = 'スタート';
      stopHint.classList.add('show');
      document.body.addEventListener('click', stopAlarm);
      document.body.addEventListener('touchstart', stopAlarm);
    } else {
      updateDisplay(remainingTime);
    }
  }, 1000);
}

// ------------------------------
// 一時停止
// ------------------------------
function pauseCountdown() {
  isRunning = false;
  clearInterval(countdownInterval);
}

// ------------------------------
// 表示更新（hh:mm:ss or mm:ss）
// ------------------------------
function updateDisplay(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  timeDisplay.textContent = h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ------------------------------
// 入力文字列から秒数に変換（6000特例あり）
// ------------------------------
function parseSmartTime(inputStr) {
  const raw = inputStr.replace(/\D/g, '').padStart(2, '0');
  if (raw === '6000') return 3600;
  const len = raw.length;
  const s = parseInt(raw.slice(-2), 10);
  const m = len > 2 ? parseInt(raw.slice(-4, -2), 10) : 0;
  const h = len > 4 ? parseInt(raw.slice(0, -4), 10) : 0;
  return h * 3600 + m * 60 + s;
}

// ------------------------------
// アラーム停止 + リセット
// ------------------------------
function stopAlarm() {
  alarm.pause();
  alarm.currentTime = 0;
  stopHint.classList.remove('show');
  document.body.removeEventListener('click', stopAlarm);
  document.body.removeEventListener('touchstart', stopAlarm);
  resetTimer();
}

// ------------------------------
// プリセットセット関数（グローバル）
// ------------------------------
function setPreset(seconds) {
  if (isRunning) return;
  remainingTime = seconds;
  timeInput.value = '';
  updateDisplay(remainingTime);
}
