// Get modal elements
const modal = document.getElementById("classModal");
const closeModal = document.getElementById("closeModal");
const modalClassName = document.getElementById("modalClassName");
const modalClassDescription = document.getElementById("modalClassDescription");
const modalClassDetails = document.getElementById("modalClassDetails");
const modalLink = document.getElementById("modalLink");

const classBoxes = document.querySelectorAll(".class-box");

// set for specific class
classBoxes.forEach(box => {
    box.addEventListener("click", function() {
        // Get class data from the clicked box
        const className = box.getAttribute("data-class");
        const classDescription = box.getAttribute("data-description");
        const classDetails = box.getAttribute("data-details");
        const classLink = box.getAttribute("data-link"); //added link for now


        // Set the modal content
        modalClassName.textContent = className;
        modalClassDescription.textContent = classDescription;
        modalClassDetails.textContent = classDetails;

        

        
        modal.style.display = "block";
    });
});


closeModal.addEventListener("click", function() {
    modal.style.display = "none";
});

window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});


