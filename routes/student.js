const express = require('express');

const isAuth = require('../middleware/is-auth');

const studentController = require('../controllers/student');

const router = express.Router();

router.use(isAuth);

router.get('/home', studentController.getHome);

router.get('/activities/submit', studentController.getSubmit);

router.post('/activities/submit', studentController.postSubmit);

router.get('/activities/form/view/:id', studentController.getFormView);

router.get('/activities/monitor', studentController.getMonitor); 

router.get('/activities/monitor/view/:id', studentController.getMonitorView); 

router.get('/activities/revise', studentController.getRevise);

router.get('/activities/revise/view/:id', studentController.getMonitorView);

router.post('/activities/revise', studentController.postRevise);

router.get('/project-milestones', studentController.getProjectMilestones);

router.get('/group', studentController.getGroup);

router.post('/group', studentController.postGroup);

router.post('/group/capstone/title', studentController.postTitle);


module.exports = router;
