
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tag_to_events', function(table){
  	table.increments('id')
  	table.timestamps(true,true)

  	//foreign keys
  	table.integer('event_id').unsigned().index().references('id').inTable('events')
  	table.integer('tag_id').unsigned().index().references('id').inTable('tags')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tag_to_events')
};