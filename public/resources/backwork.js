document.addEventListener('DOMContentLoaded', function () {
    fetchAndPopulateTable();
});

function fetchAndPopulateTable() {
    fetch(`${window.location.origin}/AssignmentsStored`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
            const tableBody = document.querySelector('#assignmentsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error</td></tr>';
        });
}

function populateTable(data) {
    const tableBody = document.querySelector('#assignmentsTable tbody');
    tableBody.innerHTML = '';
    
    for (let courseName in data.courses) {
        const course = data.courses[courseName];
        
        course.documents.forEach(doc => {  
            const row = tableBody.insertRow();
            
            row.insertCell().textContent = doc.file_name;
            row.insertCell().textContent = courseName;
            row.insertCell().textContent = doc.assignment_type;
            row.insertCell().textContent = doc.professor;
            row.insertCell().textContent = doc.date_assigned;
            
            const downloadCell = row.insertCell();
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download';
            downloadButton.style.padding = '5px 10px';
            downloadButton.style.cursor = 'pointer';
            downloadButton.addEventListener('click', () => {
                window.location.href = `/download/${doc.file_name}`;
            });
            downloadCell.appendChild(downloadButton);
        });
    }
}