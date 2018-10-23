import { TestBed } from '@angular/core/testing';

import { TranslationService } from './translation.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TranslationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  it('should be created', () => {
    const service: TranslationService = TestBed.get(TranslationService);
    expect(service).toBeTruthy();
  });
});
