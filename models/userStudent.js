const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserStudent = sequelize.define('user-student', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    section: Sequelize.STRING
})

module.exports = UserStudent;