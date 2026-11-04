import { TestBed } from '@angular/core/testing';
import { Servicos } from './servicos.service';

describe('Servicos', () => {
  let service: Servicos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Servicos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
