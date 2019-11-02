const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try
    {
        var tokenToDecode = null
        if (req.headers.authorization) {
            tokenToDecode = req.headers.authorization
        } else if (req.body && req.body.token) {
            tokenToDecode = req.body.token
        }
        var decoded = jwt.verify(tokenToDecode, process.env.JWT_SECRET)
        req.jwt = decoded
        next()
    }
    catch (err)
    {
        if (err.name === 'TokenExpiredError')
        {
            res.send({'errors': [{'msg': 'The token expired'}] })
            return
        }

        res.send({'errors': [{'msg': 'There was an error decoding the token'}] })
    }
}
