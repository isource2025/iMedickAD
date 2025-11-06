# iMedicAD - Sistema de Auditorías Médicas
## Documentación Técnica Completa - Parte 4: Componentes y Páginas

---

## 11. Componentes React

### 11.1 Componente de Login (components/LoginForm/index.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './styles.module.css';

export default function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario || !password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    setIsLoading(true);

    try {
      await login({ usuario, password });
    } catch (err: any) {
      setError(err.message || 'Error en autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>iMedicAD</h1>
          <p>Sistema de Auditorías Médicas</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 11.2 Estilos de Login (components/LoginForm/styles.module.css)

```css
.loginContainer {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00B5E2 0%, #0083A9 100%);
  padding: 20px;
}

.loginCard {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  padding: 40px;
}

.loginHeader {
  text-align: center;
  margin-bottom: 32px;
}

.loginHeader h1 {
  font-size: 32px;
  font-weight: 700;
  color: #0083A9;
  margin: 0 0 8px 0;
}

.loginHeader p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.loginForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formGroup label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.formGroup input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

.formGroup input:focus {
  outline: none;
  border-color: #00B5E2;
  box-shadow: 0 0 0 3px rgba(0, 181, 226, 0.1);
}

.formGroup input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.loginButton {
  padding: 14px;
  background: linear-gradient(135deg, #00B5E2 0%, #0083A9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.loginButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 181, 226, 0.3);
}

.loginButton:active:not(:disabled) {
  transform: translateY(0);
}

.loginButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.errorMessage {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}
```

### 11.3 Componente de Búsqueda de Pacientes (components/PatientSearch/index.tsx)

```typescript
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
```

### 11.4 Estilos de Búsqueda (components/PatientSearch/styles.module.css)

```css
.container {
  padding: 24px;
}

.searchHeader {
  margin-bottom: 24px;
}

.searchHeader h2 {
  font-size: 24px;
  font-weight: 700;
  color: #0083A9;
  margin: 0 0 16px 0;
}

.searchBox {
  width: 100%;
  max-width: 600px;
}

.searchInput {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

.searchInput:focus {
  outline: none;
  border-color: #00B5E2;
  box-shadow: 0 0 0 3px rgba(0, 181, 226, 0.1);
}

.resultsInfo {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.patientsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.patientCard {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.patientCard:hover {
  border-color: #00B5E2;
  box-shadow: 0 4px 12px rgba(0, 181, 226, 0.15);
  transform: translateY(-2px);
}

.patientHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.patientHeader h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.badge {
  background: #00B5E2;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.patientInfo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.infoRow {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.paginationButton {
  padding: 10px 20px;
  background: #00B5E2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.paginationButton:hover:not(:disabled) {
  background: #0083A9;
  transform: translateY(-2px);
}

.paginationButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pageInfo {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #00B5E2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.emptyState {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.errorMessage {
  padding: 16px 20px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  margin-bottom: 20px;
}
```

### 11.5 Componente de Tabla de Visitas (components/VisitsTable/index.tsx)

```typescript
'use client';

import { useVisits } from '@/hooks/useVisits';
import styles from './styles.module.css';

interface VisitsTableProps {
  numeroDocumento: string;
  patientName: string;
}

export default function VisitsTable({ numeroDocumento, patientName }: VisitsTableProps) {
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  const getEstadoBadgeClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('egresado')) return styles.badgeEgresado;
    if (estadoLower.includes('internado')) return styles.badgeInternado;
    return styles.badgeDefault;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Historial de Visitas - {patientName}</h2>
        <p className={styles.subtitle}>
          Total de visitas: {totalCount}
        </p>
      </div>

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
                  <tr key={visit.numeroVisita}>
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
                        {visit.diagnostico || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoBadgeClass(visit.estado)}`}>
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
    </div>
  );
}
```

---

**Continúa en DOCS_iMedicAD_PARTE5.md**
