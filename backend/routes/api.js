var express = require('express')
var router = express.Router()

var bluebird = require('bluebird')
var conn = require('../connections/db-connect')

var path = require('path')
var AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2'})

var GeneralError = require('../utils/error')

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

router.post('/event', (req, res) => {
    var info = {}
    var currentTime = new Date()
    var status = 1
    var message
    var nan = "nan"
    currentTime.setHours(currentTime.getHours() - 3)
    req.checkBody('name', 'name param is missing').notEmpty()
    req.checkBody('description', 'description param is missing').notEmpty()
    req.body.longitude = 1
    req.body.latitude = 1
    req.body.name = "avalansa"
    req.body.image = req.body.image ? req.body.image : "Image"
    req.getValidationResult()
        .then((result) => {
            if (!result.isEmpty()) {
                throw GeneralError.create(result.array())
            }
            alertMessage = req.body.name + ': ' + req.body.description + '. Longitude: ' + req.body.longitude +' , Latitude: ' + req.body.latitude
            return UserType.forge({name: 'admin'}).fetch()
        })
        .then((type) => {
            if (!type) {
                throw GeneralError.create('User Type is invalid')
            }
            info.type_id = type.get('id')
            return AlertCode.forge({name: req.body.name}).fetch()
        })
        .then((alertCode) => {
            if (!alertCode) {
                throw GeneralError.create('No alert code with that name')
            }

            info.alertId = alertCode.get('id')
            return conn.db.transaction(function(trx) {
                currentTime = currentTime.toJSON().slice(0, 19).replace('T', ' ')
                var query = "SELECT COUNT(*) as total FROM events WHERE ( alert_code_id = " + info.alertId + " ) AND ( latitude BETWEEN " + parseFloat(parseFloat(req.body.latitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.latitude) + 0.1).toFixed(3) + " ) AND (longitude BETWEEN " + parseFloat(parseFloat(req.body.longitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.longitude) + 0.1).toFixed(3) + " ) AND ( created_at >= '" + currentTime + "' )"
                trx.raw("SELECT COUNT(*) as total FROM events WHERE ( alert_code_id = " + info.alertId + " ) AND ( latitude BETWEEN " + parseFloat(parseFloat(req.body.latitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.latitude) + 0.1).toFixed(3) + " ) AND (longitude BETWEEN " + parseFloat(parseFloat(req.body.longitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.longitude) + 0.1).toFixed(3) + " ) AND desc = '" + nan + "' AND ( created_at >= '" + currentTime + "' )")
                    .then(totalEvents => {
                        if (totalEvents[0][0].total > 0) {
                            status = 0
                            message = 'A similar event has already been notified in the area'
                            return trx.raw('SELECT 1 + 1 AS sanity')
                        } else {
                            var query2 = "INSERT INTO events (`desc`, image_url, longitude, latitude, alert_code_id) VALUES ( '" + req.body.description + "', '" + req.body.image + "', " + parseFloat(req.body.longitude).toFixed(3) + ", " + parseFloat(req.body.latitude).toFixed(3) + ", " + info.alertId + ")"
                            return trx.raw("INSERT INTO events (`desc`, image_url, longitude, latitude, alert_code_id) VALUES ( '" + req.body.description + "', '" + req.body.image + "', " + parseFloat(req.body.longitude).toFixed(3) + ", " + parseFloat(req.body.latitude).toFixed(3) + ", " + info.alertId + ")")
                        }
                    })
                    .then(newEvent => {
                        if (status === 1) {
                            info.event_id = newEvent[0].insertId
                        }
                        return trx.raw('SELECT 1 + 1 AS sanity')
                    })
                    .then(trx.commit)
                    .catch((reason) => {
                        trx.rollback()
                        console.log('error from commit')
                        console.log(reason)
                        res.send()
                    })
            })
        })
        .then((result) => {
            if (status === 0) {
                return User.fetchAll()
            } else {
                return User.where({type_id: info.type_id}).fetchAll()
            }
        })
        .then((users) => {
            if (status === 0) {
                res.send({status: 0, msg: message})
            } else {
                res.send({status: 1, msg: 'Event Added', eventId: info.event_id})
            }
        })
        .catch((reason) => {
            console.log('Adding event failed!')
            console.log(reason)
            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.post('/event/:event_id/tag', (req, res) => {
    Event.forge({id: req.params.event_id}).fetch()
        .then((event) => {
            if (!event) {
                throw GeneralError.create('No event with that id')
            }
            return Tag.forge({name: req.body.name}).fetch()
        })
        .then((tag) => {
            if (!tag) {
                return Tag.forge({name: req.body.name}).save()
            } else {
                return Tag.forge({name: req.body.name}).fetch()
            }
        })
        .then((tag) => {
            if (!tag) {
                throw GeneralError.create('Error while adding tag. Please try again')
            }
            return TagToEvent.forge({event_id: req.params.event_id, tag_id: tag.get('id')}).save()
        })
        .then((event_tag) => {
            if (!event_tag) {
                throw GeneralError.create('Error while adding tag. Please try again')
            }
            res.send({msg: 'Tag added to event'})
        })
        .catch((reason) => {
            console.log('Adding tag to event failed!')
            console.log(reason)
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
            return UserType.forge({name: 'admin'}).fetch()
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
            res.send({msg: 'User added'})
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

router.post('/tag', (req, res) => {
	req.checkBody('name', 'name param is missing').notEmpty()
	req.getValidationResult()
        .then((result) => {
            if (!result.isEmpty()) {
                throw GeneralError.create(result.array())
            }
            return Tag.forge({name: req.body.name}).fetch()
        })
        .then((tag) => {
        	if (tag) {
                return Tag.forge({name: req.body.name}).fetch()
        	}
        	return Tag.forge({name: req.body.name}).save()
        })
        .then((tag) => {
        	if (!tag) {
        		throw GeneralError.create('Tage not saved. Please try again')
        	}
            res.send({msg: 'Tag info', id: tag.get('id')})
        })
        .catch((reason) => {
            console.log('Saving tag failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.patch('/tag', (req, res) => {
	req.checkBody('old_name', 'old_name param is missing').notEmpty()
	req.checkBody('new_name', 'new_name param is missing').notEmpty()
	req.getValidationResult()
		.then((result) => {
			if (!result.isEmpty()) {
				throw GeneralError.create(result.array())
			}
			return Tag.forge({name: req.body.old_name}).fetch()
		})
		.then((tag) => {
			if (!tag) {
				throw GeneralError.create('No tag with ' + req.body.old_name + ' name.')
			}
			return Tag.where({name: req.body.old_name}).save({name: req.body.new_name}, {method: 'update'})
		})
		.then((tag) => {
			if (!tag) {
				throw GeneralError.create('Tag not updated. Please try again')
			}
			res.send({msg: 'Tag updated'})
		})
		.catch((reason) => {
            console.log('Updating tag failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.delete('/tag', (req, res) => {
	req.checkBody('name', 'name param is missing').notEmpty()
	req.getValidationResult()
		.then((result) => {
			if (!result.isEmpty()) {
				throw GeneralError.create(result.array())
			}
			return Tag.where({name: req.body.name}).destroy()
		})
		.then((tag) => {
			if (!tag) {
				throw GeneralError.create('Tag not deleted. Please try again')
			}
			res.send({msg: 'Tag deleted'})
		})
		.catch((reason) => {
            console.log('Deleting tag failed!')

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

router.post('/alert/codes', (req, res) => {
	req.checkBody('name', 'name param is missing').notEmpty()
	req.getValidationResult()
        .then((result) => {
            if (!result.isEmpty()) {
                throw GeneralError.create(result.array())
            }
            return AlertCode.forge({name: req.body.name}).fetch()
        })
        .then((code) => {
        	if (code) {
        		throw GeneralError.create('Alert code with the same name already exists')
        	}
        	return AlertCode.forge({name: req.body.name}).save()
        })
        .then((code) => {
        	if (!code) {
        		throw GeneralError.create('Alert code not saved. Please try again')
        	}
        	res.send({msg: 'Alert code added'})
        })
        .catch((reason) => {
            console.log('Saving alert codes failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.patch('/alert/codes', (req, res) => {
	req.checkBody('old_name', 'old_name param is missing').notEmpty()
	req.checkBody('new_name', 'new_name param is missing').notEmpty()
	req.getValidationResult()
		.then((result) => {
			if (!result.isEmpty()) {
				throw GeneralError.create(result.array())
			}
			return AlertCode.forge({name: req.body.old_name}).fetch()
		})
		.then((code) => {
			if (!code) {
				throw GeneralError.create('No alert code with ' + req.body.old_name + ' name.')
			}
			return AlertCode.where({name: req.body.old_name}).save({name: req.body.new_name}, {method: 'update'})
		})
		.then((code) => {
			if (!code) {
				throw GeneralError.create('Alert code not updated. Please try again')
			}
			res.send({msg: 'Alert code updated'})
		})
		.catch((reason) => {
            console.log('Updating alert codes failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})

router.delete('/alert/codes', (req, res) => {
	req.checkBody('name', 'name param is missing').notEmpty()
	req.getValidationResult()
		.then((result) => {
			if (!result.isEmpty()) {
				throw GeneralError.create(result.array())
			}
			return AlertCode.where({name: req.body.name}).destroy()
		})
		.then((code) => {
			if (!code) {
				throw GeneralError.create('Alert code not deleted. Please try again')
			}
			res.send({msg: 'Alert code deleted'})
		})
		.catch((reason) => {
            console.log('Deleting alert codes failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            }
            res.send({'errors': [{'msg': reason}] })
        })
})
// alert routes end

module.exports = router;
