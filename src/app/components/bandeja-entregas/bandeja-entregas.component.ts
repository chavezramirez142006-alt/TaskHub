import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { ConectividadService } from '../../services/conectividad.service';
import { EntregaLocal } from '../../models/entrega.model';

@Component({
  selector: 'app-taskhub-bandeja-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bandeja-entregas.component.html',
  styleUrls: ['./bandeja-entregas.component.scss']
})
export class TaskHubBandejaEntregasComponent implements OnInit {
  storageService = inject(StorageService);
  conectividadService = inject(ConectividadService);

  readonly entregas = signal<EntregaLocal[]>([]);
  readonly totalPendientes = signal<number>(0); // TH-05
  readonly cargando = signal<boolean>(true);
  readonly errorMsg = signal<string | null>(null);

  // TH-07: Modal de Confirmación de Eliminación
  readonly entregaParaEliminar = signal<EntregaLocal | null>(null);

  // Modal de Detalle
  readonly entregaParaDetalle = signal<EntregaLocal | null>(null);

  // TH-06: Mensaje honesto de sincronización
  readonly mensajeSync = signal<string | null>(null);
  readonly intentandoSync = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    await this.recargarBandeja();
  }

  async recargarBandeja(): Promise<void> {
    this.cargando.set(true);
    this.errorMsg.set(null);
    try {
      const lista = await this.storageService.listarEntregas();
      this.entregas.set(lista);
      const pendientes = await this.storageService.contarPendientes();
      this.totalPendientes.set(pendientes);
    } catch (err) {
      this.errorMsg.set(`Error al leer IndexedDB: ${(err as Error).message}`);
    } finally {
      this.cargando.set(false);
    }
  }

  solicitarEliminacion(entrega: EntregaLocal): void {
    this.entregaParaEliminar.set(entrega);
  }

  cancelarEliminacion(): void {
    this.entregaParaEliminar.set(null);
  }

  async confirmarEliminacion(): Promise<void> {
    const target = this.entregaParaEliminar();
    if (target && target.id) {
      try {
        await this.storageService.eliminarEntrega(target.id);
        this.entregaParaEliminar.set(null);
        await this.recargarBandeja();
      } catch (err) {
        this.errorMsg.set(`No se pudo eliminar la entrega: ${(err as Error).message}`);
      }
    }
  }

  verDetalle(entrega: EntregaLocal): void {
    this.entregaParaDetalle.set(entrega);
  }

  cerrarDetalle(): void {
    this.entregaParaDetalle.set(null);
  }

  async reintentarSincronizacion(): Promise<void> {
    this.intentandoSync.set(true);
    this.mensajeSync.set(null);

    await new Promise(r => setTimeout(r, 600));

    if (!this.conectividadService.isOnline()) {
      this.mensajeSync.set(
        '⚠️ Sin conexión a internet: No es posible contactar un servidor remoto. Las entregas se conservan seguras en tu navegador.'
      );
      this.intentandoSync.set(false);
      return;
    }

    this.mensajeSync.set(
      '🌐 "Con conexión: listo para intentar sincronizar". Al no disponer de un endpoint/API empresarial remoto configurado, los registros se mantienen honestamente en estado PENDIENTE dentro de IndexedDB. No se alteran a SINCRONIZADO sin confirmación remota verificada.'
    );

    this.intentandoSync.set(false);
  }
}
