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
    const tableBody = document.querySelector("#coupons-table tbody");

    try {
        // Reference to the coupons collection
        const couponsCollection = collection(db, "coupons");

        // Get all documents in the coupons collection
        const snapshot = await getDocs(couponsCollection);

        snapshot.forEach((doc) => {
            const couponId = doc.id;
            const data = doc.data();

            console.log(`Coupon ID: ${couponId}`);
            console.log(`Coupon data: ${JSON.stringify(data)}`);

            // Convert Firestore timestamps to readable date format
            const startDate = data.coup_start ? data.coup_start.toDate().toLocaleDateString() : "N/A";
            const endDate = data.coup_end ? data.coup_end.toDate().toLocaleDateString() : "N/A";

            // Convert coup_isActive to "Active" or "Expired"
            const status = data.coup_isActive ? "Active" : "Expired";

            // Create a new table row
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${couponId || "N/A"}</td>
                <td>${data.coup_amount || "N/A"}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>${data.coup_desc || "N/A"}</td>
                <td>${status}</td>
                <td>
                    <button class="action-btn edit"><i class="fas fa-edit"></i></button>
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