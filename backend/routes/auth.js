var express = require('express')
var router = express.Router()

var AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2', accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY})
var sns = new AWS.SNS({ apiVersion: '2010-03-31' })
var conn = require('../connections/db-connect')
var path = require('path')

var GeneralError = require('../utils/error')
const TokenUtils = require('../utils/token-gen')

var Event = require('../models/event')
var AlertCode = require('../models/alert_code')
var Tag = require('../models/tag')
var User = require('../models/user')
var UserType = require('../models/user_type')
var TagToEvent = require('../models/tag_to_event')

// check for jwt token
var auth_middleware = require('../middleware/auth')
router.use(auth_middleware)

// event routes
router.post('/event', (req, res) => {
    var info = {}
    var currentTime = new Date()
    var status = 1
    var message
    var adminTypeId
    currentTime.setHours(currentTime.getHours() - 3)
    req.checkBody('name', 'name param is missing').notEmpty()
    req.checkBody('description', 'description param is missing').notEmpty()
    req.checkBody('longitude', 'longitude param is missing').notEmpty()
    req.checkBody('latitude', 'latitude param is missing').notEmpty()
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
                throw GeneralError.create('The user type does not exist')
            }
            adminTypeId = type.get('id')
            return User.forge({id: req.jwt.user_id}).fetch()
        })
        .then((user) => {
            if (!user) {
                throw GeneralError.create('No user with that id')
            }
            if (user.get('reported_count') >= 3) {
                throw GeneralError.create('Your account has been banned')
            }
            info.user_id = user.get('id')
            return AlertCode.forge({name: req.body.name}).fetch()
        })
        .then((alertCode) => {
            if (!alertCode) {
                throw GeneralError.create('No alert code with that name')
            }

            info.alertId = alertCode.get('id')
            return conn.db.transaction(function(trx) {
                currentTime = currentTime.toJSON().slice(0, 19).replace('T', ' ')
                trx.raw("SELECT COUNT(*) as total FROM events WHERE ( alert_code_id = " + info.alertId + " ) AND ( latitude BETWEEN " + parseFloat(parseFloat(req.body.latitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.latitude) + 0.1).toFixed(3) + " ) AND (longitude BETWEEN " + parseFloat(parseFloat(req.body.longitude) - 0.1).toFixed(3) + " AND " + parseFloat(parseFloat(req.body.longitude) + 0.1).toFixed(3) + " ) AND `desc` = '" + req.body.description + "' AND ( created_at >= '" + currentTime + "' )")
                    .then(totalEvents => {
                        if (totalEvents[0][0].total > 0) {
                            status = 0
                            message = 'A similar event has already been notified in the area'
                            return trx.raw('SELECT 1 + 1 AS sanity')
                        } else {
                            return trx.raw("INSERT INTO events (`desc`, image_url, longitude, latitude, alert_code_id, user_id) VALUES ( '" + req.body.description + "', '" + req.body.image + "', " + parseFloat(req.body.longitude).toFixed(3) + ", " + parseFloat(req.body.latitude).toFixed(3) + ", " + info.alertId + ", " + info.user_id + " )")
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
                return new Promise()
            }
            return User.where({type_id: adminTypeId}).fetch()
        })
        .then((user) => {
            if (status === 0) {
                return new Promise()
            }
            return sns.publish({
                Message: 'New Event Reported. Type: ' + req.body.name + '. Description: ' + req.body.description,
                PhoneNumber: user.get('phone')
            }).promise()
        })
        .then((result) => {
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})

router.post('/event/:event_id/tag', (req, res) => {
    Event.forge({id: req.params.event_id, user_id: req.jwt.user_id}).fetch()
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})

router.patch('/event/:event_id/report', (req, res) => {
    let userUpdate
    Event.forge({id: req.params.event_id}).fetch({withRelated: ['alert', 'user']})
        .then((event) => {
            if (!event) {
                throw GeneralError.create('No event with that id')
            }
            let reporters = JSON.parse(event.get('reporters_list'))
            if (reporters) {
                reporters.list.forEach(function(id) {
                    if (id === req.jwt.user_id) {
                        throw GeneralError.create('User already reported this event')
                    }
                })
            }
            userUpdate = event.get('reported_count') === 4
            const reportedCount = event.get('reported_count') + 1
            if (reporters) {
                reporters.list.push(req.jwt.user_id)
            } else {
                reporters = {
                    list: [req.jwt.user_id]
                }
            }
            return event.save({reported_count: reportedCount, reporters_list: JSON.stringify(reporters)}, {method: 'update'})
        })
        .then((event) => {
            if (!event) {
                throw GeneralError.create('Event not updated')
            }
            return User.forge({id: event.get('user_id')}).fetch()
        })
        .then((user) => {
            const reportedCount = user.get('reported_count') + 1
            if (userUpdate) {
                user.save({reported_count: reportedCount}, {method: 'update'})
            }
            res.send({msg: 'Event reported'})
        })
        .catch((reason) => {
            console.log('Reporting event failed!')
            console.log(reason)
            if (reason.send_message) {
                res.send({errors: reason.message})
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})
// event routes end

// tag routes
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})
// tag routes end

// alert codes routes
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
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
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})
// alert code routes end

//user routes
router.post('/user/admin', (req, res) => {
    var type_id
    req.checkBody('email', 'email param is missing').notEmpty()
    req.checkBody('first_name', 'first_name param is missing').notEmpty()
    req.checkBody('last_name', 'last_name param is missing').notEmpty()
    req.checkBody('password', 'password param is missing').notEmpty()
    req.getValidationResult()
        .then((result) => {
            if (!result.isEmpty()) {
                throw GeneralError.create(result.array())
            }
            if (req.jwt.role !== 'admin') {
                throw GeneralError.create('Not authorized')
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
            const token = TokenUtils.generate('admin', user.get('id'))
            res.send({msg: 'User added', token})
        })
        .catch((reason) => {
            console.log('Adding user info failed!')

            if (reason.send_message) {
                res.send({errors: reason.message})
            } else {
                res.send({'errors': [{'msg': reason}] })
            }
        })
})
//user routes end

module.exports = router;
