'use strict';

const { useState, useEffect } = React;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropStatus, setDropStatus] = useState(null);

  const exampleUserData = {
    fullName: "Cam Thomas",
    email: "thomac23@university.edu",
    joined: "August 24, 2023",
    classes: ["CSCI-1100", "ITWS-1100", "MATH-2100", "PHIL-2100"],
    ratings: [
      { professor: "Dr. Callahan", rating: 5, comment: "Easily the Best Cactus I know..." },
      { professor: "Dr. Plum", rating: 3, comment: "Difficult exams!" },
      { professor: "Dr. Kuzmin", rating: 2, comment: "Difficult to pay attention to at 8 AM." },
      { professor: "Dr. Plotka", rating: 4, comment: "Reasonable with excused absences." }
    ]
  };

  const formatData = (data) => {
    console.log(data.professor_ratings);
    console.log(data.courses);
    return {
      fullName: `${data.first_name} ${data.last_name}`,
      email: data.username,
      joined: data.date_joined,
      classes: data.courses && data.courses.length > 0 ? data.courses : ["Not Enrolled In Any Classes"],
      ratings: data.professor_ratings && data.professor_ratings.length > 0 ? 
               data.professor_ratings : [{ professor: "N/a", rating: 0, comment: "No Comments Submitted" }]
    };
  };

  const handleDropCourse = async (courseId) => {
    try {
      setDropStatus({ message: `Dropping course ${courseId}...`, type: 'info' });
      
      const response = await fetch(`${window.origin}/dropcourse`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
        credentials: 'same-origin'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUserData(prevData => ({
          ...prevData,
          classes: prevData.classes.filter(course => course !== courseId)
        }));
        setDropStatus({ message: result.message, type: 'success' });
        
        setTimeout(() => setDropStatus(null), 3000);
      } else {
        setDropStatus({ message: result.message || 'Failed to drop course', type: 'error' });
      }
    } catch (error) {
      console.error("Error dropping course:", error);
      setDropStatus({ message: 'An error occurred while trying to drop the course', type: 'error' });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${window.origin}/userData`);
        
        if (!response.ok) {
          throw new Error(`Error Status: ${response.status}`);
        }
        
        const data = await response.json();
        const formattedData = formatData(data);
        setUserData(formattedData);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserData(exampleUserData);
        setError("Failed to load user profile from server. Using default data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return React.createElement('div', { className: 'content' },
      React.createElement('div', { className: 'table-container' },
        React.createElement('p', null, "Loading profile..."))
    );
  }

  if (error && !userData) {
    return React.createElement('div', { className: 'content' },
      React.createElement('div', { className: 'table-container' },
        React.createElement('p', null, "Error: " + error),
        React.createElement('p', null, "Please try again later."))
    );
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'header-section' },
      React.createElement('h1', { className: 'profile-name' }, userData.fullName),
      React.createElement(
        'table',
        { className: 'profile-info-table' },
        React.createElement(
          'tbody',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('td', null, 'Email:'),
            React.createElement('td', null, userData.email)
          ),
          React.createElement(
            'tr',
            null,
            React.createElement('td', null, 'Joined:'),
            React.createElement('td', null, userData.joined)
          )
        )
      )
    ),
    dropStatus && React.createElement(
      'div',
      { className: `status-message ${dropStatus.type}` },
      dropStatus.message
    ),
    React.createElement(
      'div',
      { className: 'table-container' },
      React.createElement('h2', null, "Enrolled Classes"),
      React.createElement(
        'table',
        { id: "enrolledClassesTable" },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', null, "Course ID"),
            React.createElement('th', null, "Actions")
          )
        ),
        React.createElement(
          'tbody',
          null,
          userData.classes.map((className, index) =>
            React.createElement(
              'tr',
              { key: index },
              React.createElement('td', null, className),
              React.createElement(
                'td', 
                null,
                className !== "Not Enrolled In Any Classes" && 
                React.createElement(
                  'button',
                  { onClick: () => handleDropCourse(className) },
                  'Drop Course'
                )
              )
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'table-container' },
      React.createElement('h2', null, "Professor Ratings"),
      React.createElement(
        'table',
        { id: "assignmentsTable" },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', null, "Professor"),
            React.createElement('th', null, "Rating"),
            React.createElement('th', null, "Comment")
          )
        ),
        React.createElement(
          'tbody',
          null,
          userData.ratings.map((item, index) =>
            React.createElement(
              'tr',
              { key: index },
              React.createElement('td', { className: 'professor-cell' }, item.professor),
              React.createElement(
                'td',
                { className: 'rating-cell' },
                '★'.repeat(Math.floor(item.rating)) +
                  (item.rating % 1 >= 0.5 ? '½' : '')
              ),
              React.createElement('td', { className: 'comment-cell' }, item.comment)
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'add-controls' },
        React.createElement('button', { id: 'addRatingButton' }, 'Add Rating')
      )
    )
  );
};

document.addEventListener('DOMContentLoaded', function() {
  const contentNode = document.getElementById('content');
  if (contentNode) {
    const root = ReactDOM.createRoot(contentNode);
    root.render(React.createElement(UserProfile));
  } else {
    console.error("Element with ID 'content' not found!");
  }
});