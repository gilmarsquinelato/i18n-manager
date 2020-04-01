<template>
  <div class="folder">
    <v-row>
      <v-col class="pa-0">
        <v-card tile>
          <v-toolbar color="primary" dark class="flex-grow-0">
            <v-row>
              <v-col cols="2">
                <v-select
                  v-model="treeVisibilityFilter"
                  :items="treeVisibilityFilterOptions"
                  item-value="value"
                  item-text="label"
                  label="Show"
                  outlined
                  hide-details
                  dense
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="treeFilter"
                  @input="filterTree"
                  hide-details
                  prepend-icon="mdi-magnify"
                  single-line
                  label="Search"
                  outlined
                  dense
                />
              </v-col>
            </v-row>
          </v-toolbar>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="main ma-0 mt-2">
      <v-col cols="4" class="left-side pa-0 pb-1 mr-4">
        <v-card class="left-card">
          <RecycleScroller
            :items="expandedTreeItems"
            :item-size="44"
            key-field="id"
            class="tree-scroller"
            v-slot="{ item }"
          >
            <Tree
              :key="item.id"
              :item="item"
              :selected-item="selectedItem"
              :expanded="isParentExpanded(item)"
              :clipboard-item-id="clipboardItemId"
              :clipboard-item-action="clipboardItemAction"
              @select="selectItem"
              @right-click="handleItemRightClick"
            />
          </RecycleScroller>
        </v-card>
      </v-col>
      <v-col class="right-side pa-2 pr-0">
        <v-row class="ma-0">
          <v-col class="pa-0 mb-4">
            <div class="translate-container">
              <Translate
                :language-list="languageList"
                :is-translation-enabled="isTranslationEnabled"
                :selected-item="selectedItem"
                @showSettings="showSettings"
                @translate="translate"
              />
            </div>
          </v-col>
        </v-row>
        <v-row class="ma-0 content-container">
          <v-col class="pa-0 pr-2">
            <Content
              :selected-item="selectedItem"
              :folder="folder"
              :original-folder="originalFolder"
              :language-list="languageList"
              :is-translation-enabled="isTranslationEnabled"
              @update-value="updateFolderValue"
              @translate="translate"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="status-bar">
      <v-col class="pb-0 pt-2">
        <v-card tile>
          <div class="status-item" v-if="isSaving">
            <v-icon>mdi-content-save-outline</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <TranslationProgressPanel
      :is-translating="isTranslating"
      :translation-progress="translationProgress"
      :translation-errors="translationErrors"
      @setIsTranslating="setIsTranslating"
      @cancelTranslate="cancelTranslate"
    />

    <ContextMenu
      ref="contextMenuRef"
      :tree="tree"
      :tree-items="treeItems"
      :clipboard-item-id="clipboardItemId"
      @add-item="onAddItem"
      @paste-item="onPasteItem"
      @rename-item="renameItem"
      @delete-item="deleteItem"
      @send-modified-content="sendModifiedContent"
      @set-clipboard="setClipboard"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from '@vue/composition-api';

  import {
    AddItemPayload,
    ChangeFolderValuePayload,
    ClipboardItemAction,
    LanguageListItem,
    PasteItemPayload,
    TranslationError,
    TranslationProgress,
    TreeItem,
    TreeMap,
  } from '@/folder/types';
  import { useNamespace } from '@/store/utils';
  import { CustomSettings, LoadedPath } from '@common/types';
  import useTree from './compositions/tree';

  import Content from '../../components/Content.vue';
  import Translate from '../../components/Translate.vue';
  import TranslationProgressPanel from '../../components/TranslationProgressPanel.vue';
  import Tree from '../../components/Tree.vue';
  import ContextMenu from '../../components/ContextMenu.vue';

  export default defineComponent({
    name: 'Folder',
    components: { TranslationProgressPanel, Translate, Content, Tree, ContextMenu },
    setup() {
      const globalModule = useNamespace('global');
      const showSettings = globalModule.useMutation('showSettings');

      const settingsModule = useNamespace('settings');
      const settings = settingsModule.useState<CustomSettings>('settings');

      const folderModule = useNamespace('folder');
      const tree = folderModule.useState<TreeMap>('tree');
      const treeItems = folderModule.useGetter<TreeItem[]>('treeItems');
      const folder = folderModule.useState<LoadedPath[]>('folder');
      const originalFolder = folderModule.useState<LoadedPath[]>('originalFolder');
      const selectedItem = folderModule.useState<TreeItem>('selectedItem');
      const sendModifiedContent = folderModule.useAction('sendModifiedContent');
      const setSelectedItem = folderModule.useMutation('setSelectedItem');
      const updateValue = folderModule.useMutation('updateValue');
      const updateTreeStatus = folderModule.useMutation('updateTreeStatus');
      const deleteItem = folderModule.useMutation('deleteItem');
      const renameItem = folderModule.useMutation('renameItem');
      const addItem = folderModule.useMutation('addItem');

      const languageList = folderModule.useState<LanguageListItem[]>('languageList');
      const isTranslationEnabled = folderModule.useState<boolean>('isTranslationEnabled');
      const isTranslating = folderModule.useState<boolean>('isTranslating');
      const translationProgress = folderModule.useState<TranslationProgress>('translationProgress');
      const translationErrors = folderModule.useState<TranslationError[]>('translationErrors');
      const translate = folderModule.useAction('translate');
      const cancelTranslate = folderModule.useAction('cancelTranslate');
      const setIsTranslating = folderModule.useMutation('setIsTranslating');

      const isSaving = folderModule.useState<boolean>('isSaving');

      const setClipboard = folderModule.useMutation('setClipboard');
      const pasteItem = folderModule.useMutation('pasteItem');
      const clipboardItemId = folderModule.useState<string>('clipboardItemId');
      const clipboardItemAction = folderModule.useState<ClipboardItemAction>('clipboardItemAction');

      const treeComposition = useTree(tree, treeItems, folder);

      const contextMenuRef = ref<any>(null);

      function selectItem(item: TreeItem) {
        setSelectedItem(item);
        if (item.type !== 'item') {
          treeComposition.toggleTreeNode(item);
        }
      }

      function updateFolderValue(payload: ChangeFolderValuePayload) {
        updateValue(payload);
        updateTreeStatus();
        sendModifiedContent();
      }

      function onAddItem(payload: AddItemPayload) {
        addItem(payload);
        treeComposition.expandTreeNode(payload.parent);
      }

      function onPasteItem(payload: PasteItemPayload) {
        pasteItem(payload);
        treeComposition.expandTreeNode(payload.parent);
      }

      function handleItemRightClick(event: MouseEvent, item: TreeItem) {
        contextMenuRef.value?.handleRightClick(event, item);
      }

      return {
        showSettings,
        settings,
        folder,
        originalFolder,
        selectedItem,
        selectItem,
        updateFolderValue,

        tree,
        treeItems,

        ...treeComposition,
        contextMenuRef,
        handleItemRightClick,
        onAddItem,
        onPasteItem,
        renameItem,
        deleteItem,
        setClipboard,
        sendModifiedContent,

        languageList,
        isTranslationEnabled,
        translate,
        isTranslating,
        translationProgress,
        translationErrors,
        setIsTranslating,
        cancelTranslate,

        isSaving,

        clipboardItemId,
        clipboardItemAction,
      };
    },
  });
</script>

<style scoped lang="scss">
  .folder {
    height: 100vh;
  }

  .main {
    flex: 1;
    height: calc(100vh - 64px - 46px);
  }

  .left-side {
    height: 100%;
  }

  .left-card {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;

    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .tree-container {
    overflow: auto;
    height: 100%;

    .tree-scroller {
      height: 100%;
    }
  }

  .right-side {
    padding-top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;

    .content-container {
      height: 100%;
      overflow: auto;

      > div {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }

  .status-bar {
    .v-card {
      height: 30px;
    }

    .status-item {
      padding: 0 8px;

      animation: status-animation 2s infinite;
    }
  }

  @keyframes status-animation {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>

<style lang="scss">
  .tree-container {
    .tree-scroller {
      > div {
        overflow: visible;
      }
    }
  }
</style>
