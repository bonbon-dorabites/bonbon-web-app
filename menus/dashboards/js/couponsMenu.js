/*// Import the functions you need from the SDKs
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
    const activeCouponsContainer = document.querySelector(".active-coupons");
    const headTitle = document.getElementById("coupon-head");
    const noCouponMessage = document.createElement("h2");
    noCouponMessage.textContent = "No Coupons Available";
    noCouponMessage.style.textAlign = "center";
    noCouponMessage.style.marginTop = "10px";
    noCouponMessage.style.color = "marroon";
    noCouponMessage.style.fontWeight = "bold";
    noCouponMessage.style.fontStyle = "italic";
    noCouponMessage.classList.add("no-coupons-text");

    const userEmail = user.email;
    const userQuery = query(collection(db, "users"), where("email", "==", userEmail));

    const unsubscribeUser = onSnapshot(userQuery, (userSnapshot) => {
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const usedCoupons = userData.usedCoupons || [];

            const unsubscribeCoupons = onSnapshot(collection(db, "coupons"), (querySnapshot) => {
                activeCouponsContainer.innerHTML = '';
                document.querySelectorAll(".no-coupons-text").forEach(el => el.remove()); // Remove previous messages

                let hasCoupons = false;
                let couponArray = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const couponId = doc.id;
                    const isActive = data.coup_isActive;
                    const minOrder = data.min_order || 0;

                    if (isActive && !usedCoupons.includes(couponId)) {
                        hasCoupons = true;

                        const couponDiv = document.createElement("div");
                        couponDiv.classList.add("coupon-page-card");

                        const couponText = document.createElement("span");
                        couponText.classList.add("coupon-page-card-text");
                        couponText.textContent = data.coup_desc;

                        const extraInfo = document.createElement("div");
                        extraInfo.classList.add("coupon-extra-info");
                        extraInfo.innerHTML = `
                            <small>Code: <strong>${couponId}</strong></small>
                            <br>
                            <small>Discount Amount: ₱${data.coup_amount}</small>
                            <br>
                            <small>Minimum Spend: ₱${minOrder}</small>
                        `;

                        couponDiv.appendChild(couponText);
                        couponDiv.appendChild(extraInfo);
                        couponArray.push(couponDiv);
                    }
                });

                // Apply spacing for first and last coupons
                if (couponArray.length > 0) {
                    couponArray[0].style.marginTop = "15px";
                    couponArray[couponArray.length - 1].style.marginBottom = "15px";
                }

                couponArray.forEach(coupon => activeCouponsContainer.appendChild(coupon));

                if (!hasCoupons) {
                    activeCouponsContainer.appendChild(noCouponMessage);
                }

                headTitle.style.display = "block";
            });
        }
    });

    return unsubscribeUser;
}

async function fetchClaimedCoupons(user) {
    const userEmail = user.email;
    const headTitle = document.getElementById("coupon-head2");
    const claimedCouponsContainer = document.querySelector(".claimed-coupon");
    const noCouponMessage = document.createElement("h2");
    noCouponMessage.textContent = "No Coupons Claimed";
    noCouponMessage.style.textAlign = "center";
    noCouponMessage.style.marginTop = "10px";
    noCouponMessage.style.color = "marroon";
    noCouponMessage.style.fontWeight = "bold";
    noCouponMessage.style.fontStyle = "italic";
    noCouponMessage.classList.add("no-coupons-text");

    // Fetch user data from Firestore
    const unsubscribeUser = onSnapshot(query(collection(db, "users"), where("email", "==", userEmail)), (querySnapshot) => {
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const usedCoupons = userData.usedCoupons || [];

            claimedCouponsContainer.innerHTML = ''; // Clear previous coupons

            // If there are no claimed coupons, show the message
            if (usedCoupons.length === 0) {
                claimedCouponsContainer.appendChild(noCouponMessage);
                return;
            }

            let hasCoupons = false;

            usedCoupons.forEach(async (couponId, index, array) => {
                const couponDocRef = doc(db, "coupons", couponId);
                const unsubscribeCoupon = onSnapshot(couponDocRef, (couponDocSnap) => {
                    if (couponDocSnap.exists()) {
                        headTitle.style.display = "block";
                        hasCoupons = true;
                        const couponData = couponDocSnap.data();
                        const startDate = new Date(couponData.coup_start.seconds * 1000).toLocaleDateString();
                        const endDate = new Date(couponData.coup_end.seconds * 1000).toLocaleDateString();
                        const minOrder = couponData.min_order || 0;

                        const couponDiv = document.createElement("div");
                        couponDiv.classList.add("coupon-page-card", "claimed");

                        if (index === 0) couponDiv.style.marginTop = "15px"; // Space above first coupon
                        if (index === array.length - 1) couponDiv.style.marginBottom = "15px"; // Space below last coupon

                        const couponDetails = document.createElement("div");
                        couponDetails.classList.add("coupon-details");

                        const couponText = document.createElement("span");
                        couponText.classList.add("coupon-page-card-text");
                        couponText.textContent = couponData.coup_desc;

                        const extraInfo = document.createElement("div");
                        extraInfo.classList.add("coupon-extra-info");
                        extraInfo.innerHTML = `
                            <small>Valid: ${startDate} - ${endDate}</small>
                            <br>
                            <small>Code: <strong>${couponId}</strong></small>
                            <br>
                            <small>Discount Amount: ₱${couponData.coup_amount}</small>
                            <br>
                            <small>Minimum Spend: ₱${minOrder}</small>
                        `;

                        const claimedText = document.createElement("span");
                        claimedText.classList.add("claimed-text");
                        claimedText.textContent = "Claimed";

                        couponDetails.appendChild(couponText);
                        couponDetails.appendChild(extraInfo);

                        couponDiv.appendChild(couponDetails);
                        couponDiv.appendChild(claimedText);

                        claimedCouponsContainer.appendChild(couponDiv);
                    }

                    // Show or hide the "No Coupons Claimed" message depending on whether we have coupons
                    if (!hasCoupons && claimedCouponsContainer.childElementCount === 0) {
                        claimedCouponsContainer.appendChild(noCouponMessage);
                    }

                });
                
            });
            
            
        } else {
            console.log("User document not found!");
            claimedCouponsContainer.appendChild(noCouponMessage);
        }
    });

    return unsubscribeUser;
}


// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchAvailableCoupons);
document.addEventListener("DOMContentLoaded", fetchClaimedCoupons);
*/