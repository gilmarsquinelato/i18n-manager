import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import * as _ from 'lodash';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.styl']
})
export class TreeComponent implements OnInit, OnChanges {

  @Input() tree: any;
  @Input() label = '';
  @Input() level = 0;
  @Input() path: string[] = [];
  @Input() openedPath: string[] = [];
  @Output() openPath = new EventEmitter<string[]>(true);
  @Output() contextMenu = new EventEmitter<any>(true);

  @Input() isAddingItem: boolean;
  @Input() addingItemData: any;
  @Output() cancelAddItem = new EventEmitter<void>(true);
  @Output() addItem = new EventEmitter<any>(true);
  addingItemName: string;
  @ViewChild('addItemInput') addItemInput: ElementRef;

  isCollapsed = false;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isAddingItem && changes.isAddingItem.currentValue && this.isAddingItemPath()) {
      this.isCollapsed = false;

      // Delay needed because of the delay to input appear
      setTimeout(() => this.addItemInput.nativeElement.focus(), 100);
    }
  }

  get hasChildren() {
    return this.tree && typeof (this.tree) !== 'string';
  }

  get childrenKeys() {
    return this.hasChildren ? Object.keys(this.tree) : null;
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

  onAddingItemNameChange(event: any) {
    this.addingItemName = event.target.value;
    if (event.keyCode !== 13) {
      return;
    }

    if (this.addingItemName.trim().length === 0) {
      this.onCancelAddItem();
    } else {
      this.onAddItem({
        ...this.addingItemData,
        name: this.addingItemName,
      });

      this.addingItemName = '';
    }
  }

  get isValidAddingItemName() {
    return this.tree && Object.keys(this.tree).indexOf(this.addingItemName) === -1;
  }

  onCancelAddItem() {
    this.cancelAddItem.emit();
  }

  private onAddItem(data: any) {
    this.addItem.emit(data);
  }

  isOpenedPath() {
    return _.isEqual(this.path, this.openedPath);
  }
}
