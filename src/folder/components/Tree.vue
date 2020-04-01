<template>
  <div
    class="tree-item"
    :class="{ expanded, selected, copy: isItemBeingCopied(), cut: isItemBeingCut() }"
  >
    <div
      @click="select"
      @click.right="handleRightClick"
      class="label"
      :class="[item.status, item.type]"
      :style="{ paddingLeft: item.level * 16 + 8 + 'px' }"
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

      <span v-if="item.missingCount > 0" class="badge missing-count" title="Missing items">
        {{ item.missingCount }}
      </span>
      <span v-if="item.duplicatedCount > 0" class="badge duplicated-count" title="Duplicated items">
        {{ item.duplicatedCount }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from '@vue/composition-api';

  import { ComponentEmit } from '@/index';

  import { ClipboardItemAction, TreeItem } from '../types';

  export default defineComponent({
    name: 'Tree',
    props: {
      item: {
        type: Object as () => TreeItem,
        required: true,
      },
      selectedItem: Object as () => TreeItem,
      expanded: Boolean,
      hasCopiedItem: Boolean,
      clipboardItemId: String,
      clipboardItemAction: Number as () => ClipboardItemAction,
    },
    setup(props, { emit }) {
      const icon = getIcon(props.item);
      const selectedItem = useSelectedItem(emit, props);

      const handleRightClick = (event: MouseEvent) => emit('right-click', event, props.item);

      const isClipboardItem = () => props.item.id === props.clipboardItemId;
      const isItemBeingCopied = () =>
        isClipboardItem() && props.clipboardItemAction === ClipboardItemAction.copy;
      const isItemBeingCut = () =>
        isClipboardItem() && props.clipboardItemAction === ClipboardItemAction.cut;

      return {
        icon,
        handleRightClick,
        isItemBeingCopied,
        isItemBeingCut,
        ...selectedItem,
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

    border: 2px solid transparent;

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

    &.copy {
      border: 2px solid var(--v-primary-base);
    }

    &.cut {
      border: 2px dashed var(--v-primary-base);
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

    .badge {
      $size: 24px;
      width: auto;
      height: $size;
      min-width: $size;

      border-radius: $size / 2;
      line-height: 16px;
      padding: 4px;

      text-align: center;
      font-size: 14px;

      margin-left: 8px;
    }

    .missing-count {
      background-color: var(--v-error-base);
      color: #ffffff;
    }

    .duplicated-count {
      background-color: var(--v-warning-base);
      color: #ffffff;
    }

    .item-name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
</style>
