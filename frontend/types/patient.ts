export interface Patient {
  numeroDocumento: string;
  apellidoNombre: string;
  fechaNacimiento: string | null;
  sexo: string;
  telefono: string;
  domicilio: string;
  localidad?: string;
  email: string;
  totalVisitas: number;
}

export interface PatientsResponse {
  data: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
