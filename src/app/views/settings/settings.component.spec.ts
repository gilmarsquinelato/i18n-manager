import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RemoteLinkComponent } from '@app/components/remote-link/remote-link.component';
import { Location } from '@angular/common';
import { SettingsService } from '@app/services/settings.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';


class SettingsServiceMock {
  getSettings = () => of({});

  save = () => {
  };
}


describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  const settingsService = new SettingsServiceMock();
  const location = jasmine.createSpyObj('Location', ['back']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent, RemoteLinkComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: Location,
          useValue: location,
        },
        {
          provide: SettingsService,
          useValue: settingsService,
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load saved settings', fakeAsync(() => {
    const settings = {
      googleTranslateApiKey: 'apiKey',
    };

    spyOn(settingsService, 'getSettings').and.returnValue(of(settings));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.originalSettings.googleTranslateApiKey).toBe(settings.googleTranslateApiKey);
    expect(fixture.debugElement.query(By.css('#googleTranslateApiKey')).nativeElement.value).toBe(settings.googleTranslateApiKey);
  }));

  it('should save settings', fakeAsync(() => {
    const settings = {
      googleTranslateApiKey: 'apiKey',
    };

    spyOn(settingsService, 'getSettings').and.returnValue(of(settings));
    spyOn(settingsService, 'save');

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement.click();

    expect(settingsService.save).toHaveBeenCalledWith(settings);
    expect(location.back).toHaveBeenCalled();
  }));

  it('should reset settings', fakeAsync(() => {
    const settings = {
      googleTranslateApiKey: 'apiKey',
    };

    spyOn(settingsService, 'getSettings').and.returnValue(of(settings));
    spyOn(settingsService, 'save');

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const apiKeyInput = fixture.debugElement.query(By.css('#googleTranslateApiKey')).nativeElement;
    apiKeyInput.value = 'asd';
    apiKeyInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    fixture.debugElement.query(By.css('button[type="reset"]')).nativeElement.click();

    expect(location.back).toHaveBeenCalled();
    expect(component.settings.value).toEqual(settings);
  }));
});
