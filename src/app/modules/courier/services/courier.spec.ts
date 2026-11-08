import { TestBed } from '@angular/core/testing';
import { Courier } from './courier';

describe('Courier', () => {
  let service: Courier;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Courier);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
