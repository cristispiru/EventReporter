var connection = require('../connections/db-connect')

var User = connection.orm.Model.extend({
    tableName: 'users',
    type() {
        return this.belongsTo(require('./user_type.js'), 'type_id')
    },
    fullInfo() {
        var ret = {}
        ret.id = this.get("id")
        ret.name = this.get("first_name") + " " + this.get("last_name")
        ret.status = this.related("type").get("name")
        ret.timestamp = this.get("created_at")
        ret.phone = this.get("phone")
        ret.email = this.get("email")
        ret.reported_count = this.get('reported_count')

        return ret
    }
})

module.exports = User
