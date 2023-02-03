const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Submission = sequelize.define('submission', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    deadline: {
        type: Sequelize.DATE,
        allowNull: false
    },
    status: Sequelize.STRING,
    fileName: Sequelize.STRING,
    createdBy: Sequelize.STRING
})

module.exports = Submission;