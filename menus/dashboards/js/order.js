// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDoc, Timestamp, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);


// Listener for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User authenticated: ", user.email);
        await fetchCartItems(user);
    } else {
        console.log("User not authenticated.");
    }
});

async function fetchCartItems(user) {
    const userId = user.uid;
    console.log("user-id:" + userId);

    const branchId = localStorage.getItem("selectedBranch");
    console.log("Retrieved branch:", branchId); // Check if the value is retrieved
    
    if (!branchId) {
        console.error("No branch selected.");
    } else {
        // Use branchId here
        console.log("Branch selected:", branchId);
    }

    const cartRef = doc(db, "branches", branchId, "carts", userId);
    
    try {
        const cartDoc = await getDoc(cartRef);
        
        if (!cartDoc.exists()) {
            document.getElementById("cart-items-body").innerHTML = `
                <tr>
                    <td colspan="4">You don't have anything in your cart right now.</td>
                </tr>
            `;
            return;
        }

        const cartData = cartDoc.data();
        console.log("Cart Data:", cartData); // Logs entire cart document data
        
        const itemsInCart = cartData.items_inCart;
        console.log("Items in Cart:", itemsInCart); // Logs the items_inCart object
        
        const itemIds = Object.keys(itemsInCart);
        console.log("Item IDs:", itemIds); // Logs the keys (item IDs) inside items_inCart

        if (itemIds.length === 0) {
            document.getElementById("cart-items-body").innerHTML = `
                <tr>
                    <td colspan="4">You don't have anything in your cart right now.</td>
                </tr>
            `;
            return;
        }

        // Clear any existing content (if present)
        let tableContent = '';
        // Loop through items in the cart and fetch item details
        for (let itemId of itemIds) {
            const item = itemsInCart[itemId]; // Get item directly from items_inCart

            console.log("Processing Item ID:", itemId);
            console.log("Item Data:", item); // Logs full item data

            const itemName = item.name;
            const itemPrice = item.price;
            const itemQuantity = item.quantity;

            console.log(`Processed Item - Name: ${itemName}, Price: ${itemPrice}, Quantity: ${itemQuantity}`);

            // Add item to table content
            tableContent += `
                <tr>
                    <th scope="row">
                        <i class="fas fa-minus-circle fa-lg text-danger delete-icon" 
                        onclick="deleteItem('${itemId}')"
                        style="cursor: pointer;"></i>
                    </th>
                    <td>${itemName}</td>
                    <td>${itemQuantity}</td>
                    <td>$${itemPrice.toFixed(2)}</td>
                </tr>
            `;
        }


        // Update the table body with fetched items
        document.getElementById("cart-items-body").innerHTML = tableContent || `
            <tr>
                <td colspan="4">You don't have anything ordered right now.</td>
            </tr>
        `;
    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}


// Call the function to fetch cart items when the page loads or when needed

 document.addEventListener("DOMContentLoaded", fetchCartItems);

