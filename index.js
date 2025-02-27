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
            accountDelete(user);
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
            showModal("There was no edit that happened. Submission Failed.", false);
        } else {
            showConfirmation(
                "Are you sure you want to change this account's password?",
                async function () { // ✅ CONFIRM FUNCTION
                    try {
                        await updatePassword(user, newPassword);
    
                        showModal("You have changed your password. You need to log in again!", true);
                        console.log("Password successfully updated!");
    
                        setTimeout(() => {
                            window.location.href = "../auth/login.html"; // Redirect to login
                        }, 2500);
    
                        console.log("✅ Password updated successfully.");
                    } catch (error) {
                        if (error.code === 'auth/requires-recent-login') {
                            showModal("You have been logged in for too long. Log-in again.", false);
                            setTimeout(() => {
                                window.location.href = "auth/login.html";
                            }, 2500);
                        } 
                        
                        if (error.code === 'auth/weak-password') {
                            showModal("Password should be at least 8 characters.", false);
                        }
                        console.error("❌ Error updating password:", error);
                    }
    
                    // ✅ Disable password field **AFTER** confirmation
                    passwordInput.disabled = true;
                },
                function () { // ❌ CANCEL FUNCTION
                    // ✅ Reset the input field and re-enable it
                    passwordInput.value = "";
                    location.reload()
                    console.log("❌ Password reset as user canceled the action.");
                }
            );
        }
    });
      
}

async function accountDelete(user) {
    const deleteAccountBtn = document.getElementById("account-delete");

    deleteAccountBtn.addEventListener("click", async () => {
        showConfirmation(
            "Are you sure you want to delete your account? This action cannot be undone.",
            async function () { // ✅ Confirm deletion
                try {
                    const userEmail = user.email;
                    const userId = user.uid;

                    // ✅ Delete user data from Firestore
                    const usersCollection = collection(db, "users");
                    const q = query(usersCollection, where("email", "==", userEmail)); // Use "uid" if stored
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        console.warn("⚠️ No Firestore document found for this user.");
                    } else {
                        // Convert deletions to an array of promises
                        const deletePromises = querySnapshot.docs.map(docSnap =>
                            deleteDoc(doc(db, "users", docSnap.id))
                        );

                        // Wait for all deletions to finish
                        await Promise.all(deletePromises);
                        console.log("✅ Firestore user data deleted");
                    }

                    // ✅ Delete user from Firebase Authentication
                    await deleteUser(user);
                    console.log("✅ User deleted from Firebase Authentication");

                    // Redirect after deletion
                    showModal("Your account has been deleted. Thank you for using our application.", true);
                    setTimeout(() => {
                        window.location.href = "auth/signup.html";
                    }, 2500);
                } catch (error) {
                    console.error("❌ Error deleting account:", error);
                    if (error.code === "auth/requires-recent-login") {
                        showModal("Please log in again to delete your account.", false);
                    } else {
                        showModal("Failed to delete account. Please try again.", false);
                    }
                }
            },
            function () { // ❌ Cancel deletion
                console.log("❌ Account deletion canceled.");
            }
        );
    });
}
