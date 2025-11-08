const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendBtn");
const timerEl = document.getElementById("timer");

let countdownInterval;

verifyBtn.addEventListener("click", () => {
  startCountdown(120); // 2 minutes = 120 seconds
});

resendBtn.addEventListener("click", () => {
  resendBtn.classList.add("hidden");
  startCountdown(120);
});

function startCountdown(duration) {
  clearInterval(countdownInterval);

  let remaining = duration;
  resendBtn.classList.add("hidden");
  updateTimer(remaining);

  countdownInterval = setInterval(() => {
    remaining--;
    updateTimer(remaining);

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      timerEl.textContent = "OTP expired!";
      resendBtn.classList.remove("hidden");
    }
  }, 1000);
}

function updateTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerEl.textContent = `Resend available in ${mins}:${secs < 10 ? "0" + secs : secs}`;
}