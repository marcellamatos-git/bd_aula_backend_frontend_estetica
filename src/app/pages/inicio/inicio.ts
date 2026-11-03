import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {}