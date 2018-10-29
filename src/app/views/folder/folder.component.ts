import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FolderService } from '@app/services/folder.service';
import { ParsedFile } from '@common/types';
import * as _ from 'lodash';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.styl']
})
export class FolderComponent implements OnInit {

  folderPath: string;
  folder: ParsedFile[] = [];
  originalFolder: ParsedFile[] = [];
  tree: any;
  openedPath: string[] = [];

  isResizing = false;
  treeWidth = 300;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private folderService: FolderService,
  ) {
  }

  ngOnInit() {
    const folderPath = this.activatedRoute.snapshot.queryParamMap.get('path');

    this.folderService.getOpenFolderMessages()
      .subscribe(({data}) => {
        this.folderPath = data.folderPath;
        this.folder = _.cloneDeep(data.folder);
        this.originalFolder = _.cloneDeep(data.folder);

        this.buildTree();
      });

    this.folderService.openFolder(folderPath);

    this.folderService.saveFolderListener$
      .subscribe(() => this.folderService.saveFolder(this.folder));

    this.folderService.deleteItemListener$
      .subscribe(({path}) => this.removePath(path));
  }

  startResize() {
    this.isResizing = true;
  }

  stopResize() {
    this.isResizing = false;
  }

  resize(event) {
    if (this.isResizing) {
      this.treeWidth = event.pageX - 8;

      if (this.treeWidth > window.innerWidth - 500) {
        this.treeWidth = window.innerWidth - 500;
      }
    }
  }

  onOpenPath = (event: string[]) => {
    this.openedPath = event;
  };

  onContentChange() {
    this.buildTree();

    this.folderService.dataChanged(!_.isEqual(this.folder, this.originalFolder));
  }

  onTreeMouseUp(event: MouseEvent) {
    if (event.button === 2 && (event.target as any).classList.contains('tree')) {
      this.onRightClickItemTree({
        path: [],
        x: event.pageX,
        y: event.pageY,
      });
    }
  }

  onRightClickItemTree(event) {
    this.showContextMenu(event.x, event.y, {
      path: event.path,
      isFromTree: true,
      isNode: this.isNode(event.path),
    });
  }

  onContentRightClick({x, y}) {
    this.showContextMenu(x, y, {
      isFromTree: false,
      enableCut: true,
      enableCopy: true,
      enablePaste: true,
    });
  }

  get isSaving() {
    return this.folderService.isSaving;
  }

  get isAddingItem() {
    return this.folderService.isAddingItem;
  }

  get addingItemData() {
    return this.folderService.addingItemData;
  }

  get isRenamingItem() {
    return this.folderService.isRenamingItem;
  }

  get renamingItemData() {
    return this.folderService.renamingItemData;
  }

  private buildTree = () => {
    const folderData = _.cloneDeep(this.folder.map(i => i.data));
    this.tree = _.merge.apply(null, folderData);

    this.updateTreeItemStatus([]);
  };

  private updateTreeItemStatus = (path: string[]) => {
    const treeKeys = path.length === 0
      ? Object.keys(this.tree)
      : Object.keys(_.get(this.tree, path));

    for (const key of treeKeys) {
      const currentPath = path.concat(key);

      if (typeof _.get(this.tree, currentPath) === 'string') {
        _.set(this.tree, currentPath, this.getTreeItemStatus(currentPath));
      } else {
        this.updateTreeItemStatus(currentPath);
      }
    }
  };

  private getTreeItemStatus = (path: string[]): string => {
    if (this.isNewItem(path)) {
      return 'new';
    }

    if (this.isMissingItem(path)) {
      return 'missing';
    }

    if (this.isChangedItem(path)) {
      return 'changed';
    }

    return '';
  };

  private isNewItem = (path: string[]) =>
    this.folder
      .reduce(
        (acc, curr) => acc && (
          _.get(curr.data, path) !== undefined &&
          _.get(this.getOriginalFromLanguage(curr.language).data, path) === undefined
        ),
        true
      );

  private isChangedItem = (path: string[]) =>
    this.folder
      .reduce(
        (acc, curr) => acc ||
          _.get(curr.data, path) !== _.get(this.getOriginalFromLanguage(curr.language).data, path),
        false
      );

  private isMissingItem = (path: string[]) =>
    this.folder
      .reduce(
        (acc, curr) => acc ||
          !_.get(curr.data, path),
        false
      );

  private getOriginalFromLanguage = (language: string) =>
    this.originalFolder.find(i => i.language === language);

  private showContextMenu(x: number, y: number, data: any) {
    this.folderService.showContextMenu({x, y, ...data});
  }

  private isNode(path: string[]) {
    return path.length > 0 && typeof _.get(this.tree, path) !== 'object';
  }

  addItemDone() {
    this.folderService.addItemDone();
  }

  renameItemDone() {
    this.folderService.renameItemDone();
  }

  manipulateItemDone() {
    this.addItemDone();
    this.renameItemDone();
  }

  onAddItem(data: any) {
    const path = data.path.concat(data.name);

    for (const item of this.folder) {
      _.set(item.data, path, data.isNode ? '' : {});
    }

    this.onContentChange();
    this.addItemDone();

    if (data.isNode) {
      this.openedPath = path;
    }
  }

  private removePath(path: string[]) {
    if (_.isEqual(this.openedPath, path)) {
      this.openedPath = [];
    }

    for (const item of this.folder) {
      _.unset(item.data, path);
    }

    this.onContentChange();
  }

  onRenameItem(data: any) {
    const oldPath = data.path;
    const newPath = data.path.slice(0, -1).concat(data.name);

    for (const item of this.folder) {
      _.set(item.data, newPath, _.get(item.data, oldPath));
      _.unset(item.data, oldPath);
    }

    this.onContentChange();
    this.renameItemDone();

    if (this.isNode(newPath)) {
      this.openedPath = newPath;
    }
  }
}
