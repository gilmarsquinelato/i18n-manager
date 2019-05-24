import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeComponent } from './tree.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TreeComponent', () => {
  let component: TreeComponent;
  let fixture: ComponentFixture<TreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TreeComponent],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatIconModule,
        MatChipsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
