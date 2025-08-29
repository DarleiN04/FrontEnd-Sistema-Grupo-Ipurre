import { UUID } from './common.types';


export type TipoMovimiento =
| 'ingreso' // entra al almacén
| 'egreso' // sale hacia una obra
| 'asignacion' // se marca "en uso" en obra
| 'devolucion' // regresa al almacén
| 'baja'; // se descarta por daño/pérdida


export interface Movimiento {
id: UUID;
fecha: string; // ISO string
tipo: TipoMovimiento;
materialId: UUID;
cantidad: number;
obraId?: UUID; // para egresos/asignaciones/devoluciones
observacion?: string;
}