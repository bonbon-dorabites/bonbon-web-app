// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, updateDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
        // Reference to the Firestore subcollection of orders inside the branch
        const ordersRef = collection(db, "branches", branchId, "orders");

        // Real-time listener using onSnapshot
        const unsubscribe = onSnapshot(ordersRef, async (querySnapshot) => {
            if (!querySnapshot.empty) {
                // Orders were found
                console.log(`Found ${querySnapshot.size} orders for Branch ID: ${branchId}`);

                // Clear the existing orders to avoid duplicate cards
                const ordersContainer = document.querySelector(".new-orders-container");
                ordersContainer.innerHTML = '';

                // Loop through the orders and display them
                querySnapshot.forEach(async (doc) => {
                    const orderId = doc.id;
                    const orderData = doc.data();

                    if(orderData.isNew) {
                        // Fetch user information from the users collection based on the email
                        const userEmail = orderData.user_email; // Assuming user_email field in order
                        const userDoc = await getUserInfo(userEmail);
                        
                        if (userDoc) {
                            const userData = userDoc.data();
                            const userFullName = `${userData.firstName} ${userData.lastName}`;
                            const userPhone = userData.phone;
                            const userAddress = userData.address;

                            // Loop through the items_bought map to display item details
                            let itemsHTML = "";

                            for (const [itemId, itemDetails] of Object.entries(orderData.items_bought)) {
                                itemsHTML += `
                                    <p><b>${itemDetails.quantity} x ${itemDetails.name}</b> (P ${itemDetails.price})</p>
                                `;
                            }

                            // Generate the order card HTML
                            const orderCardHTML = `
                            <div class="order-card">
                                <div class="order-id">Order #${orderId}</div>
                                
                                <div class="order-details primary-details">
                                    ${itemsHTML}
                                    <hr>
                                    <p><b>Total:</b> P${orderData.total_price.toFixed(2)}</p> <!-- Displaying the calculated total price -->
                                    <p><b>Status:</b> ${orderData.status}</p>
                                </div>

                                <div class="order-details hidden additional-details">
                                    <p><b>Name:</b> ${userFullName}</p>
                                    <p><b>Email:</b> ${userEmail}</p>
                                    <p><b>Phone:</b> ${userPhone}</p>
                                    <p><b>Address:</b> ${userAddress}</p>
                                </div>

                                <div class="order-actions">
                                    <button class="btn btn-link view-more view-more-btn">View More</button>
                                    <button class="btn btn-success confirm-order">✔ Confirm</button>
                                    <button class="btn btn-danger reject-order">✘ Reject</button>
                                </div>
                            </div>
                            `;

                            // Append the order card to the container
                            ordersContainer.innerHTML += orderCardHTML;
                        }
                    } else if (orderData.isAccepted && orderData.isFinished === false) {
                         // Generate the accordion item for accepted orders
                         const userEmail = orderData.user_email; // Assuming user_email field in order
                         const userDoc = await getUserInfo(userEmail);
                        
                         if (userDoc) {
                            const userData = userDoc.data();
                            const userFullName = `${userData.firstName} ${userData.lastName}`;
                            const userPhone = userData.phone;
                            const userAddress = userData.address;

                            // Loop through the items_bought map to display item details
                            let itemsHTML = "";
                            for (const [itemId, itemDetails] of Object.entries(orderData.items_bought)) {
                                itemsHTML += `
                                    <p>- ${itemDetails.name} (x${itemDetails.quantity})</p>
                                `;
                            }

                            // Generate the accordion item HTML
                            const accordionItemHTML = `
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
                                        <hr style="border: 1px solid white; width: 100%">

                                        <p><b>Total Price:</b> P${orderData.total_price.toFixed(2)}</p>
                                        <p><b>Estimated Time:</b> ${orderData.estimatedTime} minutes</p>
                                        <p><b>Status:</b> ${orderData.status}</p>
                                        <button class="btn btn-success finish-the-order">Finish Order</button> <!-- Added the Finish Order button -->
                                    </div>
                                </div>
                            </div>
                            <br>
                            `;

                            // Append the accordion item to the accordion container
                            pendingOrdersAccordion.innerHTML += accordionItemHTML;
                        } 
                    } else if (orderData.isFinished) {
                        console.log("ISFINISHED");
                    
                        // Empty the finished orders container before adding new content
                        const finishedOrdersContainer = document.getElementById('finishedOrdersAccordion');
                        finishedOrdersContainer.innerHTML = '';  // Clear existing orders to avoid duplication
                    
                        const userEmail = orderData.user_email; // Assuming user_email field in order
                        const userDoc = await getUserInfo(userEmail);
                        
                        if (userDoc) {
                            const userData = userDoc.data();
                            const userFullName = `${userData.firstName} ${userData.lastName}`;
                    
                            // Generate the finished order HTML with feedback
                            const finishedOrderHTML = `
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#finishedOrder${orderId}" aria-expanded="false" aria-controls="finishedOrder${orderId}">
                                        ORDER ID: ${orderId}
                                    </button>
                                </h2>
                                <div id="finishedOrder${orderId}" class="accordion-collapse collapse" data-bs-parent="#finishedOrdersAccordion">
                                    <div class="accordion-body feedback-status">
                                        <p><b>Name:</b> ${userFullName}</p>
                                        <p><b>Status:</b> Paid</p>
                                        <p><b>Feedback:</b> ${orderData.feedback || 'No feedback given'}</p>
                                    </div>
                                </div>
                            </div>
                            <br>
                            `;
                    
                            // Append the finished order to the finished orders container
                            finishedOrdersContainer.innerHTML += finishedOrderHTML;
                        }
                    }
                    
 

                });
            } else {
                console.log("No orders found for this branch.");
            }
        });



    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}


document.addEventListener("click", function (event) {
    if (event.target.classList.contains("view-more-btn")) {
        console.log("View More clicked");

        // Find the closest order-card
        const orderCard = event.target.closest(".order-card");
        if (!orderCard) return;

        // Select the additional details section
        const additionalDetails = orderCard.querySelector(".order-details.hidden") || 
                                  orderCard.querySelector(".order-details:not(.primary-details)");

        if (additionalDetails) {
            additionalDetails.classList.toggle("hidden"); // Toggle visibility

            // Change button text
            event.target.textContent = additionalDetails.classList.contains("hidden") ? "View More" : "View Less";
        }
    } else if (event.target.classList.contains("reject-order")) {
        const orderCard = event.target.closest(".order-card"); // Get the specific order card
        const orderId = orderCard.querySelector(".order-id").textContent.split("#")[1]; // Extract order ID
        rejectOrder(orderId);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Event delegation to attach event listeners to dynamically generated "Confirm" buttons
    document.querySelector(".new-orders-container").addEventListener("click", function (event) {
        if (event.target.classList.contains("confirm-order")) {
            const orderCard = event.target.closest(".order-card"); // Get the specific order card
            const orderId = orderCard.querySelector(".order-id").textContent.split("#")[1]; // Extract order ID
            const modal = document.getElementById("order-time-modal");
            const inputMinutes = document.getElementById("input-minutes");

            modal.style.display = "flex";

        // Close Modal
        document.getElementById("cancel-modal").addEventListener("click", () => {
            modal.style.display = "none";
        });
        
        // Handle Minute Buttons
        document.querySelectorAll(".btn-minute").forEach((button) => {
            button.addEventListener("click", (e) => {
                inputMinutes.value = e.target.dataset.minutes;
            });
        });

         // Confirm Button Action
        document.getElementById("confirm-modal").addEventListener("click", () => {
            const minutes = inputMinutes.value;
            if (minutes) {
                console.log(`Order confirmed with an estimated time of ${minutes} minutes.`);
                modal.style.display = "none";
                confirmOrder(orderId, minutes, orderCard, modal);
            } else {
                alert("Please input or select an estimated time.");
            }
        });

        }
    });

});

document.addEventListener("DOMContentLoaded", () => {
    // Event delegation to attach event listeners to dynamically generated "Confirm" buttons
    document.querySelector(".accordion").addEventListener("click", function (event) {
        if (event.target.classList.contains("finish-the-order")) {
           alert("ORDER FINISHED");
          // Find the closest accordion item
          const accordionItem = event.target.closest(".accordion-item");

          if (!accordionItem) {
              alert("Error: Unable to find order details.");
              return;
          }

          // Get the order ID from the corresponding button with class "pending-order-id"
          const orderIdElement = accordionItem.querySelector(".pending-order-id");

          if (!orderIdElement) {
              alert("Error: Order ID not found.");
              return;
          }

          // Extract the ORDER ID text from the button
          const orderIdText = orderIdElement.textContent.trim();
          const orderId = orderIdText.replace("ORDER ID:", "").trim(); // Remove "ORDER ID: " part

          alert("ORDER ID: " + orderId);
          // Get branch ID dynamically
          const branchButton = document.getElementById("staff-branch");
          const branch = branchButton.textContent;
          const branchId = reversedBranchMaps[branch];

          alert("BRANCH ID: " + branchId);

          if (!orderId || !branchId) {
              alert("Order ID or Branch ID is missing!");
              return;
          }

          finishOrder(branchId, orderId);
          // Call refreshOrders to reload the orders section
          refreshOrders();
        }
    });

});

async function confirmOrder(orderId, minutes, orderCard) {
    alert("HI: " + orderId);
    const branchButton = document.getElementById("staff-branch");

    const branch = branchButton.textContent;
    const branchId = reversedBranchMaps[branch];
    alert("BRANCH ID: " + branchId);
    
    try {
        // Firestore reference to the order document
        const orderRef = doc(db, "branches", branchId, "orders", orderId);

        // Update Firestore document
        await updateDoc(orderRef, {
            isAccepted: true,
            isNew: false,
            estimatedTime: parseInt(minutes, 10) // Add estimated time
        });

        console.log(`Order ${orderId} confirmed with an estimated time of ${minutes} minutes.`);

    } catch (error) {
        console.error("Error updating order:", error);
        alert("Failed to confirm the order. Please try again.");
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
            alert("Failed to reject the order. Please try again.");
        }
    } else {
        console.log("Order rejection canceled.");
    }
}

// Function to update Firestore and mark the order as finished
async function finishOrder(branchId, orderId) {
    const orderRef = doc(db, "branches", branchId, "orders", orderId);

    try {
        // Update Firestore to mark the order as finished
        await updateDoc(orderRef, {
            isFinished: true
        });

        alert(`Order ${orderId} has been marked as finished.`);
    } catch (error) {
        console.error("Error updating order:", error);
        alert("Failed to finish the order. Please try again.");
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
