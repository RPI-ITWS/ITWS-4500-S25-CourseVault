let url = "";

url = "https://course-vault.eastus.cloudapp.azure.com/node";


document.addEventListener('DOMContentLoaded', () => {

    // Must be a logged in admin to access this page
    determineStatus();

    const navButtons = document.querySelectorAll('.nav-button');
    const forms = document.querySelectorAll('.admin-form');
    const addCourseForm = document.getElementById('addCourseForm');
    const removeFileForm = document.getElementById('removeFileForm');
    const jsonInput = document.getElementById('jsonInput');
    const removeCommentForm = document.getElementById('removeCommentForm');

    jsonInput.placeholder = 
    `Enter Course Json Here...
    ex:
    {
    \t'CourseID': '____-____',
    \t'documents': [],
    \t'history': {
    \t\t'courseName': 'Critical Thinking',
    \t\t'semestersOffered': ['semester', ... ],
    \t\t'currentTimeSlots': {
    \t\t\t'day 1': 'XX:XX __ - XX:XX __',
    \t\t\t'day 2': 'XX:XX __ - XX:XX __'
    \t\t},
    \t\t'semestersAvailable': {
    \t\t\t'Semester Year': {
    \t\t\t\t'professor' : '_____',
    \t\t\t\t'location' : '_____',
    \t\t\t\t'time': {
    \t\t\t\t\t'day 1': 'XX:XX __ - XX:XX __',
    \t\t\t\t\t'day 2': 'XX:XX __ - XX:XX __'
    \t\t\t\t}
    \t\t\t},
    \t\t\t'thoughts': {
    \t\t\t\t'score': 0,
    \t\t\t\t'average': 0,
    \t\t\t\t'reviewCount': 0,
    \t\t\t\t'reviews': []
    \t\t\t}`;

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                forms.forEach(form => form.classList.remove('active'));
                return;
            }
             
            navButtons.forEach(btn => btn.classList.remove('active'));
            forms.forEach(form => form.classList.remove('active'));
             
            button.classList.add('active');
            
            const formId = button.id.replace('Btn', 'Form');
            const correspondingForm = document.getElementById(formId);
            correspondingForm.classList.add('active');
        });
    });

    addCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const jsonText = jsonInput.value.trim();
        
        try {
            const courseData = JSON.parse(jsonText);
            
            if (typeof courseData !== 'object' || courseData === null) {
                throw new Error('Input must be a valid JSON object');
            }
            
            const response = await fetch(`${url}/addCourse`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Course added successfully!');
                jsonInput.value = '';
            } else {
                const errorData = await response.json();
                alert(`Failed to add course: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert('Invalid JSON: Please enter a valid JSON object');
            } else {
                alert(error.message);
            }
        }
    });

    removeFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const courseCode = document.getElementById('courseCode').value.trim();
        const fileName = document.getElementById('fileName').value.trim();
        
        if (!courseCode || !fileName) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch(`${url}/remove-file/${courseCode}/${fileName}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                removeFileForm.reset();
            } else {
                alert(data.message || 'Error removing file');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while trying to remove the file');
        }
    });

    removeCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const courseID = document.getElementById('courseCode2').value.trim();
        const comment = document.getElementById('comment').value.trim();
        
        if (!courseID || !comment) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch(`${url}/deleteReview`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseID, comment })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Comment removed successfully!');
                removeCommentForm.reset();
            } else {
                alert(data.message || 'Error removing comment');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while trying to remove the comment');
        }
    });
});


function determineStatus() {
  return fetch(`${url}/status`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'unknown') {
        window.location.href = `/node/index.html`;
      } else if (data.status === 'user') {
        window.location.href = `/node/user/index.html`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      window.location.href = `node/index.html`;
      return;
    });
}