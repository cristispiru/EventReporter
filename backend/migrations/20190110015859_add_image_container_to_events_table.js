
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('events', function(table){
  	table.text('image_url').alter()
  })
};

exports.down = function(knex, Promise) {
};