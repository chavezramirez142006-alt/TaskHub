import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { Tarea } from '../../models/tarea.model';

@Component({
  selector: 'app-taskhub-tareas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas-lista.component.html',
  styleUrls: ['./tareas-lista.component.scss']
})
export class TaskHubTareasListaComponent {
  tareaService = inject(TareaService);

  tareaDetalle: Tarea | null = null;

  seleccionarParaEntregar(tarea: Tarea): void {
    this.tareaService.seleccionarTareaParaEntrega(tarea);
  }

  verDetalle(tarea: Tarea): void {
    this.tareaDetalle = tarea;
  }

  cerrarDetalle(): void {
    this.tareaDetalle = null;
  }
}
