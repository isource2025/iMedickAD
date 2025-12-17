'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface PatientInfo {
  numeroDocumento: string;
  apellidoNombre: string;
  fechaNacimiento: string | null;
  sexo: string;
  numeroVisita: number;
  fechaAdmision: string | null;
  sector: string;
  hospital: string;
}

interface PatientHeaderProps {
  patientInfo: PatientInfo | null;
}

export default function PatientHeader({ patientInfo }: PatientHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar header fijo después de scroll de 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!patientInfo) return null;

  // Calcular edad
  const calcularEdad = (fechaNac: string | null): number => {
    if (!fechaNac) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const edad = calcularEdad(patientInfo.fechaNacimiento);

  return (
    <div className={`${styles.patientHeader} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.patientInfo}>
          <div className={styles.mainInfo}>
            <h2 className={styles.patientName}>{patientInfo.apellidoNombre}</h2>
            <div className={styles.badges}>
              <span className={styles.badge}>DNI: {patientInfo.numeroDocumento}</span>
              <span className={styles.badge}>{edad} años</span>
              <span className={styles.badge}>{patientInfo.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
            </div>
          </div>
          <div className={styles.visitInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Visita</span>
              <span className={styles.value}>#{patientInfo.numeroVisita}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Sector</span>
              <span className={styles.value}>{patientInfo.sector}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Hospital</span>
              <span className={styles.value}>{patientInfo.hospital}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
