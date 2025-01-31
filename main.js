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
const couponModal = document.getElementById("couponsModal");
// Open modal function
function openModal() {
  employeeModal.style.display = "block";
}

// Open modal function
function openEditModal() {
  editModal.style.display = "block";
}

// Close modal function
function closeEditModal() {
  editModal.style.display = "none";
}

function openCouponModal() {
  couponModal.style.display = "block";
}

function closeCouponModal() {
  couponModal.style.display = "none";
}


function editEmployee(button) {
  console.log("EDIT");

  let employeeId, branchId, name, branch, position, contactNumber, email, permission;

  // Check if the clicked button is in a table row or details card
  const row = button.closest("tr");
  const detailsCard = button.closest(".details-card");

  if (row) {
      // If the button is inside a table row
      employeeId = row.getAttribute("data-id");
      branchId = row.getAttribute("data-branch-id");

      // Get data from table row
      name = row.cells[0].textContent;
      branch = row.cells[1].textContent;
      position = row.cells[3].textContent;
      contactNumber = row.cells[4].textContent;
      email = row.cells[5].textContent;
      permission = row.querySelector("input[type='radio']:checked")?.value || "Declined";
  } else if (detailsCard) {
      // If the button is inside a details card
      employeeId = detailsCard.getAttribute("data-id");
      branchId = detailsCard.getAttribute("data-branch-id");

      // Get data from details card
      name = detailsCard.querySelector("p:nth-child(2)").textContent.replace("Name: ", "").trim();
      branch = detailsCard.querySelector("p:nth-child(3)").textContent.replace("Branch: ", "").trim();
      permission = detailsCard.querySelector("p:nth-child(4)").textContent.replace("Permission: ", "").trim();
      position = detailsCard.querySelector("p:nth-child(5)").textContent.replace("Position: ", "").trim();
      contactNumber = detailsCard.querySelector("p:nth-child(6)").textContent.replace("Contact: ", "").trim();
      email = detailsCard.querySelector("p:nth-child(7)").textContent.replace("Email: ", "").trim();
  } else {
      console.error("Could not find the row or details card.");
      return;
  }

  // Populate the edit form
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-branch").value = branch;
  document.getElementById("edit-position").value = position;
  document.getElementById("edit-contact").value = contactNumber;
  document.getElementById("edit-email").value = email;
  document.querySelector(`input[name="edit-permission"][value="${permission}"]`).checked = true;

  // Store employeeId and branchId in hidden fields
  document.getElementById("edit-doc-id").value = employeeId;
  document.getElementById("edit-branch-id").value = branchId;

  console.log("Employee ID:", employeeId);
  console.log("Branch ID:", branchId);

  // Show the edit modal
  openEditModal();
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === employeeModal) {
    closeModal();
  }
};

function deleteRow(button) {
  const row = button.parentElement.parentElement;
  row.remove();
}