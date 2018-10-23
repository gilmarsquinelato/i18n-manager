import { Injectable } from '@angular/core';
import * as ipcMessages from '@common/ipcMessages';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IFormattedFolderPath, ParsedFile } from '@common/types';
import { IpcService } from '@app/services/ipc.service';
import { switchMap, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private recentFoldersSubject = new BehaviorSubject<IFormattedFolderPath[]>([]);
  recentFolders$ = this.recentFoldersSubject.asObservable();

  saveFolderListener$: Observable<any>;
  private saveFolderPayload = {};

  deleteItemListener$: Observable<any>;

  isAddingItem = false;
  addingItemData: any;

  isSaving = false;

  constructor(
    private ipcService: IpcService,
  ) {
    this.listenRecentFolders();
    this.setSaveFolderListener();
    this.listenSaveComplete();
    this.listenAddTreeItem();
    this.setDeleteItemListener();
  }

  loadRecentFolders = () => {
    this.ipcService.send(ipcMessages.recentFolders);
  };

  getOpenFolderMessages = () => this.ipcService.on(ipcMessages.open);

  openFolder = (path: string) => {
    this.ipcService.send(ipcMessages.open, path);
  };

  dataChanged(hasChanges: boolean) {
    this.ipcService.send(ipcMessages.dataChanged, hasChanges);
  }

  saveFolder(folder: ParsedFile[]) {
    this.isSaving = true;
    this.ipcService.send(ipcMessages.save, {
      data: this.saveFolderPayload,
      payload: folder,
    });
  }

  showContextMenu(data: any) {
    this.ipcService.send(ipcMessages.showContextMenu, data);
  }

  private listenRecentFolders() {
    this.ipcService.on(ipcMessages.recentFolders)
      .subscribe(({data}) => this.recentFoldersSubject.next(data));
  }

  private setSaveFolderListener() {
    this.saveFolderListener$ = this.ipcService.on(ipcMessages.save)
      .pipe(
        tap(({data}) => this.saveFolderPayload = data)
      );
  }

  private listenSaveComplete() {
    this.ipcService.on(ipcMessages.saveComplete)
      .subscribe(() => this.isSaving = false);
  }

  private listenAddTreeItem() {
    this.ipcService.on(ipcMessages.addTreeItem)
      .pipe(
        switchMap(({data}) => of(data))
      )
      .subscribe((data) => {
        this.addingItemData = data;
        this.isAddingItem = true;
      });
  }

  addItemDone() {
    this.isAddingItem = false;
    this.addingItemData = {};
  }

  private setDeleteItemListener() {
    this.deleteItemListener$ = this.ipcService.on(ipcMessages.removeTreeItem)
      .pipe(
        switchMap(({data}) => of(data))
      );
  }
}
