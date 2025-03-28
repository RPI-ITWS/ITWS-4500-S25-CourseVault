document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const forms = document.querySelectorAll('.admin-form');
    const addCourseForm = document.getElementById('addCourseForm');
    const jsonInput = document.getElementById('jsonInput');

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
            
            const response = await fetch(`${window.location.origin}/addCourse`, {
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
});