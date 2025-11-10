import { VisitDetail } from '@/types/visitDetail';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class VisitDetailService {
  /**
   * Obtener detalle completo de una visita
   */
  async obtenerDetalleCompleto(numeroVisita: string): Promise<VisitDetail> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/visits/${numeroVisita}/detalle`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener detalle de visita');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener detalle de visita:', error);
      throw error;
    }
  }
}

export default new VisitDetailService();
