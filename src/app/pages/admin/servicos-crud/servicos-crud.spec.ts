import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicosCrud } from './servicos-crud';

describe('ServicosCrud', () => {
  let component: ServicosCrud;
  let fixture: ComponentFixture<ServicosCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicosCrud],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicosCrud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
