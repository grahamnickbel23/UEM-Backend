// ---------- OTP LOGIC ----------

const otpForm = document.getElementById("otpForm");
const getOtpBtn = document.getElementById("getOtpBtn");
const otpInput = document.getElementById("otp");
const otpMessage = document.getElementById("otpMessage");

// Function to send OTP request
async function requestOTP() {
  try {
    const email = sessionStorage.getItem("otpEmail");

    if (!email) {
      otpMessage.style.color = "red";
      otpMessage.textContent = "No email found. Please login again!";
      return;
    }

    const res = await fetch("/api/auth/getotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok && data.success) {
      otpMessage.style.color = "green";
      otpMessage.textContent = "OTP has been sent!";
      alert("Your OTP is: " + data.otp); // ⚠️ Dev-only, remove in production
    } else {
      otpMessage.style.color = "red";
      otpMessage.textContent = data.message || "Failed to send OTP ❌";
    }
  } catch (err) {
    console.error("Error fetching OTP:", err);
    otpMessage.style.color = "red";
    otpMessage.textContent = "Server error while sending OTP ❌";
  }
}

// ✅ Automatically request OTP when page loads
window.addEventListener("DOMContentLoaded", requestOTP);

// ✅ Allow user to re-request OTP manually
if (getOtpBtn) {
  getOtpBtn.addEventListener("click", requestOTP);
}

// ✅ Handle OTP form submission
if (otpForm) {
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = sessionStorage.getItem("otpEmail");
    const otp = otpInput.value.trim();

    if (!email) {
      otpMessage.style.color = "red";
      otpMessage.textContent = "No email found. Please login again!";
      return;
    }

    try {
      const res = await fetch("/api/auth/verifyotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include"
      });

      const data = await res.json();

      otpMessage.textContent = data.message;
      otpMessage.style.color = data.success ? "green" : "red";

      if (data.success) {
        // optional: redirect user after successful verification
        // window.location.href = "/dashboard.html";
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      otpMessage.style.color = "red";
      otpMessage.textContent = "Server error while verifying OTP ❌";
    }
  });
}
