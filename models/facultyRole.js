const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const FacultyRole = sequelize.define('faculty-role', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.ENUM,
        values: ['Course facilitator', 'Track head', 'Course coordinator', 'Course department chair', 'Technical adviser']
    },
    token: Sequelize.STRING
})

module.exports = FacultyRole;