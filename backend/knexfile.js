// Update with your config settings.
var dotenv = require('dotenv');
dotenv.config()

module.exports = {

    client: 'mysql',
    connection: {
      host:     process.env.DB_HOSTNAME,
      database: process.env.DB_NAME,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4',
      port: '3306'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }

};
