url = "https://course-vault.eastus.cloudapp.azure.com/node";

document.addEventListener('DOMContentLoaded', () => {
    // Must be a logged in user to access this page
    determineStatus();
});

function determineStatus() {
  return fetch(`${url}/status`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'user') {
        window.location.href = `/node/user/index.html`;
      } else if (data.status === 'admin') {
        window.location.href = `/node/admin/index.html`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      return;
    });
}