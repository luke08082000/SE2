const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/auth/login', authController.getLogin);

router.post('/auth/login', authController.postLogin);

router.get('/auth/register', authController.getRegister);

router.post('/auth/register', authController.postRegister);

router.post('/auth/logout', authController.postLogout);

module.exports = router;