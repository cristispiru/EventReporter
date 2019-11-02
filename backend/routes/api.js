var express = require('express')
var router = express.Router()

var session = require('cookie-session')
var cookieParser = require('cookie-parser')

router.use(cookieParser())
router.use(session({keys: [process.env.SESSION_SECRET], maxAge: 30 * 24 * 60 * 60 * 1000}))

// no auth routes
var no_auth = require('./no_auth')
router.use(no_auth)

// auth routes
var auth = require('./auth')
router.use(auth)

module.exports = router
