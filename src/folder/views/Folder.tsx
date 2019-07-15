import { Card, Icon, Input, Layout, Spin } from 'antd';
import * as _ from 'lodash';
import React, { useCallback, useState } from 'react';

import commonStyles from '@src/Common.module.scss';
import { selectors as settingsSelectors } from '@src/settings/store';
import { useAction, useStoreState } from '@src/store';
import Content from '../components/Content';
import TranslationPanel from '../components/TranslationPanel';
import TranslationProgress from '../components/TranslationProgress';
import Tree from '../components/Tree';
import { actions, selectors } from '../store';
import { ITreeItem } from '../types';
import styles from './Folder.module.scss';


const Folder: React.FC = () => {
  // App settings
  const settings = useStoreState(settingsSelectors.settings);
  const googleTranslateApiKey = settings.googleTranslateApiKey;

  // Store states
  const folder = useStoreState(selectors.folder);
  const originalFolder = useStoreState(selectors.originalFolder);
  const isLoading = useStoreState(selectors.isLoading);
  const isSaving = useStoreState(selectors.isSaving);
  const tree = useStoreState(selectors.tree);
  const selectedId = useStoreState(selectors.selectedId);
  const selectedItem = useStoreState(selectors.selectedItem);
  const addingItemData = useStoreState(selectors.addingItemData);
  const renamingItemId = useStoreState(selectors.renamingItemId);
  const languageList = useStoreState(selectors.languageList);
  const allLanguages = useStoreState(selectors.allLanguages);
  const supportedLanguages = useStoreState(selectors.supportedLanguages);
  const isTranslating = useStoreState(selectors.isTranslating);
  const translationProgress = useStoreState(selectors.translationProgress);
  const translationErrors = useStoreState(selectors.translationErrors);

  // Actions
  const openContextMenu = useAction(actions.openContextMenu);
  const cancelItemActions = useAction(actions.cancelItemActions);
  const addTreeItem = useAction(actions.addTreeItem);
  const renameItem = useAction(actions.renameTreeItem);
  const setSelectedItem = useAction(actions.setSelectedItem);
  const setPathValue = useAction(actions.setPathValue);
  const setModifiedContent = useAction(actions.setModifiedContent);
  const translate = useAction(actions.translate);
  const cancelTranslate = useAction(actions.cancelTranslate);
  const setIsTranslating = useAction(actions.setIsTranslating);
  const updateTreeItemStatus = useAction(actions.updateTreeItemStatus);

  // Local states
  const [treeSearch, setTreeSearch] = useState<string>('');

  // Mouse actions
  const handleTreeMouseUp = useCallback((itemId: string, e: React.MouseEvent) => {
    if (e.button === 2 && !addingItemData && !renamingItemId) {
      const treeItem = tree.find(it => it.id === itemId);
      if (!treeItem) {
        return;
      }

      openContextMenu({
        ...getBaseContextMenuData(itemId, e),
        isFromTree: true,
        enableCopy: false,
        enableCut: false,
        enablePaste: false,
        isNode: treeItem.type === 'node' || treeItem.type === 'file',
      });
    }
  }, [openContextMenu, tree, addingItemData, renamingItemId]);

  const handleContentMouseUp = useCallback((itemId: string, e: React.MouseEvent) => {
    if (e.button === 2 && !addingItemData && !renamingItemId) {
      openContextMenu({
        ...getBaseContextMenuData(itemId, e),
        isFromTree: false,
        isNode: true,
        enableCopy: true,
        enableCut: true,
        enablePaste: true,
      });
    }
  }, [openContextMenu, tree, addingItemData, renamingItemId]);

  // Tree search
  const handleSearchChange = useCallback(
    _.debounce((search: string) => setTreeSearch(search), 300),
    [setTreeSearch]);

  // useMemo isn't updating the tree correctly
  const getFilteredTree = useCallback(
    () => filterTree(tree, treeSearch.toLowerCase()),
    [filterTree, tree, treeSearch]);
  const filteredTree = getFilteredTree();

  // Content input fields change handler
  const handleContentChange = useCallback(
    _.debounce((value: string, index: number, itemId: string) => {
      setPathValue({value, index, itemId});
      updateTreeItemStatus(itemId);
      setModifiedContent();
    }, 300),
    [setPathValue, setModifiedContent]);

  // Tree overlay
  const showOverlay = addingItemData || renamingItemId;

  return (
    <Layout className={styles.Container}>
      <TranslationProgress
        isTranslating={isTranslating}
        translationProgress={translationProgress}
        translationErrors={translationErrors}
        setIsTranslating={setIsTranslating}
        cancelTranslate={cancelTranslate}
      />

      <Layout>
        <Layout.Sider
          theme="light"
          width={300}
          className={styles.Sidebar}
          onMouseUp={e => handleTreeMouseUp('', e)}
        >
          {showOverlay && (<div className={styles.Overlay}/>)}

          <Card className={styles.Search}>
            <Input.Search placeholder="Search" onChange={e => handleSearchChange(e.target.value)}/>
          </Card>

          <div className={`${commonStyles.Scroll} ${showOverlay && styles.NoScroll}`}
               style={{flex: 1}}>
            {filteredTree.filter(it => it.parent === '').map(item => (
              <Tree
                key={item.id}
                tree={filteredTree}
                itemId={item.id}
                level={1}
                folder={folder}
                selectedId={selectedId}
                onMouseUp={handleTreeMouseUp}
                addingItemData={addingItemData}
                onCancelItemActions={cancelItemActions}
                onAddItem={addTreeItem}
                onRenameItem={renameItem}
                renamingItemId={renamingItemId}
                setSelectedItem={setSelectedItem}
              />
            ))}
          </div>
        </Layout.Sider>

        <Layout.Content className={styles.ContentContainer}>
          <TranslationPanel
            languageList={languageList}
            allLanguages={allLanguages}
            supportedLanguages={supportedLanguages}
            onTranslate={translate}
            isGoogleTranslateSetUp={!!googleTranslateApiKey}
            selectedId={selectedId}
          />

          {selectedItem && folder.length > 0 && originalFolder.length > 0 && (
            <div className={commonStyles.Scroll}>
              <Content
                folder={folder}
                originalFolder={originalFolder}
                selectedItem={selectedItem}
                onChange={handleContentChange}
                onMouseUp={handleContentMouseUp}
                languageList={languageList}
                supportedLanguages={supportedLanguages}
                onTranslate={translate}
              />
            </div>
          )}
        </Layout.Content>
      </Layout>
      <Layout.Footer className={styles.Footer}>
        {isLoading && (
          <Spin tip="Loading..." indicator={<Icon type="loading" style={{fontSize: 20}} spin/>}/>
        )}
        {isSaving && (
          <Spin tip="Saving..." indicator={<Icon type="save" style={{fontSize: 20}}/>}/>
        )}
      </Layout.Footer>
    </Layout>
  );
};

export default Folder;


const getBaseContextMenuData = (itemId: string, event: React.MouseEvent) => ({
  itemId,
  x: event.pageX,
  y: event.pageY,
});

const filterTree = (tree: ITreeItem[], search: string): ITreeItem[] => {
  if (search.length === 0) {
    return tree;
  }

  let filteredTree: ITreeItem[] = [];

  for (const item of tree) {
    if (item.label.toLowerCase().indexOf(search) !== -1) {
      filteredTree = addToFilteredTree(item, tree, filteredTree);
    }
  }

  return filteredTree;
};

const addToFilteredTree = (
  item: ITreeItem,
  tree: ITreeItem[],
  filteredTree: ITreeItem[],
  addChildren = true,
): ITreeItem[] => {
  const itemId = item.id;

  if (filteredTree.find(it => it.id === itemId)) {
    return filteredTree;
  }

  let newTree = filteredTree.concat(item);

  if (addChildren) {
    const children = tree.filter(it => it.parent === itemId);
    for (let i = 0; i < tree.length; i++) {
      const child = children[i];
      if (child) {
        newTree = addToFilteredTree(child, tree, newTree, true);
      }
    }
  }

  const parent = tree.find(it => it.id === item.parent);
  if (!parent) {
    return newTree;
  }

  return addToFilteredTree(parent, tree, newTree, false);
};
