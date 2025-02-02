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
        await fetchClaimedCoupons(user);
    } else {
        console.log("User not authenticated.");
    }
});


async function fetchAvailableCoupons() {
    // Get the existing active-coupons div
    const activeCouponsContainer = document.querySelector(".active-coupons");

    const querySnapshot = await getDocs(collection(db, "coupons"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const couponId = doc.id; // Document ID as the coupon code
        const startDate = new Date(data.coup_start.seconds * 1000).toLocaleDateString();
        const endDate = new Date(data.coup_end.seconds * 1000).toLocaleDateString();

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
            <small>Valid: ${startDate} - ${endDate}</small>
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
    });
}


async function fetchClaimedCoupons(user) {
    const userEmail = user.email;

    

}


// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchAvailableCoupons);