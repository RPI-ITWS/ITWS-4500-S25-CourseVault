async function fillSchedule(course, color, foregroundColor, selectedSemester) {
    const times = course.history.semestersAvailable[selectedSemester].time;

    const table = document.getElementById('scheduleTable');
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    function timeToRowIndex(time) {
        const [hourMinute, period] = time.split(' ');
        const [hour, minute] = hourMinute.split(':').map(num => parseInt(num, 10));
        
        const hour24 = period === 'PM' && hour !== 12 ? hour + 12 : hour;
        const totalMinutes = hour24 * 60 + minute;

        return totalMinutes / 60;
    }

    for (let day in times) {
        const timeRange = times[day];
        const [startTime, endTime] = timeRange.split('-');

        const startHour = timeToRowIndex(startTime) - 7;
        const endHour = timeToRowIndex(endTime) - 7;

        const minimumTop = 40;
        const minimumLeft = 90;
        const width = 200;
        const oneUnitHeight = 40;

        const rows = table.rows;
        const dayIndex = weekdays.indexOf(day);

        const filledSlotDiv = document.createElement('div');
        filledSlotDiv.id = `${course.history.courseName}-${day}-${startHour}-${endHour}`.replace(/[^a-zA-Z0-9]+/g, '');
        filledSlotDiv.innerHTML = `<span style="font-size: 20px; font-weight: bold;">${course.history.courseName}</span><br>${course.history.semestersAvailable[selectedSemester].professor}<br>${course.history.semestersAvailable[selectedSemester].location}`;
        filledSlotDiv.style.position = 'absolute';
        filledSlotDiv.style.top = `${minimumTop + (40 * startHour)}px`;
        filledSlotDiv.style.left = `${minimumLeft + (200 * dayIndex)}px`;
        filledSlotDiv.style.width = `${width}px`;
        filledSlotDiv.style.height = `${oneUnitHeight * (endHour - startHour)}px`;
        filledSlotDiv.style.backgroundColor = `${color}`;
        filledSlotDiv.style.color = 'black';
        filledSlotDiv.style.textAlign = 'center';
        filledSlotDiv.style.borderRadius = '5px';
        filledSlotDiv.style.borderLeft = `15px solid ${foregroundColor}`;
        filledSlotDiv.style.fontWeight = 'bold';
        filledSlotDiv.style.overflow = 'auto';
        filledSlotDiv.style.wordWrap = 'break-word';

        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
        #${filledSlotDiv.id}::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            border-radius: 10px;
        }

        #${filledSlotDiv.id}::-webkit-scrollbar-track {
            background-color: ${color};
            border-radius: 10px;
        }

        #${filledSlotDiv.id}::-webkit-scrollbar-thumb {
            background-color: ${foregroundColor};
            border-radius: 10px;
        }
        `;

        document.head.appendChild(styleElement);

        table.appendChild(filledSlotDiv);
    }
}

async function fetchSchedule() {
    const response = await fetch(`${window.origin}/userData`);

    if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
    }
    
    const data = await response.json();

    const colors = [
        '#ff6666',
        '#66b3ff',
        '#66ff66',
        '#ffff66',
        '#ffcc66',
        '#cc66ff',
        '#ffb3ff',
        '#cc9966',
        '#b3b3b3'
    ];

    const foregroundColors = [
        'red',
        'blue',
        'green',
        'yellow',
        'orange',
        'purple',
        'pink',
        'brown',
        'gray'
    ]

    for (let i = 0; i < data.courses.length; i++) {
        const course = data.courses[i];

        const response = await fetch(`${window.location.origin}/courses`)

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

        const dropdown = document.getElementById("semesterDropdown");
        const selectedSemester = dropdown.value;

        if (selectedSemester in foundCourse.history.semestersAvailable) {
            fillSchedule(foundCourse, colors[i % colors.length], foregroundColors[i % foregroundColors.length], selectedSemester);
        }
    }
}

function createScheduleGrid() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = Array.from({ length: 16 }, (_, i) => {
        const hour = (i + 7) % 12 === 0 ? 12 : (i + 7) % 12;
        const period = (i + 7) < 12 || (i + 7) >= 24 ? 'AM' : 'PM';
        return `${hour}:00 ${period}`;
    });

    const table = document.createElement('table');
    table.id = 'scheduleTable';
    table.style.border = '2px solid #5a4a3f';
    table.style.width = '1092px';
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
        th.style.width = '200px';
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
    contentDiv.appendChild(table);

    fetchSchedule();
}

function generateSemesterOptions() {
    const dropdown = document.getElementById("semesterDropdown");
    dropdown.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const cutoffDate = new Date(year, 4, 31);

    let options = [];

    if (today > cutoffDate) {
        options = [`Spring ${year + 1}`];
    } else {
        options = [`Summer ${year}`, `Fall ${year}`];
    }

    options.forEach(semester => {
        const optionElement = document.createElement("option");
        optionElement.value = semester;
        optionElement.textContent = semester;
        dropdown.appendChild(optionElement);
    });
}

generateSemesterOptions();
createScheduleGrid();

const semesterDropdown = document.getElementById('semesterDropdown');
semesterDropdown.addEventListener('change', function() {
    fetchSchedule();
});