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

document.addEventListener('click', function(event) {

    // Check if the clicked element is the submit feedback button
    if (event.target.classList.contains("feedback-submit")) {
        const orderCard = event.target.closest('.accordion-item');  // Find the closest order card element
        const orderId = orderCard.querySelector('.accordion-button').getAttribute('data-bs-target').replace('#finishedOrder', '');  // Extract orderId from the data-bs-target
        const branchId = orderCard.querySelector('.accordion-button').getAttribute('data-branch-id');  // Extract branchId from data-branch-id
        alert(branchId);
        // Call submitFeedback with the orderId and branchId
        submitFeedback(orderId, branchId);
    }
    
});


// Main fetchOrders function that accepts the branchContent as an argument
async function fetchOrders() {
    // Ensure the user is logged in
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userEmail = user.email;
            console.log(`Fetching orders for: ${userEmail}`);

            const branchesRef = collection(db, "branches");
            const branchesSnapshot = await getDocs(branchesRef);

            let allOrders = [];

            // Loop through each branch
            for (const branchDoc of branchesSnapshot.docs) {
                console.log("HI PO");
                const branchId = branchDoc.id;
                console.log(branchId);
                const ordersRef = collection(db, `branches/${branchId}/orders`);

                // Query orders where the email matches the logged-in user
                const ordersQuery = query(ordersRef, where("user_email", "==", userEmail));
                const ordersSnapshot = await getDocs(ordersQuery);

                ordersSnapshot.forEach(orderDoc => {
                    const orderData = {
                        orderId: orderDoc.id, // Document ID is the order ID
                        branch: branchId, // Track which branch this order is from
                        ...orderDoc.data() // Order details
                    };
                    
                    console.log("Fetched Order:", orderData); // Log each order separately
                    allOrders.push(orderData);
                });
            }

            console.log("All User Orders:", allOrders);
            displayOrders(allOrders);
        } else {
            console.log("No user logged in.");
        }
    });
}

async function displayOrders(allOrders) {
    const ordersContainer = document.querySelector(".new-orders-container");
    const pendingOrdersAccordion = document.getElementById("pendingOrdersAccordion");
    const finishedOrdersContainer = document.getElementById("finishedOrdersAccordion");
    
    ordersContainer.innerHTML = "";
    pendingOrdersAccordion.innerHTML = "";
    finishedOrdersContainer.innerHTML = "";

    for (const order of allOrders) {
        const { branch, orderId, user_email, items_bought, total_price, status, isNew, isAccepted, isFinished, didFeedback, estimatedTime, feedback } = order;
        
         
        // Log the full content of each order
        console.log("Order Content: ", order);
         
        // Log each individual property as well for better clarity
        console.log(`Branch: ${branch}`);
        console.log(`DID FEEDBACK: ${didFeedback}`);
        console.log(`Order ID: ${orderId}`);
        console.log(`Email: ${user_email}`);
        console.log(`Items in Cart:`, items_bought); // This can be an object or array, so logging as such
        console.log(`Total Price: ${total_price}`);
        console.log(`Status: ${status}`);
        console.log(`Is New: ${isNew}`);
        console.log(`Is Accepted: ${isAccepted}`);
        console.log(`Is Finished: ${isFinished}`);
        console.log(`Estimated Time: ${estimatedTime}`);
        console.log(`Feedback: ${feedback}`);
 
        const userDoc = await getUserInfo(user_email);
        
        if (!userDoc) continue;
        
        const userData = userDoc.data();
        const userFullName = `${userData.firstName} ${userData.lastName}`;
        const userPhone = userData.phone;
        const userAddress = userData.address;
        
        let itemsHTML = "";
        for (const itemId in items_bought) {
            const item = items_bought[itemId];
            itemsHTML += `<p><b>${item.quantity} x ${item.name}</b> (P${item.price})</p>`;
        }

        if (isNew) {
            const orderCardHTML = `
                <div class="order-card">
                    <div class="order-id">Order #${orderId} - ${branch}</div>
                    <div class="order-details primary-details">${itemsHTML}
                        <hr>
                        <p><b>Total:</b> P${total_price.toFixed(2)}</p>
                        <p><b>Status:</b> ${status}</p>
                    </div>
                    <div class="order-details hidden additional-details">
                        <p><b>Name:</b> ${userFullName}</p>
                        <p><b>Email:</b> ${user_email}</p>
                        <p><b>Phone:</b> ${userPhone}</p>
                        <p><b>Address:</b> ${userAddress}</p>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-link view-more view-more-btn">View More</button>
                    </div>
                </div>`;
            ordersContainer.innerHTML += orderCardHTML;
        } else if (isAccepted && !isFinished) {
            const accordionItemHTML = `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#acceptedOrder${orderId}" aria-expanded="false">
                            ORDER ID: ${orderId} - ${branch}
                        </button>
                    </h2>
                    <div id="acceptedOrder${orderId}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <p><b>Name:</b> ${userFullName}</p>
                            <p><b>Email:</b> ${user_email}</p>
                            <p><b>Phone:</b> ${userPhone}</p>
                            <p><b>Address:</b> ${userAddress}</p>
                            <p><b>Items:</b></p>
                            ${itemsHTML}
                            <hr>
                            <p><b>Total Price:</b> P${total_price.toFixed(2)}</p>
                            <p><b>Estimated Time:</b> <span id="timer${orderId}">${estimatedTime} minutes</span></p>
                            <p><b>Status:</b> ${status}</p>
                        </div>
                    </div>
                </div>`;
            pendingOrdersAccordion.innerHTML += accordionItemHTML;
        } else if (isFinished) {
            const finishedOrderHTML = `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#finishedOrder${orderId}" aria-expanded="false" data-branch-id="${branch}">
                            ORDER ID: ${orderId} - ${branch}
                        </button>
                    </h2>
                    <div id="finishedOrder${orderId}" class="accordion-collapse collapse">
                        <div class="accordion-body feedback-status">
                            <p><b>Name:</b> ${userFullName}</p>
                            <p><b>Status:</b> Paid</p>
                            <p><b>Feedback:</b></p>
                            <textarea name="feedback" class="form-control" placeholder="Enter your feedback here..." rows="3" 
                                ${didFeedback ? "disabled" : ""}>${didFeedback ? feedback : ""}</textarea>
                            <br>
                            ${didFeedback ? "" : '<button type="button" class="btn btn-success feedback-submit" id="submitFeedbackBtn">Submit Feedback</button>'}
                        </div>
                    </div>
                </div>`;
            finishedOrdersContainer.innerHTML += finishedOrderHTML;
        }
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

async function submitFeedback(orderId, branchId) {
    const feedbackText = document.querySelector(`#finishedOrder${orderId} .form-control`).value;


    if (feedbackText.trim() !== '') {
        // Reference to the specific order in Firestore
        const orderRef = doc(db, `branches/${branchId}/orders/${orderId}`); // Replace branchId dynamically if needed
        
        // Update Firestore with the feedback for that order
        await updateDoc(orderRef, {
            feedback: feedbackText
        });

        // Disable the textarea after submission
        const textarea = document.querySelector(`#finishedOrder${orderId} .form-control`);
        textarea.disabled = true;

        console.log(`Feedback for Order #${orderId} saved to Firestore!`);
    } else {
        alert('Please enter feedback before submitting.');
    }
}

// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchOrders);
