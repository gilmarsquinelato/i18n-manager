<template>
  <div class="tree-item" :class="{ expanded, selected }">
    <div
      @click="select"
      @click.right="handleRightClick"
      class="label"
      :class="[item.status, item.type]"
      :style="{ paddingLeft: (item.level * 16) + 8 + 'px' }"
    >
      <v-icon class="folder-arrow">
        mdi-menu-right
      </v-icon>

      <v-icon>{{ icon }}</v-icon>

      <v-tooltip bottom open-delay="1000" color="rgba(0, 0, 0, 1)">
        <template v-slot:activator="{ on }">
          <span class="item-name" v-on="on">
            {{ item.label }}
          </span>
        </template>

        {{ item.label }}
      </v-tooltip>

      <span v-if="item.missingCount > 0" class="missing-count">
        {{ item.missingCount }}
      </span>
    </div>

    <v-menu
      absolute
      v-model="isContextMenuOpen"
      :position-x="contextMenuX"
      :position-y="contextMenuY"
    >
      <v-list>
        <v-list-item v-if="item.type === 'node'" @click="addItem">
          <v-list-item-title>Add Item</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="item.type === 'node'" @click="addNode">
          <v-list-item-title>Add Node</v-list-item-title>
        </v-list-item>

        <v-divider v-if="item.type === 'node'" />

        <v-list-item @click="renameTreeItem">
          <v-list-item-title>Rename</v-list-item-title>
        </v-list-item>
        <v-list-item @click="deleteTreeItem">
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
  import { createComponent, onMounted, reactive, ref, toRefs, watch } from '@vue/composition-api';

  import { ComponentEmit } from '@/index';

  import { TreeItem } from '../types';

  export default createComponent({
    name: 'Tree',
    props: {
      item: {
        type: Object as () => TreeItem,
        required: true,
      },
      selectedItem: Object as () => TreeItem,
      expanded: Boolean,
    },
    setup(props, { emit }) {
      const icon = getIcon(props.item);
      const selectedItem = useSelectedItem(emit, props);
      const contextMenu = useContextMenu();

      function handleRightClick(event: MouseEvent) {
        if (props.item.type !== 'node' && props.item.type !== 'item') {
          return;
        }

        contextMenu.openContextMenu(event);
      }

      function addItem() {
        contextMenu.closeContextMenu();
        emit('addTreeItem', props.item, true);
      }

      function addNode() {
        contextMenu.closeContextMenu();
        emit('addTreeItem', props.item, false);
      }

      function renameTreeItem() {
        contextMenu.closeContextMenu();
        emit('renameTreeItem', props.item);
      }

      function deleteTreeItem() {
        contextMenu.closeContextMenu();
        emit('deleteTreeItem', props.item);
      }

      return {
        icon,
        addItem,
        addNode,
        renameTreeItem,
        deleteTreeItem,
        handleRightClick,
        ...selectedItem,
        ...contextMenu,
      };
    },
  });

  function useSelectedItem(
    emit: ComponentEmit,
    options: { item: TreeItem; selectedItem?: TreeItem },
  ) {
    const selected = ref(false);

    const select = () => emit('select', options.item);

    watch(
      () => options.selectedItem,
      item => {
        selected.value = item?.id === options.item?.id ?? false;
      },
    );

    return {
      selected,
      select,
    };
  }

  function useContextMenu() {
    const state = reactive({
      isContextMenuOpen: false,
      contextMenuX: 0,
      contextMenuY: 0,
    });

    function openContextMenu(event: MouseEvent) {
      state.contextMenuX = event.clientX;
      state.contextMenuY = event.clientY;
      state.isContextMenuOpen = true;
    }

    function closeContextMenu() {
      state.isContextMenuOpen = false;
    }

    return {
      ...toRefs(state),
      openContextMenu,
      closeContextMenu,
    };
  }

  function getIcon(item: TreeItem) {
    switch (item.type) {
      case 'folder':
        return 'mdi-folder-outline';
      case 'file':
        return 'mdi-file-document-outline';
      case 'node':
        return 'mdi-menu';
      case 'item':
        return 'mdi-minus';
    }
  }
</script>

<style scoped lang="scss">
  .tree-item {
    --selected-background-color: #f0f2f5;
    min-width: 100%;

    &.selected {
      .label {
        background-color: var(--selected-background-color);
      }
    }

    &.expanded {
      .folder-arrow {
        transform: rotate(45deg);
      }
    }

    .label {
      display: flex;
      flex-direction: row;
      padding: 8px;
      cursor: pointer;

      > .v-icon {
        margin-right: 8px;
      }

      &:hover {
        background-color: var(--selected-background-color);
      }

      &.item {
        .folder-arrow {
          opacity: 0;
        }
      }

      &.missing {
        color: var(--v-error-base);
      }

      &.changed {
        color: var(--v-warning-darken1);
      }

      &.new {
        color: var(--v-success-base);
      }
    }

    .folder-arrow {
      transform: rotate(0);
    }

    .missing-count {
      $size: 24px;
      width: auto;
      height: $size;
      min-width: $size;

      border-radius: $size / 2;
      line-height: 16px;
      padding: 4px;

      background-color: var(--v-error-base);
      color: #ffffff;
      text-align: center;
      font-size: 14px;

      margin-left: 8px;
    }

    .item-name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
</style>
