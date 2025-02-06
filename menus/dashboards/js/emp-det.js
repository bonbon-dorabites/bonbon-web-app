/*// Import the functions you need from the SDKs
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

const formFields = ["branchId", "role"]; // Adjust based on your form
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

        console.log("User data fetched:", originalData); // Debugging line

        formFields.forEach(id => {
            const fieldValue = originalData[id] || "";  // Safely get the value
            const fieldElement = document.getElementById(id);
            if (fieldElement) {
                fieldElement.value = fieldValue;
                console.log(`Set ${id} to:`, fieldValue); // Debugging line
            } else {
                console.warn(`Field with id ${id} not found in HTML.`);
            }
        });

        toggleFormFields(true); // Disable fields initially

        // Listen for Firestore updates
        onSnapshot(doc(db, "users", userDocId), (snapshot) => {
            const updatedData = snapshot.data();
            if (updatedData) {
                formFields.forEach(id => {
                    const updatedValue = updatedData[id] || "";
                    const updatedElement = document.getElementById(id);
                    if (updatedElement) {
                        updatedElement.value = updatedValue;
                        console.log(`Updated ${id} to:`, updatedValue); // Debugging line
                    }
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
});*/