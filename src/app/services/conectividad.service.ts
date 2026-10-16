import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConectividadService {
  readonly isOnline = signal<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => {
      console.log('[ConectividadService] Conexión detectada: Online');
      this.isOnline.set(true);
    });

    window.addEventListener('offline', () => {
      console.log('[ConectividadService] Pérdida de conexión: Offline');
      this.isOnline.set(false);
    });
  }

  get origenActual(): 'ONLINE' | 'OFFLINE' {
    return this.isOnline() ? 'ONLINE' : 'OFFLINE';
  }

  get mensajeEstado(): string {
    return this.isOnline()
      ? '🟢 Conectado - Listo para operar (Almacenando en IndexedDB local)'
      : '🔴 Modo Sin Conexión (Offline) - Operando 100% con almacenamiento local';
  }
}
