// script.js
document.addEventListener('DOMContentLoaded', function() {
    const ratingBar = document.querySelector('.rating-bar');
    const ratingFill = document.getElementById('ratingFill');
    const ratingValue = document.getElementById('ratingValue');
    const ratingContainer = document.querySelector('.rating-bar-container');
    const courseIdInput = document.getElementById('courseId');
    let isHovering = false;
    
    const storedCourseId = localStorage.getItem('reviewCourse');
    if (storedCourseId && storedCourseId !== "") {
        courseIdInput.value = storedCourseId;
    }
    

    ratingValue.value = 0;
    ratingFill.style.width = '0%';

    ratingBar.addEventListener('click', function(e) {
        const rect = ratingBar.getBoundingClientRect();
        const position = e.clientX - rect.left;
        const percentage = position / rect.width;
        
        let rating = Math.round(percentage * 5);
        rating = Math.max(0, Math.min(5, rating));
        
        const fillPercentage = (rating / 5) * 100;
        ratingFill.style.width = fillPercentage + '%';
        ratingValue.value = rating;
    });
    
    ratingContainer.addEventListener('mouseenter', function() {
        isHovering = true;
    });
    
    ratingContainer.addEventListener('mousemove', function(e) {
        if (!isHovering) return;
        
        const rect = ratingBar.getBoundingClientRect();
        
        const verticalDistance = Math.abs(e.clientY - (rect.top + rect.height/2));
        const verticalThreshold = 30;
        
        if (verticalDistance > verticalThreshold) return;
        
        let position = e.clientX - rect.left;
        
        position = Math.max(0, Math.min(position, rect.width));
        
        const percentage = position / rect.width;
        
        let rating = Math.round(percentage * 5);
        rating = Math.max(0, Math.min(5, rating));
        
        const fillPercentage = (rating / 5) * 100;
        ratingFill.style.width = fillPercentage + '%';
    });
    
    document.addEventListener('mouseout', function(e) {
        if (!e.relatedTarget || !ratingContainer.contains(e.relatedTarget)) {
            isHovering = false;
            const rating = parseInt(ratingValue.value);
            const fillPercentage = (rating / 5) * 100;
            ratingFill.style.width = fillPercentage + '%';
        }
    });
    
    ratingContainer.addEventListener('mouseleave', function() {
        isHovering = false;
        const rating = parseInt(ratingValue.value);
        const fillPercentage = (rating / 5) * 100;
        ratingFill.style.width = fillPercentage + '%';
    });
    
    const form = document.getElementById('courseRatingForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted with rating:', ratingValue.value);
        alert('Rating submitted: ' + ratingValue.value + '/5');
    });
});