'use strict';
// console.log("lol")
const registerSubmit = document.querySelector("#submit-button")
console.log(registerSubmit)

function validEmail(email) {
    if (email.slice(-8) != "@rpi.edu") {
        return false
    }
    if (email.length < 11) {
        return false
    }
    return true
}


registerSubmit.addEventListener("click", function(event) {
    event.preventDefault()

    const error = document.querySelector(".form-error")
    error.innerText = ""
    error.style.display = "none"

    const registrationData = {
        fName: document.querySelector("#fname").value,
        lName: document.querySelector("#lname").value,
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
        passwordRetype: document.querySelector("#password-retype").value
    }
    // console.log(registrationData)
    if (!registrationData.fName.trim() || !registrationData.lName.trim() ||
    !registrationData.email.trim() || !registrationData.password.trim() ||
    !registrationData.passwordRetype.trim()) {
        !error.innerText ? error.innerText = "Please complete all fields to continue." : ""
        error.style.display = "block"
    }

    if (!validEmail(registrationData.email.trim())) {
        !error.innerText ? error.innerText = "A valid RPI email is required to register." : ""
        error.style.display = "block"
    }

    if (registrationData.password !== registrationData.passwordRetype) {
        !error.innerText ? error.innerText = "The passwords provided are not identical." : ""
        error.style.display = "block"
    }

    error.innerText = "Success!" 
    error.style.color = "green"
    error.style.display = "block"
    //call backend api, get response, if 200 and good, redirect ßto /user
})