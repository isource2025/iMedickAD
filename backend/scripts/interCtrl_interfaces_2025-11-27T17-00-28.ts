/**
 * Interfaces TypeScript generadas automáticamente
 * Fecha: 27/11/2025, 14:00:28
 * Tablas: imInterCtrlMedicamento, imInterCtrlFrecuente, imInterCtrlEvolucion, imInterTipoControles
 */

export interface imInterCtrlMedicamento {
  IDCtrlMedica: number; // PRIMARY KEY
  IDFactura?: number;
  IDDetalle?: number;
  NroIndicacion?: number;
  ModuloOrigen?: string;
  TipoMedicamento?: string;
  NumeroVisita?: number;
  Sector?: string;
  FechaCarga?: number;
  HoraCarga?: number;
  OperadorCarga?: number;
  Profesional?: number;
  FechaControl?: number;
  HoraControl?: number;
  Troquel?: number;
  Cantidad?: number;
  TipoUnidad?: string;
  Observaciones?: string;
  IDCliente?: number;
  Status?: number;
  CantidadIndicada?: number;
  IdTurno?: number;
}

export interface imInterCtrlFrecuente {
  Valor: number; // PRIMARY KEY
  NumeroVisita?: number;
  FechaCarga?: number;
  HoraCarga?: number;
  OperadorCarga?: number;
  Profesional?: number;
  FechaControl?: number;
  HoraControl?: number;
  Pulso?: number;
  Maximo?: number;
  Minimo?: number;
  FrecuenciaRespiratoria?: number;
  Axilar?: number;
  Rectal?: number;
  Observaciones?: string;
  Nroindicacion?: number;
  Hgt?: string;
  IdSector?: string;
  PAMedia?: number;
  Saturometria?: number;
  Peso?: number;
  Talla?: number;
  IdTurno?: number;
}

export interface imInterCtrlEvolucion {
  NumeroVisita: number; // PRIMARY KEY
  Profesional?: number;
  FechaControl: number; // PRIMARY KEY
  HoraControl: number; // PRIMARY KEY
  Observaciones?: string;
  FechaHoraCarga?: Date;
  OperadorCarga?: number;
}

export interface imInterTipoControles {
  Valor: number; // PRIMARY KEY
  Descripcion?: string;
}
