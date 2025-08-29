import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
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
  selector: 'app-materiales-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    CurrencyPipe
  ],
  templateUrl: './materiales.page.html',
  styleUrls: ['./materiales.page.css']
})
export class MaterialesPage {
  // búsqueda / edición
  search: string = '';
  idEditando: number | null = null;

  // modal agregar
  showAddForm = false;
  newMaterial: NewMaterial = this.getEmptyNewMaterial();
  @ViewChild('nombreInput') nombreInput?: ElementRef<HTMLInputElement>;

  // datos demo
  materiales: Material[] = [
    { id: 1, nombre: 'Cemento',        cantidad: 500, unidad: 'bolsas',   costo: 10,  estado: 'En Stock',   proveedor: 'Proveedor A' },
    { id: 2, nombre: 'Vigas de Acero', cantidad: 200, unidad: 'unidades', costo: 50,  estado: 'En Stock',   proveedor: 'Proveedor B' },
    { id: 3, nombre: 'Madera',         cantidad: 80,  unidad: 'tablones', costo: 5,   estado: 'Stock Bajo', proveedor: 'Proveedor C' },
  ];

  // ------ LISTADO / FILTRO ------
  get materialesFiltrados(): Material[] {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) return this.materiales;
    return this.materiales.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      m.proveedor.toLowerCase().includes(q)
    );
  }
  trackById = (_: number, m: Material) => m.id;

  // ------ MODAL ------
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newMaterial = this.getEmptyNewMaterial();
      // dar tiempo a que ngIf pinte el input y enfocar
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

  // ------ ALTA ------
  private getEmptyNewMaterial(): NewMaterial {
    return {
      nombre: '',
      cantidad: 0,
      unidad: 'unidades',
      costo: 0,
      estado: 'En Stock',
      proveedor: ''
    };
  }

  addMaterial() {
    // validación mínima
    if (!this.newMaterial.nombre.trim()) return;
    if (this.newMaterial.cantidad < 0 || this.newMaterial.costo < 0) return;

    const nextId = this.materiales.length
      ? Math.max(...this.materiales.map(m => m.id)) + 1
      : 1;

    const nuevo: Material = {
      id: nextId,
      nombre: this.newMaterial.nombre.trim(),
      cantidad: Math.floor(this.newMaterial.cantidad),
      unidad: this.newMaterial.unidad.trim() || 'unidades',
      costo: Number(this.newMaterial.costo),
      estado: this.newMaterial.estado,
      proveedor: this.newMaterial.proveedor.trim()
    };

    this.materiales = [nuevo, ...this.materiales];
    this.toggleAddForm();
  }

  // ------ ELIMINAR ------
  eliminarMaterial(m: Material) {
    const ok = confirm(`¿Eliminar "${m.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.materiales = this.materiales.filter(x => x.id !== m.id);
    if (this.idEditando === m.id) this.idEditando = null;
  }

  // ------ EDICIÓN EN LÍNEA ------
  empezarEdicion(m: Material) {
    this.idEditando = m.id;
    m.tempCantidad = m.cantidad;
  }

  guardarEdicion(m: Material) {
    const nueva = Number(m.tempCantidad ?? m.cantidad);
    if (Number.isFinite(nueva) && nueva >= 0) {
      m.cantidad = nueva;

      if (m.cantidad === 0) m.estado = 'Agotado';
      else if (m.cantidad < 100) m.estado = 'Stock Bajo';
      else m.estado = 'En Stock';
    }
    this.idEditando = null;
    delete m.tempCantidad;
  }

  cancelarEdicion(m: Material) {
    this.idEditando = null;
    delete m.tempCantidad;
  }

  // ------ TOTALES ------
  getValorInventario(lista: Material[]): number {
    return (lista || []).reduce((acc, it) => acc + (it.cantidad * it.costo), 0);
  }
}

// Tipos
export interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  costo: number;
  estado: 'En Stock' | 'Stock Bajo' | 'Agotado';
  proveedor: string;
  tempCantidad?: number;
}

export interface NewMaterial {
  nombre: string;
  cantidad: number;
  unidad: string;
  costo: number;
  estado: 'En Stock' | 'Stock Bajo' | 'Agotado';
  proveedor: string;
}
