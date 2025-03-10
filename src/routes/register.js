const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

function dupUsername(username, userData) {
    let i
    for (i = 0; i < userData.length; i++) {
        if (userData[i].username == username) {
            return -1
        }
    }
    return i+1
}

async function hashPassword(password) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}


module.exports = async (req, res) => {
    try {
        const user = req.body
        console.log(user.username + " " + user.password)

        let newUserId
        let userData = JSON.parse(fs.readFileSync(path.join(__dirname, './../data/users.json')))
        if ((newUserId = dupUsername(user.username, userData)) < 0) {
            return res.send("username already in use")
        }

        const newUser = {
            "id": newUserId,
            "username": user.username,
            "pass_hash": await hashPassword(user.password),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "courses": {},
            "professor_ratings": {}
        }

        userData.push(newUser)
        fs.writeFileSync(path.join(__dirname, './../data/users.json'), JSON.stringify(userData, null, 2))

        let jwtSecretKey = process.env.JWT_SECRET_KEY
        console.log(jwtSecretKey)
        const token = jwt.sign(newUser, jwtSecretKey, {expiresIn: "12h"})
        // add token to cookies

        res.cookie("token", token, {
            httpOnly: true,
            //other potential flags
        })
        return res.redirect("/user")
    } catch (err) {
        console.error("Error in registration:", err)
        return res.status(500).send("Internal Server Error: " + err)
    }
}

