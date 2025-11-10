export interface VisitBasic {
  numeroVisita: number;
  paciente: {
    numeroDocumento: string;
    apellidoNombre: string;
    fechaNacimiento: string | null;
    sexo: string;
  };
  fechaAdmision: string | null;
  horaAdmision: string;
  fechaEgreso: string | null;
  horaEgreso: string;
  hospital: string;
  sector: string;
  clasePaciente: string;
  tipoIngreso: string;
  estado: string;
  observaciones: string;
  diagnostico: string;
  descripcionDiagnostico: string;
}

export interface HistoriaClinicaIngreso {
  [key: string]: any; // Acepta cualquier campo de la BD
}

export interface Medicamento {
  id: number;
  fecha: string | null;
  hora: string;
  troquel: number;
  nombreMedicamento: string;
  laboratorio: string;
  presentacion: string;
  cantidad: number;
  tipoUnidad: string;
  observaciones: string;
  profesional: number;
}

export interface Evolucion {
  id: number;
  fecha: string | null;
  hora: string;
  profesional: number;
  evolucion: string;
}

export interface Practica {
  id: number;
  tipo: string;
  practica: number;
  nombrePractica: string;
  tipoNomenclador: string;
  cantidad: number;
  fecha: string | null;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
}

export interface Epicrisis {
  id: number;
  fecha: string;
  hora: string;
  profesional: number;
  epicrisis: string;
  diagnostico: string;
  diagnosticoTexto: string;
}

export interface VisitDetail {
  visita: VisitBasic;
  historiaClinicaIngreso: HistoriaClinicaIngreso | null;
  medicamentos: Medicamento[];
  evoluciones: Evolucion[];
  practicas: Practica[];
  epicrisis: Epicrisis | null;
}
