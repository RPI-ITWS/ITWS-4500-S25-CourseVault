document.addEventListener('DOMContentLoaded', function () {
    fetchAndPopulateTable();
});

function fetchAndPopulateTable() {
    fetch('/AssignmentsStored')
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
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error</td></tr>';
        });
}

function populateTable(data) {
    const tableBody = document.querySelector('#assignmentsTable tbody');
    tableBody.innerHTML = '';

    for (let courseName in data.courses) {
        const course = data.courses[courseName];

        course.documents.forEach(document => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = document.document_name;
            row.insertCell().textContent = courseName;
            row.insertCell().textContent = document.assignment_type;
            row.insertCell().textContent = document.professor;
            row.insertCell().textContent = document.date_assigned;
        });
    }
}