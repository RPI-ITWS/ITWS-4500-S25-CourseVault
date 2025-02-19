const jwt = require("jsonwebtoken")

exports.cookieAuth = (req, res, next) => {
    const nonSecurePaths = ['', '/']
    const assetsPaths = ['/resources', '/components', '/favicon']
    const preAuthPaths = ['/login', '/signup', '/login/', '/signup/']
    


    // don't check for token when grabbing static 'public' assests 
    for (let i = 0; i < assetsPaths.length; i++) {
        if (req.path.includes(assetsPaths[i])) {
            return next()
        }
    }
    console.log(req.path)

    // don't check for token when rendering pages that don't require user data  
    if (nonSecurePaths.includes(req.path)) {
        console.log('non secure path')
        return next()
    }

    const token = req.cookies.token
    if (preAuthPaths.includes(req.path)) {
        if (token) { // redirect login/register attempts when user is present
            console.log("login/register attempt while logged in; redirect")
            return res.redirect("/user")
        }
        console.log('non secure path')
        return next()
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = user
        next()
    } catch (err) {
        console.log('error:', err)
        res.clearCookie("token")
        return res.redirect("/")
    }
}