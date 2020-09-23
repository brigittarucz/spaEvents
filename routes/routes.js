// Define the path / HTTP method which controller code should execute
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const eventsController = require('../controllers/events');
const profileController = require('../controllers/profile');

router.get('/authenticate', authController.getAuth);
router.post('/authenticate/:action', authController.postAuth);

router.get('/home/events', eventsController.getEvents);
router.post('/home/events', eventsController.postAddEvent);

router.get('/home/profile', profileController.getProfile);
router.post('/home/profile', profileController.postProfile);
router.post('/home/event-delete', profileController.postDeleteFromCalendar);

module.exports = router;