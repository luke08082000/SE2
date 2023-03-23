const express = require('express');
const commonController = require('../controllers/common')
const router = express.Router();

router.get('/404', commonController.get404)

module.exports = router;