const visitsService = require('../services/visits.service');

class VisitsController {
  async obtenerVisitasPorPaciente(req, res) {
    try {
      const { numeroDocumento } = req.params;
      const { hospitalAsignado } = req.user;
      const { page = 1, limit = 50 } = req.query;
      
      const result = await visitsService.obtenerVisitasPorPaciente(
        numeroDocumento,
        hospitalAsignado,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visitas'
      });
    }
  }
  
  async obtenerVisita(req, res) {
    try {
      const { numeroVisita } = req.params;
      const { hospitalAsignado } = req.user;
      
      const visita = await visitsService.obtenerVisitaPorId(
        numeroVisita,
        hospitalAsignado
      );
      
      if (!visita) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: visita
      });
    } catch (error) {
      console.error('Error al obtener visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visita'
      });
    }
  }
}

module.exports = new VisitsController();
