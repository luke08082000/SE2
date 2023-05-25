const Sequelize = require('sequelize');

// const sequelize = new Sequelize('capstonehub', 'admin', 'password', {
//     host: 'database-3.cuyayftpxpkn.ap-southeast-2.rds.amazonaws.com',
//     port: '3306',
//     dialect: 'mysql',
//   });

const sequelize = new Sequelize('crsa', 'root', 'pass123', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql',
  });
  

module.exports = sequelize;