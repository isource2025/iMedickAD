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
      const [visita, hci, medicamentos, evoluciones, practicas, epicrisis, estudios] = await Promise.all([
        this.obtenerVisitaBasica(pool, numeroVisita),
        this.obtenerHCI(pool, numeroVisita),
        this.obtenerMedicamentos(pool, numeroVisita),
        this.obtenerEvoluciones(pool, numeroVisita),
        this.obtenerPracticas(pool, numeroVisita),
        this.obtenerEpicrisis(pool, numeroVisita),
        this.obtenerEstudios(pool, numeroVisita)
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
      console.log('🔬 Estudios:', estudios.length);
      console.log('📋 Epicrisis:', epicrisis ? '✅ SÍ' : '❌ NO');
      console.log('═══════════════════════════════════════════════════════');
      
      return {
        visita,
        historiaClinicaIngreso: hci,
        medicamentos,
        evoluciones,
        practicas,
        epicrisis,
        estudios
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
        SELECT 
          hci.*,
          p.Matricula as MatriculaProfesional,
          p.ApellidoNombre as NombreProfesional,
          RTRIM(LTRIM(hci.IdSector)) as DescripcionSector
        FROM imHCI hci
        LEFT JOIN imPersonal p ON CAST(hci.IdProfecional AS INT) = CAST(p.Matricula AS INT)
        WHERE hci.NumeroVisita = @numeroVisita
        ORDER BY hci.Fecha DESC
      `);
    
    console.log('   ✅ HCI encontradas:', result.recordset.length);
    if (result.recordset.length > 0) {
      console.log('   📋 Primera HCI - Profesional:', result.recordset[0].IdProfecional, '-', result.recordset[0].MatriculaProfesional, '-', result.recordset[0].NombreProfesional);
      console.log('   📋 Primera HCI - Sector:', result.recordset[0].IdSector, '->', result.recordset[0].DescripcionSector);
    }
    
    // Retornar todas las HCI como array
    return result.recordset;
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
            m.IDCtrlMedica,
            m.NumeroVisita,
            m.FechaControl,
            m.HoraControl,
            m.Troquel,
            v.Nombre as NombreMedicamento,
            v.Laboratorio,
            v.Presentacion,
            m.Cantidad,
            m.TipoUnidad,
            m.Observaciones,
            m.Profesional
          FROM imInterCtrlMedicamento m
          LEFT JOIN imVademecum v ON m.Troquel = v.Troquel
          WHERE m.NumeroVisita = @numeroVisita
          ORDER BY m.FechaControl DESC, m.HoraControl DESC
        `);
      
      return result.recordset.map(m => ({
        id: m.IDCtrlMedica,
        fecha: m.FechaControl ? clarionToDate(m.FechaControl) : null,
        hora: m.HoraControl ? clarionToTime(m.HoraControl) : '00:00:00',
        troquel: m.Troquel || 0,
        nombreMedicamento: m.NombreMedicamento || 'Medicamento no encontrado',
        laboratorio: m.Laboratorio || '',
        presentacion: m.Presentacion || '',
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
          e.IdHCEvolucion,
          e.IdVisita,
          e.FechaEv,
          e.HoraEv,
          e.Profecional,
          e.Evolucion,
          p.ApellidoNombre as NombreProfesional
        FROM imHCEvolucion e
        LEFT JOIN imPersonal p ON e.Profecional = p.Matricula
        WHERE e.IdVisita = @idVisita
        ORDER BY e.FechaEv DESC, e.HoraEv DESC
      `);
    
    console.log('   ✅ Evoluciones encontradas:', result.recordset.length);
    if (result.recordset.length > 0) {
      console.log('   → Primera evolución:');
      console.log('      - ID:', result.recordset[0].IdHCEvolucion);
      console.log('      - Fecha:', result.recordset[0].FechaEv);
      console.log('      - Profesional:', result.recordset[0].Profecional, '-', result.recordset[0].NombreProfesional || 'Sin nombre');
      console.log('      - Preview:', result.recordset[0].Evolucion ? result.recordset[0].Evolucion.substring(0, 80) + '...' : 'Sin texto');
    } else {
      console.log('   ⚠️  NO se encontraron evoluciones para IdVisita =', numeroVisita);
    }
    
    return result.recordset.map(e => ({
      id: e.IdHCEvolucion,
      fecha: e.FechaEv ? clarionToDate(e.FechaEv) : null,
      hora: e.HoraEv ? clarionToTime(e.HoraEv) : '00:00:00',
      profesionalId: e.Profecional || 0,
      profesionalNombre: e.NombreProfesional || null,
      profesionalUsuario: null,
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
          p.Valor,
          p.NumeroVisita,
          p.TipoPractica,
          p.Practica,
          n.Descripcion as NombrePractica,
          n.Tipo as TipoNomenclador,
          p.CantidadPractica,
          p.FechaPractica,
          p.HoraPracticaInicio,
          p.HoraPracticaFin,
          p.Observaciones
        FROM imFacPracticas p
        LEFT JOIN VUnionModuladasNomenclador n ON p.Practica = n.IDPractica
        WHERE p.NumeroVisita = @numeroVisita
        ORDER BY p.FechaPractica DESC
      `);
    
    return result.recordset.map(p => ({
      id: p.Valor,
      tipo: p.TipoPractica ? p.TipoPractica.trim() : '',
      practica: p.Practica || 0,
      nombrePractica: p.NombrePractica || 'Práctica no encontrada',
      tipoNomenclador: p.TipoNomenclador ? p.TipoNomenclador.trim() : '',
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
          ep.IdHCEpicrisis,
          ep.IdVisita,
          ep.Fecha,
          ep.Hora,
          ep.Profecional,
          ep.Epicrisis,
          ep.Diagnostico,
          ep.DiagnosticoText,
          p.ApellidoNombre as NombreProfesional
        FROM imHCEpicrisis ep
        LEFT JOIN imPersonal p ON ep.Profecional = p.Matricula
        WHERE ep.IdVisita = @idVisita
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const e = result.recordset[0];
    
    return {
      id: e.IdHCEpicrisis,
      fecha: e.Fecha,
      hora: e.Hora ? clarionToTime(e.Hora) : '00:00:00',
      profesionalId: e.Profecional || 0,
      profesionalNombre: e.NombreProfesional || null,
      profesionalUsuario: null,
      epicrisis: e.Epicrisis || '',
      diagnostico: e.Diagnostico ? e.Diagnostico.trim() : '',
      diagnosticoTexto: e.DiagnosticoText || ''
    };
  }

  /**
   * Obtener estudios (pedidos y resultados)
   */
  async obtenerEstudios(pool, numeroVisita) {
    console.log('🔍 [7/7] Buscando estudios y resultados...');
    try {
      const result = await pool.request()
        .input('idVisita', sql.Int, numeroVisita)
        .query(`
          SELECT 
            pe.IdPedido,
            pe.FechaPedido,
            pe.NotasObservacion as PedidoEstudio,
            pe.IdProtocolo,
            pe.EstadoUrgencia,
            pr.IdProtocolo as ProtocoloResultadoId,
            pr.FechaResultado,
            pr.FechaCarga,
            pr.TextoProtocolo as ResultadoEstudio,
            pr.NroProtocolo,
            pr.Estado as EstadoResultado
          FROM imPedidosEstudios pe
          LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
          WHERE pe.IdVisita = @idVisita
          ORDER BY pe.FechaPedido DESC
        `);
      
      // Obtener TODOS los adjuntos de la visita (una sola vez)
      const adjuntosResult = await pool.request()
        .input('numeroVisita', sql.Int, numeroVisita)
        .query(`
          SELECT 
            IdAdjunto,
            NumeroVisita,
            IdProtocolo,
            Patch,
            PatchServidor,
            Descripcion,
            Fecha
          FROM imPedidosEstudiosAdjuntos
          WHERE NumeroVisita = @numeroVisita
        `);
      
      console.log(`   → Adjuntos encontrados: ${adjuntosResult.recordset.length}`);
      
      // Crear estudios y asignar adjuntos
      const estudios = [];
      for (const e of result.recordset) {
        // Filtrar adjuntos que corresponden a este estudio (por IdProtocolo)
        // Si IdProtocolo es 0 o NULL, asignar todos los adjuntos sin protocolo
        const adjuntosDelEstudio = adjuntosResult.recordset.filter(adj => {
          if (e.IdProtocolo && e.IdProtocolo !== 0) {
            return adj.IdProtocolo === e.IdProtocolo;
          }
          // Si el estudio no tiene protocolo, incluir adjuntos sin protocolo
          return !adj.IdProtocolo || adj.IdProtocolo === 0;
        });
        
        estudios.push({
          id: e.IdPedido,
          fechaPedido: e.FechaPedido || null,
          pedidoEstudio: e.PedidoEstudio || '',
          idProtocolo: e.IdProtocolo || null,
          estadoUrgencia: e.EstadoUrgencia ? e.EstadoUrgencia.trim() : '',
          // Datos del resultado
          tieneResultado: !!e.ProtocoloResultadoId,
          fechaResultado: e.FechaResultado || null,
          fechaCarga: e.FechaCarga || null,
          resultadoEstudio: e.ResultadoEstudio || '',
          nroProtocolo: e.NroProtocolo ? e.NroProtocolo.trim() : '',
          estadoResultado: e.EstadoResultado ? e.EstadoResultado.trim() : '',
          // Adjuntos
          adjuntos: adjuntosDelEstudio.map(adj => ({
            id: adj.IdAdjunto,
            numeroVisita: adj.NumeroVisita,
            idProtocolo: adj.IdProtocolo,
            pathServidor: adj.PatchServidor || adj.Patch || '',
            nombreArchivo: adj.Descripcion || '',
            fechaSubida: adj.Fecha || null
          }))
        });
      }
      
      return estudios;
    } catch (error) {
      console.error('Error al obtener estudios:', error);
      return []; // Retornar array vacío si hay error
    }
  }
}

module.exports = new VisitDetailService();
