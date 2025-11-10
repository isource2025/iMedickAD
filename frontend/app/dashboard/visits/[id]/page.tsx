'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import visitDetailService from '@/services/visitDetailService';
import { VisitDetail } from '@/types/visitDetail';
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  const renderHCISection = (title: string, fields: Array<{label: string, field: string}>, data: any) => {
    // Verificar si algún campo tiene datos
    const hasData = fields.some(f => data[f.field] && data[f.field].toString().trim() !== '');
    
    if (!hasData) return null;
    
    return (
      <div className={styles.hciSection} key={title}>
        <h3 className={styles.hciSectionTitle}>{title}</h3>
        <div className={styles.hciFields}>
          {fields.map(({label, field}) => {
            const value = data[field];
            if (!value || value.toString().trim() === '') return null;
            
            return (
              <div key={field} className={styles.hciField}>
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
            {!detalle.historiaClinicaIngreso && (
              <p className={styles.noData}>No hay historia clínica de ingreso registrada</p>
            )}
            {detalle.historiaClinicaIngreso && (
              <div className={styles.hciContainer}>
                {renderHCISection('Motivo de Consulta', [
                  { label: 'Motivo', field: 'MotivoConsulta' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Enfermedad Actual', [
                  { label: 'Descripción', field: 'EnfermedadActual' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Signos Vitales', [
                  { label: 'Glucemia', field: 'SV_GLUCEMIA' },
                  { label: 'Presión Arterial', field: 'SV_PA' },
                  { label: 'Frecuencia Cardíaca', field: 'SV_FC' },
                  { label: 'Frecuencia Respiratoria', field: 'SV_FR' },
                  { label: 'Temperatura', field: 'SV_TAX' },
                  { label: 'Impresión General', field: 'SV_IMPRESIONGENERAL' },
                  { label: 'Facie', field: 'SV_FACIE' },
                  { label: 'Decúbito', field: 'SV_DECUBITO' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Examen Físico General', [
                  { label: 'Biotipo', field: 'EFG_BIOTIPO' },
                  { label: 'Peso', field: 'EFG_PESO' },
                  { label: 'Talla', field: 'EFG_TALLA' },
                  { label: 'IMC', field: 'EFG_IMC' },
                  { label: 'Piel', field: 'EFG_PIEL' },
                  { label: 'Hidratación', field: 'EFG_HIDRATACION' },
                  { label: 'Nutrición', field: 'EFG_NUTRICION' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Cabeza y Cuello', [
                  { label: 'Cabeza', field: 'CYC_CABEZA' },
                  { label: 'Ojos', field: 'CYC_OJOS' },
                  { label: 'Pupilas', field: 'CYC_PUPILAS' },
                  { label: 'Nariz', field: 'CYC_NARIZ' },
                  { label: 'Boca', field: 'CYC_BOCA' },
                  { label: 'Cuello', field: 'CYC_CUELLO' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Aparato Respiratorio', [
                  { label: 'Inspección', field: 'AR_INSPECCION' },
                  { label: 'Palpación', field: 'AR_PALPACION' },
                  { label: 'Percusión', field: 'AR_PERCUSION' },
                  { label: 'Auscultación', field: 'AR_AUSCULTACION' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Aparato Cardiovascular', [
                  { label: 'Inspección', field: 'ACV_INSPECCION' },
                  { label: 'Palpación', field: 'ACV_PALPACION' },
                  { label: 'Auscultación', field: 'ACV_AUSCULTACION' },
                  { label: 'Pulsos', field: 'ACV_PULSOS' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Abdomen', [
                  { label: 'Inspección', field: 'ABD_INSPECCION' },
                  { label: 'Palpación', field: 'ABD_PALPACION' },
                  { label: 'Percusión', field: 'ABD_PERCUSION' },
                  { label: 'Auscultación', field: 'ABD_AUSCULTACION' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Sistema Nervioso', [
                  { label: 'Conciencia', field: 'SN_CONCIENCIA' },
                  { label: 'Orientación', field: 'SN_ORIENTACION' },
                  { label: 'Lenguaje', field: 'SN_LENGUAJE' },
                  { label: 'Pares Craneales', field: 'SN_PARESCRANEALES' },
                  { label: 'Reflejos', field: 'SN_REFLEJOS' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Impresión Diagnóstica', [
                  { label: 'Diagnóstico', field: 'IMPRESIONDIAGNOSTICA' }
                ], detalle.historiaClinicaIngreso)}
                
                {renderHCISection('Comentarios', [
                  { label: 'Comentario de Ingreso', field: 'COMENTARIODEINGRESO' }
                ], detalle.historiaClinicaIngreso)}
              </div>
            )}
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
                    <th>Troquel</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Profesional</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.medicamentos.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.fecha)}</td>
                      <td>{m.hora}</td>
                      <td>{m.troquel}</td>
                      <td>{m.cantidad}</td>
                      <td>{m.tipoUnidad}</td>
                      <td>{m.profesional}</td>
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
                    Profesional: {ev.profesional}
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
                    <th>Tipo</th>
                    <th>Práctica</th>
                    <th>Cantidad</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.practicas.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.fecha)}</td>
                      <td>{p.tipo}</td>
                      <td>{p.practica}</td>
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
                    Profesional: {detalle.epicrisis.profesional}
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
