function showLoadingModal() {
  window.addEventListener("DOMContentLoaded", function() {
      // Create the modal instance
      const loadingModal = new bootstrap.Modal(document.getElementById('gifModal'), {
          backdrop: 'static', // Prevents closing modal by clicking outside
          keyboard: false // Disables closing the modal with keyboard
      });

      // Show the modal after a delay
      setTimeout(() => {
          const modalElement = document.getElementById('gifModal');
          modalElement.style.display = 'block'; // Now show the modal after styles are loaded
          loadingModal.show();
      }, 300); // Delay as needed

      // Optionally, hide the modal after some time (simulate processing)
      setTimeout(() => {
          loadingModal.hide(); // Hide the modal after 5 seconds
      }, 5000); // Adjust the time as needed
  });
}


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

// Get modal and form elements
const employeeModal = document.getElementById("employeeModal");
const editModal = document.getElementById("editEmployeeModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");
const couponModal = document.getElementById("couponsModal");
const itemModal = document.getElementById("menuModal");
const editItemModal = document.getElementById("editMenuModal");
const editCouponModal = document.getElementById("edit-couponsModal");
const loadingCouponModal = document.getElementById("details-couponsModal");

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

function openMenuModal() {
  itemModal.style.display = "block";
}

function closeMenuModal() {
  itemModal.style.display = "none";
}

function openEditMenuModal() {
  editItemModal.style.display = "block";
}

function closeEditMenuModal() {
  editItemModal.style.display = "none";
}

function openCouponModal() {
  couponModal.style.display = "block";
}

function closeCouponModal() {
  couponModal.style.display = "none";
}

function openDetailsModal() {
  loadingCouponModal.style.display = "block";
}

function closeDetailsModal() {
  loadingCouponModal.style.display = "none";
}

function closeEditCouponModal() {
  editCouponModal.style.display = "none";
}


function editEmployee(button) {
  console.log("EDIT");

  let employeeId, branchId, name, branch, position, contactNumber, email;

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
      position = row.cells[2].textContent;
      contactNumber = row.cells[3].textContent;
      email = row.cells[4].textContent;
  } else if (detailsCard) {
      // If the button is inside a details card
      employeeId = detailsCard.getAttribute("data-id");
      branchId = detailsCard.getAttribute("data-branch-id");

      // Get data from details card
      name = detailsCard.querySelector("p:nth-child(2)").textContent.replace("Name: ", "").trim();
      branch = detailsCard.querySelector("p:nth-child(3)").textContent.replace("Branch: ", "").trim();
      position = detailsCard.querySelector("p:nth-child(4)").textContent.replace("Position: ", "").trim();
      contactNumber = detailsCard.querySelector("p:nth-child(5)").textContent.replace("Contact: ", "").trim();
      email = detailsCard.querySelector("p:nth-child(6)").textContent.replace("Email: ", "").trim();
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

  // Store employeeId and branchId in hidden fields
  document.getElementById("edit-doc-id").value = employeeId;
  document.getElementById("edit-branch-id").value = branchId;

  console.log("Employee ID:", employeeId);
  console.log("Branch ID:", branchId);

  // Show the edit modal
  openEditModal();
}


function editMenu(button) {
  console.log("EDIT ");
  const row = button.closest("tr");

  let itemName, price, docId;

  if (row) {
      // If the button is inside a table row
      docId = row.getAttribute("data-menu-id"); // Get the docId from the row

      // Get the data for the selected item
      itemName = row.cells[1].innerText;
      price = parseFloat(row.cells[4].innerText.replace("₱", "").replace(",", ""));
  } else {
      console.error("Could not find the row or details card.");
      return;
  }

  // Populate the modal fields
    document.getElementById("edit-menu_name").value = itemName;
    document.getElementById("edit-menu_price").value = price;

    
  // Store docId in a hidden field
  document.getElementById("edit-doc-menu-id").value = docId;
  console.log("DOC ID:", docId);

  // Show the edit modal
  openEditMenuModal();
}

// Function to dynamically display input fields for the different sizes
function displayPriceFields() {
    const menuCategory = document.getElementById("menu-category").value;
    
    // Check if the category is Dorayaki Bites
    if (menuCategory === "Dorayaki Bites") {
        const priceSection = document.getElementById("price-fields");

        // Create input fields for each size
        priceSection.innerHTML = `
            <label for="price-oishi" >Price for OISHI (8pcs): </label>
            <input type="number" id="price-oishi" class="w-100" name="price-oishi" required><br>
            <label for="price-sugoi">Price for SUGOI (12pcs): </label>
            <input type="number" id="price-sugoi" class="w-100" name="price-sugoi" required><br>
            <label for="price-bonbon">Price for BONBON Box (16pcs): </label>
            <input type="number" id="price-bonbon" class="w-100" name="price-bonbon" required><br>
        `;
        
        const solePrice = document.getElementById("menu_price");
        solePrice.style.display = "none";
    } else {
        // Clear price fields if not Dorayaki Bites
        const solePrice = document.getElementById("menu_price");
        solePrice.style.display = "block";
        document.getElementById("price-fields").innerHTML = "";
    }


}

// Call this function whenever the category dropdown changes
document.getElementById("menu-category").addEventListener("change", displayPriceFields);

// Ensure price input only accepts numbers
function validatePrice(input) {
  input.value = input.value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal points
}

/*function editCoupon(button) {
  let couponId, `amount`, startDate, endDate, description, status;
  // Check if the clicked button is in a table row or details card
  const row = button.closest("tr");
  const detailsCard = button.closest(".details-card");

  if (row) {
    // If the button is inside a table row
    // Get data from table row
    couponId = row.cells[0].textContent;
    amount = row.cells[1].textContent;
    startDate = row.cells[2].textContent;
    endDate = row.cells[3].textContent;
    description = row.cells[4].textContent;
    status = row.cells[5].textContent;
  } else if (detailsCard) {
      // If the button is inside a details card
      
      // Get coupon ID from the `.initials` div
      const initialsDiv = detailsCard.querySelector(".initials");
      couponId = initialsDiv ? initialsDiv.textContent.trim() : "";
      // Get data from details card
      amount = detailsCard.querySelector("p:nth-child(2)").textContent.replace("Amount: ", "").trim();
      startDate = detailsCard.querySelector("p:nth-child(3)").textContent.replace("Start Date: ", "").trim();
      endDate = detailsCard.querySelector("p:nth-child(4)").textContent.replace("End Date: ", "").trim();
      description = detailsCard.querySelector("p:nth-child(5)").textContent.replace("Coupon Description: ", "").trim();
      status = detailsCard.querySelector("p:nth-child(6)").textContent.replace("Status: ", "").trim();
  } else {
      console.error("Could not find the row or details card.");
      return;
  }

      // Format the start and end date into yyyy-mm-dd for <input type="date">
      const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
      const formattedEndDate = new Date(endDate).toISOString().split('T')[0];

   // Populate the edit form
   document.getElementById("edit-couponId").value = couponId;
   document.getElementById("edit-doc-old-id").value = couponId;
   document.getElementById("edit-amountCoupon").value = amount;
   document.getElementById("edit-startDate").value = formattedStartDate;
   document.getElementById("edit-endDate").value = formattedEndDate;
   document.getElementById("edit-description").value = description;
   document.getElementById("edit-status").value = status;

   console.log("Coupon ID:", couponId);

    // Show the edit modal
    document.getElementById("edit-couponsModal").style.display = "block";

}*/

// Close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === employeeModal) {
    closeModal();
  }
};

