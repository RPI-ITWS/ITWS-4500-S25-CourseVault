'use strict';

const { useState, useEffect } = React;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultUserData = {
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

  useEffect(() => {
    setUserData(defaultUserData);
    setLoading(false);
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
    React.createElement(
      'div',
      { className: 'table-container' },
      React.createElement('h2', null, "Enrolled Classes"),
      React.createElement(
        'table',
        { id: "assignmentsTable" },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', null, "Class Name")
          )
        ),
        React.createElement(
          'tbody',
          null,
          userData.classes.map((className, index) =>
            React.createElement(
              'tr',
              { key: index },
              React.createElement('td', null, className)
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
