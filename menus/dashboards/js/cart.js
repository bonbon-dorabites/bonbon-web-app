// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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


// Attach event listeners to all cart buttons

/*
document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", function () {
        const itemId = this.id
        alert(itemId);
        addToOrder(itemId);
    });
});*/


document.addEventListener("click", (event) => {
    if (event.target.closest(".add-to-cart")) {
        const button = event.target.closest(".add-to-cart");
        const itemId = button.id;
        alert(itemId);

        const itemName = button.dataset.itemName;
        alert(itemName);
        
        // Fetch the price from the 'items' collection using itemId
        const itemRef = doc(db, "items", itemId); // Reference to the item document
        getDoc(itemRef).then((docSnap) => {
            if (docSnap.exists()) {
                const itemPrice = docSnap.data().item_price;
                alert(itemPrice);

                // Call function to add item to the cart with the fetched price
                addToCart(itemId, itemName, itemPrice);
            } else {
                console.log("Item not found in Firestore.");
            }
        }).catch((error) => {
            console.error("Error fetching item price:", error);
        });
         

        
    }
});

const branchMap = {
    "oneMallVal": "OneMallVal",
    "smNorth": "SmNorthEdsa",
    "smVal": "SmValenzuela"
};

async function addToCart(itemId, itemName, itemPrice) {
    const user = auth.currentUser;
    

    if (!user) {
        console.error("User not authenticated. Please log in.");
        /*PROMPT NA MAGLOGIN MUNA */
        return;
    }

    // Get selected branch
    const branchSelector = document.getElementById("branch-selector");
    const branch = branchSelector.value;
    const branchId = branchMap[branch];
    
    alert("BRANCH ID: " + branchId);

    localStorage.setItem("selectedBranch", branchId);
    console.log("Selected branch stored:", branchId); // Check if it's saved

    if (!branchId) {
        console.error("Please select a branch first.");
        return;
    }

    const userId = user.uid; // Get the UID of the currently logged-in user
    alert("USER ID: " + userId)

    const cartRef = doc(db, "branches", branchId, "carts", userId); // Reference to user's cart document

    try {
        await runTransaction(db, async (transaction) => {
            const cartDoc = await transaction.get(cartRef);

            if (!cartDoc.exists()) {
                // Create a new cart document if it doesn't exist
                transaction.set(cartRef, {
                    created_at: serverTimestamp(),
                    isCheckedOut: false,
                    items_inCart: {
                        [itemId]: {
                            name: itemName,
                            price: itemPrice,
                            quantity: 1
                        }
                    }
                });
            } else {
                // Update existing cart
                const cartData = cartDoc.data();
                let items = cartData.items_inCart || {};

                if (items[itemId]) {
                    // If item already in cart, increase quantity
                    items[itemId].quantity += 1;
                } else {
                    // Add new item
                    items[itemId] = {
                        name: itemName,
                        price: itemPrice,
                        quantity: 1
                    };
                }

                transaction.update(cartRef, { items_inCart: items });
            }
        });

        alert("Item added to cart successfully!");
    } catch (error) {
        console.error("Error adding item to cart:", error);
    }

}



