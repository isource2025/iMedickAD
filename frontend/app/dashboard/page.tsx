'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PatientSearch from '@/components/PatientSearch';
import styles from './styles.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>iMedicAD</h1>
            <p className={styles.subtitle}>Sistema de Auditorías Médicas</p>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.nombre}</p>
              <p className={styles.userHospital}>{user?.hospitalAsignado}</p>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <PatientSearch />
      </main>
    </div>
  );
}
