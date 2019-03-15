import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FolderService } from '@app/services/folder.service';
import { ParsedFile } from '@common/types';
import * as _ from 'lodash';
import { getLocaleLabel } from '@common/language';
import { FormControl } from '@angular/forms';
import { SettingsService } from '@app/services/settings.service';
import { TranslationService } from '@app/services/translation.service';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  search: string;

  folderPath: string;
  folder: ParsedFile[] = [];
  originalFolder: ParsedFile[] = [];
  tree: any;
  originalTree: any;
  openedPath: string[] = [];
  languageList: any[] = [];

  allLanguages: any[];
  selectedTargetLanguages = new FormControl();
  selectedSourceLanguage = new FormControl();
  keyTranslationMode = new FormControl('this');
  overwriteEmptyFields = new FormControl(false);

  settings: any;

  isTranslating = false;
  translationErrors: any[];
  languageStatus: {[k: string]: any} = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private folderService: FolderService,
    private settingsService: SettingsService,
    private translationService: TranslationService,
  ) {
  }

  ngOnInit() {
    this.settingsService.getSettings().subscribe((data) => this.settings = data);
    const folderPath = this.activatedRoute.snapshot.queryParamMap.get('path');

    this.folderService.getOpenFolderMessages()
      .subscribe(({data}) => {
        this.folderPath = data.folderPath;
        this.folder = _.cloneDeep(data.folder);
        this.originalFolder = _.cloneDeep(data.folder);

        this.buildLanguageList();
        this.buildTree();
      });

    this.folderService.openFolder(folderPath);

    this.folderService.saveFolderListener$
      .subscribe(() => this.folderService.saveFolder(this.folder));

    this.folderService.deleteItemListener$
      .subscribe(({path}) => this.removePath(path));
  }

  onOpenPath = (event: string[]) => {
    this.openedPath = event;
  };

  // tslint:disable-next-line:member-ordering
  onSearch = _.debounce(() => {
    if (!this.search || this.search.length === 0) {
      this.tree = this.originalTree;
      return;
    }

    const tempTree = _.cloneDeep(this.originalTree);
    this.walkOnTree([], (currentPath, hasChildren) => {
      if (!hasChildren && _.last(currentPath).toLowerCase().indexOf(this.search.toLowerCase()) === -1) {
        _.unset(tempTree, currentPath);
      }

      if (hasChildren) {
        const parent = _.get(tempTree, currentPath);

        if (Object.keys(parent).length === 0) {
          _.unset(tempTree, currentPath);
        }
      }
    });

    this.tree = tempTree;
  }, 300);

  onContentChange() {
    this.buildTree();

    this.folderService.dataChanged(!_.isEqual(this.folder, this.originalFolder));
    this.buildLanguageStatus();
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

  get isLoading() {
    return this.folderService.isLoading;
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
    this.originalTree = _.merge.apply(null, folderData);
    this.tree = this.originalTree;
    this.onSearch();

    this.updateTreeItemStatus();
  };

  private updateTreeItemStatus = (path: string[] = []) => {
    this.walkOnTree(path, (currentPath, hasChildren) => {
      if (!hasChildren) {
        _.set(this.tree, currentPath, this.getTreeItemStatus(currentPath));
      }
    });
  };

  private walkOnTree = (path: string[] = [], fn: (path: string[], hasChildren: boolean) => void) => {
    const treeKeys = path.length === 0
      ? Object.keys(this.originalTree)
      : Object.keys(_.get(this.originalTree, path));

    for (const key of treeKeys) {
      const currentPath = path.concat(key);

      if (typeof _.get(this.originalTree, currentPath) === 'string') {
        fn(currentPath, false);
      } else {
        this.walkOnTree(currentPath, fn);
        fn(currentPath, true);
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

  private buildLanguageList() {
    this.languageList = Object.values(this.folder)
      .map(it => it.language)
      .map(it => ({
        language: it,
        label: this.getLanguageLabel(it)
      }))
      .reduce((acc, curr) => ([...acc, curr]), []);
    this.allLanguages = _.flatMap(this.languageList.map(it => it.language));
  }

  private getLanguageLabel = (language: string): string => {
    const localeLabel = getLocaleLabel(language);
    if (!localeLabel) {
      return language;
    }

    return `${localeLabel} - ${language}`;
  };

  toggleAllLanguages() {
    if (this.selectedTargetLanguages.value.length < this.allLanguages.length) {
      this.selectedTargetLanguages.patchValue(['all', ...this.allLanguages]);
    } else {
      this.selectedTargetLanguages.patchValue([]);
    }
  }

  get isTranslationEnabled() {
    return this.settings.googleTranslateApiKey;
  }

  async startTranslation() {
    const source = this.selectedSourceLanguage.value;
    if (!source || this.selectedTargetLanguages.value.length === 0) {
      return;
    }

    const targets = this.selectedTargetLanguages.value.filter(it => it !== 'all');
    const overwrite = this.overwriteEmptyFields.value;

    if (this.keyTranslationMode.value === 'this') {
      await this.translateOpenedPath(source, targets, overwrite);
    } else {
      await this.translateAll(source, targets, overwrite);
    }

    this.buildTree();
  }

  async onTranslate(event: any) {
    await this.translateOpenedPath(event.source, [event.target], true);
  }

  async translateOpenedPath(source: string, targets: string[], overwrite: boolean) {
    this.isTranslating = true;
    this.translationErrors = await this.translatePath(source, targets, overwrite, this.openedPath);

    this.isTranslating = false;
    if (this.translationErrors.length > 0) {
      setTimeout(() => alert(this.translationErrors.join('\n')), 500);
    }
  }

  private async translateAll(source: any, targets: any, overwrite: any) {
    const paths = this.getAllPaths(this.tree);

    this.isTranslating = true;
    this.translationErrors = [];

    for (const path of paths) {
      this.translationErrors.push(
        ...await this.translatePath(source, targets, overwrite, path)
      );
    }

    this.isTranslating = false;
    if (this.translationErrors.length > 0) {
      setTimeout(() => alert(this.translationErrors.join('\n')), 500);
    }
  }

  private async translatePath(source: string, targets: string[], overwrite: boolean, path: string[]) {
    const translationErrors = [];

    for (const target of targets) {
      const result = await this.translate(source, target, path, overwrite);

      if (result) {
        translationErrors.push(result);
      }
    }

    return translationErrors;
  }

  async translate(source: string, target: string, path: string[], overwrite: boolean): Promise<string> {
    if (source === target) {
      return null;
    }

    const text = this.getFromLanguage(this.folder, source, path);
    const targetText = this.getFromLanguage(this.folder, target, path);

    if (!overwrite && targetText && targetText.length > 0) {
      return null;
    }

    try {
      const result = await this.translationService
        .translate(source, text, target)
        .toPromise();

      _.set(this.getFolder(this.folder, target).data, path, result);
      this.updateLanguageStatus(target, path);
      return null;
    } catch (e) {
      if (e.status === 400) {
        return `Google Translate can't translate from "${this.getLanguageLabel(source)}" to "${this.getLanguageLabel(target)}"`;
      } else {
        return e.message;
      }
    }
  }

  private getFromLanguage(folder: ParsedFile[], language: string, path: string[]): string {
    return _.get(this.getFolder(folder, language).data, path);
  }

  private getFolder(folder: ParsedFile[], language: string): ParsedFile {
    return folder.find(i => i.language === language);
  }

  private buildLanguageStatus() {
    for (const language of this.allLanguages) {
      this.updateLanguageStatus(language, this.openedPath);
    }
  }

  private updateLanguageStatus(language: string, path: string[]) {
    const pathString = path.join('.');
    this.languageStatus[pathString] = {
      ...this.languageStatus[pathString],
      [language]: {
        isNew: this.isNewKeyItem(language, path),
        isMissing: this.isMissingKeyItem(language, path),
        isChanged: this.isChangedKeyItem(language, path),
      }
    };
  }

  private isNewKeyItem = (language: string, path: string[]) =>
    this.getFromLanguage(this.folder, language, path) !== undefined &&
    this.getFromLanguage(this.originalFolder, language, path) === undefined;

  private isChangedKeyItem = (language: string, path: string[]) => {
    const current = this.getFromLanguage(this.folder, language, path);
    const original = this.getFromLanguage(this.originalFolder, language, path);
    return current && current !== original;
  };

  private isMissingKeyItem = (language: string, path: string[]) =>
    !this.getFromLanguage(this.folder, language, path);

  private getAllPaths(tree: any, currentPath: string[] = []) {
    const paths = [];
    for (const key of Object.keys(tree)) {
      const path = [...currentPath, key];
      if (typeof tree[key] === 'string') {
        paths.push(path);
      } else {
        paths.push(...this.getAllPaths(tree[key], path));
      }
    }

    return paths;
  }
}
