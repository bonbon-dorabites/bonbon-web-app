/*import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";


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
const db = getFirestore(app);

// Get modal 
const employeeModal = document.getElementById("employeeModal");

// Close add employee modal function
function closeEmployeeModal() {
  employeeModal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    // Get references to the buttons
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');

    // Add event listeners
    saveButton.addEventListener('click', addEmployee);
    cancelButton.addEventListener('click', closeEmployeeModal);
});

async function fetchData() {
    const tableBody = document.querySelector("#employee-table tbody");

    try {
        // Fetching all documents from all "employees" subcollections using collectionGroup
        const branchesSnapshot = await getDocs(collection(db, 'branches')); // Fetching from 'branches' collection
        console.log("branches snapshot:", branchesSnapshot);

        // If there are no branches, exit early
        if (branchesSnapshot.empty) {
            console.log("No branches found.");
            return;
        }

        // Create a map of branch ID to location
        const branchLocations = {};
        branchesSnapshot.forEach((branchDoc) => {
            const branchData = branchDoc.data();
            branchLocations[branchDoc.id] = branchData.location; // Store branch ID and location
        });

        const querySnapshot = await getDocs(collectionGroup(db, 'employees'));

        console.log("Fetching all employees...");
        console.log("Query snapshot:", querySnapshot);

        if (querySnapshot.empty) {
            console.log("No employees found.");
        } else {
            // Step 1: Group employees by branch
            const employeesByBranch = {};

            querySnapshot.forEach((doc) => {
                const employeeId = doc.id;
                const branchId = doc.ref.parent.parent.id; // Get the parent branch ID (in 'branches' collection)
                const data = doc.data();

                if (!employeesByBranch[branchId]) {
                    employeesByBranch[branchId] = [];
                }

                // Step 2: Push employee into their respective branch
                employeesByBranch[branchId].push({
                    employeeId,
                    branchId,
                    branchLocation: branchLocations[branchId] || "N/A",
                    data
                });
            });

            // Step 3: Sort employees in each branch by position (role)
            Object.keys(employeesByBranch).forEach(branchId => {
                const employees = employeesByBranch[branchId];
                
                // Sort by position (role)
                employees.sort((a, b) => a.data.position.localeCompare(b.data.position));

                // Append the sorted employees to the table
                employees.forEach(({ employeeId, branchId, branchLocation, data }) => {
                    const row = document.createElement("tr");
                    row.setAttribute("data-id", employeeId); // Store employee ID in the row
                    row.setAttribute("data-branch-id", branchId); // Branch ID

                    row.innerHTML = `
                        <td>${data.name || "N/A"}</td>
                        <td>${branchLocation || "N/A"}</td>
                        <td>${data.position || "N/A"}</td>
                        <td>${data.contactNumber || "N/A"}</td>
                        <td>${data.email || "N/A"}</td>
                        <td>
                            <button class="action-btn edit" onclick="editEmployee(this)"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" id="delete-employee"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    `;
                    tableBody.appendChild(row);

                    // Now add event listener to the delete button
                    document.querySelectorAll('.delete').forEach(button => {
                        button.addEventListener('click', (e) => {
                            e.stopImmediatePropagation();
                            deleteEmployee(e.target);  // Pass the button as the argument
                        });
                    });

                    // Generate initials
                    const initials = data.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase();

                    // Generate a random color for the initials
                    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

                    // Append a new details card
                    const detailsContainer = document.createElement("div");
                    detailsContainer.className = "details";
                    detailsContainer.innerHTML = `
                        <div class="details-card" data-id="${employeeId}" data-branch-id="${branchId}">
                            <div class="initials" style="background-color: ${randomColor};">${initials}</div>
                            <p><strong>Name:</strong> ${data.name}</p>
                            <p><strong>Branch:</strong> ${branchLocation}</p>
                            <p><strong>Position:</strong> ${data.position}</p>
                            <p><strong>Contact:</strong> ${data.contactNumber}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <div class="actions">
                                <button class="action-btn edit" onclick="editEmployee(this)"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" id="delete-employee"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    const detailsSection = document.getElementById("details-section"); // Add this ID to your parent container for details
                    detailsSection.appendChild(detailsContainer);
                });
            });

        }

        console.log("All employees loaded successfully!");
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}



function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(email);
    console.log(`Email validation (${email}):`, isValid);
    return isValid;
}

function validateContactNumber(contactNumber) {
    const contactPattern = /^[0-9]{11}$/; // Adjust length if needed
    const isValid = contactPattern.test(contactNumber);
    console.log(`Contact validation (${contactNumber}):`, isValid);
    return isValid;
}

async function addEmployee() {
    // Get form values
    closeEmployeeModal();
    console.log("ADD EMPLOYEE");
    const name = document.getElementById('name').value.trim();
    const position = document.getElementById('position').value.trim();
    const contactNumber = document.getElementById('contact').value.trim();
    const email = document.getElementById('email').value.trim();
    const branchName = document.getElementById('employee-branch').value.trim();
    
    // Validate inputs
    if (!name || !position || !contactNumber || !email || !branchName) {
        showModal("All fields are required.", false);
        return;
    }

    if (!validateContactNumber(contactNumber)) {
        showModal("Please enter a valid contact number (11 digits).", false);
        return;
    }

    if (!validateEmail(email)) {
        showModal("Please enter a valid email address!", false);
        return;
    }

    // Map branch names to Firestore branch IDs
    const branchMap = {
        "SM Valenzuela": "SmValenzuela",
        "SM North Edsa": "SmNorthEdsa",
        "One Mall Valenzuela": "OneMallVal"
    };

    // Get branch ID from map
    const branchId = branchMap[branchName];
    console.log(branchId);

    // Prepare employee data
    const employeeData = {
        name,
        position,
        contactNumber,
        email // Default to "Declined" if not selected
    };

    try {
        // Add employee to the selected branch's 'employees' subcollection
        await addEmployeeToBranch(branchId, employeeData);
        console.log("Employee added successfully!");
        showModal("Employee added successfully!", true);
        insertNewEmployeeRow(employeeData, branchId);
        startListeningToEmployees(branchId);
        closeEmployeeModal();
        
        // Clear the form
        document.getElementById("addEmployeeForm").reset();
        
    } catch (error) {
        console.error("Error adding employee:", error);
    }
    setTimeout(() => {
        location.reload();
    }, 2000);
}

async function addEmployeeToBranch(branchId, employeeData) {
    // Reference to the branch document
    console.log(branchId);

    const branchRef = doc(db, 'branches', branchId);

    // Reference to the 'employees' subcollection under the branch
    const employeesRef = collection(branchRef, 'employees');

    // Add employee data to the 'employees' subcollection
    await addDoc(employeesRef, employeeData);
}

function insertNewEmployeeRow(employeeData, branchId) {
    const tableBody = document.querySelector("#employee-table tbody");

    // Convert branch ID back to location name
    const branchMapReverse = {
        "SmValenzuela": "SM Valenzuela",
        "SmNorthEdsa": "SM North Edsa",
        "OneMallVal": "One Mall Valenzuela"
    };
    
    const branchLocation = branchMapReverse[branchId] || "N/A";

    // Create new row
    const row = document.createElement("tr");
    row.setAttribute("data-id", employeeData.id);  // Add employee ID to the row for identification
    row.setAttribute("data-branch-id", branchId);  // Add branch ID to the row for reference
    
    row.innerHTML = `
        <td>${employeeData.name || "N/A"}</td>
        <td>${branchLocation}</td>
        <td>${employeeData.position || "N/A"}</td>
        <td>${employeeData.contactNumber || "N/A"}</td>
        <td>${employeeData.email || "N/A"}</td>
        <td>
            <button class="action-btn edit" onclick="editEmployee(this)"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" id="delete-employee"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;

    // Add event listener for the delete button inside the new row
    row.querySelector("#delete-employee").addEventListener("click", function () {
        deleteEmployee(this);  // Call the deleteEmployee function when the button is clicked
    });

    // Append to table
    tableBody.appendChild(row);
}


// Real-time listener to fetch employee data
function listenForEmployeeUpdates(branchId) {
    const branchRef = doc(db, 'branches', branchId);
    const employeesRef = collection(branchRef, 'employees');

    onSnapshot(employeesRef, (snapshot) => {
        const tableBody = document.querySelector("#employee-table tbody");

        // Clear the table before populating it with updated data
        tableBody.innerHTML = "";

        snapshot.forEach((doc) => {
            const employeeData = doc.data();
            const employeeId = doc.id;

            console.log(`Employee ID: ${employeeId}`);
            console.log(`Employee Data: ${JSON.stringify(employeeData)}`);

            // Convert branch ID back to location name
            const branchMapReverse = {
                "SmValenzuela": "SM Valenzuela",
                "SmNorthEdsa": "SM North Edsa",
                "OneMallVal": "One Mall Valenzuela"
            };
            
            const branchLocation = branchMapReverse[branchId] || "N/A";

            // Create new row
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${employeeData.name || "N/A"}</td>
                <td>${branchLocation}</td>
                <td>${employeeData.position || "N/A"}</td>
                <td>${employeeData.contactNumber || "N/A"}</td>
                <td>${employeeData.email || "N/A"}</td>
                <td>
                    <button class="action-btn edit" onclick="editEmployee(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" id="delete-employee"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;

            // Append to table
            tableBody.appendChild(row);
        });
    });
}

// Initialize real-time listener for employees in a specific branch
function startListeningToEmployees(branchId) {
    listenForEmployeeUpdates(branchId);
}


// EDITING EMPLOYEES
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
  
document.addEventListener("DOMContentLoaded", () => {
    // Get references to the buttons
    const saveBtn = document.getElementById('save-edit');

    // Add event listeners
    saveBtn.addEventListener('click', updateEmployee);
});

async function updateEmployee() {
    closeEmployeeModal();
    const employeeId = document.getElementById("edit-doc-id").value;
    const branchId = document.getElementById("edit-branch-id").value;
    
    const name = document.getElementById("edit-name").value;
    const position = document.getElementById("edit-position").value;
    const contactNumber = document.getElementById("edit-contact").value;
    const email = document.getElementById("edit-email").value;
    
    const updatedData = {
        name,
        position,
        contactNumber,
        email
    };

    try {
        const employeeRef = doc(db, "branches", branchId, "employees", employeeId);
        await updateDoc(employeeRef, updatedData);
        console.log("Employee updated successfully!");
        showModal("Employee updated successfully!", true);
        closeEditModal();
        
        setTimeout(() => {
            location.reload();
        }, 2000);
        
        // Refresh the data or reload page
      } catch (error) {
        showModal("Failed to updated employee.", false);
        console.error("Error updating employee:", error);
      }
}

// DELETING EMPLOYEES
// Function to delete an employee

async function deleteEmployee(button) {
    let employeeId, branchId, row, detailsCard, detailsContainer;

    // Check if the button is inside a table row or details card
    row = button.closest("tr");
    detailsCard = button.closest(".details-card");

    if (row) {
        // If deleting from the table
        employeeId = row.getAttribute("data-id");
        branchId = row.getAttribute("data-branch-id");
    } else if (detailsCard) {
        // If deleting from the details card
        employeeId = detailsCard.getAttribute("data-id");
        branchId = detailsCard.getAttribute("data-branch-id");
        detailsContainer = detailsCard.closest(".details"); // Get the parent container
    } else {
        console.error("Could not find the row or details card.");
        return;
    }

    console.log("Employee to delete:", employeeId, "Branch ID:", branchId);

    // Show confirmation modal
    showConfirmation("Are you sure you want to delete this employee?", async function () {
        try {
            // Get reference to the employee document in Firestore
            const employeeRef = doc(db, "branches", branchId, "employees", employeeId);

            // Delete the employee document from Firestore
            await deleteDoc(employeeRef);
            console.log(`Employee with ID ${employeeId} deleted from Firestore`);

            // Remove the row or details card from the UI
            if (row) {
                row.remove();
            }
            if (detailsCard) {
                detailsCard.remove();
                // If the details container is now empty, remove it too
                if (detailsContainer && detailsContainer.childElementCount === 0) {
                    detailsContainer.remove();
                }
            }

            showModal("Row deleted successfully!", true);
        } catch (error) {
            showModal("Failed to delete row.", false);
            console.error("Error deleting employee from Firestore:", error.message);
            console.error(error.stack);
        }
    });
}


// Call fetchData when the page loads
document.addEventListener("DOMContentLoaded", fetchData);*/