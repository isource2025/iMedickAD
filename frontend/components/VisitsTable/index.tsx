'use client';

import { useRouter } from 'next/navigation';
import { useVisits } from '@/hooks/useVisits';
import styles from './styles.module.css';

interface VisitsTableProps {
  numeroDocumento: string;
  patientName: string;
  patientData?: {
    fechaNacimiento: string | null;
    sexo: string;
    telefono?: string;
    domicilio?: string;
  };
}

export default function VisitsTable({ numeroDocumento, patientName, patientData }: VisitsTableProps) {
  const router = useRouter();
  const {
    visits,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
  } = useVisits(numeroDocumento);

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

  return (
    <>
      <p className={styles.subtitle}>
        Total de visitas: {totalCount}
      </p>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando visitas...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No se encontraron visitas para este paciente</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N° Visita</th>
                  <th>Fecha Admisión</th>
                  <th>Fecha Egreso</th>
                  <th>Sector</th>
                  <th>Clase</th>
                  <th>Tipo Ingreso</th>
                  <th>Diagnóstico</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr 
                    key={visit.numeroVisita}
                    onClick={() => router.push(`/dashboard/visits/${visit.numeroVisita}`)}
                    className={styles.clickableRow}
                  >
                    <td className={styles.visitNumber}>{visit.numeroVisita}</td>
                    <td>
                      <div>{formatDate(visit.fechaAdmision)}</div>
                      <div className={styles.timeText}>{visit.horaAdmision}</div>
                    </td>
                    <td>
                      <div>{formatDate(visit.fechaEgreso)}</div>
                      <div className={styles.timeText}>{visit.horaEgreso}</div>
                    </td>
                    <td>{visit.sector}</td>
                    <td>{visit.clasePaciente}</td>
                    <td>{visit.tipoIngreso}</td>
                    <td>
                      <div className={styles.diagnostico}>
                        {visit.diagnostico && (
                          <>
                            <strong>{visit.diagnostico}</strong>
                            {visit.descripcionDiagnostico && (
                              <div className={styles.descripcionDiagnostico}>
                                {visit.descripcionDiagnostico}
                              </div>
                            )}
                          </>
                        )}
                        {!visit.diagnostico && '-'}
                      </div>
                    </td>
                    <td>
                      <span className={styles.value}>
                        {visit.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
