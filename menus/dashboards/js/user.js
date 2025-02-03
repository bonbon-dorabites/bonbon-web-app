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


// Function to search users based on the fields (first name, last name, email, phone)
document.getElementById('search').addEventListener('input', searchUsers);

// Fetch data from Firestore and populate the table
async function fetchData() {
  const tableBody = document.querySelector("#user-table tbody");
  const detailsSection = document.getElementById("userDetails-section"); // Ensure this exists in your HTML
  const allRows = [];

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
      row.setAttribute("data-id", userId); // Store user ID in the row
      row.innerHTML = `
        <td>${data.firstName || "N/A"}</td>
        <td>${data.lastName || "N/A"}</td>
        <td>${data.email || "N/A"}</td>
        <td>${data.phone || "N/A"}</td>
      `;
      tableBody.appendChild(row);
      allRows.push(row); // Keep track of all rows

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

    // Store rows globally for search functionality
    window.allRows = allRows;

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Search function to filter table rows based on the input
function searchUsers() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  
  // Filter through all rows
  const filteredRows = window.allRows.filter(row => {
    const cells = row.querySelectorAll("td");
    const firstName = cells[0].textContent.toLowerCase();
    const lastName = cells[1].textContent.toLowerCase();
    const email = cells[2].textContent.toLowerCase();
    const phone = cells[3].textContent.toLowerCase();

    // Check if any field matches the search term
    return firstName.includes(searchTerm) || lastName.includes(searchTerm) ||
           email.includes(searchTerm) || phone.includes(searchTerm);
  });

  // Hide all rows first
  window.allRows.forEach(row => row.style.display = 'none');

  // Show only filtered rows
  filteredRows.forEach(row => row.style.display = '');

  // Show the "Clear Search" button
  document.getElementById('clearSearchBtn').style.display = 'inline-block';
}

// Function to clear the search and reset table to original state
function clearSearch() {
  document.getElementById('search').value = ''; // Clear search input
  window.allRows.forEach(row => row.style.display = ''); // Show all rows
  document.getElementById('clearSearchBtn').style.display = 'none'; // Hide "Clear Search" button
}

// Call fetchData when the page loads
document.addEventListener("DOMContentLoaded", fetchData);
