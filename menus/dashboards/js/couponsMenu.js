// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, onSnapshot, where, query, getDocs, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDoc, Timestamp, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);

// Listener for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User authenticated: ", user.email);
        await fetchAvailableCoupons(user);
        await fetchClaimedCoupons(user);
    } else {
        console.log("User not authenticated.");
    }
});


async function fetchAvailableCoupons(user) {
    // Get the existing active-coupons div
    const activeCouponsContainer = document.querySelector(".active-coupons");

    // Query the user's document to get their usedCoupons array
    const userEmail = user.email;
    const userQuery = query(collection(db, "users"), where("email", "==", userEmail));

    // Listen for real-time updates to the user's document
    const unsubscribeUser = onSnapshot(userQuery, (userSnapshot) => {
        // If the user is found
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const usedCoupons = userData.usedCoupons || []; // Get the usedCoupons array

            // Listen for real-time updates to the coupons collection
            const unsubscribeCoupons = onSnapshot(collection(db, "coupons"), (querySnapshot) => {
                // Clear the existing coupons before adding new ones
                activeCouponsContainer.innerHTML = '';

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const couponId = doc.id; // Document ID as the coupon code
                    const startDate = new Date(data.coup_start.seconds * 1000);
                    const endDate = new Date(data.coup_end.seconds * 1000);
                    const isActive = data.coup_isActive; // Boolean indicating if the coupon is active

                    // Check if the coupon is active and if it has not been claimed already
                    if (isActive && !usedCoupons.includes(couponId)) {
                        // Create the coupon card div
                        const couponDiv = document.createElement("div");
                        couponDiv.classList.add("coupon-page-card");

                        // Generate coupon description and button
                        const couponText = document.createElement("span");
                        couponText.classList.add("coupon-page-card-text");
                        couponText.textContent = data.coup_desc;

                        // Add extra info (dates and discount)
                        const extraInfo = document.createElement("div");
                        extraInfo.classList.add("coupon-extra-info");
                        extraInfo.innerHTML = `
                            <small>Valid: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</small>
                            <br>
                            <small>Code: <strong>${couponId}</strong></small>
                            <br>
                            <small>Discount Amount: ₱${data.coup_amount}</small>
                        `;

                        // Append everything to the coupon div
                        couponDiv.appendChild(couponText);
                        couponDiv.appendChild(extraInfo);

                        // Append the coupon card to the active-coupons div
                        activeCouponsContainer.appendChild(couponDiv);
                    }
                });
            });
        } else {
            console.log("User not found");
        }
    });

    // Return the unsubscribe function for cleaning up the listener when it's no longer needed
    return unsubscribeUser;
}


async function fetchClaimedCoupons(user) {
    const userEmail = user.email;

    // Listen for real-time updates to the users collection
    const unsubscribeUser = onSnapshot(query(collection(db, "users"), where("email", "==", userEmail)), (querySnapshot) => {
        // If the user document exists
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Get the first document (there should only be one)
            const userData = userDoc.data();
            const usedCoupons = userData.usedCoupons || []; // Get the usedCoupons array (default to empty array if undefined)

            // Get the existing claimed-coupon div
            const claimedCouponsContainer = document.querySelector(".claimed-coupon");

            // Clear previous claimed coupons before appending new ones
            claimedCouponsContainer.innerHTML = '';

            // Iterate over the usedCoupons and fetch coupon details for each coupon ID
            usedCoupons.forEach(async (couponId) => {
                const couponDocRef = doc(db, "coupons", couponId);
                // Listen for real-time updates to each coupon's data
                const unsubscribeCoupon = onSnapshot(couponDocRef, (couponDocSnap) => {
                    if (couponDocSnap.exists()) {
                        const couponData = couponDocSnap.data();
                        const startDate = new Date(couponData.coup_start.seconds * 1000).toLocaleDateString();
                        const endDate = new Date(couponData.coup_end.seconds * 1000).toLocaleDateString();

                        // Create the claimed coupon card div
                        const couponDiv = document.createElement("div");
                        couponDiv.classList.add("coupon-page-card", "claimed");

                        // Create the coupon details section
                        const couponDetails = document.createElement("div");
                        couponDetails.classList.add("coupon-details");

                        // Generate the coupon description and code
                        const couponText = document.createElement("span");
                        couponText.classList.add("coupon-page-card-text");
                        couponText.textContent = couponData.coup_desc;

                        const couponCode = document.createElement("div");
                        couponCode.classList.add("coupon-code");
                        couponCode.textContent = `Code: ${couponId}`;

                        // Append coupon details to the card
                        couponDetails.appendChild(couponText);
                        couponDetails.appendChild(couponCode);

                        // Create the claimed text
                        const claimedText = document.createElement("span");
                        claimedText.classList.add("claimed-text");
                        claimedText.textContent = "Claimed";

                        // Append the coupon details and claimed text to the card
                        couponDiv.appendChild(couponDetails);
                        couponDiv.appendChild(claimedText);

                        // Append the coupon card to the claimed-coupon container
                        claimedCouponsContainer.appendChild(couponDiv);
                    }
                });
            });
        } else {
            console.log("User document not found!");
        }
    });

    // Return the unsubscribe function for cleaning up the listener when it's no longer needed
    return unsubscribeUser;
}


// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchAvailableCoupons);
document.addEventListener("DOMContentLoaded", fetchClaimedCoupons);