let url = "";
// if (window.location.origin === "http://localhost:3000" || window.location.origin === "localhost:3000"){
//   url = "http://localhost:3000";
// }else{
  url = "https://course-vault.eastus.cloudapp.azure.com/node";
//}

document.addEventListener('DOMContentLoaded', () => {
    // Must be a logged in user to access this page
    determineStatus();
});

function determineStatus() {
  return fetch(`${url}/status`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'user') {
        window.location.href = `${url}/user/`;
      } else if (data.status === 'admin') {
        window.location.href = `${url}/admin/`;
      }
      return;
    })
    .catch(error => {
      console.error('Error checking user status:', error);
      return;
    });
}