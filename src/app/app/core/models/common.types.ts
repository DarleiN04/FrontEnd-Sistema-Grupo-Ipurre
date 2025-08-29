export type UUID = string;
export type Unidad = 'unidad' | 'juego' | 'caja' | 'rollo';


export interface StockDetalle {
total: number; // total en almacén + uso
enUso: number; // asignados a obras / prestados
enAlmacen: number; // disponibles en almacén
minimo?: number; // stock mínimo recomendado
}