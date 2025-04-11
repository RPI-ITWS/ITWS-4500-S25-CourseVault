let url = "";
// if (window.location.origin === "http://localhost:3000" || window.location.origin === "localhost:3000"){
//   url = "http://localhost:3000";
// }else{
  url = /*"https://course-vault.eastus.cloudapp.azure.com/node"*/"http://localhost:3000";
//}

document.addEventListener('DOMContentLoaded', () => {
    
    determineStatus();

    initializeTable();
    initializeFilters();
});

let availableCourses = new Set();

function initializeFilters() {
    const search = document.getElementById('courseSearch');
    const dropdown = document.getElementById('courseDropdown');
    const typeSelect = document.getElementById('assignmentTypeFilter');

    search.addEventListener('input', e => {
        const query = e.target.value.toLowerCase();
        if (query) {
            populateDropdown(query);
            dropdown.classList.add('show');
        } else {
            dropdown.classList.remove('show');
        }
        filterTable();
    });

    typeSelect.addEventListener('change', filterTable);

    document.addEventListener('click', key => {
        if (!search.contains(key.target) && !dropdown.contains(key.target)) {
            dropdown.classList.remove('show');
        }
    });

    search.addEventListener('keypress', key => {
        if (key.key === 'Enter') {
            filterTable();
            dropdown.classList.remove('show');
        }
    });

    document.getElementById('searchButton')?.addEventListener('click', () => {
        filterTable();
        dropdown.classList.remove('show');
    });
}

function populateDropdown(query) {
    const dropdown = document.getElementById('courseDropdown');
    dropdown.innerHTML = '';
    
    const matchingCourses = Array.from(availableCourses).filter(course => course.toLowerCase().includes(query));

    matchingCourses.sort((a, b) => {
        const aMatch = a.match(/^([A-Za-z]+)-(\d{4})$/);
        const bMatch = b.match(/^([A-Za-z]+)-(\d{4})$/);
        
        if (aMatch && bMatch) {
            const [, aPrefix, aSuffix] = aMatch;
            const [, bPrefix, bSuffix] = bMatch;
            
            if (aPrefix !== bPrefix) {
                return aPrefix.localeCompare(bPrefix);
            }

            return parseInt(aSuffix) - parseInt(bSuffix);
        }

        return a.localeCompare(b);
    });

    if (matchingCourses.length) {
        matchingCourses.forEach(course => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            
            const start = course.toLowerCase().indexOf(query);
            if (start >= 0) {
                item.innerHTML = `${course.slice(0, start)}<strong>${course.slice(start, start + query.length)}</strong>${course.slice(start + query.length)}`;
            } else {
                item.textContent = course;
            }

            item.addEventListener('click', () => {
                document.getElementById('courseSearch').value = course;
                dropdown.classList.remove('show');
                filterTable();
            });
            dropdown.appendChild(item);
        });
    } else {
        dropdown.innerHTML = `<div class="dropdown-item" style="font-style: italic; color: #666">No matching courses found</div>`;
    }
}

function filterTable() {
    const query = document.getElementById('courseSearch').value.toLowerCase().trim();
    const selectedType = document.getElementById('assignmentTypeFilter').value;
    
    const rows = document.querySelectorAll('#assignmentsTable tbody tr:not(.no-results-message)');
    let visible = false;

    rows.forEach(row => {
        const courseCell = row.querySelector('td:nth-child(2)');
        const typeCell = row.querySelector('td:nth-child(3)');
        
        const courseText = courseCell.textContent.toLowerCase().trim();
        const typeText = typeCell.textContent.trim();
        
        const matchesCourse = !query || courseText.includes(query);
        const matchesType = !selectedType || typeText === selectedType;
        
        row.style.display = (matchesCourse && matchesType) ? '' : 'none';
        
        if (matchesCourse && matchesType) {
            visible = true;
        }
    });

    updateNoResults(visible);
}

function updateNoResults(hasResults) {
    const existing = document.querySelector('.no-results-message');
    existing?.remove();

    if (!hasResults) {
        const tableBody = document.querySelector('#assignmentsTable tbody');
        tableBody.insertAdjacentHTML('beforeend', `
            <tr class="no-results-message">
                <td colspan="6" style="text-align: center; font-style: italic; padding: 20px">
                    No matching assignments found
                </td>
            </tr>
        `);
    }
}

function initializeTable() {
    fetch(`${url}/AssignmentsStored`)
        .then(response => response.ok ? response.json() : Promise.reject('Network error'))
        .then(data => {
            availableCourses = new Set(Object.keys(data.courses));
            const tableBody = document.querySelector('#assignmentsTable tbody');
            tableBody.innerHTML = '';
            
            Object.entries(data.courses).forEach(([courseName, course]) => {
                course.documents.forEach(doc => {
                    tableBody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td>${doc.file_name}</td>
                            <td>${courseName}</td>
                            <td>${doc.assignment_type}</td>
                            <td>${doc.professor}</td>
                            <td>${doc.date_assigned}</td>
                            <td>
                                <button onclick="window.location.href='/download/${doc.file_name}'" 
                                        style="padding: 5px 10px; cursor: pointer">
                                    Download
                                </button>
                            </td>
                        </tr>
                    `);
                });
            });
        })
        .catch(error => {
            document.querySelector('#assignmentsTable tbody').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: red">Error loading assignments</td></tr>';
        });
}

document.getElementById("addDocumentButton").addEventListener("click", function() {
    window.location.href = `/UploadWork/index.html`;
});

function determineStatus() {
    return fetch(`${url}/status`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unknown') {
          window.location.href = `/index.html`;
        }
        return;
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        window.location.href = `/index.html`;
        return;
      });
}