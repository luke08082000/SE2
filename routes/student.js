const express = require('express');

const isAuth = require('../middleware/is-auth');

const studentController = require('../controllers/student');

const router = express.Router();

router.use(isAuth);

router.get('/home', studentController.getHome);

router.get('/activities/submit', studentController.getSubmit);

router.post('/activities/submit', studentController.postSubmit);

router.get('/activities/monitor', studentController.getMonitor); 

router.get('/activities/revise', studentController.getRevise);

router.post('/activities/revise', studentController.postRevise);

router.get('/project-milestones', studentController.getProjectMilestones);

router.get('/group', studentController.getGroup);

router.post('/group', studentController.postGroup);


module.exports = router;
