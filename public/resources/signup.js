'use strict';
let url = "";
if (window.location.origin === "http://localhost:3000" || window.location.origin === "localhost:3000"){
  url = "http://localhost:3000";
}else{
  url = "https://course-vault.eastus.cloudapp.azure.com/node";
}

document.addEventListener('DOMContentLoaded', () => {
    determineStatus();
});

const registerSubmit = document.querySelector("#submit-button")

function validEmail(email) {
    if (email.slice(-8) != "@rpi.edu") {
        return false
    }
    if (email.length < 11) {
        return false
    }
    return true
}


registerSubmit.addEventListener("click", async function(event) {
    event.preventDefault()

    const error = document.querySelector(".form-error")
    error.innerText = ""
    error.style.display = "none"
    let isFormValid = true

    const registrationData = {
        first_name: document.querySelector("#fname").value,
        last_name: document.querySelector("#lname").value,
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
        passwordRetype: document.querySelector("#password-retype").value
    }

    if (!registrationData.first_name.trim() || !registrationData.last_name.trim() ||
    !registrationData.email.trim() || !registrationData.password.trim() ||
    !registrationData.passwordRetype.trim()) {
        !error.innerText ? error.innerText = "Please complete all fields to continue." : ""
        error.style.display = "block"
        isFormValid = false
    }

    if (!validEmail(registrationData.email.trim())) {
        !error.innerText ? error.innerText = "A valid RPI email is required to register." : ""
        error.style.display = "block"
        isFormValid = false
    }

    if (registrationData.password !== registrationData.passwordRetype) {
        !error.innerText ? error.innerText = "The passwords provided are not identical." : ""
        error.style.display = "block"
        isFormValid = false
    }



    if (isFormValid) {
        try {
            const res = await fetch(`${url}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            const resData = await res.json()
           
            if (res.status == 400) { // bad request => email in use already
                error.innerText = "The provided email is already associated with an account."
            }
            if (!res.ok) { 
                throw res 
            }

            error.innerText = "Success!" 
            error.style.color = "green"
            error.style.display = "block"
            //redirect to /user
            window.location.href = `${url}/user`
        } catch (err) {
            console.error('There was a problem with registration request:', err);
            // return { err: `problem with API call, ${err.status} status`}
            if (!error.innerText) {
                error.innerText = "Something went wrong on our end, please try again later."   
            } 
            error.style.color = "black"
            error.style.display = "block"
        }
        //call backend api, get response, if 200 and good, redirect ßto /user
    }
    
})


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
        window.location.href = `${url}/`;
        return;
      });
  }