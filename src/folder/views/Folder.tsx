import { RouteComponentProps } from '@reach/router';
import { Card, Input, Layout } from 'antd';
import * as _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { useActions, useStore } from '../../store';
import Content from '../components/Content';
import Tree from '../components/Tree';
import { walkOnTree } from '../functions';
import styles from './Folder.module.scss';


const getPathFromLocation = (location: any) =>
  JSON.parse(new URLSearchParams(location ? location.search : '').get('path') || '');

const getBaseContextMenuData = (path: string[], event: React.MouseEvent, tree: any) => ({
  path,
  x: event.pageX,
  y: event.pageY,
  isNode: path.length > 0 && typeof _.get(tree, path) !== 'object',
});

const containsIgnoreCase = (text: string, term: string) =>
  text.toLowerCase().indexOf(term.toLowerCase()) !== -1;

const getFilteredTree = (tree: any, search: string) => {
  const tempTree = _.cloneDeep(tree);
  walkOnTree(tempTree, [], (currentPath, hasChildren) => {
    // Look for the search term in the current item
    const lastPathPart = _.last(currentPath) || '';
    const found = lastPathPart.length === 0 || containsIgnoreCase(lastPathPart, search);
    if (found) {
      return;
    }

    // If is at the root and don't have children
    if (!hasChildren && currentPath.length === 1) {
      _.unset(tempTree, currentPath);
    }

    // Only remove a key with its children if not found the search term in any one of them
    if (hasChildren) {
      const children = Object.keys(_.get(tempTree, currentPath));
      const containsSearchTerm = children
        .filter(it => containsIgnoreCase(it, search))
        .length > 0;

      if (!containsSearchTerm) {
        _.unset(tempTree, currentPath);
      }
    }
  });

  return tempTree;
};

const Folder: React.FC<RouteComponentProps> = ({location}) => {
  const folderPath = getPathFromLocation(location);

  const folder = useStore(state => state.folder.folder);
  const isLoading = useStore(state => state.folder.isLoading);
  const tree = useStore(state => state.folder.tree);
  const openedPath = useStore(state => state.folder.openedPath);
  const addingItemData = useStore(state => state.folder.addingItemData);
  const renamingItemPath = useStore(state => state.folder.renamingItemPath);

  const subscribe = useActions(actions => actions.folder.subscribe);
  const loadFolder = useActions(actions => actions.folder.loadFolder);
  const openContextMenu = useActions(actions => actions.folder.openContextMenu);
  const cancelItemActions = useActions(actions => actions.folder.cancelItemActions);
  const addItem = useActions(actions => actions.folder.addItem);
  const renameItem = useActions(actions => actions.folder.renameItem);
  const setOpenedPath = useActions(actions => actions.folder.setOpenedPath);

  const [treeSearch, setTreeSearch] = useState<string>('');

  useEffect(() => {
    subscribe();
  }, [subscribe]);

  useEffect(() => {
    loadFolder(folderPath);
  }, [loadFolder, folderPath]);

  const onTreeMouseUp = useCallback((path: string[], e: React.MouseEvent) => {
    if (e.button === 2 && !addingItemData) {
      openContextMenu({
        ...getBaseContextMenuData(path, e, tree),
        isFromTree: true,
        enableCopy: false,
        enableCut: false,
        enablePaste: false,
      });
    }
  }, [openContextMenu, tree, addingItemData]);

  const updateTreeSearch = useCallback(
    _.debounce((search: string) => setTreeSearch(search), 300),
    [setTreeSearch]);

  const filteredTree = useCallback(() => getFilteredTree(tree, treeSearch), [tree, treeSearch]);

  const showOverlay = addingItemData || renamingItemPath;

  return (
    <Layout className={styles.Container}>
      <Layout.Sider
        theme="light"
        width={300}
        className={styles.Sidebar}
        onMouseUp={e => onTreeMouseUp([], e)}
      >
        {showOverlay && (<div className={styles.Overlay}/>)}

        <Card className={styles.Search}>
          <Input.Search placeholder="Search" onChange={e => updateTreeSearch(e.target.value)}/>
        </Card>

        <div className={`${styles.TreeContainer} ${showOverlay && styles.NoScroll}`}>
          <Tree
            level={0}
            tree={filteredTree()}
            path={[]}
            openedPath={openedPath}
            onMouseUp={onTreeMouseUp}
            addingItemData={addingItemData}
            onCancelItemActions={cancelItemActions}
            onAddItem={addItem}
            onRenameItem={renameItem}
            renamingItemPath={renamingItemPath}
            setOpenedPath={setOpenedPath}
          />
        </div>
      </Layout.Sider>
      <Layout>
        <Layout.Content>
          <Content
            folder={folder}
            openedPath={openedPath}
          />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default Folder;
