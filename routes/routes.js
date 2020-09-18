// Define the path / HTTP method which controller code should execute
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const eventsController = require('../controllers/events');

router.get('/authenticate', authController.getAuth);
router.post('/authenticate/:action', authController.postAuth);

router.get('/home', eventsController.getEvents);

module.exports = router;