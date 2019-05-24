import { Icon, Input, Form } from 'antd';
import * as _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useBoolean, useInput } from 'react-hanger';

import styles from './Tree.module.scss';


interface ITreeProps {
  tree: any;
  label?: string;
  path: string[];
  level: number;
  openedPath: string[];
  onMouseUp: (path: string[], e: React.MouseEvent) => void;
  addingItemData: any;
  onCancelItemActions: () => void;
  onAddItem: (name: string) => void;
  onRenameItem: (name: string) => void;
  renamingItemPath?: string[];
  setOpenedPath: (path: string[]) => void;
}

const Tree: React.FC<ITreeProps> =
  ({
     level,
     tree,
     label,
     path,
     openedPath,
     onMouseUp,
     addingItemData,
     onCancelItemActions,
     onAddItem,
     onRenameItem,
     renamingItemPath,
     setOpenedPath,
   }) => {
    const collapsed = useBoolean(false);

    const isFolder = typeof tree !== 'string';
    const isOpenedPath = openedPath.length > 0 && _.isEqual(path, openedPath);
    const isAddingItem = addingItemData && _.isEqual(path, addingItemData.path);
    const isRenamingItem = renamingItemPath && _.isEqual(path, renamingItemPath);

    const items = isFolder
      ? Object.keys(tree).sort((a, b) => a.localeCompare(b))
      : [];

    const siblings = items.filter(it => it !== label);

    const onLabelClick = useCallback(() => {
      if (isFolder) {
        collapsed.toggle();
      } else {
        setOpenedPath(path);
      }
    }, [isFolder, collapsed, setOpenedPath, path]);

    const onLabelMouseUp = useCallback((e: React.MouseEvent) => {
      if (e.button === 2) {
        onMouseUp(path, e);
      }
    }, [onMouseUp, path]);

    const onInputEnter = useCallback((newLabel: string) => {
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
        onEnter={onInputEnter}
        defaultValue={isAddingItem ? '' : label || ''}
        siblings={siblings}
      />
    );

    return (
      <div
        className={`${styles.Tree} ${collapsed.value && styles.Collapsed} ${!isFolder && styles.File}`}
      >
        {isRenamingItem && itemInput}
        {!isRenamingItem && (
          <Label
            label={label}
            tree={tree}
            level={level}
            onLabelClick={onLabelClick}
            onLabelMouseUp={onLabelMouseUp}
            isOpenedPath={isOpenedPath}
            isFolder={isFolder}
            collapsed={collapsed.value}
          />
        )}

        <div className={styles.Children}>
          {isAddingItem && itemInput}

          <TreeChildren
            level={level}
            tree={tree}
            items={items}
            path={path}
            openedPath={openedPath}
            onMouseUp={onMouseUp}
            addingItemData={addingItemData}
            onCancelItemActions={onCancelItemActions}
            onAddItem={onAddItem}
            onRenameItem={onRenameItem}
            renamingItemPath={renamingItemPath}
            setOpenedPath={setOpenedPath}
          />
        </div>
      </div>
    );
  };

export default Tree;


interface ILabelProps {
  label?: string;
  tree: any;
  level: number;
  onLabelClick: () => void;
  onLabelMouseUp: (e: React.MouseEvent) => void;
  isFolder: boolean;
  isOpenedPath: boolean;
  collapsed: boolean;
}

const Label: React.FC<ILabelProps> =
  ({
     label,
     tree,
     level,
     onLabelClick,
     onLabelMouseUp,
     isFolder,
     collapsed,
     isOpenedPath,
   }) => {
    const isNew = !isFolder && tree === 'new';
    const isChanged = !isFolder && tree === 'changed';
    const isMissing = !isFolder && tree === 'missing';

    const classNames = useMemo(() =>
        [
          styles.Label,
          isNew && styles.New.toString(),
          isChanged && styles.Changed.toString(),
          isMissing && styles.Missing.toString(),
          isOpenedPath && styles.Opened.toString(),
        ]
          .filter(it => !!it)
          .join(' '),
      [isNew, isChanged, isMissing, isOpenedPath]);

    if (!label) {
      return null;
    }

    return (
      <div
        className={classNames}
        onClick={onLabelClick}
        onMouseUp={onLabelMouseUp}
        style={{paddingLeft: level * 16}}
      >
      <span className={styles.CaretIcon}>
        {isFolder && collapsed && (<Icon type="caret-right"/>)}
        {isFolder && !collapsed && (<Icon type="caret-down"/>)}
      </span>

        <span className={styles.FileIcon}>
        {isFolder && collapsed && (<Icon type="folder"/>)}
          {isFolder && !collapsed && (<Icon type="folder-open"/>)}

          {!isFolder && (<Icon type="file"/>)}
      </span>

        {label}
      </div>
    );
  };

interface ITreeChildrenProps {
  items: string[];
}

const TreeChildren: React.FC<ITreeProps & ITreeChildrenProps> = ({items, path, tree, level, ...props}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {items.map(item => (
        <Tree
          level={level + 1}
          key={item}
          tree={tree[item]}
          label={item}
          path={path.concat(item)}
          {...props}
        />
      ))}
    </>
  );
};


interface IItemInputProps {
  onCancelItemActions: () => void;
  onEnter: (name: string) => void;
  defaultValue: string;
  siblings: string[];
}

const ItemInput: React.FC<IItemInputProps> = ({onCancelItemActions, onEnter, defaultValue, siblings}) => {
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
};
