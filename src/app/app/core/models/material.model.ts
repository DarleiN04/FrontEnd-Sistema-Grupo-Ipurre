import { UUID, Unidad, StockDetalle } from './common.types';


export interface Material {
id: UUID;
codigo: string; // ej: MAT-0001
nombre: string; // ej: Taladro percutor
categoria: 'herramienta' | 'EPP' | 'consumible' | 'equipamiento';
unidad: Unidad;
marca?: string;
modelo?: string;
descripcion?: string;
stock: StockDetalle;
}