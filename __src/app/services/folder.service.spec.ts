import { TestBed } from '@angular/core/testing';

import { FolderService } from './folder.service';

describe('FolderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FolderService = TestBed.get(FolderService);
    expect(service).toBeTruthy();
  });
});
