// Toggle accordion sections
const headers = document.querySelectorAll('.accordion-header');
headers.forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const toggleIcon = header.querySelector('.toggle-icon');

    // Toggle display of accordion body
    if (body.style.display === 'block') {
      body.style.display = 'none';
      toggleIcon.textContent = '+';
    } else {
      body.style.display = 'block';
      toggleIcon.textContent = '-';
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");
  const orderSection = document.getElementById("order");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const backBtn = document.getElementById("backBtn");
  const backBtn2 = document.getElementById("backBtn2");
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
  backBtn2.addEventListener("click", () => {
      checkoutForm.style.display = "none";
      orderSection.style.display = "block";
  });
});

document.querySelectorAll('.label').forEach(label => {
    label.addEventListener('click', function () {
      // Remove active class from all labels
      document.querySelectorAll('.label').forEach(l => l.classList.remove('active'));
      
      // Add active class to the clicked label
      this.classList.add('active');
    });
  });
  

  // Open Modal
  function openModal() {
    document.getElementById('employeeModal').style.display = "block";
}

// Close Modal
function closeModal() {
    document.getElementById('employeeModal').style.display = "none";
}
