import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { ClientesComponent } from './pages/clientes/clientes';
import { CatalogoComponent } from './pages/catalogo/catalogo';
import { CarrinhoComponent } from './pages/carrinho/carrinho';
import { MeusPedidosComponent } from './pages/meus-pedidos/meus-pedidos';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';
import { ProdutosCrudComponent } from './pages/admin/produtos-crud/produtos-crud';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrinho', component: CarrinhoComponent },
  { path: 'meus-pedidos', component: MeusPedidosComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'produtos-crud', component: ProdutosCrudComponent },
  { path: '**', redirectTo: 'inicio' }
];