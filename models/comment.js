const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Comment = sequelize.define('comment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    comment: {
        type: Sequelize.STRING(1000)
    },
    submissionId: Sequelize.INTEGER,
    userFacultyId: Sequelize.INTEGER
})

module.exports = Comment;