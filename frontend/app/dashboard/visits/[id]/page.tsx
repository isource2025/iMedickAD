'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import visitDetailService from '@/services/visitDetailService';
import { VisitDetail } from '@/types/visitDetail';
import { rtfToText } from '@/utils/rtfToText';
import styles from './styles.module.css';

export default function VisitDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [detalle, setDetalle] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hci');

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setLoading(true);
        const data = await visitDetailService.obtenerDetalleCompleto(id);
        setDetalle(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar el detalle de la visita');
      } finally {
        setLoading(false);
      }
    };

    cargarDetalle();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    // Si es formato ISO date (YYYY-MM-DD), parsearlo como fecha local
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return `${day}/${month}/${year}`;
    }
    // Para otros formatos, usar Date
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  const renderHCISection = (title: string, fields: Array<{label: string, field: string}>, data: any) => {
    // Verificar si algún campo tiene datos
    const hasData = fields.some(f => data[f.field] && data[f.field].toString().trim() !== '');
    
    if (!hasData) return null;
    
    // Detectar si es un campo de texto largo (solo 1 campo)
    const isFullWidthField = fields.length === 1;
    
    return (
      <div className={styles.hciSection} key={title}>
        <h3 className={styles.hciSectionTitle}>{title}</h3>
        <div className={isFullWidthField ? styles.hciFieldsFullWidth : styles.hciFields}>
          {fields.map(({label, field}) => {
            const value = data[field];
            if (!value || value.toString().trim() === '') return null;
            
            return (
              <div key={field} className={isFullWidthField ? styles.hciFieldFullWidth : styles.hciField}>
                <span className={styles.hciLabel}>{label}:</span>
                <span className={styles.hciValue}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando detalle de visita...</div>
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Visita no encontrada'}</div>
        <button onClick={() => router.back()} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Volver
        </button>
        <h1>Detalle de Visita #{detalle.visita.numeroVisita}</h1>
      </div>

      {/* Información del Paciente */}
      <div className={styles.patientInfo}>
        <h2>Información del Paciente</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Nombre:</span>
            <span className={styles.value}>{detalle.visita.paciente.apellidoNombre}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Documento:</span>
            <span className={styles.value}>{detalle.visita.paciente.numeroDocumento}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha Nacimiento:</span>
            <span className={styles.value}>{formatDate(detalle.visita.paciente.fechaNacimiento)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Sexo:</span>
            <span className={styles.value}>{detalle.visita.paciente.sexo}</span>
          </div>
        </div>
      </div>

      {/* Información de la Visita */}
      <div className={styles.visitInfo}>
        <h2>Información de la Internación</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha Admisión:</span>
            <span className={styles.value}>
              {formatDate(detalle.visita.fechaAdmision)} {detalle.visita.horaAdmision}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha Egreso:</span>
            <span className={styles.value}>
              {formatDate(detalle.visita.fechaEgreso)} {detalle.visita.horaEgreso}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Hospital:</span>
            <span className={styles.value}>{detalle.visita.hospital}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Sector:</span>
            <span className={styles.value}>{detalle.visita.sector}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Diagnóstico:</span>
            <span className={styles.value}>
              {detalle.visita.diagnostico && (
                <>
                  <strong>{detalle.visita.diagnostico}</strong>
                  {detalle.visita.descripcionDiagnostico && (
                    <span className={styles.diagnosticoDesc}>
                      {' - '}{detalle.visita.descripcionDiagnostico}
                    </span>
                  )}
                </>
              )}
              {!detalle.visita.diagnostico && '-'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Estado:</span>
            <span className={styles.value}>{detalle.visita.estado}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'hci' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('hci')}
        >
          HC Ingreso
        </button>
        <button
          className={activeTab === 'medicamentos' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('medicamentos')}
        >
          Medicamentos ({detalle.medicamentos.length})
        </button>
        <button
          className={activeTab === 'evoluciones' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('evoluciones')}
        >
          Evoluciones ({detalle.evoluciones.length})
        </button>
        <button
          className={activeTab === 'practicas' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('practicas')}
        >
          Prácticas ({detalle.practicas.length})
        </button>
        <button
          className={activeTab === 'estudios' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('estudios')}
        >
          Estudios ({detalle.estudios.length})
        </button>
        <button
          className={activeTab === 'epicrisis' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('epicrisis')}
        >
          Epicrisis
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Historia Clínica de Ingreso */}
        {activeTab === 'hci' && (
          <div className={styles.section}>
            <h2>Historia Clínica de Ingreso</h2>
            {detalle.historiaClinicaIngreso.length === 0 && (
              <p className={styles.noData}>No hay historia clínica de ingreso registrada</p>
            )}
            {detalle.historiaClinicaIngreso.map((hci, index) => (
              <div key={index} className={styles.hciContainer}>
                <div className={styles.hciHeader}>
                  <h3 className={styles.hciTitle}>
                    {detalle.historiaClinicaIngreso.length > 1 ? `Historia Clínica #${index + 1}` : 'Historia Clínica de Ingreso'}
                  </h3>
                  <div className={styles.hciMeta}>
                    {hci.Fecha && <span className={styles.hciDate}>Fecha: {new Date(hci.Fecha).toLocaleString('es-AR')}</span>}
                    {hci.IdProfecional && <span className={styles.hciProfesional}>Profesional: {hci.IdProfecional}</span>}
                  </div>
                </div>
                
                {renderHCISection('Motivo de Consulta', [
                  { label: 'Motivo', field: 'MotivoConsulta' }
                ], hci)}
                
                {renderHCISection('Enfermedad Actual', [
                  { label: 'Descripción', field: 'EnfermedadActual' }
                ], hci)}
                
                {renderHCISection('Signos Vitales', [
                  { label: 'Glucemia', field: 'SV_GLUCEMIA' },
                  { label: 'Presión Arterial', field: 'SV_PA' },
                  { label: 'Frecuencia Cardíaca', field: 'SV_FC' },
                  { label: 'Frecuencia Respiratoria', field: 'SV_FR' },
                  { label: 'Temperatura', field: 'SV_TAX' },
                  { label: 'Impresión General', field: 'SV_IMPRESIONGENERAL' },
                  { label: 'Facie', field: 'SV_FACIE' },
                  { label: 'Decúbito', field: 'SV_DECUBITO' },
                  { label: 'Marcha', field: 'SV_MARCHA' },
                  { label: 'Talla', field: 'SV_TALLA' },
                  { label: 'Peso Actual', field: 'SV_PESOACTUAL' },
                  { label: 'Peso Habitual', field: 'SV_PESOHABITUAL' },
                  { label: 'Estado Nutricional', field: 'SV_ESTADONUTRICIONAL' },
                  { label: 'Varices', field: 'SV_VARICES' },
                  { label: 'Flebitis', field: 'SV_FLEBITIS' },
                  { label: 'Trombosis', field: 'SV_TROMBOSIS' },
                  { label: 'Circulación Colateral', field: 'SV_CIRCULACIONCOLATERAL' },
                  { label: 'Texto Adicional', field: 'SV_TEXTO' }
                ], hci)}
                
                {renderHCISection('Piel y Faneras', [
                  { label: 'Coloración', field: 'PF_COLORACION' },
                  { label: 'Humedad', field: 'PF_HUMEDAD' },
                  { label: 'Temperatura', field: 'PF_TEMPERATURA' },
                  { label: 'Distribución Pilosa', field: 'PF_DISTRIBUCIONPILOSA' },
                  { label: 'Elasticidad', field: 'PF_ELASTICIDAD' },
                  { label: 'Uñas', field: 'PF_UNIAS' },
                  { label: 'Cicatrices', field: 'PF_CICATRICES' },
                  { label: 'Texto Adicional', field: 'PF_TEXTO' }
                ], hci)}
                
                {renderHCISection('Tejido Celular Subcutáneo', [
                  { label: 'Distribución', field: 'TCS_DISTRIBUCION' },
                  { label: 'Cantidad', field: 'TCS_CANTIDAD' },
                  { label: 'Nódulos', field: 'TCS_NODULOS' },
                  { label: 'Enfisema', field: 'TCS_ENFISEMA' },
                  { label: 'Edemas', field: 'TCS_EDEMAS' },
                  { label: 'Texto Adicional', field: 'TCS_TEXTO' }
                ], hci)}
                
                {renderHCISection('Sistema Linfático', [
                  { label: 'Linfangitis', field: 'SL_LINFANGITIS' },
                  { label: 'Adenomegalias', field: 'SL_ADENOMEGALIAS' },
                  { label: 'Texto Adicional', field: 'SL_TEXTO' }
                ], hci)}
                
                {renderHCISection('Sistema Osteoarticular y Muscular', [
                  { label: 'Músculo Trofismo Sensibilidad', field: 'SOAM_MUSCULOTROFISMOSENSIBILIDAD' },
                  { label: 'Huesos', field: 'SOAM_HUESOS' },
                  { label: 'Columna Vertebral', field: 'SOAM_COLUMNAVERTEBRAL' },
                  { label: 'Articulaciones', field: 'SOAM_ARTICULACIONES' },
                  { label: 'Índice Tobillo-Brazo Derecha', field: 'SOAM_INDICETOBILLOBRAZODERECHA' },
                  { label: 'Índice Tobillo-Brazo Izquierda', field: 'SOAM_INDICETOBILLOBRAZOIZQUIERA' },
                  { label: 'Perímetro MID', field: 'SOAM_PERIMETROMID' },
                  { label: 'Perímetro MII', field: 'SOAM_PERIMETROMII' },
                  { label: 'Texto Adicional', field: 'SOAM_TEXTO' }
                ], hci)}
                
                {renderHCISection('Cabeza', [
                  { label: 'Forma', field: 'C_FORMA' },
                  { label: 'Tamaño', field: 'C_TAMANIO' },
                  { label: 'Ojos', field: 'C_OJOS' },
                  { label: 'Pupilas', field: 'C_PUPILAS' },
                  { label: 'Conjuntivas', field: 'C_CONJUNTIVAS' },
                  { label: 'Córneas', field: 'C_CORNEAS' },
                  { label: 'Escleróticas', field: 'C_ESCLEROTICAS' },
                  { label: 'Párpados', field: 'C_PARPADOS' },
                  { label: 'Fosas Nasales', field: 'C_FOSASNASALES' },
                  { label: 'Boca', field: 'C_BOCA' },
                  { label: 'Labios', field: 'C_LABIOS' },
                  { label: 'Encías', field: 'C_ENCIAS' },
                  { label: 'Fauces', field: 'C_FAUCES' },
                  { label: 'Lengua', field: 'C_LENGUA' },
                  { label: 'Dientes', field: 'C_DIENTES' },
                  { label: 'Glándulas Salivales', field: 'C_GLANDULASSALIVALES' },
                  { label: 'Pabellones Auriculares y CAE', field: 'C_PABELLONESAURICULARESYCAE' },
                  { label: 'Texto Adicional', field: 'C_TEXTO' }
                ], hci)}
                
                {renderHCISection('Cuello', [
                  { label: 'Conformación', field: 'CU_CONFORMACION' },
                  { label: 'Laringe', field: 'CU_LARINGE' },
                  { label: 'Hueco Supraclavicular', field: 'CU_HUECOSUPRACLAVICULAR' },
                  { label: 'Hueco Infraclavicular', field: 'CU_HUECOINFRACLAVICULAR' },
                  { label: 'Yugulares', field: 'CU_YUGULARES' },
                  { label: 'Tiroides', field: 'CU_TIROIDES' },
                  { label: 'Texto Adicional', field: 'CU_TEXTO' }
                ], hci)}
                
                {renderHCISection('Mamas', [
                  { label: 'Simetría', field: 'M_SIMETRIA' },
                  { label: 'Nódulos', field: 'M_NODULOS' },
                  { label: 'Tamaño', field: 'MI_TAMANO' },
                  { label: 'Superficie', field: 'MI_SUPERFICIE' },
                  { label: 'Areolas', field: 'MI_AREOLAS' },
                  { label: 'Pezones', field: 'MI_PEZONES' },
                  { label: 'Maniobra Pectorales', field: 'MI_MANIOBRAPECTORALES' },
                  { label: 'Texto Adicional', field: 'MI_TEXTO' }
                ], hci)}
                
                {renderHCISection('Aparato Respiratorio', [
                  { label: 'Tórax', field: 'AR_TORAX' },
                  { label: 'Forma', field: 'AR_FORMA' },
                  { label: 'Elasticidad', field: 'AR_ELASTICIDAD' },
                  { label: 'Tipo Respiratorio', field: 'AR_TIPORESPIRATORIO' },
                  { label: 'Expansión de Vértices', field: 'AR_EXPANSIONDEVERTICES' },
                  { label: 'Bases', field: 'AR_BASES' },
                  { label: 'Vibraciones Vocales', field: 'AR_VIBRACIONESVOCALES' },
                  { label: 'Inspección', field: 'AR_INSPECCION' },
                  { label: 'Palpación', field: 'AR_PALPACION' },
                  { label: 'Percusión', field: 'AR_PERCUSION' },
                  { label: 'Auscultación', field: 'AR_AUSCULTACION' },
                  { label: 'Texto Adicional', field: 'AR_TEXTO' }
                ], hci)}
                
                {renderHCISection('Aparato Cardiovascular', [
                  { label: 'Frecuencia Cardíaca', field: 'AC_FRECUENCIACARDIACA' },
                  { label: 'Central', field: 'AC_CENTRAL' },
                  { label: 'Periférica', field: 'AC_PERIFERICA' },
                  { label: 'Pulso Radial', field: 'AC_PULSORADIAL' },
                  { label: 'Relleno Capilar', field: 'AC_RELLENOAPILAR' },
                  { label: 'Latido Apexiano', field: 'AC_LATIDOAPEXIANO' },
                  { label: 'Latidos Palpables', field: 'AC_LATIDOPALPABLES' },
                  { label: 'Auscultación', field: 'AC_AUSCULTACION' },
                  { label: 'R1', field: 'AC_R1' },
                  { label: 'R2', field: 'AC_R2' },
                  { label: 'Ruidos Agregados', field: 'AC_RUIDOSAGREGADOS' },
                  { label: 'Frotes', field: 'AC_FROTES' },
                  { label: 'Soplos', field: 'AC_SOPLOS' },
                  { label: 'Palpación', field: 'AC_PALPACION' },
                  { label: 'Pulsos', field: 'AC_PULSOS' },
                  { label: 'Texto Adicional', field: 'AC_TEXTO' }
                ], hci)}
                
                {renderHCISection('Abdomen', [
                  { label: 'Inspección', field: 'A_INSPECCION' },
                  { label: 'Palpación', field: 'A_PALPACION' },
                  { label: 'Superficial', field: 'A_SUPERFICIAL' },
                  { label: 'Profunda', field: 'A_PROFUNDA' },
                  { label: 'Percusión', field: 'A_PERCUSION' },
                  { label: 'Hígado', field: 'A_HIGADO' },
                  { label: 'Límite Superior', field: 'A_LIMTESUP' },
                  { label: 'Límite Inferior', field: 'A_LIMTEINF' },
                  { label: 'Altura', field: 'A_ALTURA' },
                  { label: 'Características', field: 'A_CARACTERISTICAS' },
                  { label: 'Auscultación', field: 'A_AUSCULTACION' },
                  { label: 'RHA', field: 'A_RHA' },
                  { label: 'Soplos', field: 'A_SOPLOS' },
                  { label: 'Celda Esplénica', field: 'A_CELDAESPLENICA' },
                  { label: 'Bazo', field: 'A_BAZO' },
                  { label: 'Perímetro', field: 'A_PERIMETRO' },
                  { label: 'Texto Adicional', field: 'A_TEXTO' }
                ], hci)}
                
                {renderHCISection('Aparato Urogenital', [
                  { label: 'Genitales Externos', field: 'AUG_GENITALESEXTERNOS' },
                  { label: 'Tacto Vaginal', field: 'AUG_TACTOVAGINAL' },
                  { label: 'Tacto Rectal', field: 'AIG_TACTORECTAL' },
                  { label: 'Puño Percusión', field: 'AUG_PUNIOPERCUSION' },
                  { label: 'Puntos Uretrales', field: 'AUG_PUNTOSURETRALES' },
                  { label: 'Texto Adicional', field: 'AUG_TEXTO' }
                ], hci)}
                
                {renderHCISection('Sistema Nervioso', [
                  { label: 'Conciencia', field: 'SN_CONCIENCIA' },
                  { label: 'Marcha', field: 'SN_MARCHA' },
                  { label: 'Tono Muscular', field: 'SN_TONOMUSCULAR' },
                  { label: 'Fuerza Muscular', field: 'SN_FUERZAMUSCULAR' },
                  { label: 'Signos Piramidales', field: 'SN_SIGNOSPIRAMIDALES' },
                  { label: 'Sensibilidad Superficial', field: 'SN_SENSIBILIDADSUPERFICIAL' },
                  { label: 'Signos Meníngeos', field: 'SN_SIGNOSMENINGEOS' },
                  { label: 'Pares Craneanos', field: 'SN _PARESCRANEANOS' },
                  { label: 'Taxia', field: 'SN_TAXIA' },
                  { label: 'Praxia', field: 'SN_PRAXIA' },
                  { label: 'Glasgow', field: 'EN_GLASGOW' },
                  { label: 'Sensibilidad', field: 'EN_SENCIVILIDAD' },
                  { label: 'Motricidad', field: 'EN_MOTRICIDAD' },
                  { label: 'Texto Adicional', field: 'SN_TEXTO' }
                ], hci)}
                
                {renderHCISection('Examen Oftalmológico', [
                  { label: 'Fondo de Ojo', field: 'EO_FONDODEOJO' },
                  { label: 'Medios Birrefringentes', field: 'EO_MEDIOSBIREFRIGENTES' },
                  { label: 'Cruces', field: 'EO_CRUCES' },
                  { label: 'Relación', field: 'EO_RELACION' },
                  { label: 'Hemorragia/Exudados', field: 'EO_HEMORRAGIAEXUDADOS' }
                ], hci)}
                
                {renderHCISection('Electrocardiograma', [
                  { label: 'Ritmo', field: 'EC_RITMO' },
                  { label: 'Frecuencia', field: 'EC_FRECUENCIA' },
                  { label: 'PR', field: 'EC_PR' },
                  { label: 'QT', field: 'EC_QT' },
                  { label: 'Onda P', field: 'EC_ONDAP' },
                  { label: 'Duración', field: 'EC_DURACION' },
                  { label: 'Amplitud', field: 'EC_AMPLITUD' },
                  { label: 'Conformación', field: 'EC_CONFORMACION' },
                  { label: 'QRS', field: 'EC_QRS' },
                  { label: 'Onda T', field: 'EC_ONDAT' },
                  { label: 'ST', field: 'EC_ST' },
                  { label: 'Eje', field: 'EC_EJE' },
                  { label: 'Conclusiones', field: 'EC_CONCLUSIONES' }
                ], hci)}
                
                {renderHCISection('Radiografía de Tórax', [
                  { label: 'Fecha/Hora', field: 'RDT_DATETIME' },
                  { label: 'Técnica', field: 'RDT_TECNICA' },
                  { label: 'Partes Blandas', field: 'RDT_PARTESBLANDAS' },
                  { label: 'Partes Óseas', field: 'RDT_PARTESOSEAS' },
                  { label: 'Hemidiafragmas', field: 'RDT_HEMIDIAFRAGMAS' },
                  { label: 'ICT', field: 'RDT_ICT' },
                  { label: 'Senos Costofrénicos', field: 'RDT_SENOSCOSTOFRENICOS' },
                  { label: 'Mediastino', field: 'RDT_MEDIASTINO' },
                  { label: 'Silueta Cardiovascular', field: 'RDT_SILUETACARDIOVASCULAR' },
                  { label: 'Hilios', field: 'RDT_HILIOS' },
                  { label: 'Campos Pulmonares', field: 'RDT_CAMPOSPULMONARES' },
                  { label: 'Conclusiones', field: 'RDT_CONCLUSIONES' },
                  { label: 'Posición', field: 'RDT_POSICION' },
                  { label: 'Parénquima', field: 'RDT_PARENQUIMA' }
                ], hci)}
                
                {renderHCISection('Laboratorio', [
                  { label: 'Resultados', field: 'RDT_LABORATORIO' }
                ], hci)}
                
                {renderHCISection('Impresión Diagnóstica', [
                  { label: 'Diagnóstico', field: 'IMPRESIONDIAGNOSTICA' }
                ], hci)}
                
                {renderHCISection('Comentarios', [
                  { label: 'Comentario de Ingreso', field: 'COMENTARIODEINGRESO' }
                ], hci)}
              </div>
            ))}
          </div>
        )}

        {/* Medicamentos */}
        {activeTab === 'medicamentos' && (
          <div className={styles.section}>
            <h2>Control de Medicamentos</h2>
            {detalle.medicamentos.length === 0 && (
              <p className={styles.noData}>No hay medicamentos registrados</p>
            )}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Medicamento</th>
                    <th>Presentación</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.medicamentos.map((m, idx) => (
                    <tr key={`med-${m.id}-${m.troquel}-${idx}`}>
                      <td>{formatDate(m.fecha)}</td>
                      <td>{m.hora}</td>
                      <td><strong>{m.nombreMedicamento}</strong></td>
                      <td>{m.presentacion}</td>
                      <td>{m.cantidad}</td>
                      <td>{m.tipoUnidad}</td>
                      <td>{m.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evoluciones */}
        {activeTab === 'evoluciones' && (
          <div className={styles.section}>
            <h2>Evoluciones</h2>
            {detalle.evoluciones.length === 0 && (
              <p className={styles.noData}>No hay evoluciones registradas</p>
            )}
            {detalle.evoluciones.map((ev) => (
              <div key={ev.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDate}>
                    {formatDate(ev.fecha)} - {ev.hora}
                  </span>
                  <span className={styles.cardProfesional}>
                    Profesional: {ev.profesionalNombre || `Matrícula ${ev.profesionalId}`}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.evolucionText}>{ev.evolucion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prácticas */}
        {activeTab === 'practicas' && (
          <div className={styles.section}>
            <h2>Prácticas Médicas</h2>
            {detalle.practicas.length === 0 && (
              <p className={styles.noData}>No hay prácticas registradas</p>
            )}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Práctica / Procedimiento</th>
                    <th>Cantidad</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.practicas.map((p, idx) => (
                    <tr key={`prac-${p.id}-${p.practica}-${idx}`}>
                      <td>{formatDate(p.fecha)}</td>
                      <td>{p.practica}</td>
                      <td><strong>{p.nombrePractica}</strong></td>
                      <td>{p.cantidad}</td>
                      <td>{p.horaInicio}</td>
                      <td>{p.horaFin}</td>
                      <td>{p.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estudios */}
        {activeTab === 'estudios' && (
          <div className={styles.section}>
            <h2>Estudios y Resultados</h2>
            {detalle.estudios.length === 0 && (
              <p className={styles.noData}>No hay estudios registrados</p>
            )}
            {detalle.estudios.map((est, idx) => (
              <div key={`est-${est.id}-${est.idProtocolo}-${idx}`} className={styles.estudioCard}>
                <div className={styles.estudioHeader}>
                  <div className={styles.estudioInfo}>
                    <span className={styles.estudioFecha}>
                      Pedido: {formatDate(est.fechaPedido)}
                    </span>
                    {est.nroProtocolo && (
                      <span className={styles.estudioProtocolo}>
                        Protocolo: {est.nroProtocolo}
                      </span>
                    )}
                    {est.estadoUrgencia && (
                      <span className={styles.estudioUrgencia}>
                        {est.estadoUrgencia}
                      </span>
                    )}
                  </div>
                  {est.tieneResultado && est.fechaResultado && (
                    <span className={styles.estudioResultadoFecha}>
                      Resultado: {formatDate(est.fechaResultado)}
                    </span>
                  )}
                </div>
                
                <div className={styles.estudioComparativa}>
                  {/* Pedido */}
                  <div className={styles.estudioColumna}>
                    <h3 className={styles.estudioSubtitle}>📋 Pedido de Estudio</h3>
                    <div className={styles.estudioTexto}>
                      {est.pedidoEstudio || 'Sin observaciones'}
                    </div>
                  </div>
                  
                  {/* Resultado */}
                  <div className={styles.estudioColumna}>
                    <h3 className={styles.estudioSubtitle}>
                      {est.tieneResultado ? '✅ Resultado' : '⏳ Pendiente'}
                    </h3>
                    <div className={styles.estudioTexto}>
                      {est.tieneResultado && est.resultadoEstudio ? (
                        rtfToText(est.resultadoEstudio)
                      ) : (
                        <p className={styles.noData}>Resultado pendiente</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjuntos */}
                {est.adjuntos && est.adjuntos.length > 0 && (
                  <div className={styles.adjuntosContainer}>
                    <h3 className={styles.adjuntosTitle}>📎 Archivos Adjuntos</h3>
                    <div className={styles.adjuntosList}>
                      {est.adjuntos.map((adj, adjIdx) => (
                        <a
                          key={`adj-${adj.id}-${adjIdx}`}
                          href={`${process.env.NEXT_PUBLIC_API_URL}/archivos/descargar?path=${encodeURIComponent(adj.pathServidor)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.adjuntoItem}
                        >
                          <span className={styles.adjuntoIcon}>
                            {adj.nombreArchivo.toLowerCase().endsWith('.pdf') ? '📄' : '📁'}
                          </span>
                          <span className={styles.adjuntoNombre}>
                            {adj.nombreArchivo || 'Archivo sin nombre'}
                          </span>
                          <span className={styles.adjuntoAccion}>Ver →</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Epicrisis */}
        {activeTab === 'epicrisis' && (
          <div className={styles.section}>
            <h2>Epicrisis</h2>
            {!detalle.epicrisis && (
              <p className={styles.noData}>No hay epicrisis registrada</p>
            )}
            {detalle.epicrisis && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDate}>
                    {formatDate(detalle.epicrisis.fecha)} - {detalle.epicrisis.hora}
                  </span>
                  <span className={styles.cardProfesional}>
                    Profesional: {detalle.epicrisis.profesionalNombre || `Matrícula ${detalle.epicrisis.profesionalId}`}
                  </span>
                </div>
                <div className={styles.cardSection}>
                  <h3>Diagnóstico</h3>
                  <p className={styles.textContent}>
                    {detalle.epicrisis.diagnostico && (
                      <>
                        <strong>{detalle.epicrisis.diagnostico}</strong>
                        {detalle.epicrisis.diagnosticoTexto && (
                          <span> - {detalle.epicrisis.diagnosticoTexto}</span>
                        )}
                      </>
                    )}
                    {!detalle.epicrisis.diagnostico && 'No registrado'}
                  </p>
                </div>
                <div className={styles.cardSection}>
                  <h3>Epicrisis</h3>
                  <p className={styles.textContent}>
                    {detalle.epicrisis.epicrisis || 'No registrada'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
