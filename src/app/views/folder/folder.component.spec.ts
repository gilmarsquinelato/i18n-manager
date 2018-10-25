import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderComponent } from './folder.component';
import { TreeComponent } from '@app/components/tree/tree.component';
import { ContentComponent } from '@app/components/content/content.component';
import { FormsModule } from '@angular/forms';
import { TranslateButtonComponent } from '@app/components/translate-button/translate-button.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

describe('FolderComponent', () => {
  let component: FolderComponent;
  let fixture: ComponentFixture<FolderComponent>;

  beforeEach(async(() => {
    const activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    activatedRoute.snapshot = {
      queryParamMap: {
        get() { return ''; }
      }
    };

    const location = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [
        FolderComponent,
        TreeComponent,
        ContentComponent,
        TranslateButtonComponent,
      ],
      imports: [
        FormsModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: Location,
          useValue: location,
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
