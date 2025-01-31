import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
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

// Fetch data from Firestore and populate the table

async function fetchData() {
    const tableBody = document.querySelector("#user-table tbody");
  
    try {
      // Reference to the users collection
      const usersCollection = collection(db, "users");

      // Get all documents in the users collection
      const snapshot = await getDocs(usersCollection);

       snapshot.forEach((doc) => {
                const userId = doc.id;
                const data = doc.data();

                console.log(`User ID: ${userId}`);
                console.log(`User data: ${JSON.stringify(data)}`);
          
              // Create a new table row
              const row = document.createElement("tr");
              row.setAttribute("data-id", userId); // Store employee ID in the row

              
              const branchName = data.branchId;
              console.log("USER BRANCH NAME: " + branchName);
              const branchMap = {
                "SmValenzuela": "SM Valenzuela",
                "SmNorthEdsa": "SM North Edsa",
                "OneMallVal": "One Mall Valenzuela"
            };
        
              // Get branch ID from map
              const branch = branchMap[branchName];
              console.log("AFTER MAP: " + branch);
              
              row.innerHTML = `
                
                <td>${data.firstName || "N/A"}</td>
                <td>${data.lastName || "N/A"}</td>
                <td>${data.role || "N/A"}</td>
                <td>${branch || "N/A"}</td>
                <td>${data.email || "N/A"}</td>
                <td>${data.phone || "N/A"}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" id="delete-user"><i class="fa-solid fa-trash"></i></button>
                </td>
              `;
              tableBody.appendChild(row);

                            // Now add event listener to the delete button
              document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                  console.log("HI CONSOLE");
                  deleteUser(e.target);  // Pass the button as the argument
                  
                });
              });

              const name = data.lastName && data.firstName ? `${data.lastName} ${data.firstName}` : data.firstName || data.lastName || "N/A";

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
                    <div class="details-card" data-id="${userId}" data-branch-id="${branchName}">
                        <div class="initials" style="background-color: ${randomColor};">${initials}</div>
                        <p><strong>First Name:</strong> ${data.firstName}</p>
                        <p><strong>Last Name:</strong> ${data.lastName}</p>
                        <p><strong>Contact:</strong> ${data.phone}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <div class="actions">
                            <button class="action-btn edit" onclick="editUser(this)"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" id="delete-user"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
                
                const detailsSection = document.getElementById("userDetails-section"); // Add this ID to your parent container for details
                detailsSection.appendChild(detailsContainer);

  
          });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Get references to the buttons
    const saveButton = document.getElementById('save-user');

    // Add event listeners
    saveButton.addEventListener('click', addUser);
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

    

    async function addUser() {
        // Get form values
        const lastName = document.getElementById("lastName").value.trim();
        const firstName = document.getElementById("firstName").value.trim();
        const role = document.getElementById('role-dropdown').value.trim();
        const branchName = document.getElementById('user-branch').value.trim();
        const contact = document.getElementById("phone").value.trim();
        const email = document.getElementById("emailAd").value.trim();

            /*
            if (!validateContactNumber(contactNumber)) {
                alert("Please enter a valid contact!");
                return;
            }
        

            if (!validateEmail(email)) {
                alert("Please enter a valid email address!");
                return;
            }*/

            // Map branch names to Firestore branch IDs
              const branchMap = {
                "SM Valenzuela": "SmValenzuela",
                "SM North Edsa": "SmNorthEdsa",
                "One Mall Valenzuela": "OneMallVal"
            };

            // Get branch ID from map
            const branch = branchMap[branchName];
            let newUser; 
            if(role === "Customer") {
              // Create a user object with the collected data
                newUser = {
                  lastName: lastName,
                  firstName: firstName,
                  role: role,
                  phone: contact,
                  email: email,
              };

            } else {
               newUser = {
                branchId: branch,
                role: role,
                email: email,
              };
            }

            try {
                // Reference to the users collection in Firestore
                const usersCollection = collection(db, "users");
            
                // Add user to Firestore
                const docRef = await addDoc(usersCollection, newUser);
            
                // Log the new user ID
                console.log("User added with ID: ", docRef.id);
            
                // Close the modal after saving
                closeUserModal();

                // Reload the page after adding the user
                 window.location.reload();  // This reloads the page
                        
              } catch (error) {
                console.error("Error adding user: ", error);
                alert("Error adding user. Please try again.");
              }
    }

    /* EDIT USERS */
    document.addEventListener("DOMContentLoaded", () => {
        // Get references to the buttons
        const saveBtn = document.getElementById('save-userEdit');
    
        // Add event listeners
        saveBtn.addEventListener('click', updateUser);
    });
    

    async function updateUser() {
        const userId = document.getElementById("edit-doc-id").value;
        alert("UPDATED: " + userId);
    
        const lastName = document.getElementById("edit-lastName").value.trim();
        const firstName = document.getElementById("edit-firstName").value.trim();
        const phone = document.getElementById("edit-phone").value.trim();
        const email = document.getElementById("edit-emailAd").value.trim();
        const role = document.getElementById("edit-role-dropdown").value.trim();
        const branch = document.getElementById("edit-user-branch").value.trim();
        alert(branch);

        const branchMap = {
          "SM Valenzuela": "SmValenzuela",
          "SM North Edsa": "SmNorthEdsa",
          "One Mall Valenzuela": "OneMallVal"
      };
  
      // Get branch ID from map
        const branchId = branchMap[branch];



        let updatedData; 
            if(role === "Customer") {
              updatedData = {
                lastName,
                firstName,
                phone,
                email,
            };

            } else {

              alert("FOR OTHERS");

              updatedData = {
                branchId,
                role,
                email,
            };
            
            }


        try {
            const userRef = doc(db, "users", userId);

            await updateDoc(userRef, updatedData);

            console.log("User updated successfully!");
            alert("User updated successfully!");
            
            // Close modal after save
            closeEditModal();
            
            // Refresh the data or reload page
            location.reload();
          } catch (error) {
            console.error("Error updating employee:", error);
          }
    }


    /* DELETE USER */
    async function deleteUser(button) {
      alert("DELETE USER");
          console.log("delete");
      
          let userId, row, detailsCard, detailsContainer;
      
          // Check if the button is inside a table row or details card
          row = button.closest("tr");
          detailsCard = button.closest(".details-card");
      
          if (row) {
              // If deleting from the table
              userId = row.getAttribute("data-id");
          } else if (detailsCard) {
              // If deleting from the details card
              userId = detailsCard.getAttribute("data-id");
              detailsContainer = detailsCard.closest(".details"); // Get the parent container
          } else {
              console.error("Could not find the row or details card.");
              return;
          }
      
          console.log("DELETE USER ID: " + userId);
      
          // Confirm before deleting
          const confirmDelete = confirm("Are you sure you want to delete this employee?");
          
          if (confirmDelete) {
              try {
                  // Get reference to the employee document in Firestore
                  const userRef = doc(db, "users", userId);
      
                  // Delete the user document from Firestore
                  await deleteDoc(userRef);
      
                  console.log("User deleted successfully!");
      
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
      
                  alert("User deleted successfully!");
              } catch (error) {
                  console.error("Error deleting user:", error.message);
                  console.error(error.stack);
              }
          } else {
              console.log("User deletion canceled.");
          }
    }




  // Call fetchData when the page loads
  document.addEventListener("DOMContentLoaded", fetchData);