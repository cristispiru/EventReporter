
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
  	table.increments('id')
  	table.timestamps(true,true)
  	table.string('first_name')
  	table.string('last_name')
  	table.string('phone')
  	table.string('email')

  	//foreign keys
  	table.integer('type_id').unsigned().index().references('id').inTable('user_types')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
