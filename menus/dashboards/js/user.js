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

// Function to search users based on the fields (first name, last name, email, phone)
document.getElementById('search2').addEventListener('input', searchUsers);

async function fetchData() {
  const tableBody = document.querySelector("#user-table tbody");
  const detailsSection = document.getElementById("userDetails-section");
  const allRows = [];

  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);

    snapshot.forEach((doc) => {
      const userId = doc.id;
      const data = doc.data();
      const userRole = data.role || "N/A";

      if (["Staff", "Manager", "Owner"].includes(userRole)) {
        return;
      }

      const row = document.createElement("tr");
      row.setAttribute("data-id", userId);
      row.innerHTML = `
        <td>${data.firstName || "N/A"}</td>
        <td>${data.lastName || "N/A"}</td>
        <td>${data.email || "N/A"}</td>
        <td>${data.phone || "N/A"}</td>
      `;
      tableBody.appendChild(row);
      allRows.push(row);

      const name = data.lastName && data.firstName
        ? `${data.lastName} ${data.firstName}`
        : data.firstName || data.lastName || "N/A";

      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

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

    // Log to check if rows are being populated
    console.log("Rows populated: ", window.allRows);

    // After data is fetched, activate search functionality
    document.getElementById('search').addEventListener('input', searchUsers);

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Search function to filter table rows based on the input
function searchUsers() {
  console.log("Search triggered!");
  const searchTerm = document.getElementById('search').value.toLowerCase();

  // Log to check the search term
  console.log("Search Term: ", searchTerm);

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
