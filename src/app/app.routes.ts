
import { Routes } from '@angular/router';

import { InicioComponent } from './pages/inicio/inicio';
import { ClientesComponent } from './pages/clientes/clientes';
import { CatalogoComponent } from './pages/catalogo/catalogo';
import { CarrinhoComponent } from './pages/carrinho/carrinho';
import { MeusPedidosComponent } from './pages/meus-pedidos/meus-pedidos';

import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';
import { ProdutosCrudComponent } from './pages/admin/produtos-crud/produtos-crud';
import { ServicosCrudComponent } from './pages/admin/servicos-crud/servicos-crud';
import { PedidosAdminComponent } from './pages/admin/pedidos-admin/pedidos-admin';

import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  // PÁGINAS PÚBLICAS
  { path: 'inicio', component: InicioComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrinho', component: CarrinhoComponent },
  { path: 'meus-pedidos', component: MeusPedidosComponent },

  // CADASTRO PÚBLICO DE CLIENTES
  {
    path: 'clientes',
    component: ClientesComponent,
    data: { mostrarLista: false }
  },

  // PAINEL ADMINISTRATIVO
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },

  // GERENCIAMENTO DE CLIENTES
  {
    path: 'admin/clientes',
    component: ClientesComponent,
    canActivate: [adminGuard],
    data: { mostrarLista: true }
  },

  {
    path: 'produtos-crud',
    component: ProdutosCrudComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'servicos-crud',
    component: ServicosCrudComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'pedidos-admin',
    component: PedidosAdminComponent,
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: 'inicio' }

];
