import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { StorageService } from '../../services/storage.service';
import { ConectividadService } from '../../services/conectividad.service';
import { EntregaLocal } from '../../models/entrega.model';

@Component({
  selector: 'app-taskhub-formulario-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-entrega.component.html',
  styleUrls: ['./formulario-entrega.component.scss']
})
export class TaskHubFormularioEntregaComponent {
  tareaService = inject(TareaService);
  storageService = inject(StorageService);
  conectividadService = inject(ConectividadService);

  comentario: string = '';
  nombreArchivoAdjunto: string = 'solucion_practica_senati.zip';

  readonly guardando = signal<boolean>(false);
  readonly errorValidacion = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly entregaRegistradaId = signal<number | null>(null);

  // TH-02, TH-03, TH-04, TH-08
  async enviarEntrega(): Promise<void> {
    this.errorValidacion.set(null);
    this.mensajeExito.set(null);
    this.entregaRegistradaId.set(null);

    const tarea = this.tareaService.tareaSeleccionada();

    // Validación 1: Tarea seleccionada obligatoria (TH-02)
    if (!tarea) {
      this.errorValidacion.set('Debes seleccionar una tarea académica antes de registrar la entrega.');
      return;
    }

    // Validación 2: Comentario no vacío obligatorio (TH-02)
    if (!this.comentario || this.comentario.trim().length === 0) {
      this.errorValidacion.set('El comentario de entrega es obligatorio. Escribe una breve descripción de tu solución.');
      return;
    }

    this.guardando.set(true);

    const nuevaEntrega: EntregaLocal = {
      tareaId: tarea.id,
      curso: tarea.curso,
      tituloTarea: tarea.titulo,
      comentario: this.comentario.trim(),
      fechaRegistro: new Date().toISOString(),
      estadoSincronizacion: 'PENDIENTE', // TH-04
      intentosSincronizacion: 0,
      nombreArchivo: this.nombreArchivoAdjunto
    };

    try {
      // TH-03: Guardar en IndexedDB
      const id = await this.storageService.guardarEntregaLocal(nuevaEntrega);

      const verificacion = await this.storageService.obtenerEntrega(id);
      if (!verificacion) {
        throw new Error('Verificación fallida: No se encontró la entrega en IndexedDB tras guardarla.');
      }

      this.entregaRegistradaId.set(id);
      this.mensajeExito.set(
        `✓ Entrega #${id} guardada exitosamente en el almacenamiento local (IndexedDB) para la tarea "${tarea.titulo}". Estado: PENDIENTE. (Consulta tu bandeja "Mis entregas locales").`
      );

      this.comentario = '';
    } catch (err) {
      // TH-08: Manejo explícito de error en IndexedDB
      this.errorValidacion.set(
        `Fallo al interactuar con IndexedDB: ${(err as Error).message}. Tu formulario no se guardó.`
      );
    } finally {
      this.guardando.set(false);
    }
  }

  cancelar(): void {
    this.tareaService.limpiarSeleccion();
    this.comentario = '';
    this.errorValidacion.set(null);
    this.mensajeExito.set(null);
  }
}
