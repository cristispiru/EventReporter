var connection = require('../connections/db-connect')

var Event = connection.orm.Model.extend({
    tableName: 'events',
    alert() {
        return this.belongsTo(require('./alert_code.js'), 'alert_code_id')
    },
    fullInfo() {
        var ret = {}
        ret.id = this.get("id")
        ret.description = this.get("desc")
        ret.timestamp = this.get("created_at")
        ret.image = this.get("image_url")
        ret.longitude = this.get("longitude")
        ret.latitude = this.get("latitude")
        ret.alert_code = this.related("alert").get("name")

        return ret
    }
})

module.exports = Event
