const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin, handleValidation } = require('../middleware/validationMiddleware');

router.post('/signup', validateSignup, handleValidation, signup);
router.post('/login',  validateLogin,  handleValidation, login);
router.get('/me',      protect, getMe);
router.get('/users',   protect, authorize('Admin'), getAllUsers);

module.exports = router;
