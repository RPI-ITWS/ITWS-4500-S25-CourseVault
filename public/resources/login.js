'use strict';

document.addEventListener('DOMContentLoaded', () => {
    determineStatus();
});

const loginSubmit = document.querySelector("#submit-button")
console.log(loginSubmit)

function validEmail(email) {
    if (email.slice(-8) != "@rpi.edu") {
        return false
    }
    if (email.length < 11) {
        return false
    }
    return true
}

loginSubmit.addEventListener("click", async function(event) {
    event.preventDefault()

    const error = document.querySelector(".form-error")
    error.innerText = ""
    error.style.display = "none"
    let isFormValid = true

    const registrationData = {
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
    }
    // console.log(registrationData)

    if (!registrationData.email.trim() || !registrationData.password.trim()) {
        !error.innerText ? error.innerText = "Please complete all fields to continue." : ""
        error.style.display = "block"
        isFormValid = false
    }

    if (!validEmail(registrationData.email.trim())) {
        !error.innerText ? error.innerText = "A valid RPI email is required to login." : ""
        error.style.display = "block"
        isFormValid = false
    }

    if (isFormValid) {
        //call backend api, get response, if 200 and good, redirect to /user
        try {
            const res = await fetch(`${window.location.origin}/node/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            const resData = await res.json()
            console.log(resData)
           
            if (res.status == 400) { // bad request => email in use already
                error.innerText = "The provided email and/or password are not associated with an existing account."
            }
            if (!res.ok) { 
                throw res 
            }

            error.innerText = "Success!" 
            error.style.color = "green"
            error.style.display = "block"
            //redirect to /user
            window.location.href = "/user"
        } catch (err) {
            console.error('There was a problem with registration request:', err);
            // return { err: `problem with API call, ${err.status} status`}
            if (!error.innerText) {
                error.innerText = "Something went wrong on our end, please try again later."   
            } 
            error.style.color = "black"
            error.style.display = "block"
        }
        
    }
    
})

function determineStatus() {
    return fetch(`${window.location.origin}/node/status`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'user') {
          window.location.href = `${window.location.origin}/node/user/`;
        } else if (data.status === 'admin') {
          window.location.href = `${window.location.origin}/node/admin/`;
        }
        return;
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        window.location.href = `${window.location.origin}/node/`;
        return;
      });
  }