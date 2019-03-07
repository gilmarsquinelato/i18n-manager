import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';
import { TranslateButtonComponent } from '@app/components/translate-button/translate-button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SettingsService } from '@app/services/settings.service';
import { TranslationService } from '@app/services/translation.service';
import { of } from 'rxjs';
import { ParsedFile } from '@common/types';
import { By } from '@angular/platform-browser';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatMenuModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


class SettingsServiceMock {
  getSettings = () => of({});
}

class TranslationServiceMock {

}

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;

  const settingsServiceMock = new SettingsServiceMock();
  const translationServiceMock = new TranslationServiceMock();

  const mockFolder: ParsedFile[] = [
    {
      language: 'en-us',
      extension: 'json',
      fileName: 'en-us.json',
      filePath: '/fake/path/en-us.json',
      data: {
        message: 'value',
      },
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentComponent,
        TranslateButtonComponent,
      ],
      imports: [
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatMenuModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: SettingsService,
          useValue: settingsServiceMock,
        },
        {
          provide: TranslationService,
          useValue: translationServiceMock,
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render languages of selected path', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = mockFolder;

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.field')).length).toBe(1);
  }));

  it('should have the correct label', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = mockFolder;

    fixture.detectChanges();

    const inputGroups = fixture.debugElement.queryAll(By.css('.field'));
    expect(inputGroups[0].query(By.css('label')).nativeElement.textContent).toBe('English (United States) - en-us');
  }));

  it('should have the correct value', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = mockFolder;

    fixture.detectChanges();

    const inputGroups = fixture.debugElement.queryAll(By.css('.field'));
    console.log(inputGroups);
    expect(inputGroups[0].query(By.css('input')).nativeElement.value).toBe(mockFolder[0].data.message);
  }));

  it('should have status = new', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = [{...mockFolder[0], data: {}}];
    component.status = {
      message: {
        'en-us': {isChanged: false, isNew: true, isMissing: false},
      }
    };

    component.ngOnInit();
    fixture.detectChanges();

    const inputGroups = fixture.debugElement.queryAll(By.css('.field'));
    expect(inputGroups[0].nativeElement.classList).toContain('new');
  }));

  it('should have status = changed', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = [{...mockFolder[0], data: {message: 'originalValue'}}];
    component.status = {
      message: {
        'en-us': {isChanged: true, isNew: false, isMissing: false},
      }
    };

    component.ngOnInit();
    fixture.detectChanges();

    const inputGroups = fixture.debugElement.queryAll(By.css('.field'));
    expect(inputGroups[0].nativeElement.classList).toContain('changed');
  }));

  it('should have status = missing', fakeAsync(() => {
    component.path = ['message'];
    component.folder = mockFolder;
    component.originalFolder = mockFolder;
    component.status = {
      message: {
        'en-us': {isChanged: false, isNew: false, isMissing: true},
      }
    };

    component.ngOnInit();
    fixture.detectChanges();

    const inputGroups = fixture.debugElement.queryAll(By.css('.field'));
    expect(inputGroups[0].nativeElement.classList).toContain('missing');
  }));
});
