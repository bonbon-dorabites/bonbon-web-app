// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, updateDoc, where, getDocs, getDoc, setDoc, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
    const cancelButton = document.getElementById('cancelActionBtn'); // Get the cancel button

    // Set the confirmation message
    modalMessage.textContent = message;

    // Remove previous event listeners to prevent duplication
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    cancelButton.replaceWith(cancelButton.cloneNode(true));

    const newConfirmButton = document.getElementById('confirmActionBtn');
    const newCancelButton = document.getElementById('cancelActionBtn');

    // Attach new event listener for Confirm
    newConfirmButton.addEventListener("click", function () {
        callback(); // Execute the callback function
        modalInstance.hide(); // Hide modal properly
    });

    // Attach new event listener for Cancel
    newCancelButton.addEventListener("click", function () {
        modalInstance.hide(); // Ensure modal is closed
    });

    // Show the modal
    modalInstance.show();
}

// Mapping of branchId to display text
const branchMaps = {
    "SmValenzuela": "SM VALENZUELA",
    "SmNorthEdsa": "SM NORTH EDSA",
    "OneMallVal": "ONE MALL VALENZUELA" 
};

const reversedBranchMaps = {
    "SM VALENZUELA": "SmValenzuela",
    "SM NORTH EDSA": "SmNorthEdsa",
    "ONE MALL VALENZUELA": "OneMallVal"
};


async function fetchUserBranch(userEmail) {
    try {
        console.log("Fetching user branch for email:", userEmail);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const branchId = userDoc.data().branchId;
            console.log("Branch ID found:", branchId);

            const branchButton = document.getElementById("staff-branch");
            if (branchButton) {
                branchButton.innerHTML = `<strong>${branchMaps[branchId] || "Unknown Branch"}</strong>`;

                // After setting the content, call fetchOrders
                fetchOrders(branchId); // Pass the branchId to fetchOrders
            } else {
                console.error("Button with ID 'staff-branch' not found.");
            }

            // Wait for DOM update and then call setupStockUpdate
            setTimeout(() => {
                setupStockUpdate(branchId);
            }, 0);
        } else {
            console.error("User document not found.");
        }
    } catch (error) {
        console.error("Error fetching user branch:", error);
    }
}

// Ensure DOM is ready before running the script
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            fetchUserBranch(user.email);
        } else {
            console.warn("No user is currently logged in.");
        }
    });
};

let toggleStock;  // Declare toggleStock globally

const setupStockUpdate = (branchId) => {
    // Define the document reference for the specific branch
    const branchRef = doc(db, 'branches', branchId);

    // Define functions to handle the stock update for each menu item
    toggleStock = (itemName, isSoldOut, showSuccessModal = true) => {
        console.log(`Updating stock for item: ${itemName}, Sold-Out: ${isSoldOut}`);
        const itemRef = doc(branchRef, 'items', itemName);
        
        return updateDoc(itemRef, { isSoldOut: isSoldOut })
            .then(() => {
                console.log(`${itemName} updated to ${isSoldOut ? 'Sold-Out' : 'Available'}`);
                if (showSuccessModal) {
                    showModal("Item(s) successfully updated.", true);
                }
            })
            .catch((error) => {
                console.error("Error updating item stock:", error);
                showModal(`Error updating item(s): ${error.message}`, false);
            });
    };

    // Attach event listeners to buttons that toggle stock availability
    const setStockStatus = (itemName, isSoldOut) => {
        return () => {
            console.log(`Button clicked for item: ${itemName}, Sold-Out: ${isSoldOut}`);
            toggleStock(itemName, isSoldOut);
        };
    };

    // Attach event listeners to each menu item in the stock update section
    document.querySelectorAll('.dash-buttons button').forEach(button => {
        const itemId = button.parentElement.previousElementSibling.textContent.trim().replace(/\s+/g, '').toLowerCase();
        const isAvailable = button.classList.contains('btn-success');
        
        console.log(`Button for item ${itemId} has availability: ${isAvailable}`);
        
        button.onclick = setStockStatus(itemId, !isAvailable);
    });
};

// Grouped stock update functions (show only one modal)
const updateMultipleStocks = (items, isSoldOut) => {
    const updatePromises = items.map(item => toggleStock(item, isSoldOut, false));

    Promise.all(updatePromises).then(() => {
        showModal("Item(s) successfully updated.", true);
    });
};

// Ensure the functions like hasOishi are globally available
window.hasOishi = () => toggleStock('dorabite_oishi', false);
window.hasNoOishi = () => toggleStock('dorabite_oishi', true);
window.hasSugoi = () => toggleStock('dorabite_sugoi', false);
window.hasNoSugoi = () => toggleStock('dorabite_sugoi', true);
window.hasBonBox = () => toggleStock('dorabite_bonbon', false);
window.hasNoBonBox = () => toggleStock('dorabite_bonbon', true);

// Grouped stock updates (choco, dulce, cheese, walnut)
window.hasChoco = () => updateMultipleStocks(['dorabite_oishi_choco', 'dorabite_sugoi_choco', 'dorabite_bonbon_choco'], false);
window.hasNoChoco = () => updateMultipleStocks(['dorabite_oishi_choco', 'dorabite_sugoi_choco', 'dorabite_bonbon_choco'], true);
window.hasDulce = () => updateMultipleStocks(['dorabite_oishi_dulce', 'dorabite_sugoi_dulce', 'dorabite_bonbon_dulce'], false);
window.hasNoDulce = () => updateMultipleStocks(['dorabite_oishi_dulce', 'dorabite_sugoi_dulce', 'dorabite_bonbon_dulce'], true);
window.hasCheese = () => updateMultipleStocks(['dorabite_oishi_cheese', 'dorabite_sugoi_cheese', 'dorabite_bonbon_cheese'], false);
window.hasNoCheese = () => updateMultipleStocks(['dorabite_oishi_cheese', 'dorabite_sugoi_cheese', 'dorabite_bonbon_cheese'], true);
window.hasWalnut = () => updateMultipleStocks(['dorabite_walnutella_oishi', 'dorabite_walnutella_sugoi', 'dorabite_walnutella_bonbon'], false);
window.hasNoWalnut = () => updateMultipleStocks(['dorabite_walnutella_oishi', 'dorabite_walnutella_sugoi', 'dorabite_walnutella_bonbon'], true);

// Individual stock updates
window.hasNutella = () => toggleStock('boncoin_nutella', false);
window.hasNoNutella = () => toggleStock('boncoin_nutella', true);
window.hasHamCheese = () => toggleStock('boncoin_hamcheese', false);
window.hasNoHamCheese = () => toggleStock('boncoin_hamcheese', true);
window.hasMozzarella = () => toggleStock('boncoin_mozarella', false);
window.hasNoMozzarella = () => toggleStock('boncoin_mozarella', true);
window.hasOreoCream = () => toggleStock('boncoin_oreocream', false);
window.hasNoOreoCream = () => toggleStock('boncoin_oreocream', true);
window.hasChocold = () => toggleStock('chocold', false);
window.hasNoChocold = () => toggleStock('chocold', true);
window.hasHotcof = () => toggleStock('hot_cof', false);
window.hasNoHotcof = () => toggleStock('hot_cof', true);
window.hasIcedcof = () => toggleStock('iced_coffee', false);
window.hasNoIcedcof = () => toggleStock('iced_coffee', true);

// Main fetchOrders function that accepts the branchContent as an argument
async function fetchOrders(branchId) {
    console.log("Branch button content:", branchId);
    try {
        const ordersRef = collection(db, "branches", branchId, "orders");

        const unsubscribe = onSnapshot(ordersRef, async (querySnapshot) => {
            const ordersContainer = document.querySelector(".new-orders-container");
            const pendingOrdersContainer = document.getElementById("pendingOrdersAccordion");
            const finishedOrdersContainer = document.getElementById("finishedOrdersAccordion");

            const noNewOrdersMessage = document.querySelector(".new-orders h3");
            const noPendingOrdersMessage = document.querySelector(".pending-orders h3");
            const noFinishedOrdersMessage = document.querySelector(".finished-orders h3");

            // Clear previous content
            ordersContainer.innerHTML = "";
            pendingOrdersContainer.innerHTML = "";
            finishedOrdersContainer.innerHTML = "";

            let hasNewOrders = false;
            let hasPendingOrders = false;
            let hasFinishedOrders = false;

            if (!querySnapshot.empty) {
                const promises = querySnapshot.docs.map(async (doc) => {
                    const orderData = doc.data();
                    const orderId = doc.id;
                    const userEmail = orderData.user_email;
                    const userDoc = await getUserInfo(userEmail);

                    if (userDoc) {
                        const userData = userDoc.data();
                        const userFullName = `${userData.firstName} ${userData.lastName}`;
                        const userPhone = userData.phone;
                        const userAddress = userData.address;

                        let itemsHTML = "";
                        for (const [itemId, itemDetails] of Object.entries(orderData.items_bought)) {
                            itemsHTML += `<p><b>${itemDetails.quantity} x ${itemDetails.name}</b> (P${itemDetails.price})</p>`;
                        }

                        if (orderData.isNew) {
                            hasNewOrders = true;
                            ordersContainer.innerHTML += `
                                <div class="order-card">
                                    <div class="order-id">Order #${orderId}</div>
                                    <div class="order-details primary-details">
                                        ${itemsHTML}
                                        <hr>
                                        <p><b>Total:</b> P${orderData.total_price.toFixed(2)}</p>
                                        <p><b>Status:</b> ${orderData.status}</p>
                                    </div>
                                    <div class="order-actions">
                                        <button class="btn btn-success confirm-order">✔ Confirm</button>
                                        <button class="btn btn-danger reject-order">✘ Reject</button>
                                    </div>
                                </div>
                            `;
                        } else if (orderData.isAccepted && !orderData.isFinished) {
                            hasPendingOrders = true;
                            pendingOrdersContainer.innerHTML += `
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="pending-order-id accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#acceptedOrder${orderId}" aria-expanded="false" aria-controls="acceptedOrder${orderId}">
                                            ORDER ID: ${orderId}
                                        </button>
                                    </h2>
                                    <div id="acceptedOrder${orderId}" class="accordion-collapse collapse" data-bs-parent="#pendingOrdersAccordion">
                                        <div class="accordion-body">
                                            <p><b>Name:</b> ${userFullName}</p>
                                            <p><b>Email:</b> ${userEmail}</p>
                                            <p><b>Phone:</b> ${userPhone}</p>
                                            <p><b>Address:</b> ${userAddress}</p>
                                            <p><b>Items:</b></p>
                                            ${itemsHTML}
                                            <hr>
                                            <p><b>Total Price:</b> P${orderData.total_price.toFixed(2)}</p>
                                            <button class="btn btn-success finish-the-order">Finish Order</button>
                                        </div>
                                    </div>
                                </div>
                                <br>
                            `;
                        } else if (orderData.isFinished) {
                            hasFinishedOrders = true;
                            finishedOrdersContainer.innerHTML += `
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#finishedOrder${orderId}" aria-expanded="false" aria-controls="finishedOrder${orderId}">
                                            ORDER ID: ${orderId}
                                        </button>
                                    </h2>
                                    <div id="finishedOrder${orderId}" class="accordion-collapse collapse" data-bs-parent="#finishedOrdersAccordion">
                                        <div class="accordion-body">
                                            <p><b>Name:</b> ${userFullName}</p>
                                            <p><b>Status:</b> ${orderData.status}</p>
                                            <p><b>Feedback:</b> ${orderData.feedback || 'No feedback given'}</p>
                                        </div>
                                    </div>
                                </div>
                                <br>
                            `;
                        }
                    }
                });

                await Promise.all(promises);
            }

            // ✅ Show or hide messages correctly
            noNewOrdersMessage.style.display = hasNewOrders ? "none" : "block";
            noPendingOrdersMessage.style.display = hasPendingOrders ? "none" : "block";
            noFinishedOrdersMessage.style.display = hasFinishedOrders ? "none" : "block";
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}


document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('btn-warning')) {
        const orderCard = event.target.closest('.accordion-item');
        const orderId = orderCard.querySelector('.pending-order-id').textContent.split(":")[1].trim();
        console.log(orderId);
        const orderStatusSpan = document.querySelector(`#orderStatus${orderId}`);
        const currentStatus = orderStatusSpan.textContent;

        const previousStatus = currentStatus; // Store the current status as the previous status
        let newStatus;

        // Toggle between statuses
        if (currentStatus === 'Accepted') {
            newStatus = 'Making';
        } else if (currentStatus === 'Making') {
            newStatus = 'Out for Delivery';
        } else if (currentStatus === 'Out for Delivery') {
            newStatus = 'Accepted';
        }

        // Update the displayed status in the UI
        orderStatusSpan.textContent = newStatus;

        // Show the Undo button
        const undoButton = document.querySelector(`#undoStatus${orderId}`);
        undoButton.style.display = 'inline-block';

        // Store the previous status for potential undo
        orderCard.dataset.previousStatus = previousStatus;
        // Get branch ID dynamically
        const branchButton = document.getElementById("staff-branch");
        const branch = branchButton.textContent;
        const branchId = reversedBranchMaps[branch];
        console.log(branchId);
        
        const orderRef = doc(db, `branches/${branchId}/orders/${orderId}`);

        await updateDoc(orderRef, {
            status: newStatus
        });

        console.log(`Order #${orderId} status updated to "${newStatus}"`);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const newOrdersContainer = document.querySelector(".new-orders-container");
    const confirmationModal = document.getElementById("confirmationModal");

    newOrdersContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("confirm-order")) {
            showConfirmation("Are you sure you want to confirm this order?", async function () {
                const orderCard = event.target.closest(".order-card"); // Get the specific order card
                const orderId = orderCard.querySelector(".order-id").textContent.split("#")[1]; // Extract order ID
                const modal = document.getElementById("order-time-modal");
                const inputMinutes = document.getElementById("input-minutes");

                modal.style.display = "flex";

                // Ensure event listeners are not duplicated
                document.getElementById("cancel-modal").onclick = () => {
                    modal.style.display = "none";
                };

                // Handle Minute Buttons
                document.querySelectorAll(".btn-minute").forEach((button) => {
                    button.onclick = (e) => {
                        inputMinutes.value = e.target.dataset.minutes;
                    };
                });

                // Confirm Button Action
                document.getElementById("confirm-modal").onclick = () => {
                    const minutes = inputMinutes.value;
                    if (minutes) {
                        console.log(`Order confirmed with an estimated time of ${minutes} minutes.`);
                        showModal(`Order confirmed with an estimated time of ${minutes} minutes.`, true);
                        modal.style.display = "none";
                        confirmOrder(orderId, minutes, orderCard, modal);
                    } else {
                        showModal("Please input or select an estimated time.", false);
                    }
                };
            });
        } 

        if (event.target.classList.contains("reject-order")) {
            showConfirmation("Are you sure you want to reject this order?", async function () {
                const orderCard = event.target.closest(".order-card");
                const orderId = orderCard.querySelector(".order-id").textContent.split("#")[1];
                rejectOrder(orderId);
            });
        }
    });

    // Ensure modal is properly removed on cancel
    confirmationModal.addEventListener("hidden.bs.modal", function () {
        document.body.classList.remove("modal-open");
        document.querySelector(".modal-backdrop")?.remove();
    });
});


document.addEventListener("DOMContentLoaded", () => {
    // Event delegation to attach event listeners to dynamically generated "Confirm" buttons
    document.querySelector(".accordion").addEventListener("click", function (event) {
        if (event.target.classList.contains("finish-the-order")) {
            showConfirmation("Are you sure you this order is finished?", async function () { 
                showModal("Order is delivered.", true);
          // Find the closest accordion item
          const accordionItem = event.target.closest(".accordion-item");

          if (!accordionItem) {
              showModal("Error: Unable to find order details.", false);
              return;
          }

          // Get the order ID from the corresponding button with class "pending-order-id"
          const orderIdElement = accordionItem.querySelector(".pending-order-id");

          if (!orderIdElement) {
              showModal("Error: Order ID not found.", false);
              return;
          }

          // Extract the ORDER ID text from the button
          const orderIdText = orderIdElement.textContent.trim();
          const orderId = orderIdText.replace("ORDER ID:", "").trim(); // Remove "ORDER ID: " part

          // Get branch ID dynamically
          const branchButton = document.getElementById("staff-branch");
          const branch = branchButton.textContent;
          const branchId = reversedBranchMaps[branch];


          if (!orderId || !branchId) {
              showModal("Oops! The order with which you wish to proceed has no Order ID and Branch Id on the database.");
              return;
          }

          finishOrder(branchId, orderId);
          // Call refreshOrders to reload the orders section
          refreshOrders();
            });
        }
    });

});

async function confirmOrder(orderId, minutes, orderCard) {
    const branchButton = document.getElementById("staff-branch");

    const branch = branchButton.textContent;
    const branchId = reversedBranchMaps[branch];
    
    try {
        // Firestore reference to the order document
        const orderRef = doc(db, "branches", branchId, "orders", orderId);

        // Update Firestore document
        await updateDoc(orderRef, {
            isAccepted: true,
            isNew: false,
            status: "Accepted",
            estimatedTime: parseInt(minutes, 10) // Add estimated time
        });

        console.log(`Order ${orderId} confirmed with an estimated time of ${minutes} minutes.`);

    } catch (error) {
        console.error("Error updating order:", error);
        showModal("Failed to confirm the order. Please try again.", false);
    }
 

}
// Function to reject an order by setting `isNew` to false
async function rejectOrder(orderId) {
    // Show a confirmation prompt before rejecting the order
    const isConfirmed = confirm("Are you sure you want to reject this order?");

    if (isConfirmed) {
        try {
            const branchButton = document.getElementById("staff-branch");
            const branch = branchButton.textContent;
            const branchId = reversedBranchMaps[branch];

            // Firestore reference to the order document
            const orderRef = doc(db, "branches", branchId, "orders", orderId);

            // Update Firestore document to mark the order as not new
            await updateDoc(orderRef, {
                isNew: false,
            });

            console.log(`Order ${orderId} has been rejected.`);
        } catch (error) {
            console.error("Error rejecting order:", error);
            showModal("Failed to reject the order. Please try again.", false);
        }
    } else {
        console.log("Order rejection canceled.");
    }
}

// Function to update Firestore and mark the order as finished
async function finishOrder(branchId, orderId) {
    const orderRef = doc(db, "branches", branchId, "orders", orderId);

    try {
        // Fetch the order document first
        const orderDoc = await getDoc(orderRef);

        if (orderDoc.exists()) {
            const orderData = orderDoc.data();
            
            // Get the total_price from the order
            const totalPrice = orderData.total_price;
            const createdAt = orderData.created_at.toDate(); // Convert Firestore timestamp to JS Date

            // Get the month and year from the created_at timestamp
            const month = createdAt.getMonth() + 1;  // getMonth() returns 0-11, so we add 1
            const year = createdAt.getFullYear();

           // Optional: Log or alert the total price and month-year info
           console.log(`Order ${orderId} - Total Price: P${totalPrice.toFixed(2)} - Created at: ${createdAt}`);

           // Reference to the sales document for the specific branch, year, and month
           const salesRef = doc(db, "sales", branchId, String(year), String(month).padStart(2, "0"));

           // Fetch the sales document for the year and month
           const salesDoc = await getDoc(salesRef);

           if (salesDoc.exists()) {
               // If the document exists, increment the sales total
               const currentSales = salesDoc.data().total_sales || 0;
               await updateDoc(salesRef, {
                   total_sales: currentSales + totalPrice
               });

               console.log(`Sales for ${year}-${String(month).padStart(2, "0")} updated. New total: P${(currentSales + totalPrice).toFixed(2)}`);
           } else {
               // If the document doesn't exist, create it with the initial sales total
               await setDoc(salesRef, {
                   total_sales: totalPrice
               });

               console.log(`Sales document for ${year}-${String(month).padStart(2, "0")} created with total: P${totalPrice.toFixed(2)}`);
           }

           // Mark the order as finished in the orders collection
           await updateDoc(orderRef, {
               isFinished: true,
               status: "Paid",
               didFeedback: false
           });
       } else {
           showModal(`Order ${orderId} not found.`, false);
       }
    } catch (error) {
        console.error("Error updating order:", error);
        showModal("Failed to finish the order. Please try again.", false);
    }
}


// Function to get user information based on email
async function getUserInfo(userEmail) {
    try {
        console.log("EMAIL NI USER: " + userEmail);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0]; // Return the user document
        } else {
            console.error("User not found with email:", userEmail);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

// Re-fetch and update the orders
async function refreshOrders() {
    const pendingOrdersAccordion = document.getElementById('pendingOrdersAccordion');
    pendingOrdersAccordion.innerHTML = '';  // Clear the existing orders

    // Your logic to fetch and display orders
    await fetchOrders();  

}
