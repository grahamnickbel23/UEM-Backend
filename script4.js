document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Step 1: Add edit icons dynamically
  // =========================

  const editableFields = [
    "employee-id",
    "email",
    "phone",
    "date-of-birth",
    "address-line1",
    "address-line2",
    "address-line3",
    "district",
    "state",
    "country",
  ];

  editableFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Wrap the field text and icon together in a span for perfect alignment
    const wrapper = document.createElement("span");
    wrapper.classList.add("editable-wrapper");

    const icon = document.createElement("button");
    icon.innerHTML = "✏️";
    icon.className = "edit-icon";
    icon.dataset.field = fieldId;

    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(icon);
    wrapper.appendChild(field);
  });

  // =========================
  // Step 2: Handle edit popup creation
  // =========================
  let activePopup = null;

  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("edit-icon")) {
      const field = e.target.dataset.field;
      const valueEl = document.getElementById(field);
      openEditPopup(field, valueEl.textContent.trim());
    }
  });

  function openEditPopup(fieldName, currentValue) {
    closePopup();

    const popup = document.createElement("div");
    popup.classList.add("edit-popup");
    popup.innerHTML = `
            <h3>Edit ${fieldName.replace(/[-_]/g, " ")}</h3>
            <input type="text" id="edit-input" value="${currentValue}" autofocus />
            <div class="popup-buttons">
                <button id="save-btn">Submit</button>
                <button id="cancel-btn">Cancel</button>
            </div>
        `;
    document.body.appendChild(popup);
    popup.classList.add("active");
    activePopup = popup;

    popup.querySelector("#cancel-btn").onclick = () => closePopup();

    popup.querySelector("#save-btn").onclick = async () => {
      const newValue = popup.querySelector("#edit-input").value.trim();
      if (newValue === "" || newValue === currentValue) {
        closePopup();
        return;
      }

      await updateProfileField(fieldName, newValue);
      document.getElementById(fieldName).textContent = newValue;
      closePopup();
    };
  }

  function closePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  // =========================
  // Step 3: Call API to update field
  // =========================
  async function updateProfileField(fieldName, info) {
    // map frontend ids to backend-compatible field paths
    const fieldMap = {
      "profile-name": "firstName",
      "profile-gender": "gender",
      "profile-dept": "department",
      "employee-id": "employeeId",
      "email": "email.0",
      "phone": "phone.0.mobileNumber",
      "date-of-birth": "date_of_birth",
      "address-line1": "address.0.address_line_one",
      "address-line2": "address.0.address_line_two",
      "address-line3": "address.0.address_line_three",
      "district": "address.0.district",
      "state": "address.0.state",
      "country": "address.0.country",
      "role": "role"
    };

    const mappedField = fieldMap[fieldName] || fieldName;

    try {
      const res = await fetch("/api/auth/edit/lowauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fieldName: mappedField, info })
      });

      const data = await res.json();

      if (data.success) {
        console.log(`✅ Updated ${mappedField}: ${info}`);
      } else {
        console.error("❌ Update failed:", data);
        alert("Update failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("⚠️ Error updating profile:", err);
      alert("Network error while updating profile!");
    }
  }

});
