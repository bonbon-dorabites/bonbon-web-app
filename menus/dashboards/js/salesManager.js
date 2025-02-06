// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, orderBy, getDocs, query, onSnapshot, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Dropdown selectors
const yearSelector = document.getElementById("year-selector");
const monthSelector = document.getElementById("month-selector");
const daySelector = document.getElementById("day-selector");
const tableBody = document.getElementById("sales-table-body");
const salesContainer = document.getElementById("sales-container");

let orders = [];

function fetchOrders() {
    orders = []; // Reset orders
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const q = query(collection(db, "branches"), where("manager_email", "==", user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const branchDoc = querySnapshot.docs[0];
                const branchId = branchDoc.id;
                const ordersCollection = collection(db, "branches", branchId, "orders");
                const ordersQuery = query(ordersCollection, orderBy("created_at", "desc"));
                
                onSnapshot(ordersQuery, snapshot => {
                    orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), created_at: doc.data().created_at.toDate() }));
                    updateDisplay();
                });
            }
        }
    });
}

function updateDisplay() {
    tableBody.innerHTML = "";
    salesContainer.innerHTML = "";
    const selectedYear = yearSelector.value;
    const selectedMonth = monthSelector.value;
    const selectedDay = daySelector.value;

    let filteredOrders = orders;
    if (selectedYear) filteredOrders = filteredOrders.filter(order => order.created_at.getFullYear().toString() === selectedYear);
    if (selectedMonth) {
        const monthIndex = new Date(Date.parse(selectedMonth + " 1, 2000")).getMonth();
        filteredOrders = filteredOrders.filter(order => order.created_at.getMonth() === monthIndex);
    }
    if (selectedDay) filteredOrders = filteredOrders.filter(order => order.created_at.getDate().toString() === selectedDay);
    
    filteredOrders.sort((a, b) => b.created_at - a.created_at);

    
    let totalSales = 0;
    filteredOrders.forEach(order => {
        const items = Object.values(order.items_bought).map(item => `${item.name} (x${item.quantity})`).join(", ");
        
        
        const show = document.querySelectorAll(".hide");
        show.forEach(element => {
            element.style.display = "block";
        });
        document.querySelector(".hidee").style.display = "block";
        document.querySelector(".hidee").style.display = "flex";
        

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.created_at.toLocaleDateString()}</td>
            <td>${items}</td>
            <td>₱${order.total_price.toFixed(2)}</td>
            <td>${order.user_email}</td>
            <td>${order.feedback ? order.feedback : "Not yet set"}</td>
        `;
        tableBody.appendChild(row);
        
        // Create card view for small screens
        const card = document.createElement("div");
        card.classList.add("order-card");
        card.innerHTML = `
            <h2 class="text-center mt-3 mb-3"> <strong>${order.id}</strong></h2>
            <p><strong>Date:</strong> ${order.created_at.toLocaleDateString()}</p>
            <p><strong>Items:</strong> ${items}</p>
            <p><strong>Total Price:</strong> ₱${order.total_price.toFixed(2)}</p>
            <p><strong>User Email:</strong> ${order.user_email}</p>
            <p><strong>Feedback</strong> ${order.feedback}</p>
        `;
        salesContainer.appendChild(card);

        totalSales += order.total_price;
    });

    document.getElementById("total-sales").textContent = `₱${totalSales.toFixed(2)}`;
}

[yearSelector, monthSelector, daySelector].forEach(selector => {
    selector.addEventListener("change", updateDisplay);
});

document.addEventListener("DOMContentLoaded", fetchOrders);
