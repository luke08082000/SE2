const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserFaculty = sequelize.define('user-faculty', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = UserFaculty;