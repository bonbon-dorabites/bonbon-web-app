// Accordion Browse

const accordion = document.getElementsByClassName('sizes');

for(i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener('click', function() {
        this.classList.toggle('active');
    })
}

document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkout-form");
    const orderSection = document.getElementById("order");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const backBtn = document.getElementById("backBtn");

    // Show checkout form, hide order section
    checkoutBtn.addEventListener("click", () => {
        orderSection.style.display = "none";
        checkoutForm.style.display = "block";
    });

    // Show order section, hide checkout form
    backBtn.addEventListener("click", () => {
        checkoutForm.style.display = "none";
        orderSection.style.display = "block";
    });
});
