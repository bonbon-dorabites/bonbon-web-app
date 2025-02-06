import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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



// Function to display employees in the table
function displayEmployees() {
    console.log("Display Employees function called");

    const user = auth.currentUser;
    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    const managerEmail = user.email; // Get logged-in user's email
    const branchesRef = collection(db, "branches");

    // Real-time listener for the branches collection
    onSnapshot(branchesRef, async (branchSnapshot) => {
        console.log(`Found ${branchSnapshot.size} branches.`); // Log number of branches

        const tableBody = document.getElementById("staff-table-body");
        tableBody.innerHTML = ''; // Clear the table before adding new rows
        const empContainer = document.getElementById("staff-container");
        empContainer.innerHTML = ''; // Clear previous cards

        branchSnapshot.forEach(async (branchDoc) => {
            console.log(`Checking branch: ${branchDoc.id}, Manager Email: ${branchDoc.data().manager_email}`);
                
            // Check if the manager_email field matches the logged-in user's email
            if (branchDoc.data().manager_email === managerEmail) {
                console.log(`Manager found for branch: ${branchDoc.id}`);
                
                const employeesRef = collection(branchDoc.ref, "employees");

                // Real-time listener for the employees subcollection
                onSnapshot(employeesRef, (employeeSnapshot) => {
                    console.log(`Found ${employeeSnapshot.size} employees in branch ${branchDoc.id}.`); // Log number of employees

                    if (employeeSnapshot.empty) {
                        console.log("No employees found in this branch.");
                    }
                    
                
                
                    employeeSnapshot.forEach((employeeDoc) => {
                        const employeeData = employeeDoc.data();
                        const position = employeeData.position;
                        const name = employeeData.name;
                        const contactNumber = employeeData.contactNumber;
                        const email = employeeData.email;

                        console.log(`Checking employee: ${name}, Position: ${position}`);

                        // If the position is not "Manager", display the employee in the table
                        if (position !== "Manager") {
                            console.log(`Displaying employee: ${name} with position: ${position}`);
                            
                            const row = document.createElement("tr");

                            row.innerHTML = `
                                <td>${name}</td>
                                <td>${position}</td>
                                <td>${contactNumber}</td>
                                <td>${email}</td>
                            `;
                            tableBody.appendChild(row);

                            // Create card view for small screens
                            const card = document.createElement("div");
                            card.classList.add("order-card");
                            card.innerHTML = `
                                <h2 class="text-center mt-3 mb-3"> <strong>${name}</strong></h2>
                                <p><strong>Position:</strong> ${position}</p>
                                <p><strong>Contact Number:</strong> ${contactNumber}</p>
                                <p><strong>Email:</strong> ${email}</p>
                            `;
                            empContainer.appendChild(card);
                        }
                    });
                });
            }
        });
    });
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.email);
        displayEmployees(); // Call the function to display employees once the user is logged in
    } else {
        console.log("No user is logged in.");
    }
});
