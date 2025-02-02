import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB2ACxlgsaO0_E2zA1zsPEntCXOIHaG21I",
    authDomain: "bonbon-8a34a.firebaseapp.com",
    projectId: "bonbon-8a34a",
    storageBucket: "bonbon-8a34a.firebasestorage.app",
    messagingSenderId: "276254510771",
    appId: "1:276254510771:web:b936bce5f45ed255b56ac6",
    measurementId: "G-85BQTNL30R"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function showModal(message, isSuccess) {
  const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  const modalMessage = document.getElementById('modalMessage');

  modalMessage.textContent = message;

  // Change color based on success or error
  if (isSuccess) {
      document.querySelector('#loadingModal .modal-content').style.backgroundColor = '#d4edda';
  } else {
      document.querySelector('#loadingModal .modal-content').style.backgroundColor = '#f8d7da';
  }

  loadingModal.show();
}

function hideModal() {
  const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  loadingModal.hide();
}

function showConfirmation(message, callback) {
  const modalElement = document.getElementById('confirmationModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  const modalMessage = document.getElementById('confirmationMessage');
  const confirmButton = document.getElementById('confirmActionBtn');

  // Set the confirmation message
  modalMessage.textContent = message;

  // Remove any previous event listeners to prevent duplicate triggers
  confirmButton.replaceWith(confirmButton.cloneNode(true));
  const newConfirmButton = document.getElementById('confirmActionBtn');

  // Attach the new event listener
  newConfirmButton.addEventListener("click", function () {
      callback(); // Execute the callback function
      modalInstance.hide();
  });

  // Show the modal
  modalInstance.show();
}


// Fetch data from Firestore and populate the table
async function fetchData() {
  const tableBody = document.querySelector("#user-table tbody");
  const detailsSection = document.getElementById("userDetails-section"); // Ensure this exists in your HTML

  try {
      // Reference to the users collection
      const usersCollection = collection(db, "users");

      // Get all documents in the users collection
      const snapshot = await getDocs(usersCollection);

      snapshot.forEach((doc) => {
          const userId = doc.id;
          const data = doc.data();
          const userRole = data.role || "N/A"; // Ensure role exists

          // Skip users with role "Staff", "Manager", or "Owner"
          if (["Staff", "Manager", "Owner"].includes(userRole)) {
              return; // Skip this user
          }

          console.log(`User ID: ${userId}`);
          console.log(`User data: ${JSON.stringify(data)}`);

          // Create a new table row (without the actions column)
          const row = document.createElement("tr");
          row.setAttribute("data-id", userId); // Store employee ID in the row

          row.innerHTML = `
              <td>${data.firstName || "N/A"}</td>
              <td>${data.lastName || "N/A"}</td>
              <td>${data.email || "N/A"}</td>
              <td>${data.phone || "N/A"}</td>
          `;

          tableBody.appendChild(row);

          // Generate initials
          const name = data.lastName && data.firstName
              ? `${data.lastName} ${data.firstName}`
              : data.firstName || data.lastName || "N/A";

          const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

          // Generate a random color for the initials
          const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

          // Append a new details card (without the actions button)
          const detailsContainer = document.createElement("div");
          detailsContainer.className = "details";
          detailsContainer.innerHTML = `
              <div class="details-card" data-id="${userId}">
                  <div class="initials" style="background-color: ${randomColor};">${initials}</div>
                  <p><strong>First Name:</strong> ${data.firstName}</p>
                  <p><strong>Last Name:</strong> ${data.lastName}</p>
                  <p><strong>Contact:</strong> ${data.phone}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
              </div>
          `;

          detailsSection.appendChild(detailsContainer);
      });

  } catch (error) {
      console.error("Error fetching data:", error);
  }
}


  /*
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailPattern.test(email);
        console.log(`Email validation (${email}):`, isValid);
        return isValid;
    }

    function validateContactNumber(contactNumber) {
        const contactPattern = /^[0-9]{11}$/; // Adjust length if needed
        const isValid = contactPattern.test(contactNumber);
        console.log(`Contact validation (${contactNumber}):`, isValid);
        return isValid;
    }

  
    /* EDIT USERS *//*
    document.addEventListener("DOMContentLoaded", () => {
        // Get references to the buttons
        const saveBtn = document.getElementById('save-userEdit');
    
        // Add event listeners
        saveBtn.addEventListener('click', updateUser);
    });
    
/*
    async function updateUser() {
        const userId = document.getElementById("edit-doc-id").value;
        alert("UPDATED: " + userId);
    
        const lastName = document.getElementById("edit-lastName").value.trim();
        const firstName = document.getElementById("edit-firstName").value.trim();
        const phone = document.getElementById("edit-phone").value.trim();
        const email = document.getElementById("edit-emailAd").value.trim();
        const role = document.getElementById("edit-role-dropdown").value.trim();
        const branch = document.getElementById("edit-user-branch").value.trim();
        alert(branch);

        const branchMap = {
          "SM Valenzuela": "SmValenzuela",
          "SM North Edsa": "SmNorthEdsa",
          "One Mall Valenzuela": "OneMallVal"
      };
  
      // Get branch ID from map
        const branchId = branchMap[branch];



        let updatedData; 
            if(role === "Customer") {
              updatedData = {
                lastName,
                firstName,
                phone,
                email,
            };

            } else {

              alert("FOR OTHERS");

              updatedData = {
                branchId,
                role,
                email,
            };
            
            }


        try {
            const userRef = doc(db, "users", userId);

            await updateDoc(userRef, updatedData);

            console.log("User updated successfully!");
            alert("User updated successfully!");
            
            // Close modal after save
            closeEditModal();
            
            // Refresh the data or reload page
            location.reload();
          } catch (error) {
            console.error("Error updating employee:", error);
          }
    }*/

    /* DELETE USER */
  async function deleteUser(button) {
    console.log("delete");

    let userId, row, detailsCard, detailsContainer;

    // Check if the button is inside a table row or details card
    row = button.closest("tr");
    detailsCard = button.closest(".details-card");

    if (row) {
        userId = row.getAttribute("data-id");
    } else if (detailsCard) {
        userId = detailsCard.getAttribute("data-id");
        detailsContainer = detailsCard.closest(".details"); // Get the parent container
    } else {
        console.error("Could not find the row or details card.");
        return;
    }

    console.log("DELETE USER ID: " + userId);

    // Show confirmation modal before deleting
    showConfirmation("Are you sure you want to delete this employee?", async function () {
        try {
            // Get reference to the employee document in Firestore
            const userRef = doc(db, "users", userId);

            // Delete the user document from Firestore
            await deleteDoc(userRef);

            console.log("User deleted successfully!");

            // Remove the row or details card from the UI
            if (row) row.remove();
            if (detailsCard) {
                detailsCard.remove();
                if (detailsContainer && detailsContainer.childElementCount === 0) {
                    detailsContainer.remove();
                }
            }

            showModal("User Deleted Successfully", true);
        } catch (error) {
            console.error("Error deleting user:", error.message);
            showModal("Error deleting user!", false);
        }
    });
}

// Call fetchData when the page loads
document.addEventListener("DOMContentLoaded", fetchData);