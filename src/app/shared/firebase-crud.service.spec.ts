import { TestBed } from '@angular/core/testing';

import { FirebaseCrudService } from './firebase-crud.service';

describe('FirebaseCrudService', () => {
  let service: FirebaseCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
