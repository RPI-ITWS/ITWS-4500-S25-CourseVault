const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

async function validateUser(username, password, collection) {
    const matchingUser = await collection.findOne({ username: username })
    
    if (!matchingUser) {
        return null
    }
    
    const match = await bcrypt.compare(password, matchingUser.pass_hash);
    if(match) {
        return matchingUser
    }
    // otherwise, return false 
    return null
}

module.exports = async (req, res) => {
    const user = req.body
    console.log(user.username + " " + user.password)

    const collection = req.app.locals.db.collection("Users")

    let validUser
    if (!(validUser = await validateUser(user.username, user.password, collection))) {
        return res.send("username or password doesn't match an existing account")
    }

    let jwtSecretKey = process.env.JWT_SECRET_KEY
    const token = jwt.sign(validUser, jwtSecretKey, {expiresIn: "12h"})
    // add token to cookies

    res.cookie("token", token, {
        httpOnly: true,
        //other potential flags
    })
    return res.redirect("/user")
}