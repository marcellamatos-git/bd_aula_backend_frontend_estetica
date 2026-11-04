import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosAdmin } from './pedidos-admin';

describe('PedidosAdmin', () => {
  let component: PedidosAdmin;
  let fixture: ComponentFixture<PedidosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
