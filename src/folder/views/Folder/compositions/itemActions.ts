import { AddItemPayload, DeleteItemPayload, RenameItemPayload, TreeItem } from '@/folder/types';
import { reactive, toRefs, watch } from '@vue/composition-api';

export type ActionName = 'none' | 'addItem' | 'addNode' | 'renameItem' | 'deleteItem';

export default function useItemActions(
  onDelete: (payload: DeleteItemPayload) => any,
  onRename: (payload: RenameItemPayload) => any,
  onAdd: (payload: AddItemPayload) => any,
  sendModifiedContent: () => any,
) {
  const state = reactive({
    isItemActionActive: false,
    currentAction: 'none' as ActionName,
    itemSiblings: [] as TreeItem[],
    itemLabel: '',
    actionTextFieldRef: null as any,
    isValidLabel: true,
  });

  let actionItem: TreeItem;
  let isAddingItem = false;

  watch([() => state.itemSiblings, () => state.itemLabel], () => {
    state.isValidLabel =
      state.itemSiblings.filter(it => it.label === state.itemLabel).length === 0;
  });

  function itemActionDone() {
    if (!state.isValidLabel) {
      itemActionCancel();
      return;
    }

    if (state.currentAction === 'addNode' || state.currentAction === 'addItem') {
      onAdd({
        parent: actionItem,
        label: state.itemLabel,
        isItem: state.currentAction === 'addItem',
      });
    } else if (state.currentAction === 'renameItem' && state.itemLabel !== actionItem.label) {
      onRename({
        item: actionItem,
        label: state.itemLabel,
      });
    } else if (state.currentAction === 'deleteItem') {
      onDelete({
        item: actionItem,
      });
    }

    sendModifiedContent();
    itemActionCancel();
  }

  function itemActionCancel() {
    state.isItemActionActive = false;
    state.itemLabel = '';
    state.currentAction = 'none';
    state.itemSiblings = [];
  }

  function itemActionDelete(item: TreeItem) {
    if (confirm('Are you sure to delete this item?')) {
      actionItem = item;
      state.currentAction = 'deleteItem';

      itemActionDone();
    }
  }

  function itemActionRename(item: TreeItem, treeItems: TreeItem[]) {
    actionItem = item;

    const siblings = treeItems.filter(it => it.parent === item.parent && it.id !== item.id);

    state.itemLabel = item.label;
    runItemAction('renameItem', siblings);
  }

  function itemActionAddItem(item: TreeItem, isItem: boolean, treeItems: TreeItem[]) {
    actionItem = item;
    isAddingItem = isItem;

    const siblings = treeItems.filter(it => it.parent === item.id);
    const actionName: ActionName = isItem ? 'addItem' : 'addNode';

    runItemAction(actionName, siblings);
  }

  function runItemAction(actionName: ActionName, siblings: TreeItem[]) {
    state.currentAction = actionName;
    state.itemSiblings = siblings;
    state.isItemActionActive = true;

    setTimeout(state.actionTextFieldRef?.focus, 100);
  }

  return {
    ...toRefs(state),
    itemActionDone,
    itemActionCancel,
    itemActionDelete,
    itemActionRename,
    itemActionAddItem,
  };
}
