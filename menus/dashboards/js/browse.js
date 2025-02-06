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
    const hide = document.querySelector(".browse-hide");
    hide.style.display = "none";
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
