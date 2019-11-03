
exports.up = function(knex, Promise) {
    return knex.schema.alterTable('users', function(table){
        table.text('password')
        table.integer('reported_count').defaultTo(0)
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table){
        table.dropColumn('password')
        table.dropColumn('reported_count')
    })
  };