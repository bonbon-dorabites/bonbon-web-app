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
const userModal = document.getElementById("usersModal");
const editUserModal = document.getElementById("editUsersModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");

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

// Open user modal
function openUserModal() {
  // Open the modal
  userModal.style.display = "block";

  // Get the current role selected
  const role = document.getElementById('role-dropdown').value.trim();

  // Call function to handle branch dropdown and input field states based on the current role
  toggleBranchDropdown(role);
  toggleInputFields(role);

  // Add event listener for role change inside the modal
  const roleDropdown = document.getElementById('role-dropdown');
  roleDropdown.addEventListener('change', handleRoleChange);
}

// Function to toggle the branch dropdown based on the role
function toggleBranchDropdown(role) {
  const userBranch = document.getElementById('user-branch');
  
  if (role === 'Customer') {
      userBranch.disabled = true;  // Disable branch dropdown for Customer role
      console.log("Customer role selected, branch dropdown disabled");
  } else {
      userBranch.disabled = false;  // Enable branch dropdown for other roles
      console.log("Role is not Customer, branch enabled");
  }
}

// Function to disable/enable input fields based on the role
function toggleInputFields(role) {
  const lastName = document.getElementById('lastName');
  const firstName = document.getElementById('firstName');
  const phone = document.getElementById('phone');
  
  if (role === 'Manager' || role === 'Staff' || role === 'Owner') {
      // Disable fields for Manager, Staff, or Owner
      lastName.disabled = true;
      firstName.disabled = true;
      phone.disabled = true;
      
      console.log("Manager, Staff, or Owner role selected, fields disabled");
  } else {
      // Enable fields for other roles
      lastName.disabled = false;
      firstName.disabled = false;
      phone.disabled = false;
      
      console.log("Role is not Manager/Staff/Owner, fields enabled");
  }
}

// Handle role change to enable/disable branch dropdown and input fields when role is changed in the modal
function handleRoleChange() {
  const role = document.getElementById('role-dropdown').value.trim();
  toggleBranchDropdown(role);  // Call the function to toggle the branch dropdown
  toggleInputFields(role);     // Call the function to toggle the input fields
}


function closeUserModal() {
  userModal.style.display = "none";
}

function openUserEditModal() {
  editUserModal.style.display = "block";
    // Get the current role selected
    const role = document.getElementById('edit-role-dropdown').value.trim();

    // Call function to handle branch dropdown and input field states based on the current role
    toggleEditBranchDropdown(role);
    toggleEditInputFields(role);
  
    // Add event listener for role change inside the modal
    const roleDropdown = document.getElementById('edit-role-dropdown');
    roleDropdown.addEventListener('change', handleEditRoleChange);


}

// Function to toggle the branch dropdown based on the role
function toggleEditBranchDropdown(role) {
  const userBranch = document.getElementById('edit-user-branch');
  
  if (role === 'Customer') {
      userBranch.disabled = true;  // Disable branch dropdown for Customer role
      console.log("Customer role selected, branch dropdown disabled");
  } else {
      userBranch.disabled = false;  // Enable branch dropdown for other roles
      console.log("Role is not Customer, branch enabled");
  }
}

// Function to disable/enable input fields based on the role
function toggleEditInputFields(role) {
  const lastName = document.getElementById('edit-lastName');
  const firstName = document.getElementById('edit-firstName');
  const phone = document.getElementById('edit-phone');

  if (role === 'Manager' || role === 'Staff' || role === 'Owner') {
      // Disable fields for Manager, Staff, or Owner
      lastName.disabled = true;
      firstName.disabled = true;
      phone.disabled = true;
      
      console.log("Manager, Staff, or Owner role selected, fields disabled");
  } else {
      // Enable fields for other roles
      lastName.disabled = false;
      firstName.disabled = false;
      phone.disabled = false;
      
      console.log("Role is not Manager/Staff/Owner, fields enabled");
  }
}

// Handle role change to enable/disable branch dropdown and input fields when role is changed in the modal
function handleEditRoleChange() {
  const role = document.getElementById('edit-role-dropdown').value.trim();
  toggleEditBranchDropdown(role);  // Call the function to toggle the branch dropdown
  toggleEditInputFields(role);     // Call the function to toggle the input fields
}



function closeUserEditModal() {
  editUserModal.style.display = "none";
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

function editUser(button) {
  let userId, branch, role, lastName, firstName, contactNumber, email;

  // Check if the clicked button is in a table row or details card
  const row = button.closest("tr");
  const detailsCard = button.closest(".details-card");

  if (row) {
      // If the button is inside a table row
      userId = row.getAttribute("data-id");
      branchId = row.getAttribute("data-branch-id");

      // Get data from table row
      firstName = row.cells[0].textContent;
      lastName = row.cells[1].textContent;
      email = row.cells[4].textContent;
      contactNumber = row.cells[5].textContent;
      role = row.cells[2].textContent;
      branch = row.cells[3].textContent;
      console.log("BRANCH delete" + branch);
      
  } else if (detailsCard) {
      // If the button is inside a details card
      userId = detailsCard.getAttribute("data-id");

     // Get data from details card
     lastName = detailsCard.querySelector("p:nth-child(2)").textContent.replace("Last Name: ", "").trim();
     firstName = detailsCard.querySelector("p:nth-child(3)").textContent.replace("First Name: ", "").trim();
     email = detailsCard.querySelector("p:nth-child(4)").textContent.replace("Email: ", "").trim();
     contactNumber = detailsCard.querySelector("p:nth-child(5)").textContent.replace("Contact: ", "").trim();
  } else {
      console.error("Could not find the row or details card.");
      return;
  }

  // Populate the edit form with only the required fields
  document.getElementById("edit-lastName").value = lastName;
  document.getElementById("edit-firstName").value = firstName;
  document.getElementById("edit-phone").value = contactNumber;
  document.getElementById("edit-emailAd").value = email;
  document.getElementById("edit-role-dropdown").value = role;
  document.getElementById("edit-user-branch").value = branch;
  
  // Store employeeId and branchId in hidden fields
  document.getElementById("edit-doc-id").value = userId;
  document.getElementById("edit-branch-id").value = branch;


  console.log("User ID:", userId);

  // Show the edit modal
  openUserEditModal(); 


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