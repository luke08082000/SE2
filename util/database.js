const Sequelize = require('sequelize');

require('dotenv').config(); // Load environment variables from .env file

// Access environment variables
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// const sequelize = new Sequelize('crsa', 'root', 'pass123', {
//     dialect: 'mysql',
//     host: 'localhost'
// })
const sequelize = new Sequelize('capstonehub', 'admin', 'password', {
    host: 'database-3.cuyayftpxpkn.ap-southeast-2.rds.amazonaws.com',
    port: '3306',
    dialect: 'mysql',
  });
  

module.exports = sequelize;