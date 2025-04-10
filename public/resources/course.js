let url = "";
// if (window.location.origin === "http://localhost:3000" || window.location.origin === "localhost:3000"){
//   url = "http://localhost:3000";
// }else{
  url = "https://course-vault.eastus.cloudapp.azure.com/node";
// }

document.addEventListener('DOMContentLoaded', () => {

    determineStatus();

    const courseID = localStorage.getItem('courseID') || 'CSCI-1100';
    fetchCourseData(courseID);
  });
  
  async function fetchCourseData(courseID) {
    try {
      const response = await fetch(`${url}/class?course_id=${courseID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching course data: ${response.statusText}`);
      }
  
      const courseData = await response.json();
      updateCourseInfo(courseData);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      document.querySelector('.container').innerHTML = `
        <div class="box error">
          <h2>Error Loading Course Data</h2>
          <p>Unable to load information for this course. Please try again later.</p>
        </div>
      `;
    }
  }
  
  function updateCourseInfo(data) {
    document.getElementById('course-name').textContent = data.history.courseName || 'Unknown Course';
    document.getElementById('course-id').textContent = data.CourseID || 'Unknown ID';

    let timeSlotText = '';
    if (data.history.currentTimeSlots) {
        for (const [day, time] of Object.entries(data.history.currentTimeSlots)) {
            timeSlotText += `${day}: ${time}, `;
        }
        timeSlotText = timeSlotText.slice(0, -2);
    } else {
        timeSlotText = 'Not scheduled';
    }
    document.getElementById('course-time').textContent = timeSlotText;

    let location = 'TBD';
    if (data.history.semestersAvailable) {
        const mostRecentSemester = Object.keys(data.history.semestersAvailable)[0];
        if (mostRecentSemester) {
            location = data.history.semestersAvailable[mostRecentSemester].location;
        }
    }
    document.getElementById('location-id').textContent = location;

    let currentProfessor = 'TBD';
    if (data.history.semestersAvailable) {
        const mostRecentSemester = Object.keys(data.history.semestersAvailable)[0];
        if (mostRecentSemester) {
            currentProfessor = data.history.semestersAvailable[mostRecentSemester].professor;
        }
    }
    document.getElementById('course-professor').textContent = currentProfessor;

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (data.history.semestersAvailable) {
        const semesters = Object.keys(data.history.semestersAvailable);
        const displayCount = Math.min(8, semesters.length);

        for (let i = 0; i < displayCount; i++) {
            const semester = semesters[i];
            const professor = data.history.semestersAvailable[semester].professor;

            const listItem = document.createElement('li');
            listItem.textContent = `${semester} - ${professor}`;
            historyList.appendChild(listItem);
        }

        if (semesters.length > 8) {
            const viewMoreButton = document.createElement('button');
            viewMoreButton.className = 'view-more';
            viewMoreButton.textContent = 'View More History...';
            viewMoreButton.onclick = function () {
                showAllHistory(data.history.semestersAvailable);
            };
            historyList.appendChild(viewMoreButton);
        }
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No history available';
        historyList.appendChild(listItem);
    }

    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = '';

    if (data.thoughts.reviews && Object.keys(data.thoughts.reviews).length > 0) {
        for (const [reviewer, comment] of Object.entries(data.thoughts.reviews)) {
            const listItem = document.createElement('li');
            listItem.textContent = `"${comment}"`;
            reviewsList.appendChild(listItem);
        }
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No reviews available yet';
        reviewsList.appendChild(listItem);
    }

    const reviewCountElement = document.getElementById('review-count');
    if (reviewCountElement) {
        reviewCountElement.textContent = data.thoughts.reviewCount || 0;
    }

    const reviewScoreElement = document.getElementById('review-score');
    if (reviewScoreElement && data.thoughts && data.thoughts.average !== undefined) {
        reviewScoreElement.textContent = data.thoughts.average;
    }
}

function showAllHistory(semestersData) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; 

    for (const [semester] of Object.entries(semestersData)) {
        const listItem = document.createElement('li');
        const professor = semestersData[semester].professor;
        listItem.textContent = `${semester} - ${professor}`;
        historyList.appendChild(listItem);
    }
}

async function addClass() {
    const identifier = localStorage.getItem('courseID') || 'CSCI-1100';
    // console.log(identifier)
    try {
        const response = await fetch(`${url}/addClass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_id: identifier }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.json();
            alert(`Error adding course: ${errorText.message}`);
            return;
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert("An error occurred while adding the course.");
        console.error("Error:", error);
    }
}

function handleReviewButtonClick() {
    const reviewCourse = localStorage.getItem('courseID') || 'CSCI-1100';
    localStorage.setItem('reviewCourse', reviewCourse);
    
    window.location.href = window.location.origin+'/rating';
  }

  function determineStatus() {
    return fetch(`${url}/status`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unknown') {
          window.location.href = `${url}/`;
        }
        return;
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        window.location.href = `${url}/`;
        return;
      });
}