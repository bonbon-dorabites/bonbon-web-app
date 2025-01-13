// Accordion Browse

const accordion = document.getElementsByClassName('sizes');

for(i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener('click', function() {
        this.classList.toggle('active');
    })
}