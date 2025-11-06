'use client';

import { usePatients } from '@/hooks/usePatients';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function PatientSearch() {
  const router = useRouter();
  const {
    patients,
    isLoading,
    error,
    search,
    currentPage,
    totalPages,
    totalCount,
    handleSearch,
    handlePageChange,
  } = usePatients();

  const handlePatientClick = (numeroDocumento: string) => {
    router.push(`/dashboard/patients/${numeroDocumento}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h2>Búsqueda de Pacientes</h2>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar por nombre o documento (mín. 3 caracteres)..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando pacientes...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            {search.length >= 3
              ? 'No se encontraron pacientes'
              : 'Ingrese al menos 3 caracteres para buscar'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            <p>
              Mostrando {patients.length} de {totalCount} pacientes
            </p>
          </div>

          <div className={styles.patientsGrid}>
            {patients.map((patient) => (
              <div
                key={patient.numeroDocumento}
                className={styles.patientCard}
                onClick={() => handlePatientClick(patient.numeroDocumento)}
              >
                <div className={styles.patientHeader}>
                  <h3>{patient.apellidoNombre}</h3>
                  <span className={styles.badge}>
                    {patient.totalVisitas} visitas
                  </span>
                </div>
                <div className={styles.patientInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>DNI:</span>
                    <span>{patient.numeroDocumento}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Sexo:</span>
                    <span>{patient.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                  </div>
                  {patient.telefono && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Tel:</span>
                      <span>{patient.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
}
