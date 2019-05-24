import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';
import { TranslateButtonComponent } from '@app/components/translate-button/translate-button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SettingsService } from '@app/services/settings.service';
import { TranslationService } from '@app/services/translation.service';
import { of } from 'rxjs';
import { ParsedFile } from '@common/types';
import { By } from '@angular/platform-browser';
import {
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatMenuModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';


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
        ScrollingModule,
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
});
