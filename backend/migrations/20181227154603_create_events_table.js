
exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', function(table){
  	table.increments('id')
  	table.timestamps(true,true)
  	table.text('desc')
  	table.string('image_url')
  	table.float('longitude')
  	table.float('latitude')

  	//foreign keys
  	table.integer('alert_code_id').unsigned().index().references('id').inTable('alert_codes')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events')
};