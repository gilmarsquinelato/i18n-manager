<template>
  <div>
    <v-menu absolute v-model="isOpened" :position-x="positionX" :position-y="positionY">
      <v-list>
        <v-list-item v-if="hasChildren()" @click="addItem">
          <v-list-item-title>Add Item</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="hasChildren()" @click="addNode">
          <v-list-item-title>Add Node</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isItemOrNode()" @click="copyItem">
          <v-list-item-title>Copy</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isItemOrNode()" @click="cutItem">
          <v-list-item-title>Cut</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isItemOrNode()" @click="duplicateItem">
          <v-list-item-title>Duplicate</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isFileOrNode() && clipboardItemId" @click="pasteItem">
          <v-list-item-title>Paste</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isItemOrNode()" @click="renameItem">
          <v-list-item-title>Rename</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isItemOrNode()" @click="deleteItem">
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="isDialogVisible" eager width="500" @keydown.esc="cancelAction">
      <v-card class="px-0 d-flex flex-column">
        <v-card-title>{{ actionTitle }}</v-card-title>

        <v-card-text>
          <v-text-field
            label="Name"
            ref="itemLabelRef"
            v-model="itemLabel"
            :error-messages="!isValidLabel ? 'There is another item with this name' : ''"
            @keyup.enter="finishAction"
          />
        </v-card-text>

        <v-spacer />

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelAction">Cancel</v-btn>
          <v-btn color="primary" @click="finishAction">Ok</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, Ref, ref, toRefs, watch } from '@vue/composition-api';

  import {
    AddItemPayload,
    ClipboardItemAction,
    DeleteItemPayload,
    PasteItemPayload,
    RenameItemPayload,
    SetClipboardPayload,
    TreeItem,
    TreeMap,
  } from '@/folder/types';

  export default defineComponent({
    props: {
      tree: {
        required: true,
        type: Object as () => TreeMap,
      },
      treeItems: {
        required: true,
        type: Array as () => TreeItem[],
      },
      clipboardItemId: {
        type: String,
      },
    },
    setup(props, { emit }) {
      const itemLabelRef = ref<any>(null);
      const clickedItem = ref<TreeItem | null>(null);
      const isDialogVisible = ref<boolean>(false);
      const siblings = ref<TreeItem[]>([]);
      const actionTitle = ref<String>('');
      const itemLabel = ref<String>('');
      const isValidLabel = ref<boolean>(true);
      const finishAction = ref<Function | null>(null);

      const contextMenu = useContextMenu(clickedItem);

      const sendModifiedContent = () => emit('send-modified-content');

      watch([siblings, itemLabel], () => {
        isValidLabel.value = siblings.value.filter(it => it.label === itemLabel.value).length === 0;
      });

      const getItemType = () => clickedItem.value?.type;
      const hasChildren = () => getItemType() !== 'item';
      const isItemOrNode = () => getItemType() === 'item' || getItemType() === 'node';
      const isFileOrNode = () => getItemType() !== 'folder' && getItemType() !== 'item';

      const focusLabelInput = () => setTimeout(itemLabelRef.value!.focus, 100);

      const showDialog = () => (isDialogVisible.value = true);
      const hideDialog = () => (isDialogVisible.value = false);
      const cancelAction = () => {
        itemLabel.value = '';
        isValidLabel.value = true;
        hideDialog();
      };
      finishAction.value = cancelAction;

      const addItemStart = (isItem: boolean) => () => {
        finishAction.value = addItemFinish(isItem);
        siblings.value = props.treeItems.filter(it => it.parent === clickedItem.value!.id);
        actionTitle.value = 'Add Item';
        showDialog();
        focusLabelInput();
      };
      const addItemFinish = (isItem: boolean) => () => {
        if (!isValidLabel.value) return;

        emit('add-item', {
          parent: clickedItem.value,
          label: itemLabel.value,
          isItem,
        } as AddItemPayload);
        cancelAction();
        sendModifiedContent();
      };

      const addItem = addItemStart(true);
      const addNode = addItemStart(false);

      const copyItem = () => {
        emit('set-clipboard', {
          item: clickedItem.value,
          action: ClipboardItemAction.copy,
        } as SetClipboardPayload);
      };

      const cutItem = () => {
        emit('set-clipboard', {
          item: clickedItem.value,
          action: ClipboardItemAction.cut,
        } as SetClipboardPayload);
      };

      const duplicateItem = () => {
        copyItem();

        finishAction.value = pasteItemFinish;
        siblings.value = props.treeItems.filter(it => it.parent === clickedItem.value!.parent);
        actionTitle.value = 'Duplicate Item';
        itemLabel.value = clickedItem.value!.label;
        clickedItem.value = props.tree[clickedItem.value!.parent];

        showDialog();
        focusLabelInput();
      };

      const pasteItem = () => {
        finishAction.value = pasteItemFinish;
        siblings.value = props.treeItems.filter(it => it.parent === clickedItem.value!.id);
        actionTitle.value = 'Paste Item';
        itemLabel.value = props.tree[props.clipboardItemId!]?.label;

        showDialog();
        focusLabelInput();
      };
      const pasteItemFinish = () => {
        if (!isValidLabel.value) return;

        emit('paste-item', {
          parent: clickedItem.value,
          label: itemLabel.value,
        } as PasteItemPayload);
        cancelAction();
        sendModifiedContent();
      };

      const renameItem = () => {
        finishAction.value = renameItemFinish;

        siblings.value = props.treeItems.filter(
          it => it.parent === clickedItem.value!.parent && it.id !== clickedItem.value!.id,
        );
        actionTitle.value = 'Rename Item';
        itemLabel.value = clickedItem.value!.label;

        showDialog();
        focusLabelInput();
      };
      const renameItemFinish = () => {
        if (!isValidLabel.value || itemLabel.value === clickedItem.value!.label) return;

        emit('rename-item', {
          item: clickedItem.value,
          label: itemLabel.value,
        } as RenameItemPayload);
        cancelAction();
        sendModifiedContent();
      };

      const deleteItem = () => {
        if (confirm('Are you sure to delete this item?')) {
          emit('delete-item', {
            item: clickedItem.value,
          } as DeleteItemPayload);
          sendModifiedContent();
        }
      };

      return {
        ...contextMenu,
        isDialogVisible,
        actionTitle,
        itemLabelRef,
        itemLabel,
        isValidLabel,

        hasChildren,
        isItemOrNode,
        isFileOrNode,

        addItem,
        addNode,
        copyItem,
        cutItem,
        duplicateItem,
        pasteItem,
        renameItem,
        deleteItem,
        finishAction,
        cancelAction,
      };
    },
  });

  function useContextMenu(clickedItem: Ref<TreeItem | null>) {
    const state = reactive({
      isOpened: false,
      positionX: 0,
      positionY: 0,
    });

    const handleRightClick = (event: MouseEvent, item: TreeItem) => {
      clickedItem.value = item;
      state.positionX = event.clientX;
      state.positionY = event.clientY;
      state.isOpened = true;
    };

    return {
      ...toRefs(state),
      handleRightClick,
    };
  }
</script>

<style scoped></style>
