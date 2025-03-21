async function fillSchedule() {
    const response = await fetch(`${window.origin}/userData`);

    if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
    }
    
    const data = await response.json();

    for (let i = 0; i < data.courses.length; i++) {
        const course = data.courses[i];

        const response = await fetch(`${window.location.origin}/AssignmentsStored`)

        if (!response.ok) {
            throw new Error(`Error Status: ${response.status}`);
        }

        const courseData = await response.json();

        let foundCourse;

        for (const [courseCode, cData] of Object.entries(courseData.courses)) {
            if (courseCode === course) {
                foundCourse = cData;
            }
        }

        const times = foundCourse.history.currentTimeSlots;
    }
}

function createScheduleGrid() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const period = i < 12 ? 'AM' : 'PM';
        return `${hour}:00 ${period}`;
    });

    const table = document.createElement('table');
    table.id = 'scheduleTable';
    table.style.border = '2px solid #5a4a3f';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');
    const thm = document.createElement('th');
    thm.textContent = 'Time';
    thm.style.backgroundColor = '#5a4a3f';
    thm.style.border = '1px solid #5a4a3f';
    headerRow.appendChild(thm);

    weekdays.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.padding = '10px';
        th.style.backgroundColor = '#d6c2a8';
        th.style.border = '1px solid #5a4a3f';
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    times.forEach(time => {
        const row = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        timeCell.style.padding = '8px';
        timeCell.style.fontWeight = 'bold';
        timeCell.style.backgroundColor = '#d6c2a8';
        timeCell.style.border = '1px solid #5a4a3f';
        timeCell.style.width = '90px';
        row.appendChild(timeCell);

        weekdays.forEach(() => {
            const cell = document.createElement('td');
            cell.textContent = '';
            cell.style.border = '1px solid #ccc';
            cell.style.height = '40px';
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    const contentDiv = document.getElementById('content-block');
    //contentDiv.innerHTML = '';
    contentDiv.appendChild(table);

    fillSchedule();
}

createScheduleGrid();