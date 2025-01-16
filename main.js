// Accordion Browse

const accordion = document.getElementsByClassName('sizes');

for(i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener('click', function() {
        this.classList.toggle('active');
    })
}

// Checkout
document.getElementById("checkoutBtn").addEventListener("click", function() {
    const orderSection = document.getElementById("order");
    const checkoutSect = document.getElementById("checkout-form");
    if (orderSection) {
        orderSection.style.display = "none";
        checkoutSect.style.display = "block";
    }
});
