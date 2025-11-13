// ---------- LOGIN PAGE LOGIC ----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // sendig api request to backend
      const response = await fetch("api/auth/requestlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("otpEmail", email);
        alert("Login Successful ✅ Redirecting to OTP...")
        setTimeout(() => {
          window.location.href = "otp.html";
        }, 500);
      } else {
        alert( data.message || "Invalid credentials ❌")
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again!")
    }
  });
}

// ---------- OTP LOGIC ----------

const otpForm = document.getElementById("otpForm");
const getOtpBtn = document.getElementById("getOtpBtn");
const otpInput = document.getElementById("otp");
const otpMessage = document.getElementById("otpMessage");

if (getOtpBtn) {
  getOtpBtn.addEventListener("click", async () => {
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
        alert("Your OTP is: " + data.otp); // Dev only
      } else {
        otpMessage.style.color = "red";
        otpMessage.textContent = data.message || "Failed to send OTP ❌";
      }
    } catch (err) {
      console.error("Error fetching OTP:", err);
      otpMessage.style.color = "red";
      otpMessage.textContent = "Server error while sending OTP ❌";
    }
  });
}

if (otpForm) {
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = sessionStorage.getItem("otpEmail");
    const otp = otpInput.value;

    if (!email) {
      otpMessage.style.color = "red";
      otpMessage.textContent = "No email found. Please login again!";
      return;
    }

    try {
      // Send OTP to backend
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include"
      });

      const data = await res.json();
      otpMessage.textContent = data.message;
      otpMessage.style.color = data.success ? "green" : "red";

      if (res.ok && data.success) {
        // Wait a bit for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 500));

        // Call backend to get profile info and role
        const profileRes = await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        const profileData = await profileRes.json();

        if (profileRes.ok && profileData.success) {
          // Forward based on role
          if (profileData.user.role === "faculty") {
            window.location.href = "facultyProfile.html";
          } else {
            window.location.href = "profile.html";
          }
        } else {
          otpMessage.style.color = "red";
          otpMessage.textContent = profileData.message || "Failed to fetch profile ❌";
        }
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      otpMessage.style.color = "red";
      otpMessage.textContent = "Server error while verifying OTP ❌";
    }
  });
}
