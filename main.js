// Toggle accordion sections
const headers = document.querySelectorAll('.accordion-header');
headers.forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const toggleIcon = header.querySelector('.toggle-icon');

    // Toggle display of accordion body
    if (body.style.display === 'block') {
      body.style.display = 'none';
      toggleIcon.textContent = '+';
    } else {
      body.style.display = 'block';
      toggleIcon.textContent = '-';
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");
  const orderSection = document.getElementById("order");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const backBtn = document.getElementById("backBtn");
  const backBtn2 = document.getElementById("backBtn2");
  // Show checkout form, hide order section
  checkoutBtn.addEventListener("click", () => {
      orderSection.style.display = "none";
      checkoutForm.style.display = "block";
  });
  // Show order section, hide checkout form
  backBtn.addEventListener("click", () => {
      checkoutForm.style.display = "none";
      orderSection.style.display = "block";
  });
  backBtn2.addEventListener("click", () => {
      checkoutForm.style.display = "none";
      orderSection.style.display = "block";
  });
});

document.querySelectorAll('.label').forEach(label => {
    label.addEventListener('click', function () {
      // Remove active class from all labels
      document.querySelectorAll('.label').forEach(l => l.classList.remove('active'));
      
      // Add active class to the clicked label
      this.classList.add('active');
    });
  });
  

// Open Modal
function openModal() {
    document.getElementById('employeeModal').style.display = "block";
}

// Close Modal
function closeModal() {
    document.getElementById('employeeModal').style.display = "none";
}

// Get modal and form elements
const modal = document.getElementById("employeeModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");

// Open modal function
function openModal() {
  modal.style.display = "block";
}

// Close modal function
function closeModal() {
  modal.style.display = "none";
}

// Save employee details (placeholder function)
function saveEmployee() {
  // Get input values
  const name = document.getElementById("name").value.trim();
  const branch = document.getElementById("employee-branch").value;
  const position = document.getElementById("position").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const email = document.getElementById("email").value.trim();
  const permission = document.querySelector('input[name="permission"]:checked')?.value;

  if (!name || !branch || !position || !contact || !email || !permission) {
    alert("Please fill out all fields.");
    return;
  }

  // Append a new row to the staff table
  const tableBody = document.getElementById("staff-table-body");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${name}</td>
    <td>${branch}</td>
    <td>
      <label>
        <input type="radio" name="permission-${Date.now()}" value="Allowed" ${permission === "Allowed" ? "checked" : ""} disabled> Allowed
      </label>
      <label>
        <input type="radio" name="permission-${Date.now()}" value="Declined" ${permission === "Declined" ? "checked" : ""} disabled> Declined
      </label>
    </td>
    <td>${position}</td>
    <td>${contact}</td>
    <td>${email}</td>
    <td>
      <button class="action-btn edit" onclick="toggleEdit(this)"><i class="fas fa-edit"></i></button>
      <button class="action-btn delete" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
    </td>
  `;
  tableBody.appendChild(newRow);

  // Close the modal
  closeModal();

  // Reset the form
  addEmployeeForm.reset();
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};


function toggleEdit(button) {
  const row = button.parentElement.parentElement;
  const radios = row.querySelectorAll('input[type="radio"]');
  const isEditing = button.innerHTML === '<i class="fas fa-edit"></i>';

  if (isEditing) {
      button.textContent = 'Save';
      radios.forEach(radio => radio.disabled = false);
  } else {
      button.innerHTML = '<i class="fas fa-edit"></i>';
      radios.forEach(radio => radio.disabled = true);
  }
}

function deleteRow(button) {
  const row = button.parentElement.parentElement;
  row.remove();
}