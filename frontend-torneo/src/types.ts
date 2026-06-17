// src/types.ts
export interface Tournament {
  id?: number;
  nombre: string;
  fechaInicio: string; // ISO date
  fechaFin?: string;
  descripcion?: string;
}

export interface Participant {
  id?: number;
  nombre: string;
  edad: number;
  equipoId?: number;
}

export interface Team {
  id?: number;
  nombre: string;
  ciudad?: string;
}

export interface Player {
  id?: number;
  nombre: string;
  edad: number;
  equipoId?: number;
}

export interface Match {
  id?: number;
  torneoId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  fecha: string; // ISO date
  marcadorLocal?: number;
  marcadorVisitante?: number;
}

export interface Statistic {
  id?: number;
  jugadorId: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}
