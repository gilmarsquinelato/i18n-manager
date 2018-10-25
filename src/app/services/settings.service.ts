import { Injectable } from '@angular/core';
import { IpcService } from '@app/services/ipc.service';
import * as ipcMessages from '@common/ipcMessages';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<any>({});
  private settings$ = this.settingsSubject.asObservable();

  constructor(
    private ipcService: IpcService,
  ) {
    ipcService.on(ipcMessages.settings)
      .subscribe(({data}) => this.settingsSubject.next(data));
    ipcService.send(ipcMessages.settings);
  }

  getSettings() {
    return this.settings$;
  }

  save(settings: any) {
    this.ipcService.send(ipcMessages.saveSettings, settings);
    this.settingsSubject.next(settings);
  }
}
