//code for profile pic view
const profileImg = document.getElementById('profile-img');
const viewer = document.getElementById('image-viewer');
const viewerImg = document.getElementById('viewer-img');
const closeBtn = document.querySelector('.close');

profileImg.addEventListener('click', () => {
    viewerImg.src = profileImg.src;   // load the same image
    viewer.style.display = 'flex';    // show overlay
});

closeBtn.addEventListener('click', () => {
    viewer.style.display = 'none';
});

// close when clicking outside the image
viewer.addEventListener('click', (e) => {
    if (e.target === viewer) {
        viewer.style.display = 'none';
    }
});

// // code for if no profile pic is there
// const profileInitialsEl = document.getElementById('profile-initials');

// // Fetch profile data from API
// fetch('/api/auth/profile')
//   .then(response => response.json())
//   .then(profileData => {
//     profileInitialsEl.textContent = generateInitials(profileData.firstName, profileData.lastName);
//   })
//   .catch(error => {
//     console.error('Error loading profile:', error);
//     profileInitialsEl.textContent = "GU"; // fallback
//   });

// // Generate initials
// function generateInitials(first, last) {
//   if (!first && !last) return "GU"; // fallback for Guest User
//   const f = first ? first.charAt(0).toUpperCase() : "";
//   const l = last ? last.charAt(0).toUpperCase() : "";
//   return `${f}${l}`;
// }



// code for achiveent view
function openAchievement(el) {

    //var heading, details;
    const heading = document.getElementById('modal-heading').innerText;
    const details = document.getElementById('modal-details').innerText

    document.getElementById('achivement-modal').style.display = 'flex';
}

function closeAchievement() {
    document.getElementById('achivement-modal').style.display = 'none';
}

// close modal if clicked outside
document.getElementById('achivement-modal').addEventListener('click', function (e) {
    if (e.target === this) closeAchievement();
});

// code for upload html
function addEmail() {
  const section = document.getElementById('email-section');
  const newRow = document.createElement('div');
  newRow.className = 'dynamic-input-row';
  newRow.innerHTML = `
    <input type="email" name="email[]" placeholder="Ex: user@example.com" required />
    <button type="button" class="remove-btn" onclick="removeRow(this)">- Remove</button>
  `;
  section.appendChild(newRow);
}

function addPhone() {
  const section = document.getElementById('phone-section');
  const newRow = document.createElement('div');
  newRow.className = 'dynamic-input-row';
  newRow.innerHTML = `
    <input type="text" name="phoneCountryCode[]" placeholder="Country Code" style="width: 30%;" required />
    <input type="tel" name="phoneNumber[]" placeholder="Ex: 9126375827" style="width: 65%;" required />
    <button type="button" class="remove-btn" onclick="removeRow(this)">- Remove</button>
  `;
  section.appendChild(newRow);
}

function removeRow(btn) {
  btn.parentElement.remove();
}