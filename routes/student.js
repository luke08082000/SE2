const express = require('express');

const router = express.Router();

router.get('/home', (req, res) => {
    res.render('student/home');
});

router.get('/activities', (req, res) => {
    res.render('student/activities');
});

router.get('/capstone-projects', (req, res) => {
    res.render('student/capstone-projects');
});

router.get('/group', (req, res) => {
    res.render('student/group');
});

module.exports = router;
