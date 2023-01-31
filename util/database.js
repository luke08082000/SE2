const Sequelize = require('sequelize');

const sequelize = new Sequelize('crsa', 'root', 'pass123', {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;