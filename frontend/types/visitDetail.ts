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
  profesionalId: number;
  profesionalNombre: string | null;
  profesionalUsuario: string | null;
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
  profesionalId: number;
  profesionalNombre: string | null;
  profesionalUsuario: string | null;
  epicrisis: string;
  diagnostico: string;
  diagnosticoTexto: string;
}

export interface Adjunto {
  id: number;
  numeroVisita: number;
  idProtocolo: number;
  pathServidor: string;
  nombreArchivo: string;
  fechaSubida: string | null;
}

export interface Estudio {
  id: number;
  fechaPedido: string | null;
  pedidoEstudio: string;
  idProtocolo: number | null;
  estadoUrgencia: string;
  tieneResultado: boolean;
  fechaResultado: string | null;
  fechaCarga: string | null;
  resultadoEstudio: string;
  nroProtocolo: string;
  estadoResultado: string;
  adjuntos: Adjunto[];
}

export interface PracticaProtocolo {
  id: number;
  codigoPractica: number;
  nombrePractica: string;
  tipoPractica: string;
  tipoNomenclador: string;
  cantidad: number;
  fecha: string | null;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
  codOperador: number | null;
  nombreProfesional: string | null;
  matriculaProfesional: number | null;
}

export interface Protocolo {
  idProtocolo: number;
  nroProtocolo: string;
  numeroVisita: number;
  idPaciente: number;
  fechaProtocolo: string | null;
  tipoProtocolo: string;
  fechaHoraInicio: string | null;
  fechaHoraFin: string | null;
  diagnosticoPreProcedimiento: string;
  tecnica: string;
  diagnosticoPosProcedimiento: string;
  texto: string;
  estado: string;
  idOperador: number | null;
  nombreProfesionalProtocolo: string | null;
  matriculaProfesionalProtocolo: number | null;
  practicas: PracticaProtocolo[];
}

export interface VisitDetail {
  visita: VisitBasic;
  historiaClinicaIngreso: HistoriaClinicaIngreso[];
  medicamentos: Medicamento[];
  evoluciones: Evolucion[];
  practicas: Practica[];
  epicrisis: Epicrisis | null;
  estudios: Estudio[];
  protocolos: Protocolo[];
}
