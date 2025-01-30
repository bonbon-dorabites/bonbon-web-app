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
const employeeModal = document.getElementById("employeeModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");

// Open modal function
function openModal() {
  employeeModal.style.display = "block";
}

// Close modal function
function closeModal() {
  employeeModal.style.display = "none";
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