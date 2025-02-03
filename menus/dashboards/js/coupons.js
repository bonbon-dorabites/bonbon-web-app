import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collectionGroup, collection, updateDoc, deleteDoc, doc, addDoc, getDocs, getDoc, Timestamp, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

async function fetchData() {
    const tableBody = document.querySelector("#coupons-table tbody");
    const detailsSection = document.getElementById("userDetails-section"); // Ensure this exists in your HTML
    const allRows = [];

    try {
        const couponsCollection = collection(db, "coupons");
        const snapshot = await getDocs(couponsCollection);

        snapshot.forEach((doc) => {
            const couponId = doc.id;
            const data = doc.data();

            const startDate = data.coup_start ? data.coup_start.toDate().toLocaleDateString() : "N/A";
            const endDate = data.coup_end ? data.coup_end.toDate().toLocaleDateString() : "N/A";
            const status = data.coup_isActive ? "Active" : "Expired";

            const applicableBranches = data.applicable_branches?.join(", ") || "N/A";
            const firstTimeUsersOnly = data.first_time_users_only ? "Yes" : "No";
            const minOrder = data.min_order || "N/A";

            const row = document.createElement("tr");
            row.setAttribute("edit-doc-old-id", couponId); // Store coupon ID in the row

            row.innerHTML = `
                <td>${couponId || "N/A"}</td>
                <td>Php${data.coup_amount || "N/A"}.00</td>
                <td>${data.coup_desc || "N/A"}</td>
                <td>${status}</td>
                <td>
                    <div style="display: flex !important;">
                        <button class="action-btn detail"><i class="bi bi-file-earmark-richtext-fill"></i></button>
                        <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);

            // Fix the edit button event listener
            document.querySelectorAll('.edit').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();

                    // Ensure we get the correct row
                    const row = e.currentTarget.closest("tr");
                    if (!row) return;

                    // Extract coupon ID
                    const couponId = row.getAttribute("edit-doc-old-id");

                    // Show modal
                    const showEditModal = document.getElementById("edit-couponsModal");
                    showEditModal.style.display = 'block';

                    // Call editCoupon with the coupon ID
                    editCoupon(couponId);
                });
            });

            // Add delete event listener
            document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    deleteCoupon(e.target);  
                });
            });


            // Add details card (optional, based on your use case)
            const detailsContainer = document.createElement("div");
            detailsContainer.className = "details";
            detailsContainer.innerHTML = `
                <div class="details-card">
                    <div class="initials" style="background-color: var(--brown);">${couponId}</div>
                    <p><strong>Amount:</strong> ${data.coup_amount}</p>
                    <p><strong>Coupon Description:</strong> ${data.coup_desc}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <div class="actions">
                        <button class="action-btn detail"><i class="bi bi-file-earmark-richtext-fill"></i></button>
                        <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;

            // Show details
            document.querySelectorAll('.detail').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();

                    // Ensure we get the correct row
                    const row = e.currentTarget.closest("tr");
                    if (!row) return;

                    // Extract coupon ID
                    const couponId = row.getAttribute("edit-doc-old-id");

                    // Show modal
                    const showCouponModal = document.getElementById("details-couponsModal");
                    showCouponModal.style.display = 'block';

                    // Call editCoupon with the coupon ID
                    showCoupon(couponId);
                });
            });

            const detailsSection = document.getElementById("couponDetails-section");
            detailsSection.appendChild(detailsContainer);
        });
        // Store rows globally for search functionality
        window.allRows = allRows;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


async function addCoupon() {
    const couponId = document.getElementById("couponId").value.trim();
    const amountCoupon = document.getElementById("amountCoupon").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value === "Active"; // Convert to boolean

    // Get the applicable branches (checkboxes)
    const applicableBranches = [];
    if (document.getElementById("SmValenzuela").checked) applicableBranches.push("SmValenzuela");
    if (document.getElementById("SmNorthEdsa").checked) applicableBranches.push("SmNorthEdsa");
    if (document.getElementById("OneMallVal").checked) applicableBranches.push("OneMallVal");

    // Get the first-time users radio button value
    const firstTimeUsersOnly = document.querySelector('input[name="firstTime"]:checked')?.value === "Yes";

    // Get the minimum order value
    const minOrder = parseFloat(document.getElementById("minOrder").value.trim());

    // Validate required fields
    if (!couponId || !amountCoupon || !startDate || !endDate || !description || applicableBranches.length === 0 || isNaN(minOrder)) {
        showModal("Please fill in all required fields!", false);
        return;
    }

    showConfirmation("Are you sure you want to add this coupon?", async function () {
        try {
            // Convert date input to Firestore Timestamp
            const startTimestamp = Timestamp.fromDate(new Date(startDate));
            const endTimestamp = Timestamp.fromDate(new Date(endDate));

            // Firestore reference to "coupons" collection
            const couponRef = doc(db, "coupons", couponId);

            // Add data to Firestore
            await setDoc(couponRef, {
                coup_amount: parseFloat(amountCoupon),
                coup_start: startTimestamp,
                coup_end: endTimestamp,
                coup_desc: description,
                coup_isActive: status,
                applicable_branches: applicableBranches,  // Store applicable branches
                first_time_users_only: firstTimeUsersOnly, // Store first-time user status
                min_order: minOrder // Store minimum order
            });

            showModal("Coupon added successfully!", true);
            closeCouponModal(); // Close modal after successful save
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } catch (error) {
            showModal("Failed to add coupon.", false);
            console.error("Error adding coupon:", error);
        }
    });
}

// Event listener for the save button
document.getElementById("save-coupon").addEventListener("click", addCoupon);


document.addEventListener("DOMContentLoaded", () => {
    // Get references to the buttons
    const saveBtn = document.getElementById('save-editCoupon');

    // Add event listeners
    saveBtn.addEventListener('click', updateCoupon);
});

// Update Coupon

document.getElementById("save-editCoupon").addEventListener("click", updateCoupon);

async function updateCoupon() {
    const couponId = document.getElementById("edit-couponId").value.trim();
    const amount = parseFloat(document.getElementById("edit-amountCoupon").value.trim()) || 0;
    const startDate = document.getElementById("edit-startDate").value.trim();
    const endDate = document.getElementById("edit-endDate").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const status = document.getElementById("edit-status").value.trim() === "Active"; // Convert to boolean
    const applicableBranches = [
        document.getElementById("SmValenzuelaa").checked ? "SmValenzuela" : null,
        document.getElementById("SmNorthEdsaa").checked ? "SmNorthEdsa" : null,
        document.getElementById("OneMallVall").checked ? "OneMallVal" : null
    ].filter(branch => branch !== null);
    const firstTimeUsersOnly = document.querySelector('input[name="firstTime"]:checked').value === "Yes";
    const minOrder = parseFloat(document.getElementById("minOrderr").value.trim()) || 0;

    if (!couponId) {
        showModal("Coupon ID is missing. Operation failed.", false);
        return;
    }

    try {
        console.log("Fetching coupon data for ID:", couponId);

        // Fetch the coupon based on the provided couponId
        const couponRef = doc(db, "coupons", couponId);
        const couponSnap = await getDoc(couponRef);

        // Check if the coupon exists
        if (!couponSnap.exists()) {
            showModal("Coupon not found.", false);
            return;
        }

        console.log("Coupon found:", couponId);

        // Retrieve existing coupon data
        const existingCouponData = couponSnap.data();
        
        // Normalize existing Firestore data
        const formattedExistingCouponData = {
            coup_amount: parseFloat(existingCouponData.coup_amount) || 0,
            coup_start: existingCouponData.coup_start ? existingCouponData.coup_start.toDate().toISOString().split('T')[0] : null,
            coup_end: existingCouponData.coup_end ? existingCouponData.coup_end.toDate().toISOString().split('T')[0] : null,
            coup_desc: (existingCouponData.coup_desc || "").trim(),
            coup_isActive: Boolean(existingCouponData.coup_isActive),
            applicable_branches: existingCouponData.applicable_branches || [],
            first_time_users_only: existingCouponData.first_time_users_only || false,
            min_order: parseFloat(existingCouponData.min_order) || 0
        };

        console.log("Existing Coupon Data:", formattedExistingCouponData);

        // Normalize input data
        const newCouponData = {
            coup_amount: amount,
            coup_start: startDate || null,
            coup_end: endDate || null,
            coup_desc: description,
            coup_isActive: status,
            applicable_branches: applicableBranches,
            first_time_users_only: firstTimeUsersOnly,
            min_order: minOrder
        };

        console.log("New Coupon Data:", newCouponData);

        // Compare the fields for changes
        const isChanged = Object.keys(newCouponData).some(key => {
            if (key === "applicable_branches") {
                return !arraysEqual(newCouponData[key], formattedExistingCouponData[key]);
            }
            return newCouponData[key] !== formattedExistingCouponData[key];
        });

        console.log("Changes Detected:", isChanged);

        if (!isChanged) {
            showModal("No edits were made.", false);
            return;
        } else {
            // If changes were detected, proceed to update the coupon in Firestore
        showConfirmation("Are you sure you want to save your edits to this coupon?", async function () {
            try {
                const couponDataToUpdate = {
                    coup_amount: amount,
                    coup_start: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
                    coup_end: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
                    coup_desc: description,
                    coup_isActive: status,
                    applicable_branches: applicableBranches,
                    first_time_users_only: firstTimeUsersOnly,
                    min_order: minOrder
                };

                // Update the existing coupon document with the new data
                await updateDoc(couponRef, couponDataToUpdate);

                console.log("Coupon updated successfully!");
                showModal("Coupon updated successfully!", true);
                closeEditCouponModal();
                setTimeout(() => {
                    location.reload();
                }, 1500);

            } catch (error) {
                console.error("Error updating coupon:", error);
                showModal("Failed to update coupon.", false);
            }
        });
        }
    } catch (error) {
        console.error("Error checking coupon changes:", error);
        showModal("An error occurred while checking changes.", false);
    }
}

// Helper function to compare arrays
function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}


async function deleteCoupon(button) {
    console.log("delete");

    let couponId, row, detailsCard, detailsContainer;

    // Check if the button is inside a table row or details card
    row = button.closest("tr");
    detailsCard = button.closest(".details-card");

    if (row) {
        // If deleting from the table
        couponId = row.cells[0].textContent;
    } else if (detailsCard) {
        // If deleting from the details card
        const initialsDiv = detailsCard.querySelector(".initials");
        couponId = initialsDiv ? initialsDiv.textContent.trim() : "";

        detailsContainer = detailsCard.closest(".details"); // Get the parent container
    } else {
        console.error("Could not find the row or details card.");
        return;
    }


    // Confirm before deleting
    showConfirmation("Are you sure you want to delete this coupon?", async function () {
    try {
        // Get reference to the employee document in Firestore
        const couponRef = doc(db, "coupons", couponId);

        // Delete the employee document from Firestore
        await deleteDoc(couponRef);

        console.log("Coupon deleted successfully!");

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

        showModal("Coupon deleted successfully!", true);
        setTimeout(() => {
            location.reload();
        }, 1500);
    } catch (error) {
        console.error("Error deleting coupon:", error.message);
        showModal("Failed to delete coupon.", false );
        console.error(error.stack);
    }
    });
}

function editCoupon(couponId) {
    try {
        console.log("Editing coupon with ID:", couponId);

        const couponRef = doc(db, "coupons", couponId);
        
        // Use onSnapshot for real-time updates
        onSnapshot(couponRef, (couponSnap) => {
            if (!couponSnap.exists()) {
                console.error("Coupon not found!");
                return;
            }

            const data = couponSnap.data();
            console.log("Coupon data fetched:", data);

            // Populate input fields
            document.getElementById("edit-couponId").value = couponId;
            document.getElementById("edit-amountCoupon").value = data.coup_amount || "";
            document.getElementById("edit-description").value = data.coup_desc || "";

            // Start and End Date
            document.getElementById("edit-startDate").value = data.coup_start 
                ? data.coup_start.toDate().toISOString().split("T")[0] 
                : "";
            document.getElementById("edit-endDate").value = data.coup_end 
                ? data.coup_end.toDate().toISOString().split("T")[0] 
                : "";
            
            console.log("Start Date:", document.getElementById("edit-startDate").value);
            console.log("End Date:", document.getElementById("edit-endDate").value);

            // Status
            document.getElementById("edit-status").value = data.coup_isActive ? "Active" : "Expired";
            console.log("Status:", document.getElementById("edit-status").value);
            
            // Minimum Order
            const minOrderField = document.getElementById("minOrderr");
            if (minOrderField) {
                minOrderField.value = data.min_order || "";
                console.log("Min Order set to:", minOrderField.value);
            } else {
                console.error("Min Order input field not found!");
            }
            
            // Checkbox for applicable branches
            const branchCheckboxes = {
                "SM VALENZUELA": document.getElementById("SmValenzuelaa"),
                "SM NORTH EDSA": document.getElementById("SmNorthEdsaa"),
                "ONE MALL VALENZUELA": document.getElementById("OneMallVall"),
            };
            
            Object.keys(branchCheckboxes).forEach(branch => {
                if (branchCheckboxes[branch]) {
                    branchCheckboxes[branch].checked = data.applicable_branches?.includes(branch) || false;
                    console.log(`Checkbox ${branch} checked:`, branchCheckboxes[branch].checked);
                } else {
                    console.error(`Checkbox for ${branch} not found!`);
                }
            });
            
            // Radio buttons for first-time users only
            const firstTimeYes = document.getElementById("firstTimeYess");
            const firstTimeNo = document.getElementById("firstTimeNoo");
            
            if (firstTimeYes && firstTimeNo) {
                firstTimeYes.checked = data.first_time_users_only === true;
                firstTimeNo.checked = data.first_time_users_only === false;
            
                console.log("Radio 'Yes' checked:", firstTimeYes.checked);
                console.log("Radio 'No' checked:", firstTimeNo.checked);
            } else {
                console.error("Radio buttons for first-time users not found!");
            }
        });
    } catch (error) {
        console.error("Error fetching coupon details:", error);
    }
}

function showCoupon(couponId) {
    try {
        console.log("Editing coupon with ID:", couponId);

        const couponRef = doc(db, "coupons", couponId);
        
        // Use onSnapshot for real-time updates
        onSnapshot(couponRef, (couponSnap) => {
            if (!couponSnap.exists()) {
                console.error("Coupon not found!");
                return;
            }

            const data = couponSnap.data();
            console.log("Coupon data fetched:", data);

            // Populate input fields
            document.getElementById("edit-couponIddd").value = couponId;
            document.getElementById("edit-amountCouponnn").value = data.coup_amount || "";
            document.getElementById("edit-descriptionnn").value = data.coup_desc || "";

            // Start and End Date
            document.getElementById("edit-startDateee").value = data.coup_start 
                ? data.coup_start.toDate().toISOString().split("T")[0] 
                : "";
            document.getElementById("edit-endDateee").value = data.coup_end 
                ? data.coup_end.toDate().toISOString().split("T")[0] 
                : "";
            
            console.log("Start Date:", document.getElementById("edit-startDateee").value);
            console.log("End Date:", document.getElementById("edit-endDateee").value);

            // Status
            document.getElementById("edit-statusss").value = data.coup_isActive ? "Active" : "Expired";
            console.log("Status:", document.getElementById("edit-status").value);
            
            // Minimum Order
            const minOrderField = document.getElementById("minOrderrr");
            if (minOrderField) {
                minOrderField.value = data.min_order || "";
                console.log("Min Order set to:", minOrderField.value);
            } else {
                console.error("Min Order input field not found!");
            }
            
            // Checkbox for applicable branches
            const branchCheckboxes = {
                "SmValenzuela": document.getElementById("SmValenzuelaaa"),
                "SmNorthEdsa": document.getElementById("SmNorthEdsaaa"),
                "OneMallVal": document.getElementById("OneMallValll"),
            };
            
            Object.keys(branchCheckboxes).forEach(branch => {
                if (branchCheckboxes[branch]) {
                    branchCheckboxes[branch].checked = data.applicable_branches?.includes(branch) || false;
                    console.log(`Checkbox ${branch} checked:`, branchCheckboxes[branch].checked);
                } else {
                    console.error(`Checkbox for ${branch} not found!`);
                }
            });
            
            // Radio buttons for first-time users only
            const firstTimeYes = document.getElementById("firstTimeYesss");
            const firstTimeNo = document.getElementById("firstTimeNooo");
            
            if (firstTimeYes && firstTimeNo) {
                firstTimeYes.checked = data.first_time_users_only === true;
                firstTimeNo.checked = data.first_time_users_only === false;
            
                console.log("Radio 'Yes' checked:", firstTimeYes.checked);
                console.log("Radio 'No' checked:", firstTimeNo.checked);
            } else {
                console.error("Radio buttons for first-time users not found!");
            }
        });
    } catch (error) {
        console.error("Error fetching coupon details:", error);
    }
}
    
// Call fetchData when the page loads
document.addEventListener("DOMContentLoaded", fetchData);

// Function to search users based on the fields (first name, last name, email, phone)
document.getElementById('search').addEventListener('input', searchUsers);
document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);

// Search function to filter table rows based on the input
function searchCoupons() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    // Filter through all rows
    const filteredRows = window.allCouponRows.filter(row => {
        const cells = row.querySelectorAll("td");
        const couponId = cells[0].textContent.toLowerCase();
        const amount = cells[1].textContent.toLowerCase();
        const description = cells[2].textContent.toLowerCase();
        const status = cells[3].textContent.toLowerCase();

        // Check if any field matches the search term
        return couponId.includes(searchTerm) || amount.includes(searchTerm) ||
               description.includes(searchTerm) || status.includes(searchTerm);
    });

    // Hide all rows first
    window.allCouponRows.forEach(row => row.style.display = 'none');

    // Show only filtered rows
    filteredRows.forEach(row => row.style.display = '');

    // Show the "Clear Search" button
    document.getElementById('clearSearchBtn').style.display = 'inline-block';
}

// Function to clear the search and reset table to original state
function clearSearch() {
    document.getElementById('search').value = ''; // Clear search input
    window.allCouponRows.forEach(row => row.style.display = ''); // Show all rows
    document.getElementById('clearSearchBtn').style.display = 'none'; // Hide "Clear Search" button
}
