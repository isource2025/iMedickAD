const express = require('express');
const router = express.Router();
const visitsController = require('../controllers/visits.controller');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/visits/patient/:numeroDocumento?page=1&limit=50
router.get('/patient/:numeroDocumento', visitsController.obtenerVisitasPorPaciente);

// GET /api/visits/:numeroVisita
router.get('/:numeroVisita', visitsController.obtenerVisita);

module.exports = router;
