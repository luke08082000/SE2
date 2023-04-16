const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserStudent = sequelize.define('user-student', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    section: Sequelize.STRING,
    role: {
        type: Sequelize.ENUM,
        values: ['project-manager', 'quality-assurance', 'front-end-developer', 'back-end-developer']
    },
    studentId: Sequelize.INTEGER
})

module.exports = UserStudent;