import { TreeItem, TreeMap } from '@/folder/types';
import { getContentFromPath } from '@/folder/utils/files';
import { LoadedPath } from '@common/types';
import { ref, Ref, watch } from '@vue/composition-api';
import _ from 'lodash/fp';

export default function useTree(
  tree: Ref<TreeMap>,
  treeItems: Ref<TreeItem[] | null>,
  folder: Ref<LoadedPath[]>,
) {
  // empty string means the root tree, required to show the root nodes
  let expandedItems: string[] = [''];

  const treeFilter = ref('');
  const treeVisibilityFilter = ref<'all' | 'missing' | 'duplicated'>('all');
  const treeVisibilityFilterOptions = ref([
    { label: 'All', value: 'all' },
    { label: 'Missing', value: 'missing' },
    { label: 'Duplicated', value: 'duplicated' },
  ]);

  const filteredTreeItems = ref<TreeItem[]>(treeItems.value ?? []);
  const expandedTreeItems = ref<TreeItem[]>([]);

  watch(treeItems, () => {
    filterTreeItems(false);
    updateExpandedTreeItems();
  });

  watch(treeVisibilityFilter, () => {
    updateExpandedTreeItems();
  });

  function expandTreeNode(item: TreeItem) {
    if (expandedItems.includes(item.id)) return;
    expandedItems.push(item.id);
    updateExpandedTreeItems();
  }

  function toggleTreeNode(item: TreeItem) {
    if (expandedItems.indexOf(item.id) === -1) {
      expandedItems.push(item.id);
    } else {
      dropExpandedChildren(item.id);
    }
    updateExpandedTreeItems();
  }

  function dropExpandedChildren(id: string) {
    if (expandedItems.find(it => it === id)) {
      expandedItems = expandedItems.filter((it) => it !== id);

      const children = (filteredTreeItems.value ?? [])
        .filter(it => it.parent === id)
        .map(it => it.id);

      for (let i = 0; i < children.length; ++i) {
        dropExpandedChildren(children[i]);
      }
    }
  }

  function updateExpandedTreeItems() {
    let filteredByVisibility = filteredTreeItems.value ?? [];
    if (treeVisibilityFilter.value === 'missing') {
      filteredByVisibility = filteredByVisibility.filter(it => it.missingCount > 0);
    }
    if (treeVisibilityFilter.value === 'duplicated') {
      filteredByVisibility = filteredByVisibility.filter(it => it.duplicatedCount > 0);
    }

    expandedTreeItems.value = filteredByVisibility.filter(
      it => expandedItems.includes(it.id) || expandedItems.includes(it.parent),
    );
  }

  function isParentExpanded(item: TreeItem): boolean {
    return expandedItems.includes(item.id);
  }

  function filterTreeItems(resetExpandedItems: boolean = true) {
    if (!treeItems.value) return;

    if (treeFilter.value.length === 0) {
      filteredTreeItems.value = treeItems.value;
      if (resetExpandedItems) {
        expandedItems = [''];
      }
      updateExpandedTreeItems();
      return;
    }

    const lowerCaseFilter = treeFilter.value.toLowerCase();

    filteredTreeItems.value = _.pipe(
      filterItems,
      filteredItems => {
        const notItems = filteredItems.filter(it => it.type !== 'item');
        return {
          ...insertItems(filteredItems),
          ...insertChildren(notItems),
        };
      },
      Object.values,
      _.sortBy(({ id }) => id),
    )(lowerCaseFilter);

    expandedItems = [''].concat(
      filteredTreeItems.value.filter(it => it.type !== 'item').map(it => it.id),
    );

    updateExpandedTreeItems();
  }

  function filterItems(filter: string) {
    return (treeItems.value ?? []).filter(it => {
      return filterByKey(it, filter) || filterByPath(it, filter) || filterByValue(it, filter);
    });
  }

  function filterByKey(item: TreeItem, filter: string) {
    return item.label.toLowerCase().includes(filter);
  }

  function filterByPath(item: TreeItem, filter: string) {
      return filter.includes('.') && 
      (item.path.filter(p => typeof p === 'string')
      .join('.')
      .replace('items.data.', '')
      .toLowerCase().includes(filter));
  }

  function filterByValue(item: TreeItem, filter: string) {
    if (item.type !== 'item') return false;

    const content = getContentFromPath(folder.value, item.path);
    for (const item of content) {
      if (item.value && item.value.toLowerCase().includes(filter)) {
        return true;
      }
    }

    return false;
  }

  function insertItems(filteredItems: TreeItem[]) {
    const result: TreeMap = {};

    for (let i = 0; i < filteredItems.length; i++) {
      const item = filteredItems[i];

      if (item.parent) {
        const parent = tree.value[item.parent];
        Object.assign(result, insertItems([parent]));
      }

      result[item.id] = item;
    }

    return result;
  }

  function insertChildren(filteredItems: TreeItem[]) {
    const result: TreeMap = {};

    for (let i = 0; i < filteredItems.length; i++) {
      const item = filteredItems[i];

      result[item.id] = item;

      const children = (treeItems.value ?? []).filter(it => it.parent === item.id);
      Object.assign(result, insertChildren(children));
    }

    return result;
  }

  const filterTree = _.debounce(500, filterTreeItems);

  return {
    treeFilter,
    treeVisibilityFilter,
    treeVisibilityFilterOptions,
    filteredTreeItems,
    expandedTreeItems,
    expandTreeNode,
    toggleTreeNode,
    isParentExpanded,
    filterTree,
  };
}
