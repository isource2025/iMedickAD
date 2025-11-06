import { VisitsResponse, VisitDetail } from '@/types/visit';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class VisitService {
  /**
   * Obtener visitas de un paciente
   */
  async obtenerVisitasPorPaciente(
    numeroDocumento: string,
    page: number = 1,
    limit: number = 50
  ): Promise<VisitsResponse> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_URL}/visits/patient/${numeroDocumento}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener visitas');
      }

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de una visita
   */
  async obtenerVisita(numeroVisita: string): Promise<VisitDetail> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/visits/${numeroVisita}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener visita');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }
}

export default new VisitService();
