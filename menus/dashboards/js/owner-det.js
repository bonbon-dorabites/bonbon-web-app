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

// Authenticate user and set up passcode functionality
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is authenticated:", user);
        
        // Get the user email from Firebase Authentication
        const userEmail = user.email;
        const passcodeInput = document.getElementById("passcode");

        // Handle passcode cancel button click
        document.getElementById("passcode-cancel").addEventListener("click", function() {
            if(passcodeInput.value === "") {
                showModal("No changes happenneed. There was nothing to cancel!", false);
            } else {
                showModal("Removed all edits.", true);
                passcodeInput.value = ""; // Clear the input field
            }
        });

        // Handle passcode cancel button click
        document.getElementById("passcode-edit").addEventListener("click", function() {
            passcodeInput.disabled = false;
        });

        // Handle passcode submit button click
        document.getElementById("passcode-submit").addEventListener("click", function() {
            const passcode = passcodeInput.value.trim(); // Get the passcode entered

            if (passcode) {
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
                                // Call the verifyPasscode function to verify after storing the passcode
                                verifyPasscode(userEmail);
                            })
                            .catch((error) => {
                                console.error("Error updating passcode: ", error);
                            });
                        });
                    }).catch((error) => {
                        console.error("Error querying user by email: ", error);
                    });
                });
            } else {
                console.log("Please enter a passcode.");
            }
        });
    } else {
        console.log("User is not authenticated.");
    }
});

