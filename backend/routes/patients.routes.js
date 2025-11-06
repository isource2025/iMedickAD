const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patients.controller');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/patients?search=&page=1&limit=30
router.get('/', patientsController.buscarPacientes);

// GET /api/patients/:numeroDocumento
router.get('/:numeroDocumento', patientsController.obtenerPaciente);

module.exports = router;
