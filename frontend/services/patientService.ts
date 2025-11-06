import { PatientsResponse, Patient } from '@/types/patient';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class PatientService {
  /**
   * Buscar pacientes
   */
  async buscarPacientes(
    search: string = '',
    page: number = 1,
    limit: number = 30
  ): Promise<PatientsResponse> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_URL}/patients?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar pacientes');
      }

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      throw error;
    }
  }

  /**
   * Obtener paciente por documento
   */
  async obtenerPaciente(numeroDocumento: string): Promise<Patient> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${numeroDocumento}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener paciente');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw error;
    }
  }
}

export default new PatientService();
