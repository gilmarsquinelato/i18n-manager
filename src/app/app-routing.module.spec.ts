import { AppRoutingModule } from './app-routing.module';
import { IpcService } from '@app/services/ipc.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppRoutingModule', () => {
  let appRoutingModule: AppRoutingModule;

  beforeEach(() => {
    const router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        IpcService,
        {
          provide: Router,
          useValue: router,
        },
      ]
    });

    appRoutingModule = new AppRoutingModule(TestBed.get(IpcService), TestBed.get(Router));
  });

  it('should create an instance', () => {
    expect(appRoutingModule).toBeTruthy();
  });
});
