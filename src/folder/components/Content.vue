<template>
  <div class="content">
    <v-card class="my-4 pa-0" v-for="(item, index) in content" :key="item.language">
      <v-row align="center">
        <v-col cols="1">
          <div class="item-index">{{ index + 1 }}</div>
        </v-col>
        <v-col>
          <v-textarea
            @keyup="onChange($event, item.languageIndex)"
            v-model="item.value"
            :label="getLanguageLabel(item.language)"
            placeholder=" "
            :tabindex="index"
            outlined
            class="item-input"
            :class="itemStatusColor(item, originalContent[index])"
            hide-details
            rows="1"
            auto-grow
            dense
          />
        </v-col>
        <v-col cols="1">
          <v-menu max-height="90vh">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon tabindex="-1">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item disabled>Translate from</v-list-item>

              <v-list-item
                v-for="languageItem in contextLanguageList"
                :key="languageItem.language"
                @click="translate(languageItem.language, item.language)"
                :disabled="languageItem.disabled || languageItem.language === item.language"
              >
                <v-list-item-title>{{ getLanguageLabel(languageItem.language) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, Ref, ref, watch } from '@vue/composition-api';
  import _ from 'lodash';

  import { LoadedPath } from '@common/types';
  import { getLanguageLabel } from '../utils/language';
  import { getContentFromPath } from '../utils/files';
  import {
    ChangeFolderValuePayload,
    ContentItem,
    LanguageListItem,
    TranslatePayload,
    TreeItem,
  } from '../types';

  export default defineComponent({
    name: 'Content',
    props: {
      selectedItem: Object as () => TreeItem,
      isTranslationEnabled: Boolean,
      folder: {
        type: Array as () => LoadedPath[],
        required: true,
      },
      originalFolder: {
        type: Array as () => LoadedPath[],
        required: true,
      },
      languageList: {
        type: Array as () => LanguageListItem[],
        required: true,
      },
    },
    setup(props, { emit }) {
      const { content, originalContent, refreshContent } = useContent();
      const { contextLanguageList, updateLanguageList } = useContextLanguageList();

      watch([() => props.folder, () => props.selectedItem, () => props.languageList], () => {
        refreshContent(props.folder, props.originalFolder, props.selectedItem);
        updateLanguageList(props.languageList, content);
      });

      function updateValue(event: any, index: number) {
        emit('update-value', {
          index,
          value: event.target.value,
          itemId: props.selectedItem!.id,
        } as ChangeFolderValuePayload);
      }

      function translate(sourceLanguage: string, targetLanguage: string) {
        emit('translate', {
          mode: 'this',
          overwrite: true,
          sourceLanguage,
          targetLanguages: [targetLanguage],
        } as TranslatePayload);
      }

      return {
        content,
        originalContent,
        itemStatusColor,
        getLanguageLabel,
        contextLanguageList,
        onChange: _.throttle(updateValue, 500),
        translate,
      };
    },
  });

  function itemStatusColor(item: ContentItem, originalItem: ContentItem): string {
    if (item.value !== undefined && originalItem.value === undefined) return 'status-success';

    if (item.value && item.value !== originalItem.value) return 'status-warning';

    if (!item.value) return 'status-error';

    return '';
  }

  function useContent() {
    const content = ref<ContentItem[]>([]);
    const originalContent = ref<ContentItem[]>([]);

    function refreshContent(
      folder: LoadedPath[],
      originalFolder: LoadedPath[],
      selectedItem?: TreeItem,
    ) {
      if (!selectedItem || selectedItem.type !== 'item') {
        content.value = [];
        return;
      }

      content.value = getContentFromPath(folder, selectedItem.path);
      originalContent.value = getContentFromPath(originalFolder, selectedItem.path);
    }

    return {
      content,
      originalContent,
      refreshContent,
    };
  }

  function useContextLanguageList() {
    const contextLanguageList = ref<LanguageListItem[]>([]);

    let contentLanguages: string[] = [];

    function updateLanguageList(languageList: LanguageListItem[], content: Ref<ContentItem[]>) {
      contentLanguages = content.value.map(it => it.language);
      contextLanguageList.value = languageList.filter(it => contentLanguages.includes(it.language));
    }

    return {
      contextLanguageList,
      updateLanguageList,
    };
  }
</script>

<style lang="scss">
  .item-index {
    box-sizing: content-box;
    margin: 0 16px;
    padding: 4px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    line-height: 32px;
    text-align: center;
    background-color: var(--v-primary-base);
    color: #ffffff;
  }

  @mixin input-color($color) {
    &,
    label,
    &:hover {
      color: $color !important;
      caret-color: $color !important;
    }

    fieldset {
      border-color: $color !important;
      border-width: 2px;
    }
  }

  .item-input {
    &.status-success {
      @include input-color(var(--v-success-base));
    }
    &.status-warning {
      @include input-color(var(--v-warning-darken1));
    }
    &.status-error {
      @include input-color(var(--v-error-base));
    }
  }
</style>
