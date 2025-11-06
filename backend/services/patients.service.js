const { getConnection, sql } = require('../config/db');
const { clarionToDate } = require('../utils/dateConverter');

class PatientsService {
  /**
   * Buscar pacientes por hospital
   */
  async buscarPacientes(hospitalAsignado, searchTerm = '', page = 1, limit = 30) {
    try {
      console.log('🔍 buscarPacientes - Parámetros:', { hospitalAsignado, searchTerm, page, limit });
      
      const pool = await getConnection();
      const offset = (page - 1) * limit;
      
      // Query de búsqueda
      let whereClause = '1=1';
      const params = [];
      
      if (searchTerm && searchTerm.length >= 3) {
        whereClause += ` AND (
          p.ApellidoyNombre LIKE @searchTerm
          OR p.NumeroDocumento LIKE @searchTerm
        )`;
        params.push({ name: 'searchTerm', type: sql.VarChar, value: `%${searchTerm}%` });
      }
      
      console.log('📝 whereClause:', whereClause);
      console.log('📝 params:', params);
      
      // Contar total
      const countRequest = pool.request();
      params.forEach(param => {
        countRequest.input(param.name, param.type, param.value);
      });
      
      const countQuery = `
        SELECT COUNT(DISTINCT p.NumeroDocumento) as total
        FROM imPacientes p
        WHERE ${whereClause}
      `;
      
      console.log('🔢 COUNT Query:', countQuery);
      
      const countResult = await countRequest.query(countQuery);
      
      const totalCount = countResult.recordset[0].total;
      console.log('📊 Total encontrado:', totalCount);
      
      // Obtener datos paginados
      const dataRequest = pool.request();
      params.forEach(param => {
        dataRequest.input(param.name, param.type, param.value);
      });
      
      const dataQuery = `
        SELECT DISTINCT
          p.NumeroDocumento,
          p.ApellidoyNombre,
          p.FechaNacimiento,
          p.Sexo,
          p.TelefonoParticular as Telefono,
          p.Domicilio,
          p.Mail as Email,
          (SELECT COUNT(*) 
           FROM imVisita v2 
           WHERE v2.IDPACIENTE = p.IdPaciente) as TotalVisitas
        FROM imPacientes p
        WHERE ${whereClause}
        ORDER BY p.ApellidoyNombre
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
      `;
      
      console.log('📋 DATA Query:', dataQuery);
      
      const dataResult = await dataRequest.query(dataQuery);
      
      console.log('✅ Registros obtenidos:', dataResult.recordset.length);
      
      // Procesar datos
      const pacientes = dataResult.recordset.map(p => ({
        numeroDocumento: p.NumeroDocumento,
        apellidoNombre: p.ApellidoyNombre,
        fechaNacimiento: clarionToDate(p.FechaNacimiento),
        sexo: p.Sexo,
        telefono: p.Telefono,
        domicilio: p.Domicilio,
        email: p.Email,
        totalVisitas: p.TotalVisitas
      }));
      
      return {
        data: pacientes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      };
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      throw error;
    }
  }
  
  /**
   * Obtener paciente por documento
   */
  async obtenerPacientePorDocumento(numeroDocumento, hospitalAsignado) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .query(`
          SELECT 
            p.NumeroDocumento,
            p.ApellidoyNombre,
            p.FechaNacimiento,
            p.Sexo,
            p.TelefonoParticular as Telefono,
            p.Domicilio,
            p.ValorLocalidad as Localidad,
            p.Mail as Email,
            (SELECT COUNT(*) 
             FROM imVisita v 
             WHERE v.IDPACIENTE = p.IdPaciente) as TotalVisitas
          FROM imPacientes p
          WHERE p.NumeroDocumento = @numeroDocumento
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const p = result.recordset[0];
      
      return {
        numeroDocumento: p.NumeroDocumento,
        apellidoNombre: p.ApellidoyNombre,
        fechaNacimiento: clarionToDate(p.FechaNacimiento),
        sexo: p.Sexo,
        telefono: p.Telefono,
        domicilio: p.Domicilio,
        localidad: p.Localidad,
        email: p.Email,
        totalVisitas: p.TotalVisitas
      };
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw error;
    }
  }
}

module.exports = new PatientsService();
