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
            if (userMenuText) {
              userMenuText.textContent = `Hi, ${firstName}`;
            }
    
            // Check roles
            if (user.email === "jayjay.otaku@gmail.com") {
              ownerMenu.style.display = "block"; // Owner menu
              console.log("Owner menu displayed.");
            } else if (managerEmails.includes(user.email)) {
              managerMenu.style.display = "block"; // Staff menu
              console.log("Manager menu displayed.");
            } else if (staffEmails.includes(user.email)) {
              staffMenu.style.display = "block"; // Staff menu
              console.log("Staff menu displayed.");
            } else {
              customerMenu.style.display = "block"; // Customer menu
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
    
    // Add staff
    function addManagerEmail(email) {
      if (!staffEmails.includes(email)) {
        managerEmails.push(email);
        console.log(`Added ${email} to manager.`);
      } else {
        console.log(`${email} is already a manager.`);
      }
    }

    // Remove staff
    function removeManagerEmail(email) {
      const index = managerEmails.indexOf(email);
      if (index !== -1) {
        managerEmails.splice(index, 1);
        console.log(`Removed ${email} from manager.`);
      } else {
        console.log(`${email} is not a manager.`);
      }
    }
    
    // Add staff
    function addStaffEmail(email) {
      if (!staffEmails.includes(email)) {
        staffEmails.push(email);
        console.log(`Added ${email} to staff.`);
      } else {
        console.log(`${email} is already a staff member.`);
      }
    }

    // Remove staff
    function removeStaffEmail(email) {
      const index = staffEmails.indexOf(email);
      if (index !== -1) {
        staffEmails.splice(index, 1);
        console.log(`Removed ${email} from staff.`);
      } else {
        console.log(`${email} is not a staff member.`);
      }
    }
  
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

  const branchSelector = document.getElementById("branch-selector");

  const branchMap = {
      "oneMallVal": "OneMallVal",
      "smNorth": "SmNorthEdsa",
      "smVal": "SmValenzuela"
  };
  
  const itemMap = {
      "dorabite_oishi": ["#oishi-flavors-show", "#oishi-flavors-none"],
      "dorabite_sugoi": ["#sugoi-flavors-show", "#sugoi-flavors-none"],
      "dorabite_bonbon": ["#box-flavors-show", "#box-flavors-none"],
      "dorabite_oishi_choco": ["#choco-oishi-instock", "#choco-oishi-sold"],
      "dorabite_sugoi_choco": ["#choco-sugoi-instock", "#choco-sugoi-sold"],
      "dorabite_bonbon_choco": ["#choco-box-instock", "#choco-box-sold"],
      "dorabite_oishi_dulce": ["#dulce-oishi-instock", "#dulce-oishi-sold"],
      "dorabite_sugoi_dulce": ["#dulce-sugoi-instock", "#dulce-sugoi-sold"],
      "dorabite_bonbon_dulce": ["#dulce-box-instock", "#dulce-box-sold"],
      "dorabite_oishi_cheese": ["#cheese-oishi-instock", "#cheese-oishi-sold"],
      "dorabite_sugoi_cheese": ["#cheese-sugoi-instock", "#cheese-sugoi-sold"],
      "dorabite_bonbon_cheese": ["#cheese-box-instock", "#cheese-box-sold"],
      "dorabite_walnutella_oishi": ["#wnut-oishi-instock", "#wnut-oishi-sold"],
      "dorabite_walnutella_sugoi": ["#wnut-sugoi-instock", "#wnut-sugoi-sold"],
      "dorabite_walnutella_bonbon": ["#wnut-box-instock", "#wnut-box-sold"],
      "boncoin_nutella": ["#bc-nut-instock", "#bc-nut-sold"],
      "boncoin_hamcheese": ["#bc-ham-instock", "#bc-ham-sold"],
      "boncoin_mozarella": ["#bc-mozza-instock", "#bc-mozza-sold"],
      "boncoin_oreocream": ["#bc-oreo-instock", "#bc-oreo-sold"],
      "chocold": ["#chocold-instock", "#chocold-sold"],
      "hot_coffee": ["#hotcof-instock", "#hotcof-sold"],
      "iced_coffee": ["#icedcof-instock", "#icedcof-sold"]
  };
  
  function updateItemDisplay(branch) {
      if (!branch) return;
  
      const branchDoc = branchMap[branch];
      const itemsRef = collection(db, `branches/${branchDoc}/items`);
  
      // Listen for real-time updates
      onSnapshot(itemsRef, (snapshot) => {
          snapshot.forEach(doc => {
              const data = doc.data();
              const itemName = doc.id;
  
              if (itemMap[itemName]) {
                  const [instockSelector, soldSelector] = itemMap[itemName];
                  const instockElement = document.querySelector(instockSelector);
                  const soldElement = document.querySelector(soldSelector);
  
                  if (instockElement && soldElement) {
                      if (data.isSoldOut) {
                          instockElement.style.display = "none";
                          soldElement.style.display = "block";
                      } else {
                          instockElement.style.display = "block";
                          soldElement.style.display = "none";
                      }
                  }
              }
          });
      });
  }
  
  // Event listener for branch selection
  branchSelector.addEventListener("change", (event) => {
      updateItemDisplay(event.target.value);
  });

// Function to fetch and listen to menu items in real-time from Firestore
function listenToMenuItems() {
  const itemsCollectionRef = collection(db, "items");

  // Set up the real-time listener
  onSnapshot(itemsCollectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          const docId = doc.id;
          
          console.log("Updated:", docId, data); // Debugging: Check if data is being updated

          // Function to set text content safely
          function setTextContent(selector, value) {
              const element = document.querySelector(selector);
              if (element) element.textContent = value;
          }

          // Function to format price with ₱ symbol
          function formatPrice(price) {
              return `₱${price}`;
          }

          // Update item names & prices based on Firestore document ID
          switch (docId) {
              case "dorabite_oishi":
                  setTextContent("#oishi-title", data.item_name);
                  // Create the <span> element for the toggle icon
                  const toggleIcon = document.createElement("span");
                  toggleIcon.classList.add("toggle-icon");
                  toggleIcon.textContent = "+"; // Add the text inside the span

                  // Append the toggle icon after the item name (or wherever you want)
                  const oishiTitleElement = document.querySelector("#oishi-title");
                  if (oishiTitleElement) {
                      oishiTitleElement.appendChild(toggleIcon);
                  }
                  break;

              case "dorabite_oishi_choco":
                  document.querySelectorAll(".flavor-choco").forEach(el => el.textContent = data.item_name);
                  setTextContent("#choco-oishi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_oishi_dulce":
                  document.querySelectorAll(".flavor-dulce").forEach(el => el.textContent = data.item_name);
                  setTextContent("#dulce-oishi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_oishi_cheese":
                  document.querySelectorAll(".flavor-cheese").forEach(el => el.textContent = data.item_name);
                  setTextContent("#cheese-oishi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_walnutella_oishi":
                  document.querySelectorAll(".flavor-walnutella").forEach(el => el.textContent = data.item_name);
                  setTextContent("#wnut-oishi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_sugoi":
                  setTextContent("#sugoi-title", data.item_name);
                  // Create the <span> element for the toggle icon
                  const toggleIconSugoi = document.createElement("span");
                  toggleIconSugoi.classList.add("toggle-icon");
                  toggleIconSugoi.textContent = "+"; // Add the text inside the span

                  // Append the toggle icon after the item name (or wherever you want)
                  const sugoiTitleElement = document.querySelector("#sugoi-title");
                  if (sugoiTitleElement) {
                      sugoiTitleElement.appendChild(toggleIconSugoi);
                  }
                  break;

              case "dorabite_sugoi_choco":
                  document.querySelectorAll(".flavor-choco").forEach(el => el.textContent = data.item_name);
                  setTextContent("#choco-sugoi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_sugoi_dulce":
                  document.querySelectorAll(".flavor-dulce").forEach(el => el.textContent = data.item_name);
                  setTextContent("#dulce-sugoi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_sugoi_cheese":
                  document.querySelectorAll(".flavor-cheese").forEach(el => el.textContent = data.item_name);
                  setTextContent("#cheese-sugoi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_walnutella_sugoi":
                  document.querySelectorAll(".flavor-walnutella").forEach(el => el.textContent = data.item_name);
                  setTextContent("#wnut-sugoi-price", formatPrice(data.item_price));
                  break;

              case "dorabite_bonbon":
                  setTextContent("#bonbox-title", data.item_name);
                  // Create the <span> element for the toggle icon
                  const toggleIconBonbon = document.createElement("span");
                  toggleIconBonbon.classList.add("toggle-icon");
                  toggleIconBonbon.textContent = "+"; // Add the text inside the span

                  // Append the toggle icon after the item name (or wherever you want)
                  const bonbonTitleElement = document.querySelector("#bonbox-title");
                  if (bonbonTitleElement) {
                      bonbonTitleElement.appendChild(toggleIconBonbon);
                  }
                  break;

              case "dorabite_bonbon_choco":
                  document.querySelectorAll(".flavor-choco").forEach(el => el.textContent = data.item_name);
                  setTextContent("#choco-bonbox-price", formatPrice(data.item_price));
                  break;

              case "dorabite_bonbon_dulce":
                  document.querySelectorAll(".flavor-dulce").forEach(el => el.textContent = data.item_name);
                  setTextContent("#dulce-bonbox-price", formatPrice(data.item_price));
                  break;

              case "dorabite_bonbon_cheese":
                  document.querySelectorAll(".flavor-cheese").forEach(el => el.textContent = data.item_name);
                  setTextContent("#cheese-bonbox-price", formatPrice(data.item_price));
                  break;

              case "dorabite_walnutella_bonbon":
                  document.querySelectorAll(".flavor-walnutella").forEach(el => el.textContent = data.item_name);
                  setTextContent("#wnut-bonbox-price", formatPrice(data.item_price));
                  break;

              case "boncoin_nutella":
                  setTextContent("#nutella-title", data.item_name);
                  setTextContent("#bc-nut-price", formatPrice(data.item_price));
                  break;

              case "boncoin_hamcheese":
                  setTextContent("#hamcheese-title", data.item_name);
                  setTextContent("#bc-ham-price", formatPrice(data.item_price));
                  break;

              case "boncoin_mozarella":
                  setTextContent("#mozza-title", data.item_name);
                  setTextContent("#bc-mozza-price", formatPrice(data.item_price));
                  break;

              case "boncoin_oreocream":
                  setTextContent("#oreocream-title", data.item_name);
                  setTextContent("#bc-oreo-price", formatPrice(data.item_price));
                  break;

              case "chocold":
                  setTextContent("#chocold-title", data.item_name);
                  setTextContent("#chocold-price", formatPrice(data.item_price));
                  break;

              case "hot_coffee":
                  setTextContent("#hotcof-title", data.item_name);
                  setTextContent("#hotcof-price", formatPrice(data.item_price));
                  break;

              case "iced_coffee":
                  setTextContent("#icedcof-title", data.item_name);
                  setTextContent("#icedcof-price", formatPrice(data.item_price));
                  break;

              default:
                  console.warn(`No matching element for document: ${docId}`);
          }
      });
  }, (error) => {
      console.error("Error listening to menu items:", error);
  });
}

// Call the listener to automatically update the page when data changes
listenToMenuItems();
