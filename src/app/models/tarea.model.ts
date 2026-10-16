export type EstadoAcademico = 'Pendiente' | 'Entregado' | 'En revisión' | 'Calificado';

export interface Tarea {
  id: number;
  curso: string;
  titulo: string;
  fechaEntrega: string;
  estadoAcademico: EstadoAcademico;
  descripcion: string;
  instructor: string;
  archivosAdjuntos?: string[];
}
