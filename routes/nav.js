const express = require('express');

const isAuth = require('../middleware/is-auth');

const isFaculty = require('../middleware/is-faculty');

const navController = require('../controllers/nav');

const router = express.Router();

router.get('/home', isAuth, navController.getHome);

router.get('/activities/submit', isAuth, navController.getSubmit); // Student only

router.post('/activities/submit', isAuth, navController.postSubmit); // Student only

router.get('/activities/monitor', isAuth, navController.getMonitor); // Student only

router.get('/activities/approve-documents', isAuth, isFaculty, navController.getApproveDocuments);

router.get('/activities/roles', isAuth, isFaculty, navController.getRole);

router.post('/activities/roles', isAuth, isFaculty, navController.postRole);

router.get('/activities/create-form', isAuth, isFaculty, navController.getCreateForm); // Faculty only

router.post('/activities/create-form', isAuth, isFaculty, navController.postCreateForm); // Faculty only

router.get('/capstone-projects', isAuth, navController.getCapstoneProjects);

router.post('/capstone-projects', isAuth, navController.postCapstoneProjects);

router.get('/group', isAuth, navController.getGroup);

router.post('/group', isAuth, navController.postGroup);


module.exports = router;
