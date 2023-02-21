const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const SubmissionForm = require('./submissionForm');

const Submission = sequelize.define('submission', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    description: Sequelize.STRING,
    title: Sequelize.STRING,
    deadline: Sequelize.DATE,
    status: Sequelize.STRING,
    fileName: Sequelize.STRING,
    filePath: Sequelize.STRING,
    submittedBy: Sequelize.STRING,
    groupId: Sequelize.INTEGER
})

module.exports = Submission;