// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, where, getDocs, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

const branchSelector = document.getElementById("branch-selector");

const branchMap = {
    "oneMallVal": "OneMallVal",
    "smNorth": "SmNorthEdsa",
    "smVal": "SmValenzuela"
};

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

// Fetch the items with the price field and then process them
async function fetchItemsAndUpdate() {
    const itemsCollection = collection(db, "items");
    
    // Create a query to fetch only items with a price field
    const itemsQuery = query(itemsCollection, where("item_price", ">", 0));  // Price field should be greater than 0

    const itemsSnapshot = await getDocs(itemsQuery);

    // Fetch the data and map it into an array of items
    const items = itemsSnapshot.docs.map(doc => doc.data());

    // Log the items to the console to inspect the data
    console.log("Fetched Items with Price:", items);

    const updatedItems = await updateItemsWithIds(items);

    // Log the updated items (no Firebase update)
    console.log("Updated Items with IDs:", updatedItems);

    // Check if items match category "Dorayaki bites" and size "Oishi" and display them
    updatedItems.forEach(item => {
        console.log("INSIDE UPDATED ITEM");
        let targetDiv = null;
        if (item.category === "Dorayaki Bites") {
            

            // Determine where to append the item based on size
            if (item.size === "OISHI (8pcs)") {
                targetDiv = document.getElementById('oishi-flavors-show');
            } else if (item.size === "SUGOI (12pcs)") {
                targetDiv = document.getElementById('sugoi-flavors-show');
            } else if (item.size === "BONBON Box (16pcs)") {
                targetDiv = document.getElementById('box-flavors-show');
            }

            if (targetDiv) {
                // Create the div to display the item
                const flavorDiv = document.createElement('div');
                flavorDiv.classList.add('dorayaki', 'flavor');

                // Set the inner HTML of the created div with the item details
                flavorDiv.innerHTML = `
                <p class="flavor-name">${item.item_name}</p>
                <div id="${item.instockId}" class="right-side">
                    <span id="${item.priceId}" class="price">₱${item.item_price}</span>
                    <button data-item-name="${item.name_to_show}" id="${item.formattedId}" class="cart-btn add-to-cart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7e492e" class="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0"/>
                        </svg>
                    </button>
                </div>
                <div id="${item.soldId}" class="right-side">
                    <button class="cart-btn">
                        <img src="/img/out-of-stock.png" height="30" width="80" alt="">
                    </button>
                </div>
            `;

                // Append the flavor div to the corresponding section
                targetDiv.appendChild(flavorDiv);
            }
        } else if (item.category === "Boncoin") {
            targetDiv = document.getElementById('boncoin-container');

            if (targetDiv) {
                const boncoinDiv = document.createElement('div');
                boncoinDiv.classList.add('boncoin', 'flavor', 'item');
                boncoinDiv.innerHTML = `
                    <p id="boncoin-title">${item.item_name}</p>
                    <div id="${item.instockId}" class="right-side">
                        <span id="${item.priceId}" class="price">₱${item.item_price}</span>
                        <button data-item-name="${item.name_to_show}" id="${item.formattedId}" class="cart-btn add-to-cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" class="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0"/>
                            </svg>
                        </button>
                    </div>
                    <div id="${item.soldId}" class="right-side">
                        <div class="d-flex justify-content-center align-items-center">
                            <button class="cart-btn">
                                <img src="/img/out-of-stock.png" height="30" width="80" alt="">
                            </button>
                        </div>
                    </div>
                `;
                targetDiv.appendChild(boncoinDiv);
            }
        } else if (item.category === "Drinks") {
            targetDiv = document.getElementById('drinks-container');

            if (targetDiv) {
                const drinksDiv = document.createElement('div');
                drinksDiv.classList.add('drink', 'flavor', 'item');
                drinksDiv.innerHTML = `
                    <p id="drink-title">${item.item_name}</p>
                    <div id="${item.instockId}" class="right-side">
                        <span id="${item.priceId}" class="price">₱${item.item_price}</span>
                        <button data-item-name="${item.name_to_show}" id="${item.formattedId}" class="cart-btn add-to-cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" class="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0"/>
                            </svg>
                        </button>
                    </div>
                    <div id="${item.soldId}" class="right-side">
                        <div class="d-flex justify-content-center align-items-center">
                            <button class="cart-btn">
                            <img src="/img/out-of-stock.png" height="30" width="80" alt="">
                            </button>
                        </div>
                    </div>
  
                `;
                targetDiv.appendChild(drinksDiv);
            }
        }


    });

}


async function updateItemsWithIds(items) {
    // Create an updatedItems array without Firestore storage
    const updatedItems = await Promise.all(items.map(async (item) => {
        // Log the item properties for inspection
        console.log('Item Category:', item.category);
        console.log('Item Name:', item.item_name);
        console.log('Item Size:', item.size);

        // Conditionally generate IDs based on whether size exists
        let formattedId, priceId, instockId, soldId;
        
        if (item.size) {
            console.log("WITH SIZE");
            formattedId = getFormattedId(item.category, item.item_name, item.size);
            priceId = generatePriceId(item.category, item.item_name, item.size);
            instockId = generateInstockId(item.category, item.item_name, item.size);
            soldId = generateSoldId(item.category, item.item_name, item.size);
        } else {
            console.log("WITHOUT SIZE");
            formattedId = getFormattedId(item.category, item.item_name);
            priceId = generatePriceId(item.category, item.item_name);
            instockId = generateInstockId(item.category, item.item_name);
            soldId = generateSoldId(item.category, item.item_name);
        }

        // Dynamically update itemMap
        itemMap[formattedId] = [instockId, soldId];
        console.log(`Updated itemMap: ${formattedId} => [${instockId}, ${soldId}]`);

        // Log each generated ID for inspection
        console.log('Formatted ID:', formattedId);
        console.log('Price ID:', priceId);
        console.log('Instock ID:', instockId);
        console.log('Sold ID:', soldId);

        // Return the updated item object with generated IDs (no Firestore update)
        return {
            ...item,
            formattedId,
            priceId,
            instockId,
            soldId
        };
    }));

    return updatedItems;
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


function generatePriceId(category, name, size) {
    const formattedName = nameMapping[capitalizeFirstLetter(name.trim())] || name.trim().toLowerCase().replace(/\s+/g, '');
    const formattedCategory = categoryMapping[category.trim()] || category.trim().toLowerCase();
    const formattedSize = size ? (sizeMapping[size.trim()] || size.trim().replace(/\s+/g, '').toLowerCase()) : '';

    if (category === "Boncoin") {
        return `bc-${formattedName}-price`;
    }

    if (category === "drinks") {
        return `${formattedName}-price`;
    }

    // If size is provided, include it in the ID, otherwise omit it
    return size ? `${formattedName}-${formattedSize}-price` : `${formattedName}-price`;
}


function generateInstockId(category, name, size) {
    const formattedName = nameMapping[capitalizeFirstLetter(name.trim())] || name.trim().toLowerCase().replace(/\s+/g, '');
    const formattedCategory = categoryMapping[category.trim()] || category.trim().toLowerCase();
    const formattedSize = size ? (sizeMapping[size.trim()] || size.trim().replace(/\s+/g, '').toLowerCase()) : '';

    if (category === "Boncoin") {
        return `bc-${formattedName}-instock`;
    }

    if (category === "drinks") {
        return `${formattedName}-instock`;
    }

    // If size is provided, include it in the ID, otherwise omit it
    return size ? `${formattedName}-${formattedSize}-instock` : `${formattedName}-instock`;
}

function generateSoldId(category, name, size) {
    const formattedName = nameMapping[capitalizeFirstLetter(name.trim())] || name.trim().toLowerCase().replace(/\s+/g, '');
    const formattedCategory = categoryMapping[category.trim()] || category.trim().toLowerCase();
    const formattedSize = size ? (sizeMapping[size.trim()] || size.trim().replace(/\s+/g, '').toLowerCase()) : '';

    if (category === "Boncoin") {
        return `bc-${formattedName}-sold`;
    }

    if (category === "drinks") {
        return `${formattedName}-sold`;
    }

    // If size is provided, include it in the ID, otherwise omit it
    return size ? `${formattedName}-${formattedSize}-sold` : `${formattedName}-sold`;
}


const itemMap = {
    "dorabite_oishi": ["#oishi-flavors-show", "#oishi-flavors-none"],
    "dorabite_sugoi": ["#sugoi-flavors-show", "#sugoi-flavors-none"],
    "dorabite_bonbon": ["#box-flavors-show", "#box-flavors-none"],

};

function updateItemDisplay(branch) {
    if (!branch) {
        console.log("No branch selected. Exiting function.");
        return;
    }

    const branchDoc = branchMap[branch];
    console.log(`Branch selected: ${branch}, Branch document ID: ${branchDoc}`);

    const itemsRef = collection(db, `branches/${branchDoc}/items`);
    console.log(`Listening for real-time updates at path: branches/${branchDoc}/items`);

    // Listen for real-time updates
    onSnapshot(itemsRef, (snapshot) => {
        console.log("Snapshot received:", snapshot);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const itemName = doc.id;

            console.log(`Document ID: ${itemName}, Data:`, data);

            if (itemMap[itemName]) {
                const [instockSelector, soldSelector] = itemMap[itemName];
                console.log(`Matched itemMap entry for '${itemName}':`, {
                    instockSelector,
                    soldSelector
                });

                const instockElement = document.getElementById(instockSelector);
                const soldElement = document.getElementById(soldSelector);

                if (instockElement && soldElement) {
                    console.log(`Instock element found: ${instockSelector}`);
                    console.log(`Sold element found: ${soldSelector}`);

                    if (data.isSoldOut) {
                        console.log(`Item '${itemName}' is sold out. Updating display.`);
                        instockElement.style.display = "none";
                        soldElement.style.display = "block";
                    } else {
                        console.log(`Item '${itemName}' is in stock. Updating display.`);
                        instockElement.style.display = "block";
                        soldElement.style.display = "none";
                    }
                } else {
                    console.warn(`Elements not found for '${itemName}':`, {
                        instockSelector,
                        soldSelector
                    });
                }
            } else {
                console.warn(`No entry found in itemMap for '${itemName}'. Skipping.`);
            }
        });
    });
}

// Event listener for branch selection
branchSelector.addEventListener("change", (event) => {
    updateItemDisplay(event.target.value);
});

  // Fetch items on page load
  window.onload = fetchItemsAndUpdate;



