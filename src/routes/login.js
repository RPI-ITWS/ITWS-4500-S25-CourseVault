const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

async function validateUser(username, password) {
    let userData = JSON.parse(fs.readFileSync(path.join(__dirname, './../data/users.json')))

    let matchingUser
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].username == username) {
            matchingUser = userData[i]
            break
        }
    }
    if (!matchingUser) { //no matching user, return null
        return null
    }
    
    const match = await bcrypt.compare(password, matchingUser.pass_hash);
    if(match) {
        //user is a match, return true
        return matchingUser
    }
    // otherwise, return false 
    return null
}

module.exports = async (req, res) => {
    const user = req.body
    console.log(user.username + " " + user.password)

    let validUser
    if (!(validUser = await validateUser(user.username, user.password))) {
        return res.send("username or password doesn't match an existing account")
    }

    let jwtSecretKey = process.env.JWT_SECRET_KEY
    const token = jwt.sign(validUser, jwtSecretKey, {expiresIn: "1s"})
    // add token to cookies

    res.cookie("token", token, {
        httpOnly: true,
        //other potential flags
    })
    return res.redirect("/user")
}

