import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstoqueConsulta } from './estoque-consulta';

describe('EstoqueConsulta', () => {
  let component: EstoqueConsulta;
  let fixture: ComponentFixture<EstoqueConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstoqueConsulta],
    }).compileComponents();

    fixture = TestBed.createComponent(EstoqueConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
