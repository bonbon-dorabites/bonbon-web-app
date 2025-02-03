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

        // Query orders in this specific branch's orders subcollection
        const querySnapshot = await getDocs(ordersRef);
        if (!querySnapshot.empty) {
            // Orders were found
            console.log(`Found ${querySnapshot.size} orders for Branch ID: ${branchId}`);

            querySnapshot.forEach(async (doc) => {
                // Get order details
                const orderId = doc.id;
                const orderData = doc.data();

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
                    let totalPrice = 0;



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
                    const ordersContainer = document.querySelector(".new-orders-container");
                    ordersContainer.innerHTML += orderCardHTML;
                }
   
            });
        } else {
            console.log("No orders found for this branch.");
        }
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
    }
});



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