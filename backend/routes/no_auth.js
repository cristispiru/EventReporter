var express = require('express')
var router = express.Router()

var AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2'})

var GeneralError = require('../utils/error')
const TokenUtils = require('../utils/token-gen')

var Event = require('../models/event')
var AlertCode = require('../models/alert_code')
var Tag = require('../models/tag')
var User = require('../models/user')
var UserType = require('../models/user_type')
var TagToEvent = require('../models/tag_to_event')

// HealthCheck
router.get('/', function(req, res, next) {
    res.send({msg: "OK"})
});

// event routes
router.get('/event', (req, res) => {
    Event.fetchAll({withRelated: 'alert'})
        .then((events) => {
            var toSend = []
            events.forEach(function(event) {
                toSend.push(event.fullInfo())
            })
            res.send({msg: 'Events List', list: toSend})
        })
        .catch((reason) => {
            console.log('Getting events list failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.get('/event/:minLongitude/:maxLongitude/:minLatitude/:maxLatitude', (req, res) => {
    Event.forge().query(function(qb){
        qb.where('latitude', '<=', req.params.maxLatitude).andWhere('latitude', '>=', req.params.minLatitude).andWhere('longitude', '<=', req.params.maxLongitude).andWhere('latitude', '>=', req.params.minLongitude)
    }).fetchAll({withRelated: 'alert'})
        .then((events) => {
            var toSend = []
            events.forEach(function(event) {
                console.log(event)
                toSend.push(event.fullInfo())
            })
            res.send({msg: 'Nearby Event List', list: toSend})
        })
        .catch((reason) => {
            console.log('Getting nearby events list failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.get('/event/:event_id', (req, res) => {
    var toSend
    Event.forge({id: req.params.event_id}).fetch({withRelated: 'alert'})
        .then((event) => {
            if (!event) {
                throw GeneralError.create('No event with that id')
            }
            toSend = event.fullInfo()
            toSend.tags = []
            return TagToEvent.where({event_id: event.get('id')}).fetchAll({withRelated: 'tag'})
        })
        .then((tags) => {
            tags.forEach(function(tag) {
                toSend.tags.push(tag.related('tag').get('name'))
            })
            res.send(toSend)
        })
        .catch((reason) => {
            console.log('Getting event details failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})
// event routes end

// user routes
router.get('/user/:user_email', (req, res) => {
    User.forge({email: req.params.user_email}).fetch({withRelated: ['type']})
        .then((user) => {
            if (!user) {
                throw GeneralError.create('No user with that id')
            }
            res.send(user.fullInfo())
        })
        .catch((reason) => {
            console.log('Getting user info failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.post('/user', (req, res) => {
    var type_id
    req.checkBody('email', 'email param is missing').notEmpty()
    req.checkBody('first_name', 'first_name param is missing').notEmpty()
    req.checkBody('last_name', 'last_name param is missing').notEmpty()
    req.getValidationResult()
        .then((result) => {
            if (!result.isEmpty()) {
                throw GeneralError.create(result.array())
            }
            return UserType.forge({name: 'basic'}).fetch()
        })
        .then((user_type) => {
            if (!user_type) {
                throw GeneralError.create('No user type with that name')
            }
            type_id = user_type.get('id')
            return User.where({email: req.body.email}).count()
        })
        .then((user_count) => {
            if (user_count > 0) {
                throw GeneralError.create('The email is already used')
            }
            var info = {}
            info.email = req.body.email
            info.first_name = req.body.first_name
            info.last_name = req.body.last_name
            info.type_id = type_id
            if (req.body.phone) {
                info.phone = req.body.phone
            }
            return User.forge(info).save()
        })
        .then((user) => {
            if (!user) {
                throw GeneralError.create('User not saved. Please try again')
            }
            const token = TokenUtils.generate('basic', user.get('id'))
            res.send({msg: 'User added', token})
        })
        .catch((reason) => {
            console.log('Adding user info failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})
// user routes end

// tag routes
router.get('/tag', (req, res) => {
	Tag.fetchAll()
		.then((tags) => {
            var toSend = []
            tags.forEach(function(tag) {
                toSend.push({id: tag.get('id'), name: tag.get('name')})
            })
            res.send(toSend)
		})
		.catch((reason) => {
            console.log('Getting tag list failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.get('/tag/:tag_name', (req, res) => {
    Tag.forge({name: req.params.tag_name}).fetch()
        .then((tag) => {
            if (!tag) {
                throw GeneralError.create('No tag with that name')
            }
            res.send(tag.fullInfo())
        })
        .catch((reason) => {
            console.log('Getting tag list failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})
// tag routes end

// alert routes
router.get('/alert/codes', (req, res) => {
	AlertCode.fetchAll()
		.then((alerts) => {
            var toSend = []
            alerts.forEach(function(alert) {
                toSend.push({id: alert.get('id'), name: alert.get('name')})
            })
            res.send(toSend)
		})
		.catch((reason) => {
            console.log('Getting alert codes list failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})
// alert routes end

module.exports = router;
