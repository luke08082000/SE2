const express = require('express');

const isAuth = require('../middleware/is-auth');

const isFaculty = require('../middleware/is-faculty');

const facultyController = require('../controllers/faculty');

const router = express.Router();

router.use(isAuth, isFaculty);

router.get('/home', facultyController.getHome);

router.post('/home', facultyController.postBatch);

router.get('/activities/approve-documents', facultyController.getApproveDocuments);

router.post('/activities/approve-documents', facultyController.postApproveDocuments);

router.get('/activities/roles', facultyController.getRole);

router.post('/activities/roles', facultyController.postRole);

router.post('/activities/remove', facultyController.postRemove);

router.get('/activities/create-form', facultyController.getCreateForm); 

router.post('/activities/create-form', facultyController.postCreateForm); 

router.get('/activities/view/:id', facultyController.getView);

router.get('/archive/view/:id', facultyController.getArchiveView);

router.post('/activities/post/comment', facultyController.postComment);

router.get('/capstone-projects', facultyController.getCapstoneProjects);

router.get('/group', facultyController.getGroup);

router.post('/group', facultyController.postGroup);


module.exports = router;
