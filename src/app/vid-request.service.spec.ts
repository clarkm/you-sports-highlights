import { TestBed } from '@angular/core/testing';

import { VidRequestService } from './vid-request.service';

describe('VidRequestService', () => {
  let service: VidRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VidRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
