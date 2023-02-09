const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Membership = sequelize.define('membership', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    role: Sequelize.STRING
})

module.exports = Membership;