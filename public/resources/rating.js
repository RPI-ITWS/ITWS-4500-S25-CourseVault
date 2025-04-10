// script.js
let url = "";

url = "https://course-vault.eastus.cloudapp.azure.com/node";


document.addEventListener('DOMContentLoaded', function() {

    determineStatus();
    
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
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const courseId = courseIdInput.value;
        const score = parseInt(ratingValue.value);
        const comment = document.getElementById('comment').value || "No additional comments";
    
        if (!courseId) {
            alert('Please enter a Course ID');
            return;
        }

        if (score === 0) {
            alert('Please select a rating');
            return;
        }
    
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
    
        try {
            const response = await fetch(`${url}/addReview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    course:  courseIdInput.value,
                    score: parseInt(ratingValue.value),
                    comment: comment
                })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Review submitted successfully!');
                courseIdInput.value = '';
                ratingValue.value = 0;
                ratingFill.style.width = '0%';
                document.getElementById('comment').value = '';
            } else {
                alert(result.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred while submitting the review');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Review';
        }
    });
});

function determineStatus() {
    return fetch(`${url}/status`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unknown') {
          window.location.href = `/node/index.html`;
        }
        return;
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        window.location.href = `/node/index.html`;
        return;
      });
}