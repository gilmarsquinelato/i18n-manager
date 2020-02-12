import { Form, Icon, Input } from 'antd';
import * as _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useBoolean, useInput } from 'react-hanger';

import { ITreeItem, TreeItemType } from '@src/folder/types';
import { ILoadedPath } from '@typings/index';
import styles from './Tree.module.scss';


interface ITreeProps {
  tree: ITreeItem[];
  itemId: string;
  level: number;
  selectedId: string;
  onMouseUp: (itemId: string, e: React.MouseEvent) => void;
  addingItemData?: any;
  onCancelItemActions: () => void;
  onAddItem: (name: string) => void;
  onRenameItem: (name: string) => void;
  renamingItemId?: string;
  setSelectedItem: (itemId: string) => void;
  folder: ILoadedPath[];
}

const Tree = React.memo<ITreeProps>(
  ({
     tree,
     itemId,
     level,
     selectedId,
     onMouseUp,
     addingItemData,
     onCancelItemActions,
     onAddItem,
     onRenameItem,
     renamingItemId,
     setSelectedItem,
     folder,
   }) => {
    // State
    const collapsed = useBoolean(false);

    const isSelectedItem = itemId === selectedId;
    const isAddingItem = addingItemData && itemId === addingItemData.itemId;
    const isRenamingItem = itemId === renamingItemId;

    // Memoized values
    const item = useMemo(() => tree.find(it => it.id === itemId)!, [tree, itemId]);
    const isFolder = item.type !== 'item';

    const parentItems = useMemo<string[]>(
      () => {
        if (!isAddingItem && !isRenamingItem) {
          return [];
        }

        let arr: ITreeItem[] = [];
        if (isAddingItem) {
          arr = tree.filter(it => it.parent === item.id);
        }

        if (isRenamingItem) {
          arr = tree
            .filter(it => it.parent === item.parent)
            .filter(it => it.label !== item.label);
        }

        return arr
          .map(it => it.label)
          .sort((a, b) => a.localeCompare(b));
      },
      [isAddingItem, isRenamingItem, tree, item]);

    const items = useMemo(() =>
        tree
          .filter(it => it.parent === itemId)
          .sort((a, b) => a.label.localeCompare(b.label)),
      [tree, itemId]);

    // Handlers
    const handleLabelClick = useCallback(() => {
      if (isFolder) {
        collapsed.toggle();
      } else {
        setSelectedItem(itemId);
      }
    }, [isFolder, collapsed, setSelectedItem, itemId]);

    const handleLabelMouseUp = useCallback((e: React.MouseEvent) => {
      if (e.button === 2) {
        onMouseUp(itemId, e);
      }
    }, [onMouseUp, itemId]);

    const handleInputEnter = useCallback((newLabel: string) => {
      if (isAddingItem) {
        onAddItem(newLabel);
      }
      if (isRenamingItem) {
        onRenameItem(newLabel);
      }
    }, [isAddingItem, isRenamingItem, onAddItem, onRenameItem]);

    const itemInput = (
      <ItemInput
        onCancelItemActions={onCancelItemActions}
        onEnter={handleInputEnter}
        defaultValue={isAddingItem ? '' : item.label || ''}
        siblings={parentItems}
      />
    );

    return (
      <div
        className={
          `${styles.Tree} ${collapsed.value && styles.Collapsed} ${!isFolder && styles.File}`
        }
      >
        {isRenamingItem
          ? itemInput
          : (
            <Label
              item={item}
              level={level}
              onLabelClick={handleLabelClick}
              onLabelMouseUp={handleLabelMouseUp}
              isSelectedItem={isSelectedItem}
              isFolder={isFolder}
              collapsed={collapsed.value}
            />
          )}

        {isAddingItem && itemInput}

        <div className={`${styles.Children} ${items.length === 0 ? styles.Hidden : ''}`}>
          <TreeChildren
            items={items}
            tree={tree}
            itemId={item.id}
            level={level}
            selectedId={selectedId}
            onMouseUp={onMouseUp}
            addingItemData={addingItemData}
            onCancelItemActions={onCancelItemActions}
            onAddItem={onAddItem}
            onRenameItem={onRenameItem}
            renamingItemId={renamingItemId}
            setSelectedItem={setSelectedItem}
            folder={folder}
          />
        </div>
      </div>
    );
  });

export default Tree;


interface ILabelProps {
  item: ITreeItem;
  level: number;
  onLabelClick: () => void;
  onLabelMouseUp: (e: React.MouseEvent) => void;
  isFolder: boolean;
  isSelectedItem: boolean;
  collapsed: boolean;
}

const Label = React.memo<ILabelProps>(
  ({
     item,
     level,
     onLabelClick,
     onLabelMouseUp,
     isFolder,
     collapsed,
     isSelectedItem,
   }) => {
    const itemStatus = useMemo(() => item.status, [item]);
    const itemType = item.type;

    const itemTitle = getItemTitle(itemType);

    const classNames = useMemo(
      () => {
        const statusClass =
          (itemStatus === 'new' && styles.New) ||
          (itemStatus === 'changed' && styles.Changed) ||
          (itemStatus === 'missing' && styles.Missing) ||
          '';

        return [
          styles.LabelContainer,
          statusClass,
          isSelectedItem && styles.Opened.toString(),
        ]
          .filter(Boolean)
          .join(' ');
      },
      [itemStatus, styles, isSelectedItem],
    );

    return (
      <div
        className={classNames}
        onClick={onLabelClick}
        onMouseUp={onLabelMouseUp}
        style={{paddingLeft: level * 16}}
        title={itemTitle}
      >
        <span className={styles.CaretIcon}>
          {isFolder && (<Icon type={collapsed ? 'caret-right' : 'caret-down'}/>)}
        </span>

        <span className={styles.FileIcon}>
          <Icon type={getLabelIcon(itemType)}/>
        </span>

        {item.missingCount > 0 && <span className={styles.Badge}>{item.missingCount}</span>}
        {item.untranslated && <span className={styles.Untranslated}>?</span>}

        <span className={styles.Label}>
          {item.label}
        </span>
      </div>
    );
  });

interface ITreeChildrenProps {
  items: ITreeItem[];
}

const TreeChildren: React.FC<ITreeProps & ITreeChildrenProps> = React.memo(
  ({items, itemId, level, tree, ...props}) =>
    <>
      {items.map(item => (
        <Tree
          itemId={item.id}
          key={item.id}
          tree={tree}
          level={level + 1}
          {...props}
        />
      ))}
    </>);


interface IItemInputProps {
  onCancelItemActions: () => void;
  onEnter: (name: string) => void;
  defaultValue: string;
  siblings: string[];
}

const ItemInput: React.FC<IItemInputProps> = React.memo(
  ({onCancelItemActions, onEnter, defaultValue, siblings}) => {
    const value = useInput(defaultValue);

    const isValid = !siblings.includes(value.value);

    return (
      <div className={styles.InputContainer}>
        <Form.Item
          hasFeedback
          validateStatus={!isValid ? 'error' : ''}
          help={!isValid ? 'Already have an item with this name' : ''}
        >
          <Input
            autoFocus
            onBlur={e => e.target.focus()}
            onKeyUp={e => e.keyCode === 27 && onCancelItemActions()}
            onPressEnter={() => value.value && isValid && onEnter(value.value)}
            value={value.value}
            onChange={value.onChange}
          />
        </Form.Item>
      </div>
    );
  });

const getLabelIcon = _.memoize((itemType: TreeItemType) => {
  switch (itemType) {
    case 'folder':
      return 'folder';
    case 'file':
      return 'file-text';
    case 'node':
      return 'bars';
    case 'item':
      return 'line';
  }
});

const getItemTitle = _.memoize((itemType: TreeItemType) => {
  switch (itemType) {
    case 'folder':
      return 'Folder';
    case 'file':
      return 'File Group';
    case 'node':
      return 'Node';
    case 'item':
      return 'Item';
  }
});
