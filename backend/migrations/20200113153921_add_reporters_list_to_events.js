
exports.up = function(knex, Promise) {
    return knex.schema.alterTable('events', function(table){
        table.json('reporters_list')
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.table('events', function(table){
        table.dropColumn('reporters_list')
    })
  };