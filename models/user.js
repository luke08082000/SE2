const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM,
        values: ['Student', 'Faculty', 'admin'],
        defaultValue: 'Student'
    },
    emailVerified: {
        type: Sequelize.ENUM,
        values: ['unverified', 'verified'],
        defaultValue: 'unverified'
    },
    token: Sequelize.STRING
})

module.exports = User;