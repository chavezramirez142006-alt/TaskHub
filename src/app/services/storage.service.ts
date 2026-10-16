import { Injectable } from '@angular/core';
import { EntregaLocal, EstadoSincronizacion } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly dbName = 'SENATITaskHubDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'entregas';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no soportado en este navegador.'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('tareaId', 'tareaId', { unique: false });
          store.createIndex('estadoSincronizacion', 'estadoSincronizacion', { unique: false });
          store.createIndex('fechaRegistro', 'fechaRegistro', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('TH-08: No se pudo abrir la base de datos SENATITaskHubDB'));
    });
  }

  /**
   * Guarda una entrega local con fecha y estado inicial PENDIENTE.
   * Reglas TH-03, TH-04, TH-08.
   */
  async guardarEntregaLocal(entrega: EntregaLocal): Promise<number> {
    try {
      const db = await this.dbPromise;
      return new Promise<number>((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        const registro: Omit<EntregaLocal, 'id'> = {
          tareaId: entrega.tareaId,
          curso: entrega.curso,
          tituloTarea: entrega.tituloTarea,
          comentario: entrega.comentario,
          fechaRegistro: entrega.fechaRegistro || new Date().toISOString(),
          estadoSincronizacion: 'PENDIENTE', // TH-04
          intentosSincronizacion: 0,
          nombreArchivo: entrega.nombreArchivo || 'evidencia_tarea.pdf'
        };

        const request = store.add(registro);

        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(new Error('TH-08: Error al persistir la entrega en IndexedDB'));
        transaction.onerror = () => reject(new Error('TH-08: Error de transacción en IndexedDB'));
      });
    } catch (err) {
      throw new Error(`TH-08: ${(err as Error).message}`);
    }
  }

  /**
   * Devuelve las entregas para la bandeja "Mis entregas locales".
   */
  async listarEntregas(): Promise<EntregaLocal[]> {
    const db = await this.dbPromise;
    return new Promise<EntregaLocal[]>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const resultados = (request.result as EntregaLocal[]) || [];
        resultados.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        resolve(resultados);
      };

      request.onerror = () => reject(new Error('Error al listar entregas'));
    });
  }

  /**
   * Consulta el detalle de una entrega específica.
   */
  async obtenerEntrega(id: number): Promise<EntregaLocal | undefined> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as EntregaLocal);
      request.onerror = () => reject(new Error(`No se pudo consultar la entrega #${id}`));
    });
  }

  /**
   * Elimina un registro tras confirmación del usuario.
   * Regla TH-07.
   */
  async eliminarEntrega(id: number): Promise<boolean> {
    const db = await this.dbPromise;
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error(`TH-08: Error al eliminar la entrega #${id}`));
    });
  }

  /**
   * Cuenta los registros en estado PENDIENTE derivado de la base de datos.
   * Regla TH-05.
   */
  async contarPendientes(): Promise<number> {
    const db = await this.dbPromise;
    return new Promise<number>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('estadoSincronizacion');
      const request = index.count('PENDIENTE');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Error al contar entregas pendientes'));
    });
  }

  /**
   * Actualiza estado y metadatos tras un intento real.
   */
  async actualizarEstado(id: number, estado: EstadoSincronizacion, errorMsg?: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as EntregaLocal;
        if (!item) {
          reject(new Error(`Entrega #${id} no encontrada`));
          return;
        }

        item.estadoSincronizacion = estado;
        item.intentosSincronizacion = (item.intentosSincronizacion || 0) + 1;
        if (errorMsg) {
          item.ultimoError = errorMsg;
        }

        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(new Error('Error al actualizar estado de la entrega'));
      };

      getReq.onerror = () => reject(new Error('Error al buscar la entrega'));
    });
  }
}
