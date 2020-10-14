<template>
  <v-dialog v-model="visible" @close="hideExport" persistent>
    <v-form @submit.prevent="onSubmit" class="export-form">
      <v-card class="export">
        <v-card-title primary-title>
          <v-btn icon class="mr-2" @click="hideExport">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Export to xlsx / csv
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col v-if="languageList.length" class="px-5 pb-0">
              <v-toolbar-title>Select languages to export:</v-toolbar-title>
              <div class="language-list">
                <div v-for="(lang, index) in languageList" :key="index" class="language-list__item">
                  <v-checkbox
                    :value="lang.language"
                    v-model="selectedLanguages"
                    :label="lang.label"
                  />
                </div>
              </div>
              <div class="pt-4">
                <v-btn
                  :disabled="!selectedLanguages.length || isLoading"
                  type="submit"
                  color="primary"
                >
                  Export
                </v-btn>
                <v-progress-circular v-if="isLoading" indeterminate color="primary" />
              </div>
            </v-col>
            <v-col v-else>
              <div class="text-center">
                <h3>No data available for export.</h3>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-spacer />
        <v-card-actions>
          <v-spacer />
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
  import { useNamespace } from '@/store/utils';
  import { defineComponent, watch } from '@vue/composition-api';
  import { isObject } from 'lodash';

  export default defineComponent({
    name: 'Export.vue',
    setup() {
      const exportModule = useNamespace('export');
      const folderModule = useNamespace('folder');
      /* States */
      const visible = exportModule.useState('isExportVisible');
      let isLoading = exportModule.useState('isLoading');
      const languageList = folderModule.useState('languageList');
      let folder = folderModule.useState('folder');
      /* Actions/Mutations */
      const hideExport = exportModule.useMutation('hideExport');
      const createXls = exportModule.useAction('createXLS');
      const showLoading = exportModule.useMutation('showLoading');

      let selectedLanguages = [];

      watch(visible, (a) => {
        if (!visible.value) {
          hideExport();
        } else {
          selectedLanguages = [];
          languageList.value.map((item) => {
            selectedLanguages.push(item.language);
          });
        }
      });

      async function getLabel(key, value, labels) {
        let label = key;
        if (isObject(value)) {
          for (const k in value) {
            getLabel(label + '.' + k, value[k], labels);
          }
        } else {
          labels.push({ label, value });
          return true;
        }
      }

      async function onSubmit() {
        if (this.selectedLanguages.length) {
          showLoading();
          const files = folder.value;
          let sheetData = {};
          try {
            await files.map(async (file) => {
              if (!sheetData[file.name]) {
                sheetData[file.name] = {};
              }
              await file.items.map(async (language) => {
                if (!this.selectedLanguages.includes(language.language)) {
                  return;
                }
                let languageData = language.data;
                for (const key in languageData) {
                  let labels = [];
                  getLabel(key, languageData[key], labels);
                  labels.map(async (label) => {
                    if (!sheetData[file.name][label.label]) {
                      sheetData[file.name][label.label] = {};
                    }
                    sheetData[file.name][label.label][language.language] = label.value || '';
                  });
                }
              });
            });
            createXls({
              selectedLanguages: this.selectedLanguages,
              sheetData,
            });
          } catch (e) {
            alert('error');
          }
        }
      }

      return {
        visible,
        hideExport,
        onSubmit,
        languageList,
        selectedLanguages,
        isLoading,
      };
    },
  });
</script>

<style lang="scss">
  .export {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .export-form {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .language-list {
    &__item {
      .v-input__slot {
        margin-bottom: 0;
      }
      .v-messages {
        display: none;
      }
    }
  }
</style>
