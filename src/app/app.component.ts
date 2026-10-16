import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskHubTareasListaComponent } from './components/tareas-lista/tareas-lista.component';
import { TaskHubFormularioEntregaComponent } from './components/formulario-entrega/formulario-entrega.component';
import { TaskHubBandejaEntregasComponent } from './components/bandeja-entregas/bandeja-entregas.component';
import { StorageService } from './services/storage.service';
import { TareaService } from './services/tarea.service';
import { ConectividadService } from './services/conectividad.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TaskHubTareasListaComponent,
    TaskHubFormularioEntregaComponent,
    TaskHubBandejaEntregasComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  storageService = inject(StorageService);
  tareaService = inject(TareaService);
  conectividadService = inject(ConectividadService);

  readonly tabActiva = signal<'tareas' | 'formulario' | 'bandeja'>('tareas');

  setTab(tab: 'tareas' | 'formulario' | 'bandeja'): void {
    this.tabActiva.set(tab);
  }
}
