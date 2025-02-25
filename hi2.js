// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

function showConfirmation(message, callback) {
    const modalElement = document.getElementById('confirmationModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    const modalMessage = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmActionBtn');
  
    // Set the confirmation message
    modalMessage.textContent = message;
  
    // Remove any previous event listeners to prevent duplicate triggers
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    const newConfirmButton = document.getElementById('confirmActionBtn');
  
    // Attach the new event listener
    newConfirmButton.addEventListener("click", function () {
        callback(); // Execute the callback function
        modalInstance.hide();
    });
  
    // Show the modal
    modalInstance.show();
}

// Function to show the password modal and handle the input
function showPasswordModal(message, callback) {
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    const passwordMessage = document.getElementById('passwordMessage');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');

    // Set the message for the modal
    passwordMessage.textContent = message;

    // Show the modal
    passwordModal.show();

    // Clear previous input
    passwordInput.value = "";

    // Handle the submit button click event
    submitPasswordBtn.onclick = function() {
        const passcode = passwordInput.value.trim();

        // If passcode is not empty, call the callback with the entered passcode
        if (passcode) {
            callback(passcode);
            passwordModal.hide();
        } else {
            alert("Please enter the passcode.");
        }
    };
}

// Function to verify passcode (using SHA-256 hash)
function verifyPasscode() {
    const ownerEmail = "owner_bonbon@gmail.com";

    showPasswordModal("Please enter the owner's passcode to proceed:", function(enteredPasscode) {
        // Hash the entered passcode for comparison (use SHA-256)
        hashPasscode(enteredPasscode).then(hashedPasscode => {
            // Query Firestore to find the owner's document by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", ownerEmail));

            // Get the user document by email
            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.empty) {
                    console.log("No user found with that email.");
                    return;
                }

                // Assuming only one document with the email exists
                querySnapshot.forEach((doc) => {
                    // Get the stored passcode (hashed)
                    const storedHashedPasscode = doc.data().passcode;

                    // Compare the entered passcode with the stored hashed passcode
                    if (hashedPasscode === storedHashedPasscode) {
                        showModal("Passcode is correct! Access granted.", true)
                        setTimeout(() => {
                            console.log("test");
                            hideModal();
                            console.log("Redirecting to login...");
                            window.location.href = "menus/emp-details.html";
                        }, 2000);
                    } else {
                        showModal("Incorrect passcode! Access denied.", false)
                    }
                });
            }).catch((error) => {
                console.error("Error querying user by email: ", error);
            });
        });
    });
}

// Function to hash the entered passcode securely using SHA-256
function hashPasscode(passcode) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(passcode))
        .then(hashBuffer => {
            return Array.from(new Uint8Array(hashBuffer))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        });
}


document.addEventListener("DOMContentLoaded", () => {
    // Define the menu elements
    const signupMenu = document.getElementById("signup-menu");
    const loginMenu = document.getElementById("login-menu");
    const userMenu = document.getElementById("user-menu");
    const editMenu = document.getElementById("edit-menu");
    const empEditMenu = document.getElementById("emp-edit-menu");
    const ownerDet = document.getElementById("owner-edit-menu");
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
        empEditMenu.style.display = "none";
        ownerDet.style.display = "none";
        logoutMenu.style.display = "none";
        ownerMenu.style.display = "none";
        managerMenu.style.display = "none";
        staffMenu.style.display = "none";
        customerMenu.style.display = "none";
    };

    const updateUIForLoggedInUser = (user) => {
        console.log("User logged in: ", user.email);
    
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", user.email));
    
        getDocs(q).then((querySnapshot) => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    const userEmail = userData.email;
                    const firstName = userData.firstName;
                    const role = userData.role; // Get the role
    
                    console.log("User data fetched: ", userData);
    
                    // Show user-specific menus
                    signupMenu.style.display = "none";
                    loginMenu.style.display = "none";
                    userMenu.style.display = "block";
                    logoutMenu.style.display = "block";
    
                    const userMenuText = userMenu.querySelector("p");
                    if (userMenuText) {
                        userMenuText.textContent = ''; // Clear any previous text
                    }
    
                    // Handle different roles
                    if (role === "Owner") {
                        ownerMenu.style.display = "block"; // Owner menu
                        ownerDet.style.display = "block";
                        if (userMenuText) {
                            userMenuText.textContent = `Hi Admin`; // Show "Hi Admin" for Owner
                        }
                        console.log("Owner menu displayed.");
                    } else if (role === "Manager") {
                        managerMenu.style.display = "block"; // Manager menu
                        empEditMenu.style.display = "block";
                        if (userMenuText) {
                            userMenuText.textContent = `Hi Manager`; // Show "Hi Manager" for Manager
                        }
                        console.log("Manager menu displayed.");
                        // Make the emp-edit-menu clickable for Manager
                        document.getElementById("emp-edit-menu").addEventListener("click", function() {
                            verifyPasscode();
                        });
                    } else if (role === "Staff") {
                        staffMenu.style.display = "block"; // Staff menu
                        empEditMenu.style.display = "block";
                        if (userMenuText) {
                            userMenuText.textContent = `Hi Staff`; // Show "Hi Staff" for Staff
                        }
                        console.log("Staff menu displayed.");

                        // Make the emp-edit-menu clickable for Manager
                        document.getElementById("emp-edit-menu").addEventListener("click", function() {
                            verifyPasscode();
                        });
                    } else if (role === "Customer") {
                        customerMenu.style.display = "block"; // Customer menu
                        editMenu.style.display = "block";
                        if (userMenuText) {
                            userMenuText.textContent = `Hi, ${firstName}`; // Show "Hi, {firstName}" for Customer
                        }
                        console.log("Customer menu displayed.");
                    }
    
                    // Real-time listener for Firestore document updates (onSnapshot)
                    onSnapshot(doc.ref, (snapshot) => {
                        const updatedData = snapshot.data();
                        const updatedFirstName = updatedData?.firstName;
    
                        if (userMenuText && updatedFirstName) {
                            // Update the firstName in real-time for the customer role
                            if (role === "Customer") {
                                userMenuText.textContent = `Hi, ${updatedFirstName}`;
                            }
                        }
                    });
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
                window.location.href = "../../auth/login.html";
            }, 2000);  // Adjusted timeout to give enough time for the modal to appear
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

