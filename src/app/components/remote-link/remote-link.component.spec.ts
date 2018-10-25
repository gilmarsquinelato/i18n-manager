import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLinkComponent } from './remote-link.component';

describe('RemoteLinkComponent', () => {
  let component: RemoteLinkComponent;
  let fixture: ComponentFixture<RemoteLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
