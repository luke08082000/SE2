const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Batch = sequelize.define('batch', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    isActive: Sequelize.BOOLEAN,
    start: Sequelize.DATEONLY,
    end: Sequelize.DATEONLY
})

module.exports = Batch;