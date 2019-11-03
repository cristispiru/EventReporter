
exports.up = function(knex, Promise) {
    return knex.schema.alterTable('events', function(table){
        table.integer('reported_count').defaultTo(0)
        table.integer('user_id').unsigned().index().references('id').inTable('users')
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.table('events', function(table){
        table.dropColumn('reported_count')
        table.dropForeign('user_id')
        table.dropColumn('user_id')
    })
  };