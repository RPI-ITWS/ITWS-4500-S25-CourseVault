const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

async function dupUsername(username, collection) {
    const user = await collection.findOne({ username: username })
    return user ? false : true
}

async function hashPassword(password) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

module.exports = async (req, res) => {
    try {
        const user = req.body
        console.log(user)
        
        const collection = req.app.locals.db.collection("Users")
        const newUserId = await dupUsername(user.username, collection)
        
        if (newUserId) {
            return res.status(400).send({msg: "Email already in use"})
        }

        const currentDate = new Date()
        const options = { month: 'long', day: 'numeric', year: 'numeric' }
        const formattedDate = currentDate.toLocaleDateString('en-US', options)
        
        const newUser = {
            "username": user.username,
            "pass_hash": await hashPassword(user.password),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": formattedDate,
            "courses": {},
            "professor_ratings": {}
        }

        await collection.insertOne(newUser)

        let jwtSecretKey = process.env.JWT_SECRET_KEY
        const token = jwt.sign(newUser, jwtSecretKey, {expiresIn: "12h"})

        res.cookie("token", token, {
            httpOnly: true,
            // other potential flags
        })
        return res.status(200).send({msg: "Registration successful"})
    } catch (err) {
        console.error("Error in registration:", err)
        return res.status(500).send({msg: "Internal Server Error: " + err})
    }
}
