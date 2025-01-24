// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Save user details to Firestore
        await addDoc(collection(db, "users"), {
            uid,
            firstName,
            lastName,
            phone,
            address,
            email
        });

        // Show loading modal and redirect after a delay
        showModal("Creating account. Please wait...", true);
        setTimeout(() => {
            window.location.href = "/auth/login.html";
        }, 600);
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

        // Show success message and redirect
        showModal("Redirecting to your diary booklet...", true);
        setTimeout(() => {
            window.location.href = "/index.html";
        }, 600);

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

