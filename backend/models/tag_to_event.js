var connection = require('../connections/db-connect')

var TagToEvent = connection.orm.Model.extend({
    tableName: 'tag_to_events',
    tag() {
        return this.belongsTo(require('./tag.js'), 'tag_id')
    },
    event() {
    	return this.belongsTo(require('./event.js'), 'event_id')
    },
    fullInfo() {
        var ret = {}
        ret.tag = this.related("tag").fullInfo()
        ret.event = this.related("event").fullInfo()

        return ret
    },
    tagInfo() {
        var ret = {}
        ret.tag = this.related("tag").fullInfo()
    }
})

module.exports = TagToEvent
