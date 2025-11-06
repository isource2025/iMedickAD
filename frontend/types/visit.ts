export interface Visit {
  numeroVisita: string;
  numeroDocumento: string;
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

export interface VisitDetail extends Visit {
  paciente: {
    apellidoNombre: string;
    fechaNacimiento: string | null;
    sexo: string;
  };
}

export interface VisitsResponse {
  data: Visit[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
