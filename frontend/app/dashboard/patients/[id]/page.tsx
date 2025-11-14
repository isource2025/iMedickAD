'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import VisitsTable from '@/components/VisitsTable';
import patientService from '@/services/patientService';
import { Patient } from '@/types/patient';
import styles from './styles.module.css';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.obtenerPaciente(params.id);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar paciente');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatient();
    }
  }, [params.id, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.error}>
        <p>Paciente no encontrado</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

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
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Volver
        </button>
      </div>

      <div className={styles.patientCard}>
        <h1>{patient.apellidoNombre}</h1>
        <div className={styles.patientGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>DNI:</span>
            <span className={styles.value}>{patient.numeroDocumento}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha Nacimiento:</span>
            <span className={styles.value}>{formatDate(patient.fechaNacimiento)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Sexo:</span>
            <span className={styles.value}>
              {patient.sexo === 'M' ? 'Masculino' : 'Femenino'}
            </span>
          </div>
          {patient.telefono && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Teléfono:</span>
              <span className={styles.value}>{patient.telefono}</span>
            </div>
          )}
          {patient.domicilio && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Domicilio:</span>
              <span className={styles.value}>{patient.domicilio}</span>
            </div>
          )}
          {patient.email && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{patient.email}</span>
            </div>
          )}
        </div>
      </div>

      <VisitsTable
        numeroDocumento={patient.numeroDocumento}
        patientName={patient.apellidoNombre}
      />
    </div>
  );
}
