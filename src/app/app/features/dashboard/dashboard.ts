import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  totalMateriales = 0;
  totalObras = 0;
  totalMovimientos = 0;

  ngOnInit() {
    // 🔹 Datos simulados por ahora (sin services)
    this.totalMateriales = 12;   // cantidad de materiales en catálogo
    this.totalObras = 5;         // cantidad de obras activas
    this.totalMovimientos = 34;  // cantidad de movimientos registrados
  }

}
