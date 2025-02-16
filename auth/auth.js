// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, where, getDocs, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


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

// Email validation function
function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
    const signupButton = document.getElementById("signup");
    signupButton.addEventListener("click", handleSignup);
});

document.addEventListener("DOMContentLoaded", () => {
    const signupButton = document.getElementById("login");
    signupButton.addEventListener("click", handleLogin);
});

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

// Handle signup
async function handleSignup(event) {
    event.preventDefault();

    // Get input values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Basic validation
    if (!firstName || !lastName || !phone || !email || !password || !address) {
        showModal("Please fill in all required fields.", false);
        return;
    }

    // Check if terms and conditions checkbox is selected
    if (!agreeTerms) {
        showModal("You must agree to the Terms of Use and Privacy Policy to sign up.", false);
        return;
    }

    // Enforce a stricter password length (at least 8 characters)
    if (password.length < 8) {
        showModal("Password should be at least 8 characters long.", false);
        return;
    }

    try {
        // Create a new user with the provided email and password
        await createUserWithEmailAndPassword(auth, email, password);

        // Save user details to Firestore with a timestamp and role
        await addDoc(collection(db, "users"), {
            firstName,
            lastName,
            phone,
            address,
            email,
            usedCoupons: [],
            order_count: 0,
            role: "Customer",  // Custom role field
            timestamp: serverTimestamp() // Add a Firestore timestamp
        });

        // Show loading modal and redirect after a delay
        showModal("Creating account. Please wait...", true);
        setTimeout(() => {
            window.location.href = "auth/login.html";
        }, 2000);
    } catch (error) {
        console.error("Signup error: ", error.code, error.message);

        // Handle specific errors
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/email-already-in-use') {
            showModal("This email is already registered. Please use a different email.", false);
        } else if (errorCode === 'auth/invalid-email') {
            showModal("Invalid email format.", false);
        } else if (errorCode === 'auth/weak-password') {
            showModal("Password should be at least 6 characters.", false); // Firebase's default rule
        } else {
            showModal(errorMessage, false); // Display other errors
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation
    if (!email || !password) {
        showModal("Please fill in all required fields.", false);
        return;
    }

    // Check if email format is valid
    if (!isValidEmail(email)) {
        showModal("Please enter a valid email address.", false);
        return;
    }

    try {
        // Log the email and password for debugging
        console.log("Attempting login with:", email);

        // Try to sign in the user
        await signInWithEmailAndPassword(auth, email, password);

        // Listen to the user's document in Firestore using onSnapshot
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));

        // Real-time listener for the user's document
        onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const role = doc.data().role;  // Get the user's role (Manager, Staff, etc.)
                    const hasAccess = doc.data().hasAccess;  // Get the hasAccess field

                    if ((role === "Manager" || role === "Staff") && hasAccess === false) {
                        // If the user is a Manager or Staff but has no access, show an error and prevent redirect
                        showModal("You do not have access to the website. Please contact the admin.", false);
                        return;
                    } else {
                        // If the user has access, or their role is not Manager or Staff, redirect to index.html
                        showModal("Welcome to BonBon. Cravings satisfied.", true);
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 2000);
                    }
                });
            } else {
                // Handle case where user is not found in the Firestore collection
                showModal("No user found with this email. Please sign up or check your email.", false);
            }
        });

    } catch (error) {
        // Log the error details for debugging
        console.error("Login error:", error.code, error.message);

        // Handle specific errors
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/user-not-found') {
            showModal("No account found with this email. Please sign up or check your email.", false);
        } else if (errorCode === 'auth/wrong-password') {
            showModal("Incorrect password. Please try again.", false);
        } else if (errorCode === 'auth/invalid-email') {
            showModal("Invalid email format.", false);
        } else {
            showModal(errorMessage, false);
        }
    }
}

document.getElementById("branch-selector").addEventListener("change", function() {
    let browseShow = document.querySelector(".browse-show");
    let footerShow = document.querySelector(".footer-show");
    let browseHide = document.querySelector(".browse-hide");
    let footerFixed = document.querySelector(".footer-fixed");

    if (this.value === "") {  // If "Select a branch" is selected
        browseShow.style.display = "none";
        footerShow.style.display = "none";
        browseHide.style.display = "block";
        footerFixed.style.display = "block";
    } else {  // If any other option is selected
        browseShow.style.display = "block";
        footerShow.style.display = "block";
        browseHide.style.display = "none";
        footerFixed.style.display = "none";
    }
});

