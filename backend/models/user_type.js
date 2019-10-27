var connection = require('../connections/db-connect')

var UserType = connection.orm.Model.extend({
    tableName: 'user_types',
    fullInfo() {
        var ret = {}
        ret.id = this.get("id")
        ret.name = this.get("name")

        return ret
    }
})

module.exports = UserType
