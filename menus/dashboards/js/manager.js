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


// Ensure DOM is ready before running the script
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in PO:", user.email);
            fetchUserBranch(user.email);
            
        } else {
            console.warn("No user is currently logged in.");
        }
    });
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

            fetchFinishedOrders(branchId);

        } else {
            console.error("User document not found.");
        }
    } catch (error) {
        console.error("Error fetching user branch:", error);
    }
}


async function fetchFinishedOrders(branchId) {
    console.log("Branch button content:", branchId);
    try {
        // Reference to the Firestore subcollection of orders inside the branch
        const ordersRef = collection(db, "branches", branchId, "orders");

        // Real-time listener using onSnapshot
        const unsubscribe = onSnapshot(ordersRef, async (querySnapshot) => {
            if (!querySnapshot.empty) {
                // Orders were found
                console.log(`Found ${querySnapshot.size} orders for Branch ID: ${branchId}`);

                // Loop through the orders and display them
                querySnapshot.forEach(async (doc) => {
                    const orderId = doc.id;
                    const orderData = doc.data();
                    console.log(orderData);
                    if (orderData.isFinished) {
                        console.log("ISFINISHEDD");
                    
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
                                        <p><b>Status:</b> ${orderData.status}</p>
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
