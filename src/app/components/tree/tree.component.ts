import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import { ParsedFile } from '@common/types';
import { AbstractControl, FormControl } from '@angular/forms';
import { GenericErrorStateMatcher } from '@app/lib/validation';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements OnInit, OnChanges {

  @Input() tree: any;
  @Input() parentTree: any;
  @Input() label = '';
  @Input() level = 0;
  @Input() path: string[] = [];
  @Input() openedPath: string[] = [];
  @Input() folder: ParsedFile[];
  @Output() openPath = new EventEmitter<string[]>(true);
  @Output() contextMenu = new EventEmitter<any>(true);

  @Input() isAddingItem: boolean;
  @Input() addingItemData: any;
  @Output() cancelAddItem = new EventEmitter<void>(true);
  @Output() addItem = new EventEmitter<any>(true);
  @ViewChild('addItemInput') addItemInput: ElementRef;
  addingItemNameControl: FormControl;


  @Input() isRenamingItem: boolean;
  @Input() renamingItemData: any;
  @ViewChild('renameItemInput') renameItemInput: ElementRef;
  @Output() cancelRenameItem = new EventEmitter<void>(true);
  @Output() renameItem = new EventEmitter<any>(true);
  renamingItemNameControl: FormControl;


  isCollapsed = false;
  missingTranslations = 0;
  errorStateMatcher = new GenericErrorStateMatcher();

  childrenKeys: string[] = null;

  constructor() {
    this.addingItemNameControl = new FormControl('', this.validateAddingItemName);
    this.renamingItemNameControl = new FormControl('', this.validateRenamingItemName);
  }

  ngOnInit() {
    this.updateMissingTranslationsCounter();
    this.renamingItemNameControl.patchValue(this.label);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isAddingItem && changes.isAddingItem.currentValue && this.isAddingItemPath()) {
      this.isCollapsed = false;

      // Delay needed because of the delay to input appear
      setTimeout(() => this.addItemInput.nativeElement.focus(), 100);
    }

    if (changes.isRenamingItem && changes.isRenamingItem.currentValue && this.isRenamingItemPath()) {
      this.isCollapsed = false;

      // Delay needed because of the delay to input appear
      setTimeout(() => this.renameItemInput.nativeElement.focus(), 100);
    }

    if (changes.tree) {
      this.childrenKeys = changes.tree.currentValue && typeof changes.tree.currentValue !== 'string'
        ? Object.keys(changes.tree.currentValue).sort((a, b) => a.localeCompare(b))
        : null;
    }
    this.updateMissingTranslationsCounter();
  }

  get hasChildren() {
    return this.childrenKeys;
  }

  toggleOrOpen() {
    if (this.hasChildren) {
      this.isCollapsed = !this.isCollapsed;
    } else {
      this.openPath.emit(this.path);
    }
  }

  onOpenPath(event: string[]) {
    this.openPath.emit(event);
  }

  onMouseUp(event: MouseEvent) {
    if (event.button === 2) {
      this.onContextMenu({
        path: this.path,
        x: event.pageX,
        y: event.pageY,
      });
    }
  }

  onContextMenu(event: any) {
    this.contextMenu.emit(event);
  }

  isAddingItemPath() {
    return this.isAddingItem && _.isEqual(this.path, this.addingItemData.path);
  }

  isRenamingItemPath() {
    return this.isRenamingItem && _.isEqual(this.path, this.renamingItemData.path);
  }

  validateAddingItemName = (control: AbstractControl) => {
    return this.tree && Object.keys(this.tree).indexOf(control.value) !== -1
      ? {exists: true}
      : null;
  };

  validateRenamingItemName = (control: AbstractControl) => {
    const containsNameInParentTree = (this.parentTree &&
      Object.keys(this.parentTree)
        .filter(it => it !== this.label)
        .indexOf(control.value) !== -1);

    return containsNameInParentTree
      ? {exists: true}
      : null;
  };

  onAddingItemNameChange(event: any) {
    if (event.key === 'Escape') {
      this.onCancelAddItem();
    }

    if (event.key !== 'Enter' || this.addingItemNameControl.invalid) {
      return;
    }

    if (this.addingItemNameControl.value.trim().length === 0) {
      this.onCancelAddItem();
    } else {
      this.onAddItem({
        ...this.addingItemData,
        name: this.addingItemNameControl.value,
      });

      this.addingItemNameControl.patchValue('');
    }
  }

  onRenamingItemNameChange(event: any) {
    if (event.key === 'Escape') {
      this.onCancelRenameItem();
    }

    if (event.key !== 'Enter' || this.renamingItemNameControl.invalid) {
      return;
    }

    if (this.renamingItemNameControl.value.trim().length === 0 || this.renamingItemNameControl.value === this.label) {
      this.onCancelRenameItem();
    } else {
      this.onRenameItem({
        ...this.renamingItemData,
        name: this.renamingItemNameControl.value,
      });
    }
  }

  onCancelAddItem() {
    this.cancelAddItem.emit();
  }

  private onAddItem(data: any) {
    this.addItem.emit(data);
  }

  onCancelRenameItem() {
    this.cancelRenameItem.emit();
  }

  private onRenameItem(data: any) {
    this.renameItem.emit(data);
  }

  isOpenedPath() {
    return _.isEqual(this.path, this.openedPath);
  }

  private updateMissingTranslationsCounter() {
    if (this.hasChildren || !this.folder) {
      this.missingTranslations = 0;
      return;
    }

    this.missingTranslations = this.folder
      .map(it => _.get(it.data, this.path))
      .filter(it => !it)
      .length;
  }
}
