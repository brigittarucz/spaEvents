// Define the path / HTTP method which controller code should execute
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/authenticate', authController.getAuth);

module.exports = router;