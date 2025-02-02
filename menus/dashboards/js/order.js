// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, onSnapshot, where, query, getDocs, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDoc, Timestamp, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

            // Add item to table content with spinner
            tableContent += `
                <tr>
                    <th scope="row">
                        <i class="fas fa-minus-circle fa-lg text-danger delete-icon" 
                            id="delete-item-${itemId}"
                            style="cursor: pointer;"></i>
                    </th>
                    <td>${itemName}</td>
                    <td>
                        <input type="number" id="quantity-${itemId}" value="${itemQuantity}" min="1" max="50" 
                               style="width: 60px;" class="quantity-spinner" />
                    </td>
                    <td>P${itemPrice.toFixed(2)}</td>
                </tr>
            `;
        }

        // Update the table body with fetched items
        document.getElementById("cart-items-body").innerHTML = tableContent || `
            <tr>
                <td colspan="4">You don't have anything ordered right now.</td>
            </tr>
        `;

        // Attach event listeners to the delete icons
        itemIds.forEach(itemId => {
            const deleteIcon = document.getElementById(`delete-item-${itemId}`);
            if (deleteIcon) {
                deleteIcon.addEventListener("click", function() {
                    deleteItem(itemId);  // Call your delete function
                });
            }

            // Attach event listeners to the quantity spinners
            const quantityInput = document.getElementById(`quantity-${itemId}`);
            if (quantityInput) {
                quantityInput.addEventListener("change", function() {
                    const newQuantity = Math.max(1, Math.min(50, parseInt(quantityInput.value)));
                    updateQuantity(itemId, newQuantity);  // Update the quantity in Firestore
                    quantityInput.value = newQuantity;  // Update UI to reflect the constrained value
                });
            }
        });

    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}

async function updateQuantity(itemId, newQuantity) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated.");
        return;
    }

    const userId = user.uid;
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) {
        console.error("No branch selected.");
        return;
    }

    const cartRef = doc(db, "branches", branchId, "carts", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const cartDoc = await transaction.get(cartRef);
            if (!cartDoc.exists()) {
                console.error("Cart does not exist.");
                return;
            }

            let cartData = cartDoc.data();
            const item = cartData.items_inCart[itemId];
            if (item) {
                item.quantity = newQuantity;

                // Update the quantity in Firestore
                transaction.update(cartRef, { [`items_inCart.${itemId}`]: item });
            }
        });
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}


async function deleteItem(itemId) {
    const user = auth.currentUser;
    if (!user) {
         console.error("User not authenticated.");
         return;
    }
    const userId = user.uid;
    console.log("USER ID: " + userId);
    const branchId = localStorage.getItem("selectedBranch");
    console.log("BRANCH ID: " + branchId);
 
     if (!branchId) {
         console.error("No branch selected.");
         return;
     }
 
     const cartRef = doc(db, "branches", branchId, "carts", userId);
     try {
         await runTransaction(db, async (transaction) => {
             const cartDoc = await transaction.get(cartRef);
             if (!cartDoc.exists()) {
                 console.error("Cart does not exist.");
                 return;
             }
 
             let cartData = cartDoc.data();
             delete cartData.items_inCart[itemId]; // Remove the item from the map
 
             // Update Firestore with the modified cart
             transaction.update(cartRef, { items_inCart: cartData.items_inCart });
         });
 
         console.log(`Item ${itemId} removed successfully.`);
     } catch (error) {
         console.error("Error removing item:", error);
     }
 
     // Set up real-time listener to automatically update the UI after the deletion
     const unsubscribe = onSnapshot(cartRef, (cartDoc) => {
         if (cartDoc.exists()) {
             const cartData = cartDoc.data();
             const itemsInCart = cartData.items_inCart;
             console.log("Updated Cart Data:", itemsInCart); // Logs the updated cart items
 
             // Clear the cart items table
             let tableContent = '';
             const itemIds = Object.keys(itemsInCart);
             
             if (itemIds.length === 0) {
                 tableContent = `
                     <tr>
                         <td colspan="4">You don't have anything in your cart right now.</td>
                     </tr>
                 `;
             } else {
                 itemIds.forEach(itemId => {
                     const item = itemsInCart[itemId];
                     tableContent += `
                         <tr>
                             <th scope="row">
                                 <i class="fas fa-minus-circle fa-lg text-danger delete-icon" 
                                     id="delete-item-${itemId}"
                                     style="cursor: pointer;"></i>
                             </th>
                             <td>${item.name}</td>
                             <td>${item.quantity}</td>
                             <td>P${item.price.toFixed(2)}</td>
                         </tr>
                     `;
                 });
             }
 
             document.getElementById("cart-items-body").innerHTML = tableContent;
         } else {
             console.error("No cart found.");
         }
     });
 
     
     // unsubscribe();
 }
 

 document.addEventListener("DOMContentLoaded", function() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    console.log("HERE PO AKO");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async function(event) {
            event.preventDefault(); // Prevent form submission for now

            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated.");
                return;
            }
            await updateCartSummary(user.uid);
            await fillCheckoutForm(user.email);
            
        });
    }
});

async function fillCheckoutForm(userEmail) {

    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) {
        console.error("No branch selected.");
        return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));

    try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.error("User data not found.");
            return;
        }

        const userData = querySnapshot.docs[0].data();
        console.log("Fetched User Data:", userData); // Debugging

        // Populate the form fields
        document.getElementById("fname").value = userData.firstName || "";
        document.getElementById("lname").value = userData.lastName || "";
        document.getElementById("email").value = userData.email || "";
        document.getElementById("adr").value = userData.address || "";
        document.getElementById("phone").value = userData.phone || "";

    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

async function updateCartSummary(userId) {
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) {
        console.error("No branch selected.");
        return;
    }

    const cartRef = doc(db, "branches", branchId, "carts", userId);

    try {
        const cartSnap = await getDoc(cartRef);
        if (!cartSnap.exists()) {
            console.error("Cart not found.");
            return;
        }

        const cartData = cartSnap.data();
        const items = cartData.items_inCart || {};

        let totalPrice = 0;
        let itemCount = 0;
        let cartSummaryHTML = "";

        for (const itemId in items) {
            const { name, price, quantity } = items[itemId];
            const itemTotal = price * quantity;
            totalPrice += itemTotal;
            itemCount += quantity;

            cartSummaryHTML += `
                <p><a href="#">${name} (x${quantity})</a> <span class="price">P${itemTotal.toFixed(2)}</span></p>
            `;
        }

        let deliveryFee = 50;

        // Set values in HTML
        document.querySelector(".cart-part .container h4 b").textContent = itemCount;
        document.querySelector(".cart-part .container").innerHTML = `
            <h4>Summary <span class="price" style="color:var(--dark-brown)"><i class="fa fa-shopping-cart"></i> <b>${itemCount}</b></span></h4>
            ${cartSummaryHTML}
            <div class="coupon-section">
                <h4>Coupon</h4>
                <div class="coupon-wrap">
                    <input type="text" id="coupon-code" placeholder="Enter coupon code"/>
                    <button id="apply-coupon">Apply</button>
                </div>
            </div>
            <hr>
            <p>Subtotal: <span class="price subtotal">P${totalPrice.toFixed(2)}</span></p>
            <p id="discount-row" class="hidden">- Discount: <span class="price" id="discount-amount">P0.00</span></p> <!-- Hidden by default -->
            <p>Delivery: <span class="price delivery-fee">P${deliveryFee.toFixed(2)}</span></p>
            <hr>
            <p class="total"><b>Total:</b> <span class="price"><b id="total-price">P${(totalPrice + deliveryFee).toFixed(2)}</b></span></p>
        `;
    } catch (error) {
        console.error("Error fetching cart data:", error);
    }
}

// Event delegation: Listen for clicks inside .cart-part .container
document.querySelector(".cart-part .container").addEventListener("click", async (event) => {
    if (event.target && event.target.id === "apply-coupon") {

        const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated.");
                return;
        }

        await applyCoupon(user.email);
    }
});

async function applyCoupon(userEmail) {

    const couponCode = document.getElementById("coupon-code").value.trim();
    
    if (!couponCode) {
        alert("Please enter a coupon code.");
        return;
    }

    // Get the selected branch
    const branchId = localStorage.getItem("selectedBranch");
    console.log(branchId);
    if (!branchId) {
        alert("Please select a branch.");
        return;
    }

    // Get user's usedCoupons and order_count
    const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
        alert("User not found.");
        return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const usedCoupons = userData.usedCoupons || [];
    const orderCount = userData.order_count || 0;
    
    // Get coupon data
    const couponRef = doc(db, "coupons", couponCode);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
        alert("Invalid coupon.");
        return;
    }

    const couponData = couponSnap.data();

    // 🔹 Check if coupon is already used
    if (usedCoupons.includes(couponCode)) {
        alert("You have already used this coupon.");
        return;
    }

    // Get the subtotal from the price element
    const subtotalElement = document.querySelector('.subtotal');
    const subtotal = parseFloat(subtotalElement.textContent.replace('P', '').trim());
    const deliveryFee = parseFloat(document.querySelector(".delivery-fee").textContent.replace("P", "") || 0);
    // Log the subtotal to verify
    console.log("Subtotal:", subtotal);

    // 🔹 Validate the coupon requirements
    if (couponData.min_order && subtotal < couponData.min_order) {
        alert(`Minimum order of ₱${couponData.min_order} required to use this coupon.`);
        return;
    }

    if (couponData.first_time_users_only && orderCount > 0) {
        alert("This coupon is only available for first-time customers.");
        return;
    }

    if (couponData.applicable_branches && !couponData.applicable_branches.includes(branchId)) {
        alert("This coupon is not valid for the selected branch.");
        return;
    }

    // Apply discount
    const discountAmount = couponData.coup_amount;
    const newTotal = subtotal + deliveryFee - discountAmount;
    console.log("NEW TOTAL: " + newTotal);
    // Update the UI
    document.getElementById("discount-row").classList.remove("hidden");
    document.getElementById("discount-amount").textContent = `P${discountAmount.toFixed(2)}`;
    document.getElementById("total-price").textContent = `P${newTotal.toFixed(2)}`;

    alert(`Coupon applied! You saved ₱${discountAmount.toFixed(2)}. New total: ₱${newTotal.toFixed(2)}`);
    
    // Save the applied coupon temporarily to the user's document
    await setDoc(doc(db, "users", userDoc.id), {
        appliedCoupon: couponCode,
    }, { merge: true });

    console.log("Coupon code applied and saved temporarily.");

}


// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchCartItems);

