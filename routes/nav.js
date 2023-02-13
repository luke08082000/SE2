const express = require('express');

const isAuth = require('../middleware/is-auth');

const isFaculty = require('../middleware/is-faculty');

const navController = require('../controllers/nav');

const router = express.Router();

router.get('/home', isAuth, navController.getHome);

router.get('/activities', isAuth, navController.getActivities);

router.post('/activities', isAuth, navController.postActivities);

router.get('/capstone-projects', isAuth, navController.getCapstoneProjects);

router.post('/capstone-projects', isAuth, navController.postCapstoneProjects);

router.get('/group', isAuth, navController.getGroup);

router.post('/group', isAuth, navController.postGroup);


module.exports = router;
