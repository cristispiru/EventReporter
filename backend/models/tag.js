var connection = require('../connections/db-connect')

var Tag = connection.orm.Model.extend({
    tableName: 'tags',
    fullInfo() {
        var ret = {}
        ret.id = this.get("id")
        ret.name = this.get("name")

        return ret
    }
})

module.exports = Tag
