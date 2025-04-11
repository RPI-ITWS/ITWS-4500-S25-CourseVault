let url = "";
url = /*"https://course-vault.eastus.cloudapp.azure.com/node"*/"http://localhost:3000";



document.addEventListener('DOMContentLoaded', () => {
    // Must be a logged in user to access this page
    determineStatus();
});


function determineStatus() {
  return fetch(`${url}/status`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'unknown') {
        window.location.href = `/index.html`;
      } else if (data.status === 'admin') {
        window.location.href = `/admin/index.html`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      window.location.href = `/index.html`;
      return;
    });
}