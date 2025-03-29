const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

async function dupUsername(username, collection) {
    const user = await collection.findOne({ username: username });
    return user !== null;
}

async function collectionExists(db, collectionName) {
    const collections = await db.listCollections().toArray();
    console.log(collections)
    return collections.some(collection => collection.name === collectionName);
}

async function hashPassword(password) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

module.exports = async (req, res) => {
    try {
        const user = req.body
        console.log(user)
        
        const exists = await collectionExists(req.app.locals.db, "Users");
        if (!exists) {
            return res.status(500).send({msg: "db connection failed"})
        } 
        const collection = req.app.locals.db.collection("Users")
    
        if (await dupUsername(user.email, collection)) {
            return res.status(400).send({msg: "Email already in use"})
        }

        const currentDate = new Date()
        const options = { month: 'long', day: 'numeric', year: 'numeric' }
        const formattedDate = currentDate.toLocaleDateString('en-US', options)
        
        const newUser = {
            "username": user.email,
            "pass_hash": await hashPassword(user.password),
            "status":"user",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": formattedDate,
            "courses": [],
            "course_ratings": []
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
