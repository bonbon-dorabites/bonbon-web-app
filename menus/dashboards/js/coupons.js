import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDocs, Timestamp, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

              // Generate a random color for the initials
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                
        // Append a new details card
                const detailsContainer = document.createElement("div");
                detailsContainer.className = "details";
                detailsContainer.innerHTML = `
                    <div class="details-card">
                    <div class="initials" style="background-color: ${randomColor};">HI</div>
                    <p><strong>Amount:</strong> ${data.coup_amount}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    <p><strong>End Date:</strong> ${endDate}</p>
                    <p><strong>Coupon Description:</strong> ${data.coup_desc}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <div class="actions">
                        <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" id="delete-employee"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    </div>
                `;
                
                const detailsSection = document.getElementById("couponDetails-section"); // Add this ID to your parent container for details
                detailsSection.appendChild(detailsContainer);
        });

      


    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to add a new coupon to Firestore
async function addCoupon() {
    const couponId = document.getElementById("couponId").value.trim();
    const amountCoupon = document.getElementById("amountCoupon").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value === "Active"; // Convert to boolean

    // Validate required fields
    if (!couponId || !amountCoupon || !startDate || !endDate || !description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        // Convert date input to Firestore Timestamp
        const startTimestamp = Timestamp.fromDate(new Date(startDate));
        const endTimestamp = Timestamp.fromDate(new Date(endDate));

        // Firestore reference to "coupons" collection
        const couponRef = doc(db, "coupons", couponId);

        // Add data to Firestore
        await setDoc(couponRef, {
            coup_amount: parseFloat(amountCoupon),
            coup_start: startTimestamp,
            coup_end: endTimestamp,
            coup_desc: description,
            coup_isActive: status
        });

        alert("Coupon added successfully!");
        closeCouponModal(); // Close modal after successful save
        
    } catch (error) {
        console.error("Error adding coupon:", error);
        alert("Failed to add coupon.");
    }
}

    // Event listener for the save button
    document.getElementById("save-coupon").addEventListener("click", addCoupon);



    // Call fetchData when the page loads
    document.addEventListener("DOMContentLoaded", fetchData);