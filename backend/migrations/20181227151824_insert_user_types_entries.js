
exports.up = function(knex, Promise) {
    return knex('user_types').insert([{name:'admin'}, 
    	{name: 'regional_admin'}, 
    	{name:'basic'}, 
    	{name:'prime'}])  
};

exports.down = function(knex, Promise) {
    return knex('user_types').where( 'name', 'admin').orWhere( {name:'regional_admin'} ).orWhere( {name:'prime'} ).orWhere( {name:'basic'} ).del() 
};
