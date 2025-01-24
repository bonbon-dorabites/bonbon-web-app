// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, where, getDocs, query } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    // Define the menu elements
    const signupMenu = document.getElementById("signup-menu");
    const loginMenu = document.getElementById("login-menu");
    const userMenu = document.getElementById("user-menu");
    const editMenu = document.getElementById("edit-menu");
    const logoutMenu = document.getElementById("logout-menu");
    const ownerMenu = document.getElementById("owner-menu");
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
      staffMenu.style.display = "none";
      customerMenu.style.display = "none";
    };
  
    // This function updates the UI when a user is logged in
    const updateUIForLoggedInUser = (user) => {
      console.log("User logged in: ", user.email);
  
      // Query Firestore for the user data based on email
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", user.email));
  
      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const firstName = userData.firstName;
            const email = user.email;
  
            console.log("User data fetched: ", userData);
  
            // Show user-specific menus
            signupMenu.style.display = "none";
            loginMenu.style.display = "none";
            userMenu.style.display = "block";
            editMenu.style.display = "block";
            logoutMenu.style.display = "block";
  
            // Show greeting with first name
            const userMenuText = userMenu.querySelector("p");
            if (userMenuText) {
              userMenuText.textContent = `Hi, ${firstName}`;
            }
  
            // Show specific menus based on email
            if (email === "jayjay.otaku@gmail.com") {
              ownerMenu.style.display = "block";  // Owner menu
              console.log("Owner menu displayed.");
            } else if (email === "jayjayangadok21@gmail.com") {
              staffMenu.style.display = "block";  // Staff menu
              console.log("Staff menu displayed.");
            } else {
              customerMenu.style.display = "block";  // Customer menu
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
  