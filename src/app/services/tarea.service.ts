import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private http = inject(HttpClient);

  private readonly tareasFallback: Tarea[] = [
    {
      id: 101,
      curso: 'Desarrollo Web - Módulo 3',
      titulo: 'Implementar PWA con Service Worker e IndexedDB',
      fechaEntrega: '15/04/2026',
      estadoAcademico: 'Pendiente',
      descripcion: 'Desarrollar una Aplicación Web Progresiva completa con App Manifest, Service Worker para Runtime Caching y persistencia local en IndexedDB.',
      instructor: 'Luque Chambi Jorge',
      archivosAdjuntos: ['Guia_Laboratorio_PWA.pdf', 'Especificaciones_Tecnicas.docx']
    },
    {
      id: 102,
      curso: 'Redes y Comunicaciones',
      titulo: 'Configuración de Subredes IPv4 y Enrutamiento Estático',
      fechaEntrega: '18/04/2026',
      estadoAcademico: 'Pendiente',
      descripcion: 'Diseñar e implementar topología jerárquica con VLANs, enlaces troncales 802.1Q y enrutamiento inter-VLAN en Cisco Packet Tracer.',
      instructor: 'García Pérez Carlos',
      archivosAdjuntos: ['Topologia_Redes_Semana4.pkt']
    },
    {
      id: 103,
      curso: 'Base de Datos Avanzada',
      titulo: 'Procedimientos Almacenados y Triggers en PostgreSQL',
      fechaEntrega: '22/04/2026',
      estadoAcademico: 'Pendiente',
      descripcion: 'Creación de funciones PL/pgSQL para auditoría de tablas y control transaccional de saldos bancarios.',
      instructor: 'Ramírez Soto Mario',
      archivosAdjuntos: ['Script_Inicial_Schema.sql']
    },
    {
      id: 104,
      curso: 'Cloud Computing',
      titulo: 'Despliegue de Microservicios en Google Cloud Run',
      fechaEntrega: '25/04/2026',
      estadoAcademico: 'Pendiente',
      descripcion: 'Contenerización con Docker y despliegue serverless con integración continua en Cloud Build.',
      instructor: 'Fernández Alva Rosa',
      archivosAdjuntos: ['Manual_GCP_CloudRun.pdf']
    },
    {
      id: 105,
      curso: 'Desarrollo Web - Módulo 3',
      titulo: 'Maquetación Responsive con CSS Grid y Flexbox',
      fechaEntrega: '10/04/2026',
      estadoAcademico: 'Entregado',
      descripcion: 'Diseño de dashboard adaptable para pantallas móviles, tabletas y monitores de escritorio.',
      instructor: 'Luque Chambi Jorge',
      archivosAdjuntos: ['Evaluacion_Practica_2.pdf']
    }
  ];

  readonly tareas = signal<Tarea[]>(this.tareasFallback);
  readonly filtroTitulo = signal<string>('');
  readonly filtroCurso = signal<string>('TODOS');
  readonly cargandoTareas = signal<boolean>(false);

  // Tarea actualmente seleccionada para redactar entrega (TH-02)
  readonly tareaSeleccionada = signal<Tarea | null>(null);

  constructor() {
    this.cargarTareasDesdeJson();
  }

  cargarTareasDesdeJson(): void {
    this.cargandoTareas.set(true);
    this.http.get<Tarea[]>('/data/tareas.json').subscribe({
      next: (datos) => {
        if (Array.isArray(datos) && datos.length > 0) {
          this.tareas.set(datos);
        }
        this.cargandoTareas.set(false);
      },
      error: () => {
        this.tareas.set(this.tareasFallback);
        this.cargandoTareas.set(false);
      }
    });
  }

  // TH-01: Búsqueda por título y filtro por curso combinables
  readonly tareasFiltradas = computed(() => {
    const texto = this.filtroTitulo().trim().toLowerCase();
    const curso = this.filtroCurso();

    return this.tareas().filter(t => {
      const matchTitulo = t.titulo.toLowerCase().includes(texto);
      const matchCurso = curso === 'TODOS' || t.curso === curso;
      return matchTitulo && matchCurso;
    });
  });

  readonly cursosDisponibles = computed(() => {
    const setCursos = new Set(this.tareas().map(t => t.curso));
    return ['TODOS', ...Array.from(setCursos)];
  });

  setFiltroTitulo(val: string): void {
    this.filtroTitulo.set(val);
  }

  setFiltroCurso(curso: string): void {
    this.filtroCurso.set(curso);
  }

  limpiarFiltros(): void {
    this.filtroTitulo.set('');
    this.filtroCurso.set('TODOS');
  }

  seleccionarTareaParaEntrega(tarea: Tarea): void {
    this.tareaSeleccionada.set(tarea);
  }

  limpiarSeleccion(): void {
    this.tareaSeleccionada.set(null);
  }
}
