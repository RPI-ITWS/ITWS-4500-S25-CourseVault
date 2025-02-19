// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const dummyData = require('./data/DummyDisplay.json');
const dummyWork = path.join(__dirname, '../assignments');
const app = express();
const port = 3000;
require('dotenv').config()
const cookieParser = require("cookie-parser")
const loginRoute = require("./routes/login")
const registerRoute = require("./routes/register")
const { cookieAuth } = require("./middleware/cookieAuth")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
	console.log("root route")
	res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.post("/login", loginRoute)
app.post("/register", registerRoute)
app.get("/logout", (req, res) => {
	res.clearCookie("token")
	return res.redirect("/")
})

app.use(cookieAuth)

app.get('/login', (req, res) => {
	console.log("login route")
	res.sendFile(path.join(__dirname, '../public/login/index.html'))
})
app.get('/signup', (req, res) => {
	console.log("register route")
	res.sendFile(path.join(__dirname, '../public/signup/index.html'))
})
app.get('/user', (req, res) => {
	console.log("user route")
	res.sendFile(path.join(__dirname, '../public/user/index.html'))
})
app.get('/admin', (req, res) => {
	console.log("admin route")
	res.sendFile(path.join(__dirname, '../public/admin/index.html'))
})
app.get('/backwork', (req, res) => {
	console.log("backwork route")
	res.sendFile(path.join(__dirname, '../public/backwork/index.html'))
})
app.get('/professors', (req, res) => {
	console.log("professors route")
	res.sendFile(path.join(__dirname, '../public/professors/index.html'))
})
app.get('/resources', (req, res) => {
	console.log("resources route")
	res.sendFile(path.join(__dirname, '../public/resources/index.html'))
})
app.get('/schedule', (req, res) => {
	console.log("schedule route")
	res.sendFile(path.join(__dirname, '../public/schedule/index.html'))
})

app.get('/AssignmentsStored', (req, res) => {
    res.json(dummyData);
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(dummyWork, filename);
    
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found');
    }
});

if (!fs.existsSync(dummyWork)) {
    console.error(`Error: Directory ${dummyWork} does not exist`);
    process.exit(1);
}

app.use(express.static('public'))

app.listen(port, () => {
    console.log('Listening on *:3000');
    console.log(`Serving assignments from: ${dummyWork}`);
});