// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, setDoc, collection, deleteDoc, orderBy, addDoc, doc, updateDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

const nameMapping = {
    "Ham & Cheese": "hamcheese",
    "Oreo Creamcheese": "oreocream",
    "Classic Choco": "choco",
    "Dulce De Leche": "dulce",
    "Chocold (12oz)": "chocold",
    "Hot Coffee (12oz)": "hot_coffee",
    "Iced Coffee (12oz)": "iced_coffee"
};

const categoryMapping = {
    "Dorayaki Bites": "dorabite",
    "Boncoin": "boncoin",
    "drinks": "drinks"
};

const sizeMapping = {
    "BONBON Box (16pcs)": "bonbon",
    "SUGOI (12pcs)": "sugoi",
    "OISHI (8pcs)": "oishi",
};


const itemModal = document.getElementById("menuModal");
const editItemModal = document.getElementById("editMenuModal");

function closeEditMenuModal() {
    editItemModal.style.display = "none";
}


// Function to fetch and display items
async function fetchItems() {
    console.log("Fetching items...");
    const itemsCollection = collection(db, "items");
    const itemsSnapshot = await getDocs(itemsCollection);
    const menuTableBody = document.getElementById("menu-table-body");

    menuTableBody.innerHTML = ""; // Clear existing table rows
    let index = 1; // Product numbering

    itemsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Skip items that have no price or a null/undefined price
        if (data.item_price === undefined || data.item_price === null) {
            return; 
        }

        const row = document.createElement("tr");

         // Set the doc.id as a custom attribute on the row for later access
         row.setAttribute("data-menu-id", docSnap.id); // Store doc.id in data-id attribute
         console.log("ITEM PRICE: " + data.item_name);
         console.log("ITEM PRICE: " + data.item_price);

        row.innerHTML = `
            <td>${index}</td>
            <td>${data.item_name}</td>
            <td>${data.category}</td>
            <td>${data.size !== undefined ? data.size : '-'}</td>
            <td>₱${data.item_price.toFixed(2)}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${data.status ? "checked" : ""} data-id="${docSnap.id}">
                    <span class="slider round"></span>
                </label>
            </td>
            <td>
                <button class="action-btn edit" onclick="editMenu(this)"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        menuTableBody.appendChild(row);
        index++;
    });

    // Add event listeners to toggle buttons
    document.querySelectorAll('.switch input').forEach((toggle) => {
        toggle.addEventListener("change", async function () {
            const itemId = this.getAttribute("data-id");
            const newStatus = this.checked;

            await updateDoc(doc(db, "items", itemId), { status: newStatus });
            console.log(`Updated ${itemId}: Status ${newStatus}`);
        });
    });

    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            deleteMenu(e.target);
        });
    });
}

async function addItems() {
    // Get values from the form
    const itemName = document.getElementById("menu_name").value;
    const menuCategory = document.getElementById("menu-category").value;
    const price = parseFloat(document.getElementById('menu_price').value);

    let nameDisplay = itemName;

    if(menuCategory === "Boncoin") {
        nameDisplay = menuCategory + " " + itemName;
    }
    
    // Validate input
    if (!itemName || !menuCategory || (menuCategory === "Dorayaki Bites" && (!document.getElementById("price-bonbon") || !document.getElementById("price-oishi") || !document.getElementById("price-sugoi")))) {
        alert("Please fill out all required fields.");
        return;
    }

    // Handle adding sizes and prices for Dorayaki Bites category
    if (menuCategory === "Dorayaki Bites") {
        // Get prices entered for each size
        const priceBonbon = parseFloat(document.getElementById("price-bonbon").value);
        const priceOishi = parseFloat(document.getElementById("price-oishi").value);
        const priceSugoi = parseFloat(document.getElementById("price-sugoi").value);

        const sizes = [
            { name: "BONBON Box (16pcs)", price: priceBonbon },
            { name: "OISHI (8pcs)", price: priceOishi },
            { name: "SUGOI (12pcs)", price: priceSugoi }
        ];

        // Iterate over each size and add it with the correct price
        for (let i = 0; i < sizes.length; i++) {
            const currentSize = sizes[i].name;
            const itemPrice = sizes[i].price;
            const docId = getFormattedId(menuCategory, itemName, currentSize);
            console.log("DOC ID: " + docId);

            // Prepare item data to add to Firestore
            const itemData = {
                item_name: itemName,
                category: menuCategory,
                item_price: itemPrice, // Use the user-inputted price
                status: true,
                name_to_show: itemName + " " + currentSize, // Update display name for each size
                size: currentSize, // Add the size specific to this iteration
                created_at: new Date()  // Adding a timestamp for creation
            };

            try {
                // Add the item to the Firestore collection using the generated docId
                await setDoc(doc(db, "items", docId), itemData);

                console.log("Document added with ID: ", docId); // Log the custom docId

                // Get all branches
                const branchesSnapshot = await getDocs(collection(db, "branches"));

                // Iterate over all branches with a proper asynchronous loop
                for (const branchDoc of branchesSnapshot.docs) {
                    const branchId = branchDoc.id;

                    // Define a simpler item data for each branch (with just item_name, isSoldOut, and category)
                    const branchItemData = {
                        item_name: itemName,
                        isSoldOut: false,  // Default status for items
                        categ: menuCategory,
                    };

                    // Create a document reference for the specific branch's "items" subcollection
                    const branchItemRef = doc(db, "branches", branchId, "items", docId);

                    // Add the item to the branch's "items" subcollection using the document reference
                    await setDoc(branchItemRef, branchItemData);
                    console.log(`Item added to branch ${branchId} with simplified data`);
                }

                // Show success message for each item added
                alert(`Item ${currentSize} added successfully!`);
            } catch (e) {
                console.error("Error adding document: ", e);
                alert("Error adding item. Please try again.");
            }
        }
    } else {
        // If category is not "Dorayaki Bites", proceed as usual for a single item
        const docId = getFormattedId(menuCategory, itemName);
        console.log("DOC ID: " + docId);

        // Prepare item data to add to Firestore
        const itemData = {
            item_name: itemName,
            category: menuCategory,
            item_price: price,
            status: true,
            name_to_show: nameDisplay,
            created_at: new Date()  // Adding a timestamp for creation
        };

        try {
            // Add the item to the Firestore collection using the generated docId
            await setDoc(doc(db, "items", docId), itemData);

            console.log("Document added with ID: ", docId); // Log the custom docId

            // Get all branches
            const branchesSnapshot = await getDocs(collection(db, "branches"));

            // Iterate over all branches with a proper asynchronous loop
            for (const branchDoc of branchesSnapshot.docs) {
                const branchId = branchDoc.id;

                // Define a simpler item data for each branch (with just item_name, isSoldOut, and category)
                const branchItemData = {
                    item_name: itemName,
                    isSoldOut: false,  // Default status for items
                    categ: menuCategory
                };

                // Create a document reference for the specific branch's "items" subcollection
                const branchItemRef = doc(db, "branches", branchId, "items", docId);

                // Add the item to the branch's "items" subcollection using the document reference
                await setDoc(branchItemRef, branchItemData);
                console.log(`Item added to branch ${branchId} with simplified data`);
            }

            // Show success message
            alert("Item added to all branches successfully!");

            // Reset the form after adding
            document.getElementById("addMenuForm").reset();
            
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error adding item. Please try again.");
        }
    }
}





async function editItems() {
    console.log("ITEM EDITED");
    // Get the updated values from the input fields
    const updatedItemName = document.getElementById("edit-menu_name").value;
    const updatedPrice = parseFloat(document.getElementById("edit-menu_price").value);

    // Get the document ID from the hidden input field
    const itemId = document.getElementById("edit-doc-menu-id").value;
    
    console.log("ITEM ID:: " + itemId);

    // Validate the input
    if (!updatedItemName || isNaN(updatedPrice)) {
        alert("Please provide a valid item name and price.");
        return;
    }

    try {
        // Update the item in Firestore
        const itemRef = doc(db, "items", itemId); // Reference to the item document
        await updateDoc(itemRef, {
            item_name: updatedItemName,
            item_price: updatedPrice
        });

        console.log("Item successfully updated in Firestore!");
        alert("Item updated successfully!");

        // Optionally, close the modal after the update
        closeEditMenuModal();
    } catch (e) {
        console.error("Error updating item: ", e);
        alert("Error updating item. Please try again.");
    }
}

async function deleteMenu(button) {
    console.log("delete menu");

    // Get the row where the button was clicked
    const row = button.closest("tr");

    if (!row) {
        console.error("Could not find the row or details card.");
        return;
    }

    // Get the document ID (menu item ID) from the data-menu-id attribute
    const itemId = row.getAttribute("data-menu-id");
    console.log("ITEMM ID: " + itemId);

    if (!itemId) {
        console.error("Menu item ID not found.");
        return;
    }

    // Confirm deletion with the user
    showConfirmation("Are you sure you want to delete this menu?", async function () {
        try {
            // Get reference to the item document in Firestore
            const menuRef = doc(db, "items", itemId);

            // Delete the item document from Firestore
            await deleteDoc(menuRef);

            console.log("Menu deleted successfully!");

            // Remove the row from the UI
            row.remove();

            // Show success message
            showModal("Menu deleted successfully!", true);

            // Optionally reload the page after a short delay
            setTimeout(() => {
                location.reload();
            }, 1500);

        } catch (error) {
            console.error("Error deleting menu item:", error.message);
            showModal("Failed to delete menu item.", false);
            console.error(error.stack);
        }
    });
}


  function capitalizeFirstLetter(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getFormattedId(category, name, size) {
    console.log("Name: " + name);
    console.log("Cate " + category);

    // Capitalize and format the name, category, and size
    const formattedName = nameMapping[capitalizeFirstLetter(name)] || name.trim().toLowerCase().replace(/\s+/g, '');
    const formattedCategory = categoryMapping[category.trim()] || category.trim().toLowerCase();
    const formattedSize = size ? (sizeMapping[size.trim()] || size.trim().replace(/\s+/g, '').toLowerCase()) : '';

    // Handle different categories and formats
    if (category === "Drinks") {
        return formattedName;
    }

    if (category === "Boncoin") {
        // Include size only if it exists
        return size ? `${formattedCategory}_${formattedName}_${formattedSize}` : `${formattedCategory}_${formattedName}`;
    }

    if (name.trim().toLowerCase() === "walnutella") {
        return `${formattedCategory}_${formattedName}_${formattedSize}`;
    }

    // Return with or without size depending on its existence
    return size ? `${formattedCategory}_${formattedSize}_${formattedName}` : `${formattedCategory}_${formattedName}`;
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


// Event listener for the save button
document.getElementById("save-menu").addEventListener("click", addItems);
document.getElementById("save-edit-menu").addEventListener("click", editItems);

  // Fetch items on page load
  window.onload = fetchItems;
