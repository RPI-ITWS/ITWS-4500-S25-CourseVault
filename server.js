const express = require('express')
const app = express()
const port = 3000
const cookieParser = require("cookie-parser")
const loginRoute = require("./login")
// const { jwtAuth } = require("./jwtAuth")

app.use(express.static('public'))
app.use(cookieParser())

app.post("/login", loginRoute)

app.listen(port, () => {
	console.log('Listening on *:3000')
})