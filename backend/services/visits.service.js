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
        .query(`
          SELECT COUNT(*) as total
          FROM imVisita v
          INNER JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
          WHERE p.NumeroDocumento = @numeroDocumento
        `);
      
      const totalCount = countResult.recordset[0].total;
      
      // Obtener datos
      const dataResult = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .query(`
          SELECT 
            v.NUMEROVISITA as NumeroVisita,
            p.NumeroDocumento,
            v.FECHAADMISIONS as FechaAdmision,
            0 as HoraAdmision,
            v.FECHAEGRESO as FechaEgreso,
            v.HORAEGRESO as HoraEgreso,
            v.SERVICIOHOSPITAL as Hospital,
            v.VALORSECTOR as Sector,
            v.CLASEPACIENTE as ClasePaciente,
            v.TIPOADMISION as TipoIngreso,
            v.ESTADO,
            v.OBSERVACIONES as Observaciones,
            v.DIAGNOSTICO as CodigoOMS,
            d.Descripcion as DescripcionDiagnostico
          FROM imVisita v
          INNER JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
          LEFT JOIN imDiagnosticos d ON v.DIAGNOSTICO = d.CodigoOMS
          WHERE p.NumeroDocumento = @numeroDocumento
          ORDER BY v.FECHAADMISIONS DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${limit} ROWS ONLY
        `);
      
      console.log('📋 Visitas obtenidas:', dataResult.recordset.length);
      if (dataResult.recordset.length > 0) {
        console.log('🔍 Primera visita (RAW):', JSON.stringify(dataResult.recordset[0], null, 2));
      }
      
      // Procesar datos
      const visitas = dataResult.recordset.map(v => {
        console.log('🔄 Procesando visita:', v.NumeroVisita, {
          FechaAdmision: v.FechaAdmision,
          FechaEgreso: v.FechaEgreso,
          Hospital: v.Hospital,
          Sector: v.Sector,
          ClasePaciente: v.ClasePaciente,
          TipoIngreso: v.TipoIngreso,
          Estado: v.Estado,
          CodigoOMS: v.CodigoOMS,
          DescripcionDiagnostico: v.DescripcionDiagnostico
        });
        return {
          numeroVisita: v.NumeroVisita,
          numeroDocumento: v.NumeroDocumento,
          fechaAdmision: v.FechaAdmision, // Ya es datetime de SQL Server
          horaAdmision: v.FechaAdmision ? new Date(v.FechaAdmision).toLocaleTimeString('es-AR') : '00:00:00',
          fechaEgreso: v.FechaEgreso ? clarionToDate(v.FechaEgreso) : null,
          horaEgreso: v.HoraEgreso ? clarionToTime(v.HoraEgreso) : '00:00:00',
          hospital: v.Hospital || '',
          sector: v.Sector || '',
          clasePaciente: v.ClasePaciente || '',
          tipoIngreso: v.TipoIngreso || '',
          estado: v.Estado || '',
          observaciones: v.Observaciones || '',
          diagnostico: v.CodigoOMS ? v.CodigoOMS.trim() : '',
          descripcionDiagnostico: v.DescripcionDiagnostico ? v.DescripcionDiagnostico.trim() : ''
        };
      });
      
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
        .query(`
          SELECT 
            v.NUMEROVISITA as NumeroVisita,
            p.NumeroDocumento,
            v.FECHAADMISIONS as FechaAdmision,
            0 as HoraAdmision,
            v.FECHAEGRESO as FechaEgreso,
            v.HORAEGRESO as HoraEgreso,
            v.SERVICIOHOSPITAL as Hospital,
            v.VALORSECTOR as Sector,
            v.CLASEPACIENTE as ClasePaciente,
            v.TIPOADMISION as TipoIngreso,
            v.ESTADO,
            v.OBSERVACIONES as Observaciones,
            p.ApellidoyNombre,
            p.FechaNacimiento,
            p.Sexo,
            v.DIAGNOSTICO as CodigoOMS,
            d.Descripcion as DescripcionDiagnostico
          FROM imVisita v
          INNER JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
          LEFT JOIN imDiagnosticos d ON v.DIAGNOSTICO = d.CodigoOMS
          WHERE v.NUMEROVISITA = @numeroVisita
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
        fechaAdmision: v.FechaAdmision, // Ya es datetime de SQL Server
        horaAdmision: v.FechaAdmision ? new Date(v.FechaAdmision).toLocaleTimeString('es-AR') : '00:00:00',
        fechaEgreso: v.FechaEgreso ? clarionToDate(v.FechaEgreso) : null,
        horaEgreso: v.HoraEgreso ? clarionToTime(v.HoraEgreso) : '00:00:00',
        hospital: v.Hospital || '',
        sector: v.Sector || '',
        clasePaciente: v.ClasePaciente || '',
        tipoIngreso: v.TipoIngreso || '',
        estado: v.Estado || '',
        observaciones: v.Observaciones || '',
        diagnostico: v.CodigoOMS ? v.CodigoOMS.trim() : '',
        descripcionDiagnostico: v.DescripcionDiagnostico ? v.DescripcionDiagnostico.trim() : ''
      };
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }
}

module.exports = new VisitsService();
