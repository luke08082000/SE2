const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const FacultyUserRole = sequelize.define('faculty-user-role', {});

module.exports = FacultyUserRole;