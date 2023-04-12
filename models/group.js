const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    capstoneTitle: Sequelize.STRING(500),
    section: Sequelize.STRING,
    adviserId: Sequelize.INTEGER,
    track: Sequelize.STRING
})

module.exports = Group;