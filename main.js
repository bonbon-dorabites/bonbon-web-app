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
  
// Get modal and form elements
const employeeModal = document.getElementById("employeeModal");
const editModal = document.getElementById("editEmployeeModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");

// Open modal function
function openModal() {
  employeeModal.style.display = "block";
}

// Open modal function
function openEditModal() {
  editModal.style.display = "block";
}


function editEmployee(button) {
  console.log("EDIT");
  
  const row = button.closest("tr");

  const employeeId = row.getAttribute("data-id"); // Get employee ID
  const branchId = row.getAttribute("data-branch-id");

  // Get the existing data from the row
  const name = row.cells[0].textContent;
  const branch = row.cells[1].textContent;
  const position = row.cells[3].textContent;
  const contactNumber = row.cells[4].textContent;
  const email = row.cells[5].textContent;
  const permission = row.querySelector("input[type='radio']:checked")?.value || "Declined";

  // Populate the edit form
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-branch").value = branch;
  document.getElementById("edit-position").value = position;
  document.getElementById("edit-contact").value = contactNumber;
  document.getElementById("edit-email").value = email;
  document.querySelector(`input[name="edit-permission"][value="${permission}"]`).checked = true;

  // Store docId and branchId in hidden fields for later use
  document.getElementById("edit-doc-id").value = employeeId;
  document.getElementById("edit-branch-id").value = branchId;

  console.log("Employee ID: " + employeeId);
  console.log("Branch ID: " + branchId);

  // Show the modal
  openEditModal();
}


// Close modal function
function closeEditModal() {
  editModal.style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === employeeModal) {
    closeModal();
  }
};


/*
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
}*/

function deleteRow(button) {
  const row = button.parentElement.parentElement;
  row.remove();
}