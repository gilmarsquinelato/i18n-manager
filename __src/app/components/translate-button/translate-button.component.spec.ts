import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateButtonComponent } from './translate-button.component';
import { MatIconModule } from '@angular/material';

describe('TranslateButtonComponent', () => {
  let component: TranslateButtonComponent;
  let fixture: ComponentFixture<TranslateButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TranslateButtonComponent],
      imports: [MatIconModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
