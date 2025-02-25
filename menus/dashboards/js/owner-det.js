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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const editBtn = document.getElementById("password-edit");
const submitBtn = document.getElementById("password-submit");
const cancelBtn = document.getElementById("password-cancel");

let originalPassword = ""; // Store original password to restore on cancel

// Fetch Admin Email and Role from Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userEmail = user.email;
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.role === "Owner") {
                    emailInput.value = userEmail; // Display email
                    emailInput.disabled = true;
                }
            });
        } else {
            console.log("User not found or not an Owner.");
        }

        const passcodeInput = document.getElementById("passcode");

        // Handle passcode cancel button click
        document.getElementById("passcode-cancel").addEventListener("click", function() {
            if(passcodeInput.value === "") {
                showModal("No changes happenneed. There was nothing to cancel!", false);
            } else {
                showModal("Removed all edits.", true);
                passcodeInput.value = ""; // Clear the input field
                passcodeInput.disabled = true;
            }
        });

        // Handle passcode cancel button click
        document.getElementById("passcode-edit").addEventListener("click", function() {
            passcodeInput.disabled = false;
        });

        // Handle passcode submit button click
        document.getElementById("passcode-submit").addEventListener("click", function () {
            const passcode = passcodeInput.value.trim(); // Get the passcode entered

            if (passcode) {
                // Show confirmation modal
                showConfirmation("Are you sure you want to update the passcode?", async function () {
                    // Hash the original passcode for storage (for security)
                    hashPasscode(passcode).then(hashedPasscode => {
                        // Query Firestore to find the document based on the user's email
                        const usersRef = collection(db, "users");
                        const q = query(usersRef, where("email", "==", userEmail));

                        // Get the user document by email
                        getDocs(q).then((querySnapshot) => {
                            if (querySnapshot.empty) {
                                console.log("No user found with that email.");
                                return;
                            }

                            // Assuming only one document with the email exists
                            querySnapshot.forEach((doc) => {
                                // Store the hashed passcode in Firestore
                                updateDoc(doc.ref, {
                                    passcode: hashedPasscode
                                })
                                    .then(() => {
                                        console.log("Passcode updated successfully!");
                                        showModal("Passcode updated successfully!", true); 
                                        passcodeInput.value = ""; // Clear the input field
                                        passcodeInput.disabled = true;
                                    })
                                    .catch((error) => {
                                        console.error("Error updating passcode: ", error);
                                    });
                            });
                        }).catch((error) => {
                            console.error("Error querying user by email: ", error);
                        });
                    });
                });
            } else {
                showModal("Please enter a passcode.", false);
            }
        });
    } else {
        console.log("No user is logged in.");
    }
});

// Function to verify passcode (using SHA-256 hash)
async function verifyPasscode() {
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
                            window.location.href = "../../emp-details.html";
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
async function hashPasscode(passcode) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(passcode))
        .then(hashBuffer => {
            return Array.from(new Uint8Array(hashBuffer))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        });
}

// Enable password input on edit click
editBtn.addEventListener("click", () => {
    originalPassword = passwordInput.value; // Store old password
    passwordInput.disabled = false;
});

// Cancel password edit
cancelBtn.addEventListener("click", () => {
    if (passwordInput.value.trim() === "") {
        showModal("No changes happened. There was nothing to cancel!", false);
    } else {
        showConfirmation("Are you sure you wish to perform this operation?", async function () {
            passwordInput.value = originalPassword; // Restore previous value
            passwordInput.disabled = true;
            showModal("Removed all edits.", true);
        });
    }
});

// Update password in Firebase Auth and Firestore
submitBtn.addEventListener("click", async () => {
    showConfirmation("Are you sure you wish to perform this operation?", async function () { 
        const newPassword = passwordInput.value.trim();

        if (newPassword) {
            const user = auth.currentUser;
            try {
                // Update password in Firebase Authentication
                await updatePassword(user, newPassword);
                console.log("Password updated in Firebase Authentication.");

                // Update password in Firestore (hashed for security)
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", user.email));

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach(async (doc) => {
                        await updateDoc(doc.ref, { passcode: newPassword }); // Store hashed password if needed
                        showModal("You have changed your password. You need to log-in again.");
                        setTimeout(() => {
                            window.location.href = "../../../../bonbon-web-app/auth/login.html";
                        }, 2000);
                    });
                }

                passwordInput.disabled = true; // Lock input again
            } catch (error) {
                console.error("Error updating password: ", error);
            }
        } else {
            console.log("Please enter a new password.");
        }
    });
});
