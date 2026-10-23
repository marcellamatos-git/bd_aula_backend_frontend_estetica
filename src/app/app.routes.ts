
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio').then(
        (m) => m.Inicio
      )
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes').then(
        (m) => m.Clientes
      )
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
