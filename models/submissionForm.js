const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const SubmissionForm = sequelize.define('submission-form', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    section: Sequelize.STRING,
    deadline: Sequelize.DATE,
    createdBy: Sequelize.STRING
})

module.exports = SubmissionForm;