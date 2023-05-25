const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserFaculty = sequelize.define('user-faculty', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    role: {
        type: Sequelize.ENUM,
        values: ['course-facilitator', 'track-head', 'course-coordinator', 'course-department-chair', 'technical-adviser']
    },
    section: {
        type: Sequelize.STRING,
        defaultValue: 'all'
    },
    track: {
        type: Sequelize.STRING,
        defaultValue: 'n/a'
    },
    
})

module.exports = UserFaculty;