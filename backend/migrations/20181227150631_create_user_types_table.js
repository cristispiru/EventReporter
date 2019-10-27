
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user_types', function(table){
  	table.increments('id')
  	table.timestamps(true,true)
  	table.string('name')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_types')
};
