const express = require('express');

const isAuth = require('../middleware/is-auth');

const studentController = require('../controllers/student');

const router = express.Router();

router.get('/home', isAuth, studentController.getHome);

router.get('/activities', isAuth, studentController.getActivities);

router.get('/capstone-projects', isAuth, studentController.getCapstoneProjects);

router.get('/group', isAuth, studentController.getGroup);

module.exports = router;
