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
  selector: 'app-movimientos-page',
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
  templateUrl: './movimientos.page.html'
})
export class MovimientosPage {
  // búsqueda / filtros
  search = '';
  filtroTipo: TipoMovimiento | '' = '';
  fechaDesde = '';
  fechaHasta = '';

  // edición en línea
  idEditando: number | null = null;

  // modal agregar
  showAddForm = false;
  newMov: NewMovimiento = this.emptyNewMov();
  @ViewChild('materialInput') materialInput?: ElementRef<HTMLInputElement>;

  // opciones de ejemplo
  materialesOptions = ['Cemento', 'Vigas de Acero', 'Madera', 'Ladrillos'];
  obrasOptions = ['Edificio Miraflores', 'Colegio San Pedro', 'Plaza de Huanchaco'];
  usuariosOptions = ['renzo', 'admin', 'operador'];

  // datos demo
  movimientos: Movimiento[] = [
    { id: 1, fecha: '2025-08-20', tipo: 'Entrada', material: 'Cemento', cantidad: 100, costo: 10,  obra: 'Edificio Miraflores', usuario: 'renzo', nota: 'OC-1001' },
    { id: 2, fecha: '2025-08-21', tipo: 'Salida',  material: 'Cemento', cantidad: 20,  costo: 10,  obra: 'Edificio Miraflores', usuario: 'renzo', nota: 'Consumo losa' },
    { id: 3, fecha: '2025-08-22', tipo: 'Ajuste',  material: 'Madera',  cantidad: -5,  costo: 5,   obra: 'Colegio San Pedro',  usuario: 'admin', nota: 'Merma' },
    { id: 4, fecha: '2025-08-22', tipo: 'Entrada', material: 'Vigas de Acero', cantidad: 50, costo: 50, obra: 'Plaza de Huanchaco', usuario: 'operador', nota: 'OC-1002' },
  ];

  // ===== Helpers de fecha =====
  private toDay(str: string): number {
    // YYYY-MM-DD → número simple YYYYMMDD para comparar fácilmente
    if (!str) return 0;
    return Number(str.replaceAll('-', ''));
  }
  private todayISO(): string {
    const d = new Date();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // ===== Listado filtrado =====
  get movimientosFiltrados(): Movimiento[] {
    const q = (this.search || '').toLowerCase().trim();
    const dMin = this.toDay(this.fechaDesde);
    const dMax = this.toDay(this.fechaHasta);

    return this.movimientos.filter(m => {
      const matchQ = !q ||
        m.material.toLowerCase().includes(q) ||
        (m.obra?.toLowerCase().includes(q)) ||
        (m.usuario?.toLowerCase().includes(q)) ||
        m.tipo.toLowerCase().includes(q) ||
        (m.nota?.toLowerCase().includes(q));

      const matchTipo = !this.filtroTipo || m.tipo === this.filtroTipo;

      const d = this.toDay(m.fecha);
      const matchFecha =
        (!dMin || d >= dMin) &&
        (!dMax || d <= dMax);

      return matchQ && matchTipo && matchFecha;
    });
  }

  trackById = (_: number, m: Movimiento) => m.id;

  // ===== Modal =====
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newMov = this.emptyNewMov();
      setTimeout(() => this.materialInput?.nativeElement?.focus(), 0);
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

  private emptyNewMov(): NewMovimiento {
    return {
      fecha: this.todayISO(),
      tipo: 'Entrada',
      material: '',
      cantidad: 0,
      costo: 0,
      obra: '',
      usuario: '',
      nota: ''
    };
  }

  // ===== Alta =====
  addMovimiento() {
    if (!this.newMov.material.trim()) return;
    if (!this.newMov.tipo) return;
    if (!this.newMov.fecha) this.newMov.fecha = this.todayISO();

    // Normalizamos cantidad: para Ajuste se permite negativa; para Salida aseguramos negativa.
    let cant = Number(this.newMov.cantidad);
    if (!Number.isFinite(cant)) return;

    if (this.newMov.tipo === 'Salida' && cant > 0) cant = -cant;
    if (this.newMov.tipo === 'Entrada' && cant < 0) cant = Math.abs(cant);

    const nextId = this.movimientos.length ? Math.max(...this.movimientos.map(x => x.id)) + 1 : 1;

    const movimiento: Movimiento = {
      id: nextId,
      fecha: this.newMov.fecha,
      tipo: this.newMov.tipo,
      material: this.newMov.material.trim(),
      cantidad: cant,
      costo: Number(this.newMov.costo) || 0,
      obra: this.newMov.obra?.trim(),
      usuario: this.newMov.usuario?.trim(),
      nota: this.newMov.nota?.trim()
    };

    this.movimientos = [movimiento, ...this.movimientos];
    this.toggleAddForm();
  }

  // ===== Eliminar =====
  eliminarMovimiento(m: Movimiento) {
    const ok = confirm(`¿Eliminar el movimiento #${m.id} (${m.tipo} - ${m.material})?`);
    if (!ok) return;
    this.movimientos = this.movimientos.filter(x => x.id !== m.id);
    if (this.idEditando === m.id) this.idEditando = null;
  }

  // ===== Edición en línea (cantidad y costo) =====
  empezarEdicion(m: Movimiento) {
    this.idEditando = m.id;
    m.tempCantidad = m.cantidad;
    m.tempCosto = m.costo;
  }

  guardarEdicion(m: Movimiento) {
    const cant = Number(m.tempCantidad ?? m.cantidad);
    const costo = Number(m.tempCosto ?? m.costo);
    if (!Number.isFinite(cant) || !Number.isFinite(costo)) return;

    // Ajuste de signo si el tipo es Salida
    m.cantidad = (m.tipo === 'Salida' && cant > 0) ? -cant : cant;
    m.costo = Math.max(0, costo);

    this.idEditando = null;
    delete m.tempCantidad;
    delete m.tempCosto;
  }

  cancelarEdicion(m: Movimiento) {
    this.idEditando = null;
    delete m.tempCantidad;
    delete m.tempCosto;
  }

  // ===== Totales (por lista filtrada) =====
  getEntradasCantidad(lista: Movimiento[]): number {
    return (lista || []).reduce((acc, it) => acc + (it.cantidad > 0 ? it.cantidad : 0), 0);
  }
  getSalidasCantidad(lista: Movimiento[]): number {
    return (lista || []).reduce((acc, it) => acc + (it.cantidad < 0 ? Math.abs(it.cantidad) : 0), 0);
  }
  getNetoCantidad(lista: Movimiento[]): number {
    return this.getEntradasCantidad(lista) - this.getSalidasCantidad(lista);
  }

  // Valor: entradas (+), salidas (−). Los Ajustes respetan el signo de cantidad.
  getEntradasValor(lista: Movimiento[]): number {
    return (lista || []).reduce((acc, it) => acc + (it.cantidad > 0 ? it.cantidad * it.costo : 0), 0);
  }
  getSalidasValor(lista: Movimiento[]): number {
    return (lista || []).reduce((acc, it) => acc + (it.cantidad < 0 ? Math.abs(it.cantidad) * it.costo : 0), 0);
  }
  getNetoValor(lista: Movimiento[]): number {
    return this.getEntradasValor(lista) - this.getSalidasValor(lista);
  }
}

// Tipos
export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste' | 'Transferencia';

export interface Movimiento {
  id: number;
  fecha: string;       // YYYY-MM-DD
  tipo: TipoMovimiento;
  material: string;
  cantidad: number;    // negativa para salidas, positiva para entradas/ajustes
  costo: number;       // costo unitario
  obra?: string;
  usuario?: string;
  nota?: string;

  tempCantidad?: number;
  tempCosto?: number;
}

export interface NewMovimiento {
  fecha: string;
  tipo: TipoMovimiento;
  material: string;
  cantidad: number;
  costo: number;
  obra?: string;
  usuario?: string;
  nota?: string;
}
