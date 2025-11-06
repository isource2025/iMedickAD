const patientsService = require('../services/patients.service');

class PatientsController {
  async buscarPacientes(req, res) {
    try {
      const { hospitalAsignado } = req.user;
      const { search = '', page = 1, limit = 30 } = req.query;
      
      const result = await patientsService.buscarPacientes(
        hospitalAsignado,
        search,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar pacientes'
      });
    }
  }
  
  async obtenerPaciente(req, res) {
    try {
      const { numeroDocumento } = req.params;
      const { hospitalAsignado } = req.user;
      
      const paciente = await patientsService.obtenerPacientePorDocumento(
        numeroDocumento,
        hospitalAsignado
      );
      
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: paciente
      });
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener paciente'
      });
    }
  }
}

module.exports = new PatientsController();
