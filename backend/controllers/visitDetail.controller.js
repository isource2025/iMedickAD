const visitDetailService = require('../services/visitDetail.service');

class VisitDetailController {
  /**
   * Obtener detalle completo de una visita
   */
  async obtenerDetalleCompleto(req, res) {
    try {
      const { numeroVisita } = req.params;
      
      console.log(`📋 Solicitando detalle de visita: ${numeroVisita}`);
      
      const detalle = await visitDetailService.obtenerDetalleCompleto(numeroVisita);
      
      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: detalle
      });
    } catch (error) {
      console.error('Error al obtener detalle de visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle de visita'
      });
    }
  }
}

module.exports = new VisitDetailController();
