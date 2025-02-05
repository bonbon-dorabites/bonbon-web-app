// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, orderBy, addDoc, doc, updateDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';

// Function to fetch and display items
async function fetchItems() {
    console.log("Fetching items...");
    const itemsCollection = collection(db, "items");
    const itemsSnapshot = await getDocs(itemsCollection);
    const menuTableBody = document.getElementById("menu-table-body");

    menuTableBody.innerHTML = ""; // Clear existing table rows
    let index = 1; // Product numbering

    itemsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Skip items that have no price or a null/undefined price
        if (data.item_price === undefined || data.item_price === null) {
            return; 
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index}</td>
            <td>${data.item_name}</td>
            <td>${data.category}</td>
            <td>₱${data.item_price.toFixed(2)}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${data.status ? "checked" : ""} data-id="${docSnap.id}">
                    <span class="slider round"></span>
                </label>
            </td>
            <td>
                <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        menuTableBody.appendChild(row);
        index++;
    });

    // Add event listeners to toggle buttons
    document.querySelectorAll('.switch input').forEach((toggle) => {
        toggle.addEventListener("change", async function () {
            const itemId = this.getAttribute("data-id");
            const newStatus = this.checked;

            await updateDoc(doc(db, "items", itemId), { status: newStatus });
            console.log(`Updated ${itemId}: Status ${newStatus}`);
        });
    });
}


  // Fetch items on page load
  window.onload = fetchItems;
