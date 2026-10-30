import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdutosCrud } from './produtos-crud';

describe('ProdutosCrud', () => {
  let component: ProdutosCrud;
  let fixture: ComponentFixture<ProdutosCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosCrud],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutosCrud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
