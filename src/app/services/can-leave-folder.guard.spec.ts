import { TestBed, async, inject } from '@angular/core/testing';

import { CanLeaveFolderGuard } from './can-leave-folder.guard';

describe('CanLeaveFolderGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanLeaveFolderGuard]
    });
  });

  it('should ...', inject([CanLeaveFolderGuard], (guard: CanLeaveFolderGuard) => {
    expect(guard).toBeTruthy();
  }));
});
