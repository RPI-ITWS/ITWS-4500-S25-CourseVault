const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

async function collectionExists(db, collectionName) {
    const collections = await db.listCollections().toArray();
    console.log(collections)
    return collections.some(collection => collection.name === collectionName);
}

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
    console.log(user)

    const exists = await collectionExists(req.app.locals.db, "Users");
    if (!exists) {
        return res.status(500).send({msg: "db connection failed"})
    } 
    const collection = req.app.locals.db.collection("Users")

    let validUser
    if (!(validUser = await validateUser(user.email, user.password, collection))) {
        return res.status(400).send({msg: "Username or password doesn't match an existing account"})
    }

    let jwtSecretKey = process.env.JWT_SECRET_KEY
    const token = jwt.sign(validUser, jwtSecretKey, {expiresIn: "12h"})
    // add token to cookies

    res.cookie("token", token, {
        httpOnly: true,
        //other potential flags
    })
    return res.status(200).send({msg: "Login successful"})
}