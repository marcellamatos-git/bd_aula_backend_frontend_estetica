import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verifica se o administrador já fez login nesta sessão
  const estaAutenticado = sessionStorage.getItem('adminAutenticado') === 'true';

  if (estaAutenticado) {
    return true;
  }

  // Pede a senha caso ainda não tenha feito login
  const senhaDig = prompt('🔒 ÁREA RESTRITA DA ADMINISTRAÇÃO\nDigite a senha do administrador:');
  
  if (senhaDig === 'admin123') { 
    sessionStorage.setItem('adminAutenticado', 'true');
    return true;
  } else {
    alert('Senha incorreta! Acesso negado ao Painel Administrativo.');
    router.navigate(['/inicio']);
    return false;
  }
};