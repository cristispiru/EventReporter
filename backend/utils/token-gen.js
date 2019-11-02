var jwt = require('jsonwebtoken')

function generate (role, user_id, exp_time) {
    exp_time = exp_time || "45d"

    // generate a new token
    var payload = {}
    payload.roles = role
    payload.user_id = user_id

    var options = {}
    options.expiresIn = exp_time

    console.log('generating user token with data ' + JSON.stringify(payload))

    return jwt.sign(payload, process.env.JWT_SECRET, options)
}

module.exports.generate = generate
module.exports.default_permissions = ["basic"]
