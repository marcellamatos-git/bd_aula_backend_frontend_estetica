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

// Importação do Guard que solicita a senha
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // --- MÓDULO 1: LOJA VIRTUAL (ACESSO LIVRE) ---
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrinho', component: CarrinhoComponent },
  { path: 'meus-pedidos', component: MeusPedidosComponent },

  // --- MÓDULO 2: PAINEL ADMINISTRATIVO (PROTEGIDO POR SENHA) ---
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [adminGuard] },
  { path: 'produtos-crud', component: ProdutosCrudComponent, canActivate: [adminGuard] },
  { path: 'servicos-crud', component: ServicosCrudComponent, canActivate: [adminGuard] },
  { path: 'pedidos-admin', component: PedidosAdminComponent, canActivate: [adminGuard] },

  // Rota padrão para redirecionar caminhos inexistentes
  { path: '**', redirectTo: 'inicio' }
];