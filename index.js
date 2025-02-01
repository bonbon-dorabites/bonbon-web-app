// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


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
                    } else if (role === "Staff") {
                        staffMenu.style.display = "block"; // Staff menu
                        empEditMenu.style.display = "block";
                        if (userMenuText) {
                            userMenuText.textContent = `Hi Staff`; // Show "Hi Staff" for Staff
                        }
                        console.log("Staff menu displayed.");
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
                window.location.href = "/auth/login.html";
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

const formFields = ["firstName", "lastName", "phone", "address"]; // Adjust based on your form
let originalData = {}; // Stores original values
let userDocId = null; // Firestore Document ID

// Load user data
async function loadUserData(user) {
    if (!user) return;
    
    const userEmail = user.email;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        userDocId = docSnap.id; // Store the document ID
        originalData = docSnap.data(); // Store original data

        formFields.forEach(id => {
            document.getElementById(id).value = originalData[id] || "";
        });

        toggleFormFields(true); // Disable fields initially

        // Listen for Firestore updates
        onSnapshot(doc(db, "users", userDocId), (snapshot) => {
            const updatedData = snapshot.data();
            if (updatedData) {
                formFields.forEach(id => {
                    document.getElementById(id).value = updatedData[id] || "";
                });
                originalData = { ...updatedData };
            }
        });
    } else {
        console.error("No user document found.");
    }
}

// Auth listener
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserData(user);
    } else {
        console.log("No user is logged in.");
    }
});

// Function to enable or disable form fields
function toggleFormFields(disabled) {
    formFields.forEach(id => {
        let field = document.getElementById(id);
        if (field) {
            field.disabled = disabled;
        } else {
            console.warn(`Field with ID '${id}' not found.`);
        }
    });
}

// Enable form editing
document.getElementById("allow-edit").addEventListener("click", () => {
    toggleFormFields(false);
});

document.getElementById("cancel-edit").addEventListener("click", () => {
    let isCancelled = true; // Flag to check if cancellation was necessary

    formFields.forEach(id => {
        const originalValue = originalData[id] || "";
        const currentValue = document.getElementById(id).value;
        
        // If the value has changed, mark as cancellation
        if (currentValue !== originalValue) {
            isCancelled = false; // Cancel is not needed
        }
        
        document.getElementById(id).value = originalValue;
    });

    toggleFormFields(true);

    // Show appropriate modal message based on whether any changes were made
    if (isCancelled) {
        showModal("No changes happened. Cancel failed.", false);
    } else {
        showModal("Cancelled all edits successfully.", false);
    }
});

document.getElementById("submit-edit").addEventListener("click", async () => {
    if (!userDocId) return;
    
    console.log("Entered")

    const updatedData = {};
    let isChanged = false; // Flag to check if any changes were made

    formFields.forEach(id => {
        const newValue = document.getElementById(id).value;
        const originalValue = originalData[id] || "";
        
        // Check if the value has changed
        if (newValue !== originalValue) {
            isChanged = true;
        }
        updatedData[id] = newValue;
    });

    if (!isChanged) {
        // If no changes, show modal with error
        showModal("No changes were made. Submission failed.", false);
        return; // Exit without updating the document
    }

    try {
        // Update the Firestore document
        await updateDoc(doc(db, "users", userDocId), updatedData);
        console.log("Updated")
        showModal("Successfully updated!", true);
        toggleFormFields(true);
    } catch (error) {
        console.error("Error updating document:", error);
    }
});

// Listen for authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docId = await fetchAndDisplayUserData(user);
        if (docId) {
            setupPasswordEditFunctions(user);
        }
    } else {
        console.log("No user is logged in.");
    }
});

// 1️⃣ Fetch user data and display email
async function fetchAndDisplayUserData(user) {
    const emailInput = document.getElementById("email");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get first matching document
        const docId = userDoc.id;

        // Real-time listener for email field updates
        onSnapshot(doc(db, "users", docId), (docSnap) => {
            if (docSnap.exists()) {
                emailInput.value = docSnap.data().email;
            }
        });

        return docId;
    } else {
        console.error("User not found in Firestore.");
        return null;
    }
}

// 3️⃣ Password Editing & Updating
function setupPasswordEditFunctions(user) {
    const passwordInput = document.getElementById("password");
    const passwordEditBtn = document.getElementById("password-edit");
    const passwordSubmitBtn = document.getElementById("password-submit");
    const passwordCancelBtn = document.getElementById("password-cancel");

    passwordEditBtn.addEventListener("click", () => {
        passwordInput.disabled = false;
    });

    passwordCancelBtn.addEventListener("click", () => {
        // Check if there was a change in the password field
        if (passwordInput.value.trim() === "") {
            // No change happened
            showModal("No change happened. Cancel Failed.", false);
            passwordInput.value = "";
            passwordInput.disabled = true;
        } else {
            // Changes were made, clear the password field and disable it
            passwordInput.value = "";
            passwordInput.disabled = true;
            showModal("Cancelled all edits successfully", true);
        }
    });

    passwordSubmitBtn.addEventListener("click", async () => {
        const newPassword = passwordInput.value;
    
        // Check if password field is disabled or nothing was typed
        if (passwordInput.disabled || newPassword.trim() === "") {
            // Show modal if no edit or change was made
            showModal("There was no edit that happened. Submission Failed.", false);
        } else {
            try {
                // Update password in Firebase Auth
                await updatePassword(user, newPassword);
    
                // Show success modal and inform user to log in again
                showModal("You have changed your password. You need to log-in again!", true);
    
                // Wait for the modal to display before redirecting
                setTimeout(() => {
                    console.log("test");
                    hideModal();
                    console.log("Password successfully updated!");
                    window.location.href = "/auth/login.html"; // Redirect to login
                }, 3000);
    
                console.log("✅ Password updated successfully.");
            } catch (error) {
                console.error("❌ Error updating password:", error);
            }
        }
    
        // Disable password field after submission
        passwordInput.disabled = true;
    });    
}