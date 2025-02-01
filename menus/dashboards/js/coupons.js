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
            row.setAttribute("edit-doc-old-id", couponId); // Store coupon ID in the row

            row.innerHTML = `
                <td>${couponId || "N/A"}</td>
                <td>${data.coup_amount || "N/A"}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>${data.coup_desc || "N/A"}</td>
                <td>${status}</td>
                <td>
                    <button class="action-btn edit" onclick="editCoupon(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" id="delete-coupon"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);

            // Now add event listener to the delete button
              document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                  console.log("HI CONSOLE");
                  deleteCoupon(e.target);  // Pass the button as the argument
                  
                });
              });

            // Generate a random color for the initials
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                    
            // Append a new details card
            const detailsContainer = document.createElement("div");
            detailsContainer.className = "details";
            detailsContainer.innerHTML = `
                <div class="details-card">
                    <div class="initials" style="background-color: ${randomColor};">${couponId}</div>
                    <p><strong>Amount:</strong> ${data.coup_amount}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    <p><strong>End Date:</strong> ${endDate}</p>
                    <p><strong>Coupon Description:</strong> ${data.coup_desc}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <div class="actions">
                        <button class="action-btn edit" onclick="editCoupon(this)"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" id="delete-coupon"><i class="fa-solid fa-trash"></i></button>
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


    document.addEventListener("DOMContentLoaded", () => {
        // Get references to the buttons
        const saveBtn = document.getElementById('save-editCoupon');
    
        // Add event listeners
        saveBtn.addEventListener('click', updateCoupon);
    });

    // Update Coupon

    async function updateCoupon() {
        const oldCouponId = document.getElementById("edit-doc-old-id").value.trim(); // Store old ID
        const newCouponId = document.getElementById("edit-couponId").value.trim();
        const amount = document.getElementById("edit-amountCoupon").value.trim();
        const startDate = document.getElementById("edit-startDate").value.trim();
        const endDate = document.getElementById("edit-endDate").value.trim();
        const description = document.getElementById("edit-description").value.trim();
        const status = document.getElementById("edit-status").value.trim();
    
        if (!newCouponId) {
            console.error("Error: Coupon ID is missing.");
            alert("Coupon ID is required.");
            return;
        }
    
        try {
            const couponData = {
                coup_amount: parseFloat(amount) || 0,
                coup_start: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
                coup_end: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
                coup_desc: description,
                coup_isActive: status.toLowerCase() === "active"
            };
    
            if (oldCouponId === newCouponId) {
                // ID hasn't changed, just update the existing document
                const couponRef = doc(db, "coupons", newCouponId);
                await updateDoc(couponRef, couponData);
            } else {
                // ID has changed: delete old doc, create new one
                const oldCouponRef = doc(db, "coupons", oldCouponId);
                const newCouponRef = doc(db, "coupons", newCouponId);
    
                await deleteDoc(oldCouponRef); // Remove old document
                await setDoc(newCouponRef, couponData); // Create new document with new ID
            }
    
            console.log("Coupon updated successfully!");
    
            closeEditCouponModal();
            
    
        } catch (error) {
            console.error("Error updating coupon:", error);
            alert("Failed to update coupon. Please try again.");
        }
    }
    
 async function deleteCoupon(button) {
     alert("DELETE Coupon");
     console.log("delete");
 
     let couponId, row, detailsCard, detailsContainer;
 
     // Check if the button is inside a table row or details card
     row = button.closest("tr");
     detailsCard = button.closest(".details-card");
 
     if (row) {
         // If deleting from the table
         couponId = row.cells[0].textContent;
     } else if (detailsCard) {
         // If deleting from the details card
         /*
         employeeId = detailsCard.getAttribute("data-id");
         branchId = detailsCard.getAttribute("data-branch-id");*/
         detailsContainer = detailsCard.closest(".details"); // Get the parent container
     } else {
         console.error("Could not find the row or details card.");
         return;
     }
 
     alert("DELETE COUPON ID: " + couponId);
 
     // Confirm before deleting
     const confirmDelete = confirm("Are you sure you want to delete this coupon?");
     
     if (confirmDelete) {
         try {
             // Get reference to the employee document in Firestore
             const couponRef = doc(db, "coupons", couponId);
 
             // Delete the employee document from Firestore
             await deleteDoc(couponRef);
 
             console.log("Coupon deleted successfully!");
 
             // Remove the row or details card from the UI
             if (row) {
                 row.remove();
             }
             if (detailsCard) {
                 detailsCard.remove();
                 // If the details container is now empty, remove it too
                 if (detailsContainer && detailsContainer.childElementCount === 0) {
                     detailsContainer.remove();
                 }
             }
 
             alert("Coupon deleted successfully!");
         } catch (error) {
             console.error("Error deleting employee:", error.message);
             console.error(error.stack);
         }
     } else {
         console.log("Employee deletion canceled.");
     }
 }
    



    // Call fetchData when the page loads
    document.addEventListener("DOMContentLoaded", fetchData);