var connection = require('../connections/db-connect')

var AlertCode = connection.orm.Model.extend({
    tableName: 'alert_codes',
    fullInfo() {
        var ret = {}
        ret.id = this.get("id")
        ret.name = this.get("name")

        return ret
    }
})

module.exports = AlertCode
