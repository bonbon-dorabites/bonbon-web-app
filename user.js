import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";


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

// Fetch data from Firestore and populate the table

async function fetchData() {
    const tableBody = document.querySelector("#user-table tbody");
  
    try {
      // Reference to the users collection
      const usersCollection = collection(db, "users");

      // Get all documents in the users collection
      const snapshot = await getDocs(usersCollection);

       snapshot.forEach((doc) => {
                const userId = doc.id;
                const data = doc.data();

                console.log(`User ID: ${userId}`);
                console.log(`User data: ${JSON.stringify(data)}`);
          
              // Create a new table row
              const row = document.createElement("tr");
              row.setAttribute("data-id", userId); // Store employee ID in the row
              
              row.innerHTML = `
                <td>${data.lastName || "N/A"}</td>
                <td>${data.firstName || "N/A"}</td>
                <td>${data.email || "N/A"}</td>
                <td>${data.phone || "N/A"}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" id="delete-user"><i class="fa-solid fa-trash"></i></button>
                </td>
              `;
              tableBody.appendChild(row);

  
          });

  
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Call fetchData when the page loads
  document.addEventListener("DOMContentLoaded", fetchData);