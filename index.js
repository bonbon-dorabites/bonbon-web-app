// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


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

document.addEventListener("DOMContentLoaded", () => {
    // Define the menu elements
    const signupMenu = document.getElementById("signup-menu");
    const loginMenu = document.getElementById("login-menu");
    const userMenu = document.getElementById("user-menu");
    const editMenu = document.getElementById("edit-menu");
    const logoutMenu = document.getElementById("logout-menu");
    const ownerMenu = document.getElementById("owner-menu");
    const managerMenu = document.getElementById("manager-menu");
    const staffMenu = document.getElementById("staff-menu");
    const customerMenu = document.getElementById("customer-menu");
    
    // Initialize Firebase authentication
    const auth = getAuth(); // Ensure you're getting the auth instance correctly
    
    // Function to reset all menus to their default state
    const resetMenus = () => {
        console.log("Resetting menus to default...");
        signupMenu.style.display = "block";  // Show signup and login by default
        loginMenu.style.display = "block";
        userMenu.style.display = "none";  // Hide user menu when logged out
        editMenu.style.display = "none";
        logoutMenu.style.display = "none";
        ownerMenu.style.display = "none";
        managerMenu.style.display = "none";
        staffMenu.style.display = "none";
        customerMenu.style.display = "none";
    };
    
    let managerEmails = [
        "jethrojamesaguilar.18@gmail.com"
    ];
    
    let staffEmails = [
        "jayjayangadok21@gmail.com",
        "dehonorcharryl@gmail.com",
        "shaynebondoc28@gmail.com"
    ];
    
    // This function updates the UI when a user is logged in
    const updateUIForLoggedInUser = (user) => {
        console.log("User logged in: ", user.email);
    
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", user.email));
    
        getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const firstName = userData.firstName;
    
            console.log("User data fetched: ", userData);
    
            // Show user-specific menus
            signupMenu.style.display = "none";
            loginMenu.style.display = "none";
            userMenu.style.display = "block";
            editMenu.style.display = "block";
            logoutMenu.style.display = "block";

            const userMenuText = userMenu.querySelector("p");
    
            // Check roles
            if (user.email === "jayjay.otaku@gmail.com") {
                ownerMenu.style.display = "block"; // Owner menu
                const userMenuText = userMenu.querySelector("p");
                if (userMenuText) {
                    userMenuText.textContent = `Hi Admin`;
                }
                console.log("Owner menu displayed.");
            } else if (managerEmails.includes(user.email)) {
                managerMenu.style.display = "block"; // Manager menu
                if (userMenuText) {
                    userMenuText.textContent = `Hi Manager`;
                }
                console.log("Manager menu displayed.");
            } else if (staffEmails.includes(user.email)) {
                staffMenu.style.display = "block"; // Staff menu
                console.log("Before setting text:", userMenuText?.textContent);
                if (userMenuText) {
                    userMenuText.textContent = `Hi Staff`;
                }
                console.log("After setting text:", userMenuText?.textContent);
                console.log("Staff menu displayed.");
            } else {
                customerMenu.style.display = "block"; // Customer menu
                if (userMenuText) {
                    userMenuText.textContent = `Hi, ${firstName}`;
                }
                console.log("Customer menu displayed.");
            }
            });
        } else {
            console.error("No user document found.");
        }
        }).catch((error) => {
        console.error("Error fetching user document:", error);
        });
    };
    
    // Listen for the logout button click
    logoutMenu.addEventListener("click", async () => {
        console.log("Logout clicked...");
        try {
        // Sign out from Firebase
        await signOut(auth);
    
        // Reset the menus to show signup/login
        resetMenus();
    
        // Show the logout confirmation modal
        console.log("Showing modal before redirect...");
        showModal("You have logged out. Redirecting to login page.", true);
    
        // Wait for the modal to display before redirecting
        setTimeout(() => {
            console.log("test");
            hideModal();
            console.log("Redirecting to login...");
            window.location.href = "/auth/login.html";
        }, 600);  // Adjusted timeout to give enough time for the modal to appear
        } catch (error) {
        console.error("Error signing out:", error);
        }
    });      

    // Check if the user is logged in and update the UI accordingly
    const checkIfLoggedIn = () => {
    const user = auth.currentUser;  // Get the current user from Firebase
    console.log("Checking if user is logged in...");
    
    if (user) {
        console.log("User is logged in: ", user.email);
        updateUIForLoggedInUser(user);  // Update the UI for the logged-in user
    } else {
        console.log("No user logged in.");
        resetMenus();  // If no user is logged in, reset the menus
    }
    };

    // Listen for changes to authentication state (login/logout)
    onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed...");
    if (user) {
        console.log("User is logged in: ", user.email);
        updateUIForLoggedInUser(user);  // Update UI when user logs in
    } else {
        console.log("No user logged in.");
        resetMenus();  // Reset the UI to show login/signup
    }
    });

    // Check login status when the page loads
    checkIfLoggedIn();
});