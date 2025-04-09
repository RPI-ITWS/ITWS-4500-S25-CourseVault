document.addEventListener('DOMContentLoaded', () => {
    // Must be a logged in user to access this page
    determineStatus();
});


function determineStatus() {
  return fetch(`${window.location.origin}/node/status`)
    .then(response => response.json())
    .then(data => {
      console.log(data.status);
      if (data.status === 'unknown') {
        window.location.href = `${window.location.origin}/node`;
      } else if (data.status === 'admin') {
        window.location.href = `${window.location.origin}/node/admin/`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      window.location.href = `${window.location.origin}/node`;
      return;
    });
}