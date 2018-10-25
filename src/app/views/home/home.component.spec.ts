import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FolderService } from '@app/services/folder.service';
import { of } from 'rxjs';
import { IFormattedFolderPath } from '@common/types';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let folderService;
  const fakeFolder: IFormattedFolderPath = {
    folder: 'folder',
    path: '~/path/folder',
    fullPath: '/full/path/folder'
  };


  beforeEach(async(() => {
    folderService = jasmine.createSpyObj('FolderService', ['loadRecentFolders', 'openFolder']);
    folderService.recentFolders$ = of([]);

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        {
          provide: FolderService,
          useValue: folderService,
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have recent folders', fakeAsync(() => {
    mockRecentFolders();

    tick();
    fixture.detectChanges();

    expect(folderService.loadRecentFolders).toHaveBeenCalled();

    const element: DebugElement = fixture.debugElement;
    const list = element.queryAll(By.css('ul > li'));

    expect(list.length).toBe(1);

    expect(list[0].query(By.css('.folder-name')).nativeElement.textContent).toContain(fakeFolder.folder);
    expect(list[0].query(By.css('.folder-path')).nativeElement.textContent).toContain(fakeFolder.path);
  }));

  const mockRecentFolders = () => {
    component.ngOnInit();
    component.recentFolders$ = of([fakeFolder]);
  };
});
