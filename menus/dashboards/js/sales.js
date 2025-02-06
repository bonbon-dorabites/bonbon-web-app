// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, orderBy, addDoc, doc, updateDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const branchSelector = document.getElementById("branch-selector-sales");
const yearSelector = document.getElementById("year-selector");
const monthSelector = document.getElementById("month-selector");
const daySelector = document.getElementById("day-selector");
const tableBody = document.getElementById("sales-table-body");

const branches = ["OneMallVal", "SmNorthEdsa", "SmValenzuela"];
let orders = [];

function fetchOrders() {
    orders = []; // Reset orders
    const ordersCollection = (branch) => collection(db, "branches", branch, "orders");

    branches.forEach(branch => {
        const q = query(ordersCollection(branch), orderBy("created_at", "asc"));
        onSnapshot(q, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added" || change.type === "modified") {
                    const data = change.doc.data();
                    orders.push({
                        id: change.doc.id,
                        branch,
                        created_at: data.created_at.toDate(),
                        total_price: data.total_price,
                        user_email: data.user_email,
                        items_bought: data.items_bought
                    });
                }
            });
            updateTable();
        });
    });
}

function updateTable() {
    tableBody.innerHTML = "";
    const selectedBranch = branchSelector.value;
    const selectedYear = yearSelector.value;
    const selectedMonth = monthSelector.value;
    const selectedDay = daySelector.value;

    let filteredOrders = orders;

    if (selectedBranch) {
        filteredOrders = filteredOrders.filter(order => order.branch === selectedBranch);
    }
    if (selectedYear) {
        filteredOrders = filteredOrders.filter(order => order.created_at.getFullYear().toString() === selectedYear);
    }
    if (selectedMonth) {
        const monthIndex = new Date(Date.parse(selectedMonth + " 1, 2000")).getMonth();
        filteredOrders = filteredOrders.filter(order => order.created_at.getMonth() === monthIndex);
    }
    if (selectedDay) {
        filteredOrders = filteredOrders.filter(order => order.created_at.getDate().toString() === selectedDay);
    }

    filteredOrders.sort((a, b) => a.created_at - b.created_at);

    let totalSales = 0; // Initialize total sales

    filteredOrders.forEach(order => {
        const row = document.createElement("tr");
        const items = Object.values(order.items_bought).map(item => `${item.name} (x${item.quantity})`).join(", ");

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.created_at.toLocaleDateString()}</td>
            <td>${items}</td>
            <td>₱${order.total_price.toFixed(2)}</td>
            <td>${order.user_email}</td>
        `;
        tableBody.appendChild(row);

        totalSales += order.total_price; // Add order price to total sales
    });

    // Update total sales in the footer
    document.getElementById("total-sales").textContent = `₱${totalSales.toFixed(2)}`;
}


[branchSelector, yearSelector, monthSelector, daySelector].forEach(selector => {
    selector.addEventListener("change", updateTable);
});

function updateDaySelector() {
    console.log("HII PI");

    const selectedYear = parseInt(yearSelector.value, 10);
    const selectedMonth = monthSelector.value;

    if (!selectedMonth) return;

    const monthDays = {
        "January": 31, "February": 28, "March": 31, "April": 30, "May": 31, "June": 30,
        "July": 31, "August": 31, "September": 30, "October": 31, "November": 30, "December": 31
    };

    console.log("GOING HERE");

    // Check for leap year if February is selected
    if (selectedMonth === "February" && selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0)) {
        monthDays["February"] = 29;
    }

    console.log("GOING HERE TOO");

    // Populate the day selector
    for (let day = 1; day <= monthDays[selectedMonth]; day++) {
        console.log(day);
        const option = document.createElement("option");
        option.value = day;
        option.textContent = day;
        daySelector.appendChild(option);
    }
}

// Attach event listeners
yearSelector.addEventListener("change", updateDaySelector);
monthSelector.addEventListener("change", updateDaySelector);


// Call the function to fetch cart items when the page loads or when needed
document.addEventListener("DOMContentLoaded", fetchOrders);





