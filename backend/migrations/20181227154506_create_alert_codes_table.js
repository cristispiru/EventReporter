
exports.up = function(knex, Promise) {
  return knex.schema.createTable('alert_codes', function(table){
  	table.increments('id')
  	table.timestamps(true,true)
  	table.string('name')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('alert_codes')
};
