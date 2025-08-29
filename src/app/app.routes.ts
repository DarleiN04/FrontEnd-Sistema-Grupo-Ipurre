import { Routes } from '@angular/router';
import { Shell } from './app/layout/shell/shell';
import { Dashboard } from './app/features/dashboard/dashboard';
import { MaterialesPage } from './app/features/materiales/materiales.page';
import { ObrasPage } from './app/features/obras/obras.page';
import { MovimientosPage } from './app/features/movimientos/movimientos.page';
import { Login } from './auth/login/login';

export const routes: Routes = [
  // 👉 Ruta raíz redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 👉 Login separado del Shell
  { path: 'login', component: Login },

  // 👉 Rutas del dashboard dentro del Shell
  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'materiales', component: MaterialesPage },
      { path: 'obras', component: ObrasPage },
      { path: 'movimientos', component: MovimientosPage },
    ],
  },

  // 👉 Rutas no encontradas redirigen al login
  { path: '**', redirectTo: 'login' }
];
