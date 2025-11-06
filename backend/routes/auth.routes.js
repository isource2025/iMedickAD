const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verify (requiere autenticación)
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
