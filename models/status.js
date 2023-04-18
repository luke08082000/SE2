const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Status = sequelize.define('status', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: Sequelize.ENUM,
        values: ['approved', 'reject']
    },
    submissionId: Sequelize.INTEGER,
    userFacultyId: Sequelize.INTEGER
})

module.exports = Status;