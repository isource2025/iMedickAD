const { getConnection, sql } = require('../config/db');
const { clarionToDate, clarionToTime } = require('../utils/dateConverter');

class VisitsService {
  /**
   * Obtener visitas de un paciente por hospital
   */
  async obtenerVisitasPorPaciente(numeroDocumento, hospitalAsignado, page = 1, limit = 50) {
    try {
      const pool = await getConnection();
      const offset = (page - 1) * limit;
      
      // Contar total
      const countResult = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT COUNT(*) as total
          FROM imVisita
          WHERE NumeroDocumento = @numeroDocumento
          AND Hospital = @hospital
        `);
      
      const totalCount = countResult.recordset[0].total;
      
      // Obtener datos
      const dataResult = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT 
            v.NumeroVisita,
            v.NumeroDocumento,
            v.FechaAdmision,
            v.HoraAdmision,
            v.FechaEgreso,
            v.HoraEgreso,
            v.Hospital,
            v.Sector,
            v.ClasePaciente,
            v.TipoIngreso,
            v.Estado,
            v.Observaciones,
            d.Diagnostico,
            d.TipoDiagnostico
          FROM imVisita v
          LEFT JOIN imDiagnosticos d ON v.NumeroVisita = d.NumeroVisita
          WHERE v.NumeroDocumento = @numeroDocumento
          AND v.Hospital = @hospital
          ORDER BY v.FechaAdmision DESC, v.HoraAdmision DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${limit} ROWS ONLY
        `);
      
      // Procesar datos
      const visitas = dataResult.recordset.map(v => ({
        numeroVisita: v.NumeroVisita,
        numeroDocumento: v.NumeroDocumento,
        fechaAdmision: clarionToDate(v.FechaAdmision),
        horaAdmision: clarionToTime(v.HoraAdmision),
        fechaEgreso: clarionToDate(v.FechaEgreso),
        horaEgreso: clarionToTime(v.HoraEgreso),
        hospital: v.Hospital,
        sector: v.Sector,
        clasePaciente: v.ClasePaciente,
        tipoIngreso: v.TipoIngreso,
        estado: v.Estado,
        observaciones: v.Observaciones,
        diagnostico: v.Diagnostico,
        tipoDiagnostico: v.TipoDiagnostico
      }));
      
      return {
        data: visitas,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      };
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener detalle de una visita específica
   */
  async obtenerVisitaPorId(numeroVisita, hospitalAsignado) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('numeroVisita', sql.VarChar, numeroVisita)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT 
            v.NumeroVisita,
            v.NumeroDocumento,
            v.FechaAdmision,
            v.HoraAdmision,
            v.FechaEgreso,
            v.HoraEgreso,
            v.Hospital,
            v.Sector,
            v.ClasePaciente,
            v.TipoIngreso,
            v.Estado,
            v.Observaciones,
            p.ApellidoyNombre,
            p.FechaNacimiento,
            p.Sexo,
            d.Diagnostico,
            d.TipoDiagnostico
          FROM imVisita v
          INNER JOIN imPaciente p ON v.NumeroDocumento = p.NumeroDocumento
          LEFT JOIN imDiagnosticos d ON v.NumeroVisita = d.NumeroVisita
          WHERE v.NumeroVisita = @numeroVisita
          AND v.Hospital = @hospital
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const v = result.recordset[0];
      
      return {
        numeroVisita: v.NumeroVisita,
        numeroDocumento: v.NumeroDocumento,
        paciente: {
          apellidoNombre: v.ApellidoyNombre,
          fechaNacimiento: clarionToDate(v.FechaNacimiento),
          sexo: v.Sexo
        },
        fechaAdmision: clarionToDate(v.FechaAdmision),
        horaAdmision: clarionToTime(v.HoraAdmision),
        fechaEgreso: clarionToDate(v.FechaEgreso),
        horaEgreso: clarionToTime(v.HoraEgreso),
        hospital: v.Hospital,
        sector: v.Sector,
        clasePaciente: v.ClasePaciente,
        tipoIngreso: v.TipoIngreso,
        estado: v.Estado,
        observaciones: v.Observaciones,
        diagnostico: v.Diagnostico,
        tipoDiagnostico: v.TipoDiagnostico
      };
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }
}

module.exports = new VisitsService();
