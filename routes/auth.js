const express = require('express');

const { check } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/auth/login', authController.getLogin);

router.post('/auth/login', authController.postLogin);

router.get('/auth/faculty-register', authController.getFacultyRegister);

router.get('/auth/student-register', authController.getStudentRegister);

router.post('/auth/register', check('email').isEmail(), authController.postRegister);

router.post('/auth/logout', authController.postLogout);

router.get('/auth/verify', authController.getVerify);

router.get('/auth/change-password', authController.getChangePassword);

router.post('/auth/change-password', authController.postChangePassword)

router.get('/auth/change-email', authController.getChangeEmail);

router.post('/auth/change-email', authController.postChangeEmail);

router.get('/auth/forgot-password', authController.getForgotPassword);

router.post('/auth/forgot-password', authController.postForgotPassword);

router.get('/auth/reset-password/:token', authController.getResetPassword); //from forget-password

router.post('/auth/reset-password', authController.postResetPassword); // from forget-password

module.exports = router;