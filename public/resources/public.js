document.addEventListener('DOMContentLoaded', () => {
    // Must be a logged in user to access this page
    determineStatus();
});


function determineStatus() {
  return fetch('/status')
    .then(response => response.json())
    .then(data => {
      console.log(data.status);
      if (data.status === 'user') {
        window.location.href = `${window.location.origin}/user/`;
      } else if (data.status === 'admin') {
        window.location.href = `${window.location.origin}/admin/`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      window.location.href = `${window.location.origin}/`;
      return;
    });
}