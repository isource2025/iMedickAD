const { getConnection, sql } = require('../config/db');
const { clarionToDate, clarionToTime } = require('../utils/dateConverter');

class VisitDetailService {
  /**
   * Obtener detalle completo de una visita
   */
  async obtenerDetalleCompleto(numeroVisita) {
    try {
      const pool = await getConnection();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔍 OBTENIENDO DETALLE COMPLETO DE VISITA:', numeroVisita);
      console.log('═══════════════════════════════════════════════════════');
      
      // Obtener datos relacionados en paralelo
      const [visita, hci, medicamentos, evoluciones, practicas, epicrisis] = await Promise.all([
        this.obtenerVisitaBasica(pool, numeroVisita),
        this.obtenerHCI(pool, numeroVisita),
        this.obtenerMedicamentos(pool, numeroVisita),
        this.obtenerEvoluciones(pool, numeroVisita),
        this.obtenerPracticas(pool, numeroVisita),
        this.obtenerEpicrisis(pool, numeroVisita)
      ]);
      
      if (!visita) {
        console.log('❌ Visita no encontrada');
        return null;
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ RESUMEN DEL DETALLE OBTENIDO:');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Visita:', visita.numeroVisita);
      console.log('👤 Paciente:', visita.paciente.apellidoNombre);
      console.log('📄 HC Ingreso:', hci ? '✅ SÍ' : '❌ NO');
      console.log('💊 Medicamentos:', medicamentos.length);
      console.log('📝 Evoluciones:', evoluciones.length);
      console.log('🏥 Prácticas:', practicas.length);
      console.log('📋 Epicrisis:', epicrisis ? '✅ SÍ' : '❌ NO');
      console.log('═══════════════════════════════════════════════════════');
      
      return {
        visita,
        historiaClinicaIngreso: hci,
        medicamentos,
        evoluciones,
        practicas,
        epicrisis
      };
    } catch (error) {
      console.error('Error al obtener detalle de visita:', error);
      throw error;
    }
  }
  
  /**
   * Obtener datos básicos de la visita
   */
  async obtenerVisitaBasica(pool, numeroVisita) {
    console.log('🔍 [1/6] Obteniendo datos básicos de visita...');
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          v.NUMEROVISITA as NumeroVisita,
          p.NumeroDocumento,
          p.ApellidoyNombre,
          p.FechaNacimiento,
          p.Sexo,
          v.FECHAADMISIONS as FechaAdmision,
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
        WHERE v.NUMEROVISITA = @numeroVisita
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const v = result.recordset[0];
    
    return {
      numeroVisita: v.NumeroVisita,
      paciente: {
        numeroDocumento: v.NumeroDocumento,
        apellidoNombre: v.ApellidoyNombre,
        fechaNacimiento: clarionToDate(v.FechaNacimiento),
        sexo: v.Sexo
      },
      fechaAdmision: v.FechaAdmision,
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
  }
  
  /**
   * Obtener Historia Clínica de Ingreso
   */
  async obtenerHCI(pool, numeroVisita) {
    console.log('🔍 [2/6] Buscando Historia Clínica de Ingreso...');
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT *
        FROM imHCI
        WHERE NumeroVisita = @numeroVisita
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    // Retornar todos los campos tal como vienen de la BD
    return result.recordset[0];
  }
  
  /**
   * Obtener medicamentos
   */
  async obtenerMedicamentos(pool, numeroVisita) {
    console.log('🔍 [3/6] Buscando medicamentos...');
    try {
      const result = await pool.request()
        .input('numeroVisita', sql.Int, numeroVisita)
        .query(`
          SELECT TOP 100
            IDCtrlMedica,
            NumeroVisita,
            FechaControl,
            HoraControl,
            Troquel,
            Cantidad,
            TipoUnidad,
            Observaciones,
            Profesional
          FROM imInterCtrlMedicamento
          WHERE NumeroVisita = @numeroVisita
          ORDER BY FechaControl DESC, HoraControl DESC
        `);
      
      return result.recordset.map(m => ({
        id: m.IDCtrlMedica,
        fecha: m.FechaControl ? clarionToDate(m.FechaControl) : null,
        hora: m.HoraControl ? clarionToTime(m.HoraControl) : '00:00:00',
        troquel: m.Troquel || 0,
        cantidad: m.Cantidad || 0,
        tipoUnidad: m.TipoUnidad ? m.TipoUnidad.trim() : '',
        observaciones: m.Observaciones || '',
        profesional: m.Profesional || 0
      }));
    } catch (error) {
      console.error('Error al obtener medicamentos:', error);
      return []; // Retornar array vacío si hay error
    }
  }
  
  /**
   * Obtener evoluciones
   */
  async obtenerEvoluciones(pool, numeroVisita) {
    console.log('🔍 [4/6] Buscando evoluciones...');
    console.log('   → IdVisita a buscar:', numeroVisita);
    
    const result = await pool.request()
      .input('idVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          IdHCEvolucion,
          IdVisita,
          FechaEv,
          HoraEv,
          Profecional,
          Evolucion
        FROM imHCEvolucion
        WHERE IdVisita = @idVisita
        ORDER BY FechaEv DESC, HoraEv DESC
      `);
    
    console.log('   ✅ Evoluciones encontradas:', result.recordset.length);
    if (result.recordset.length > 0) {
      console.log('   → Primera evolución:');
      console.log('      - ID:', result.recordset[0].IdHCEvolucion);
      console.log('      - Fecha:', result.recordset[0].FechaEv);
      console.log('      - Preview:', result.recordset[0].Evolucion ? result.recordset[0].Evolucion.substring(0, 80) + '...' : 'Sin texto');
    } else {
      console.log('   ⚠️  NO se encontraron evoluciones para IdVisita =', numeroVisita);
    }
    
    return result.recordset.map(e => ({
      id: e.IdHCEvolucion,
      fecha: e.FechaEv ? clarionToDate(e.FechaEv) : null,
      hora: e.HoraEv ? clarionToTime(e.HoraEv) : '00:00:00',
      profesional: e.Profecional || 0,
      evolucion: e.Evolucion || ''
    }));
  }
  
  /**
   * Obtener prácticas médicas
   */
  async obtenerPracticas(pool, numeroVisita) {
    console.log('🔍 [5/6] Buscando prácticas médicas...');
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT TOP 100
          Valor,
          NumeroVisita,
          TipoPractica,
          Practica,
          CantidadPractica,
          FechaPractica,
          HoraPracticaInicio,
          HoraPracticaFin,
          Observaciones
        FROM imFacPracticas
        WHERE NumeroVisita = @numeroVisita
        ORDER BY FechaPractica DESC
      `);
    
    return result.recordset.map(p => ({
      id: p.Valor,
      tipo: p.TipoPractica ? p.TipoPractica.trim() : '',
      practica: p.Practica || 0,
      cantidad: p.CantidadPractica || 0,
      fecha: p.FechaPractica ? clarionToDate(p.FechaPractica) : null,
      horaInicio: p.HoraPracticaInicio ? clarionToTime(p.HoraPracticaInicio) : '00:00:00',
      horaFin: p.HoraPracticaFin ? clarionToTime(p.HoraPracticaFin) : '00:00:00',
      observaciones: p.Observaciones || ''
    }));
  }
  
  /**
   * Obtener epicrisis
   */
  async obtenerEpicrisis(pool, numeroVisita) {
    console.log('🔍 [6/6] Buscando epicrisis...');
    const result = await pool.request()
      .input('idVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          IdHCEpicrisis,
          IdVisita,
          Fecha,
          Hora,
          Profecional,
          Epicrisis,
          Diagnostico,
          DiagnosticoText
        FROM imHCEpicrisis
        WHERE IdVisita = @idVisita
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const e = result.recordset[0];
    
    return {
      id: e.IdHCEpicrisis,
      fecha: e.Fecha,
      hora: e.Hora ? clarionToTime(e.Hora) : '00:00:00',
      profesional: e.Profecional || 0,
      epicrisis: e.Epicrisis || '',
      diagnostico: e.Diagnostico ? e.Diagnostico.trim() : '',
      diagnosticoTexto: e.DiagnosticoText || ''
    };
  }
}

module.exports = new VisitDetailService();
