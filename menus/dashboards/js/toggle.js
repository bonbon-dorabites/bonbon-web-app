// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, updateDoc, where, getDocs, getDoc, setDoc, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
    const cancelButton = document.getElementById('cancelActionBtn'); // Get the cancel button

    // Set the confirmation message
    modalMessage.textContent = message;

    // Remove previous event listeners to prevent duplication
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    cancelButton.replaceWith(cancelButton.cloneNode(true));

    const newConfirmButton = document.getElementById('confirmActionBtn');
    const newCancelButton = document.getElementById('cancelActionBtn');

    // Attach new event listener for Confirm
    newConfirmButton.addEventListener("click", function () {
        callback(); // Execute the callback function
        modalInstance.hide(); // Hide modal properly
    });

    // Attach new event listener for Cancel
    newCancelButton.addEventListener("click", function () {
        modalInstance.hide(); // Ensure modal is closed
    });

    // Show the modal
    modalInstance.show();
}

// Function to check logged-in user and find branch
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("in");
        const userEmail = user.email;
        console.log("Logged-in user email:", userEmail); // Debugging

        // Query branch collection to find the user's assigned branch
        const branchQuery = query(collection(db, "branches"), where("staff_email", "==", userEmail));
        const branchSnapshot = await getDocs(branchQuery);

        if (!branchSnapshot.empty) {
            const branchDoc = branchSnapshot.docs[0]; // Assuming one branch per user
            const branchId = branchDoc.id;
            const branchData = branchDoc.data();

            // Display the branch location
            document.getElementById("staff-branch").innerText = branchData.location;

            // Fetch and display stock updates
            fetchStockUpdates(branchId);
        } else {
            console.log("No assigned branch found for this user.");
        }
    } else {
        console.log("No user logged in.");
    }
});

// Function to fetch stock updates in real-time
function fetchStockUpdates(branchId) {
    const itemsRef = collection(db, `branches/${branchId}/items`); // ✅ FIXED: Corrected Firestore path

    onSnapshot(itemsRef, (snapshot) => {
        // Clear previous data
        document.querySelector(".dorabites-container").innerHTML = "";
        document.querySelector(".flavors-container").innerHTML = "";
        document.querySelector(".boncoin-container").innerHTML = "";
        document.querySelector(".drinks-container").innerHTML = "";

        snapshot.forEach((doc) => {
            const itemData = doc.data();
            const itemId = doc.id;

            if (itemData.category.startsWith("size")) {
                createSizeRow(itemId, itemData);
            } else if (itemData.category.startsWith("flavor")) {
                createFlavorRow(itemId, itemData);
            } else if (itemData.category.startsWith("boncoin")) {
                createBoncoinRow(itemId, itemData);
            } else if (itemData.category.startsWith("drink")) {
                createDrinkRow(itemId, itemData);
            }
        });
    });
}

// Function to create a row for each size dynamically
function createSizeRow(itemId, itemData) {
    const container = document.querySelector(".dorabites-container");

    // Create row div
    const row = document.createElement("div");
    row.className = "size-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "5px";
    row.style.padding = "10px"; // Padding for spacing inside the row
    row.style.borderRadius = "5px"; // Rounded corners
    row.style.backgroundColor = "#f2f2f2"; // Light background color
    row.style.height = "70px"; // Limit the height of each row
    row.style.width = "900px"; // Limit the height of each row
    row.style.fontSize = "20px"; // Smaller font size for better fit
    row.style.boxSizing = "border-box"; // Include padding and border in the element's total width and height

    // Item Name
    const name = document.createElement("span");
    name.innerText = itemData.item_name;
    name.style.fontWeight = "bold"; // Bold the item name
    name.style.flex = "1"; // Allow the name to take the available space

    // Status
    const status = document.createElement("span");
    status.innerText = itemData.isSoldOut ? "Sold Out" : "Available";
    status.style.color = itemData.isSoldOut ? "red" : "green";
    status.style.fontWeight = "bold"; // Bold the status text

    // Available button
    const availableBtn = document.createElement("button");
    availableBtn.innerText = "Available";
    availableBtn.className = "btn btn-success";
    availableBtn.style.fontSize = "12px"; // Smaller font size
    availableBtn.style.padding = "5px 10px"; // Adjust button size
    availableBtn.onclick = () => toggleStockStatus(itemId, false);

    // Sold Out button
    const soldOutBtn = document.createElement("button");
    soldOutBtn.innerText = "Sold Out";
    soldOutBtn.className = "btn btn-danger";
    soldOutBtn.style.fontSize = "12px"; // Smaller font size
    soldOutBtn.style.padding = "5px 10px"; // Adjust button size
    soldOutBtn.onclick = () => toggleStockStatus(itemId, true);

    // Append elements
    row.appendChild(name);
    row.appendChild(status);
    row.appendChild(availableBtn);
    row.appendChild(soldOutBtn);

    container.appendChild(row);
}

// Function to create a row for each flavor dynamically
function createFlavorRow(itemId, itemData) {
    const container = document.querySelector(".flavors-container");

    // Create row div
    const row = document.createElement("div");
    row.className = "flavor-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "5px";
    row.style.padding = "10px"; // Padding for spacing inside the row
    row.style.borderRadius = "5px"; // Rounded corners
    row.style.backgroundColor = "#f2f2f2"; // Light background color
    row.style.height = "70px"; // Limit the height of each row
    row.style.width = "900px"; // Limit the height of each row
    row.style.fontSize = "20px"; // Smaller font size for better fit
    row.style.boxSizing = "border-box"; // Include padding and border in the element's total width and height

    // Item Name
    const name = document.createElement("span");
    name.innerText = itemData.item_name;
    name.style.fontWeight = "bold"; // Bold the item name
    name.style.flex = "1"; // Allow the name to take the available space

    // Status
    const status = document.createElement("span");
    status.innerText = itemData.isSoldOut ? "Sold Out" : "Available";
    status.style.color = itemData.isSoldOut ? "red" : "green";
    status.style.fontWeight = "bold"; // Bold the status text

    // Available button
    const availableBtn = document.createElement("button");
    availableBtn.innerText = "Available";
    availableBtn.className = "btn btn-success";
    availableBtn.style.fontSize = "12px"; // Smaller font size
    availableBtn.style.padding = "5px 10px"; // Adjust button size
    availableBtn.onclick = () => toggleStockStatus(itemId, false);

    // Sold Out button
    const soldOutBtn = document.createElement("button");
    soldOutBtn.innerText = "Sold Out";
    soldOutBtn.className = "btn btn-danger";
    soldOutBtn.style.fontSize = "12px"; // Smaller font size
    soldOutBtn.style.padding = "5px 10px"; // Adjust button size
    soldOutBtn.onclick = () => toggleStockStatus(itemId, true);

    // Append elements
    row.appendChild(name);
    row.appendChild(status);
    row.appendChild(availableBtn);
    row.appendChild(soldOutBtn);

    container.appendChild(row);
}

// Function to create a row for each Boncoin item dynamically
function createBoncoinRow(itemId, itemData) {
    const container = document.querySelector(".boncoin-container");

    // Create row div
    const row = document.createElement("div");
    row.className = "boncoin-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "5px";
    row.style.padding = "10px"; // Padding for spacing inside the row
    row.style.borderRadius = "5px"; // Rounded corners
    row.style.backgroundColor = "#f2f2f2"; // Light background color
    row.style.height = "70px"; // Limit the height of each row
    row.style.width = "900px"; // Limit the height of each row
    row.style.fontSize = "20px"; // Smaller font size for better fit
    row.style.boxSizing = "border-box"; // Include padding and border in the element's total width and height

    // Item Name
    const name = document.createElement("span");
    name.innerText = itemData.item_name;
    name.style.fontWeight = "bold"; // Bold the item name
    name.style.flex = "1"; // Allow the name to take the available space

    // Status
    const status = document.createElement("span");
    status.innerText = itemData.isSoldOut ? "Sold Out" : "Available";
    status.style.color = itemData.isSoldOut ? "red" : "green";
    status.style.fontWeight = "bold"; // Bold the status text

    // Available button
    const availableBtn = document.createElement("button");
    availableBtn.innerText = "Available";
    availableBtn.className = "btn btn-success";
    availableBtn.style.fontSize = "12px"; // Smaller font size
    availableBtn.style.padding = "5px 10px"; // Adjust button size
    availableBtn.onclick = () => toggleStockStatus(itemId, false);

    // Sold Out button
    const soldOutBtn = document.createElement("button");
    soldOutBtn.innerText = "Sold Out";
    soldOutBtn.className = "btn btn-danger";
    soldOutBtn.style.fontSize = "12px"; // Smaller font size
    soldOutBtn.style.padding = "5px 10px"; // Adjust button size
    soldOutBtn.onclick = () => toggleStockStatus(itemId, true);

    // Append elements
    row.appendChild(name);
    row.appendChild(status);
    row.appendChild(availableBtn);
    row.appendChild(soldOutBtn);

    container.appendChild(row);
}

// Function to create a row for each drink dynamically
function createDrinkRow(itemId, itemData) {
    const container = document.querySelector(".drinks-container");

    // Create row div
    const row = document.createElement("div");
    row.className = "drink-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.marginBottom = "5px";
    row.style.padding = "10px"; // Padding for spacing inside the row
    row.style.borderRadius = "5px"; // Rounded corners
    row.style.backgroundColor = "#f2f2f2"; // Light background color
    row.style.height = "70px"; // Limit the height of each row
    row.style.width = "900px"; // Limit the height of each row
    row.style.fontSize = "20px"; // Smaller font size for better fit
    row.style.boxSizing = "border-box"; // Include padding and border in the element's total width and height

    // Item Name
    const name = document.createElement("span");
    name.innerText = itemData.item_name;
    name.style.fontWeight = "bold"; // Bold the item name
    name.style.flex = "1"; // Allow the name to take the available space

    // Status
    const status = document.createElement("span");
    status.innerText = itemData.isSoldOut ? "Sold Out" : "Available";
    status.style.color = itemData.isSoldOut ? "red" : "green";
    status.style.fontWeight = "bold"; // Bold the status text

    // Available button
    const availableBtn = document.createElement("button");
    availableBtn.innerText = "Available";
    availableBtn.className = "btn btn-success";
    availableBtn.style.fontSize = "12px"; // Smaller font size
    availableBtn.style.padding = "5px 10px"; // Adjust button size
    availableBtn.onclick = () => toggleStockStatus(itemId, false);

    // Sold Out button
    const soldOutBtn = document.createElement("button");
    soldOutBtn.innerText = "Sold Out";
    soldOutBtn.className = "btn btn-danger";
    soldOutBtn.style.fontSize = "12px"; // Smaller font size
    soldOutBtn.style.padding = "5px 10px"; // Adjust button size
    soldOutBtn.onclick = () => toggleStockStatus(itemId, true);

    // Append elements
    row.appendChild(name);
    row.appendChild(status);
    row.appendChild(availableBtn);
    row.appendChild(soldOutBtn);

    container.appendChild(row);
}

// Function to toggle stock status
async function toggleStockStatus(itemId, isSoldOut) {
    const user = auth.currentUser;
    if (!user) return;

    // Query the user's branch
    const branchQuery = query(collection(db, "branches"), where("staff_email", "==", user.email)); // ✅ FIXED
    const branchSnapshot = await getDocs(branchQuery);

    if (!branchSnapshot.empty) {
        const branchId = branchSnapshot.docs[0].id;

        // Update Firestore document
        const itemRef = doc(db, `branches/${branchId}/items`, itemId); // ✅ FIXED
        await updateDoc(itemRef, { isSoldOut });

        console.log(`Updated ${itemId}: Sold Out = ${isSoldOut}`);
    }
}
