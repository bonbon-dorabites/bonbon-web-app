// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, updateDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Mapping of branchId to display text
const branchMaps = {
    "SmValenzuela": "SM VALENZUELA",
    "SmNorthEdsa": "SM NORTH EDSA",
    "OneMallVal": "ONE MALL VALENZUELA" 
};

async function fetchUserBranch(userEmail) {
    try {
        console.log("Fetching user branch for email:", userEmail);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const branchId = userDoc.data().branchId;
            console.log("Branch ID found:", branchId);

            const branchButton = document.getElementById("staff-branch");
            if (branchButton) {
                branchButton.innerHTML = `<strong>${branchMaps[branchId] || "Unknown Branch"}</strong>`;
            } else {
                console.error("Button with ID 'staff-branch' not found.");
            }

            // Wait for DOM update and then call setupStockUpdate
            setTimeout(() => {
                setupStockUpdate(branchId);
            }, 0);
        } else {
            console.error("User document not found.");
        }
    } catch (error) {
        console.error("Error fetching user branch:", error);
    }
}

// Ensure DOM is ready before running the script
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            fetchUserBranch(user.email);
        } else {
            console.warn("No user is currently logged in.");
        }
    });
};

let toggleStock;  // Declare toggleStock globally

const setupStockUpdate = (branchId) => {
    // Define the document reference for the specific branch
    const branchRef = doc(db, 'branches', branchId);

    // Define functions to handle the stock update for each menu item
    toggleStock = (itemName, isSoldOut) => {
        console.log(`Updating stock for item: ${itemName}, Sold-Out: ${isSoldOut}`);
        const itemRef = doc(branchRef, 'items', itemName);
        updateDoc(itemRef, { isSoldOut: isSoldOut })
            .then(() => {
                console.log(`${itemName} updated to ${isSoldOut ? 'Sold-Out' : 'Available'}`);
                showModal(`${itemName} is now ${isSoldOut ? 'Sold-Out' : 'Available'}`, true);  // Show success modal
            })
            .catch((error) => {
                console.error("Error updating item stock:", error);
                showModal(`Error updating ${itemName}: ${error.message}`, false);  // Show error modal
            });
    };

    // Attach event listeners to buttons that toggle stock availability
    const setStockStatus = (itemName, isSoldOut) => {
        return () => {
            console.log(`Button clicked for item: ${itemName}, Sold-Out: ${isSoldOut}`);
            toggleStock(itemName, isSoldOut);
        };
    };

    // Attach event listeners to each menu item in the stock update section
    document.querySelectorAll('.dash-buttons button').forEach(button => {
        const itemId = button.parentElement.previousElementSibling.textContent.trim().replace(/\s+/g, '').toLowerCase();
        const isAvailable = button.classList.contains('btn-success');
        
        console.log(`Button for item ${itemId} has availability: ${isAvailable}`);
        
        if (isAvailable) {
            button.onclick = setStockStatus(itemId, false);  // Mark item as available
        } else {
            button.onclick = setStockStatus(itemId, true);   // Mark item as sold-out
        }
    });
};

// Ensure the functions like hasOishi are globally available
window.hasOishi = () => toggleStock('dorabite_oishi', false);
window.hasNoOishi = () => toggleStock('dorabite_oishi', true);
window.hasSugoi = () => toggleStock('dorabite_sugoi', false);
window.hasNoSugoi = () => toggleStock('dorabite_sugoi', true);
window.hasBonBox = () => toggleStock('dorabite_bonbon', false);
window.hasNoBonBox = () => toggleStock('dorabite_bonbon', true);
window.hasChoco = () => {  
    toggleStock('dorabite_oishi_choco', false);
    toggleStock('dorabite_sugoi_choco', false);
    toggleStock('dorabite_bonbon_choco', false);
};
window.hasNoChoco = () => { 
    toggleStock('dorabite_oishi_choco', true);
    toggleStock('dorabite_sugoi_choco', true);
    toggleStock('dorabite_bonbon_choco', true); 
};
window.hasDulce = () => { 
    toggleStock('dorabite_oishi_dulce', false);
    toggleStock('dorabite_sugoi_dulce', false);
    toggleStock('dorabite_bonbon_dulce', false); 
};
window.hasNoDulce = () => { 
    toggleStock('dorabite_oishi_dulce', true);
    toggleStock('dorabite_sugoi_dulce', true);
    toggleStock('dorabite_bonbon_dulce', true); 
};
window.hasCheese = () => { 
    toggleStock('dorabite_oishi_cheese', false);
    toggleStock('dorabite_sugoi_cheese', false);
    toggleStock('dorabite_bonbon_cheese', false); 
};
window.hasNoCheese = () => { 
    toggleStock('dorabite_oishi_cheese', true);
    toggleStock('dorabite_sugoi_cheese', true);
    toggleStock('dorabite_bonbon_cheese', true); 
};
window.hasWalnut = () => { 
    toggleStock('dorabite_walnutella_oishi', false); 
    toggleStock('dorabite_walnutella_sugoi', false);
    toggleStock('dorabite_walnutella_bonbon', false);
};
window.hasNoWalnut = () => { 
    toggleStock('dorabite_walnutella_oishi', true); 
    toggleStock('dorabite_walnutella_sugoi', true);
    toggleStock('dorabite_walnutella_bonbon', true);
};
window.hasNutella = () => toggleStock('boncoin_nutella', false);
window.hasNoNutella = () => toggleStock('boncoin_nutella', true);
window.hasHamCheese = () => toggleStock('boncoin_hamcheese', false);
window.hasNoHamCheese = () => toggleStock('boncoin_hamcheese', true);
window.hasMozzarella = () => toggleStock('boncoin_mozarella', false);
window.hasNoMozzarella = () => toggleStock('boncoin_mozarella', true);
window.hasOreoCream = () => toggleStock('boncoin_oreocream', false);
window.hasNoOreoCream = () => toggleStock('boncoin_oreocream', true);
window.hasChocold = () => toggleStock('chocold', false);
window.hasNoChocold = () => toggleStock('chocold', true);
window.hasHotcof = () => toggleStock('hot_cof', false);
window.hasNoHotcof = () => toggleStock('hot_cof', true);
window.hasIcedcof = () => toggleStock('iced_coffee', false);
window.hasNoIcedcof = () => toggleStock('iced_coffee', true);
