import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {
  CommonModule,
  NgIf,
  NgFor,
  NgClass,
  DecimalPipe,
  CurrencyPipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-obras-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    NgClass,
  
    CurrencyPipe
  ],
  templateUrl: './obras.page.html',
  styleUrls: ['./obras.page.css']
})
export class ObrasPage {
  // búsqueda / edición
  search: string = '';
  idEditando: number | null = null;

  // modal agregar
  showAddForm = false;
  newObra: NewObra = this.emptyNewObra();
  @ViewChild('nombreInput') nombreInput?: ElementRef<HTMLInputElement>;

  // datos demo
  obras: Obra[] = [
    {
      id: 1,
      nombre: 'Edificio Miraflores',
      ubicacion: 'Miraflores, Lima',
      responsable: 'Ing. Quiroz',
      estado: 'Activa',
      presupuesto: 1200000,
      gastado: 350000,
      fechaInicio: '2025-05-02'
    },
    {
      id: 2,
      nombre: 'Colegio San Pedro',
      ubicacion: 'Santiago de Surco',
      responsable: 'Arq. Salazar',
      estado: 'Pausada',
      presupuesto: 800000,
      gastado: 420000,
      fechaInicio: '2025-03-10'
    },
    {
      id: 3,
      nombre: 'Plaza de Huanchaco',
      ubicacion: 'Trujillo',
      responsable: 'Ing. Zamora',
      estado: 'Finalizada',
      presupuesto: 500000,
      gastado: 498500,
      fechaInicio: '2024-11-15',
      fechaFin: '2025-06-30'
    }
  ];

  // ---- LISTADO / FILTRO ----
  get obrasFiltradas(): Obra[] {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) return this.obras;
    return this.obras.filter(o =>
      o.nombre.toLowerCase().includes(q) ||
      o.ubicacion.toLowerCase().includes(q) ||
      o.responsable.toLowerCase().includes(q) ||
      o.estado.toLowerCase().includes(q)
    );
  }
  trackById = (_: number, o: Obra) => o.id;

  // ---- MODAL ----
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newObra = this.emptyNewObra();
      setTimeout(() => this.nombreInput?.nativeElement?.focus(), 0);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.showAddForm) this.toggleAddForm();
  }

  onOverlayClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) this.toggleAddForm();
  }

  // ---- ALTA ----
  private emptyNewObra(): NewObra {
    return {
      nombre: '',
      ubicacion: '',
      responsable: '',
      estado: 'Activa',
      presupuesto: 0,
      gastado: 0,
      fechaInicio: this.todayISO()
    };
  }

  private todayISO(): string {
    const d = new Date();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  addObra() {
    // Validación mínima
    if (!this.newObra.nombre.trim()) return;
    if (this.newObra.presupuesto < 0 || this.newObra.gastado < 0) return;
    if (this.newObra.gastado > this.newObra.presupuesto) return;

    const nextId = this.obras.length
      ? Math.max(...this.obras.map(o => o.id)) + 1
      : 1;

    const obra: Obra = {
      id: nextId,
      nombre: this.newObra.nombre.trim(),
      ubicacion: this.newObra.ubicacion.trim(),
      responsable: this.newObra.responsable.trim(),
      estado: this.newObra.estado,
      presupuesto: Number(this.newObra.presupuesto),
      gastado: Number(this.newObra.gastado),
      fechaInicio: this.newObra.fechaInicio,
      fechaFin: this.newObra.fechaFin || undefined
    };

    this.obras = [obra, ...this.obras];
    this.toggleAddForm();
  }

  // ---- ELIMINAR ----
  eliminarObra(o: Obra) {
    const ok = confirm(`¿Eliminar la obra "${o.nombre}"?`);
    if (!ok) return;
    this.obras = this.obras.filter(x => x.id !== o.id);
    if (this.idEditando === o.id) this.idEditando = null;
  }

  // ---- EDICIÓN EN LÍNEA (presupuesto) ----
  empezarEdicion(o: Obra) {
    this.idEditando = o.id;
    o.tempPresupuesto = o.presupuesto;
  }

  guardarEdicion(o: Obra) {
    const nuevo = Number(o.tempPresupuesto ?? o.presupuesto);
    if (Number.isFinite(nuevo) && nuevo >= 0 && o.gastado <= nuevo) {
      o.presupuesto = nuevo;
      // si estaba finalizada pero el presupuesto cambió, no tocamos estado
    }
    this.idEditando = null;
    delete o.tempPresupuesto;
  }

  cancelarEdicion(o: Obra) {
    this.idEditando = null;
    delete o.tempPresupuesto;
  }

  // ---- TOTALES ----
  getTotalPresupuesto(lista: Obra[]): number {
    return (lista || []).reduce((acc, it) => acc + it.presupuesto, 0);
  }
  getTotalGastado(lista: Obra[]): number {
    return (lista || []).reduce((acc, it) => acc + it.gastado, 0);
  }
  getTotalSaldo(lista: Obra[]): number {
    return this.getTotalPresupuesto(lista) - this.getTotalGastado(lista);
  }
}

// Tipos
export interface Obra {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  estado: 'Activa' | 'Pausada' | 'Finalizada';
  presupuesto: number;
  gastado: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string;   // YYYY-MM-DD
  tempPresupuesto?: number;
}

export interface NewObra {
  nombre: string;
  ubicacion: string;
  responsable: string;
  estado: 'Activa' | 'Pausada' | 'Finalizada';
  presupuesto: number;
  gastado: number;
  fechaInicio: string;
  fechaFin?: string;
}
