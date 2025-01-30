import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collectionGroup, collection, doc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";


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

// Fetch data from Firestore and populate the table
async function fetchData() {
    const tableBody = document.querySelector("#employee-table tbody");
  
    try {
      // Fetching all documents from all "employees" subcollections using collectionGroup
      // Query for all branches
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
          querySnapshot.forEach((doc) => {
                const branchId = doc.ref.parent.parent.id; // Get the parent branch ID (in 'branches' collection)
                console.log("BRANCH ID:" + branchId);  
                const branchLocation = branchLocations[branchId] || "N/A";
                console.log("BRANCH LOC:" + branchLocation);  
              const data = doc.data();
              console.log(`Employee data: ${JSON.stringify(data)}`);

              const permissionRadio = `
                <label>
                    <input type="radio" name="permission-${doc.id}" value="Allowed" ${data.permission === "Allowed" ? "checked" : ""} disabled> Allowed
                </label>
                <label>
                    <input type="radio" name="permission-${doc.id}" value="Declined" ${data.permission === "Declined" ? "checked" : ""} disabled> Declined
                </label>
                `;
            
              // Create a new table row
              const row = document.createElement("tr");
        
              row.innerHTML = `
                <td>${data.name || "N/A"}</td>
                <td>${branchLocation || "N/A"}</td>
                <td>${permissionRadio || "N/A"}</td>
                <td>${data.position || "N/A"}</td>
                <td>${data.contactNumber || "N/A"}</td>
                <td>${data.email || "N/A"}</td>
                <td>
                    <button class="action-btn edit" onclick="toggleEdit(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
                </td>
              `;
              tableBody.appendChild(row);
          });
      }
      
  
      console.log("All employees loaded successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Get references to the buttons
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');

    // Add event listeners
    saveButton.addEventListener('click', addEmployee);
    cancelButton.addEventListener('click', closeModal);
});

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

  async function addEmployee(event) {

   
    // Get form values
    console.log("ADD EMPLOYEE");
    const name = document.getElementById('name').value.trim();
    const position = document.getElementById('position').value.trim();
    const contactNumber = document.getElementById('contact').value.trim();
    const email = document.getElementById('email').value.trim();
    const branchName = document.getElementById('employee-branch').value.trim();
    
        // Validate inputs
        if (!name || !position || !contactNumber || !email || !branchName) {
            alert("All fields are required!");
            return;
        }

        if (!validateContactNumber(contactNumber)) {
            alert("Please enter a valid contact!");
            return;
        }
    

        if (!validateEmail(email)) {
            alert("Please enter a valid email address!");
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
        email,
        permission: document.querySelector('input[name="permission"]:checked')?.value || "Declined" // Default to "Declined" if not selected
    };

    try {
        // Add employee to the selected branch's 'employees' subcollection
        await addEmployeeToBranch(branchId, employeeData);
        console.log("Employee added successfully!");

        // Append the new row to the table without refreshing
        insertNewEmployeeRow(employeeData, branchId);

        // Close the modal
        closeModal();

        // Clear the form
        document.getElementById("addEmployeeForm").reset();
        
    } catch (error) {
        console.error("Error adding employee:", error);
    }
}

async function addEmployeeToBranch(branchId, employeeData) {
    alert("ADD EMPLOYEE TO BRANCH");
    // Reference to the branch document
    console.log(branchId);
    alert(branchId);
    const branchRef = doc(db, 'branches', branchId);
    alert(branchRef);
    alert(employeeData);

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

    const permissionRadio = `
        <label>
            <input type="radio" name="permission-${employeeData.email}" value="Allowed" ${employeeData.permission === "Allowed" ? "checked" : ""} disabled> Allowed
        </label>
        <label>
            <input type="radio" name="permission-${employeeData.email}" value="Declined" ${employeeData.permission === "Declined" ? "checked" : ""} disabled> Declined
        </label>
    `;

    // Create new row
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${employeeData.name || "N/A"}</td>
        <td>${branchLocation}</td>
        <td>${permissionRadio}</td>
        <td>${employeeData.position || "N/A"}</td>
        <td>${employeeData.contactNumber || "N/A"}</td>
        <td>${employeeData.email || "N/A"}</td>
        <td>
            <button class="action-btn edit" onclick="toggleEdit(this)"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;

    // Append to table
    tableBody.appendChild(row);
}



// Save employee details (placeholder function)
function saveEmployee() {
    // Get input values
    const name = document.getElementById("name").value.trim();
    const branch = document.getElementById("employee-branch").value;
    const position = document.getElementById("position").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const email = document.getElementById("email").value.trim();
    const permission = document.querySelector('input[name="permission"]:checked')?.value;
  
    if (!name || !branch || !position || !contact || !email || !permission) {
      alert("Please fill out all fields.");
      return;
    }
  
 
    
     // Generate initials
     const initials = name
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
     <div class="details-card">
       <div class="initials" style="background-color: ${randomColor};">${initials}</div>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Branch:</strong> ${branch}</p>
       <p><strong>Permission:</strong> ${permission}</p>
       <p><strong>Position:</strong> ${position}</p>
       <p><strong>Contact:</strong> ${contact}</p>
       <p><strong>Email:</strong> ${email}</p>
       <div class="actions">
         <button class="action-btn edit" onclick="toggleEdit(this)"><i class="fas fa-edit"></i></button>
         <button class="action-btn delete" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
       </div>
     </div>
   `;
  
   const detailsSection = document.getElementById("details-section"); // Add this ID to your parent container for details
   detailsSection.appendChild(detailsContainer);
  
   // Close the modal
   closeModal();
  
   // Reset the form
   addEmployeeForm.reset();
  }
  
  
  // Call fetchData when the page loads
  document.addEventListener("DOMContentLoaded", fetchData);