<template>
  <v-dialog :value="isTranslating" persistent retain-focus>
    <v-card>
      <v-card-title v-if="!completed">Translating</v-card-title>
      <v-card-title v-if="completed">Translation Finished</v-card-title>

      <div class="pa-6">
        <div v-if="!completed">
          <v-progress-linear :value="percent" height="16" rounded>
            <template v-slot="{ value }">
              <strong>{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>

          <div class="d-flex py-2">
            <span class="mr-2">Progress: </span>

            {{ currentValue }} / {{ totalValue }}
          </div>

          <div class="py-2">
            <div class="d-flex">
              <span class="mr-2">Current: </span>

              <v-breadcrumbs divider=">" :items="progressPath" class="pa-0">
                <template v-slot:item="props">
                  <v-breadcrumbs-item>{{ props.item }}</v-breadcrumbs-item>
                </template>
              </v-breadcrumbs>
            </div>
            <div class="d-flex">
              <span class="mr-2">Language: </span>

              {{ targetLanguage }}
            </div>
          </div>

          <div class="d-flex py-2">
            <span class="mr-2">Estimated Time: </span>
            {{ estimatedTime }}
          </div>
        </div>

        <div v-if="translationErrors" class="errors-container">
          <v-alert
            v-for="error in groupedErrors"
            :key="error.path.join('.')"
            type="error"
            dense
            dismissible
            text
            prominent
          >
            <div class="d-flex py-2">
              <span class="mr-2">Error at: </span>
              <v-breadcrumbs divider=">" :items="error.path" class="error-path pa-0" light>
                <template v-slot:item="props">
                  <v-breadcrumbs-item>{{ props.item }}</v-breadcrumbs-item>
                </template>
              </v-breadcrumbs>
            </div>

            <div v-for="message in error.errors" :key="message">
              {{ message }}
            </div>
          </v-alert>
        </div>
      </div>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text color="error" :disabled="completed" @click="cancelTranslate">Cancel</v-btn>
        <v-btn color="primary" :disabled="!completed" @click="finishTranslation">Ok</v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import { getLanguageLabel } from '@/folder/utils/language';
  import { computed, defineComponent } from '@vue/composition-api';
  import * as _ from 'lodash/fp';
  import { TranslationError, TranslationProgress } from '../types';

  export default defineComponent({
    name: 'TranslationProgressPanel',
    props: {
      isTranslating: {
        type: Boolean,
        required: true,
      },
      translationProgress: Object as () => TranslationProgress,
      translationErrors: {
        type: Array as () => TranslationError[],
        required: true,
      },
    },
    setup: function(props, { emit }) {
      const finishTranslation = () => emit('setIsTranslating', false);
      const cancelTranslate = () => emit('cancelTranslate');

      const completed = computed(
        () =>
          props.translationProgress &&
          props.translationProgress.current >= props.translationProgress.total,
      );

      const currentValue = computed(() => props.translationProgress?.current ?? 0);
      const totalValue = computed(() => props.translationProgress?.total ?? 0);

      const percent = computed(() =>
        props.translationProgress && props.translationProgress.current > 0
          ? (props.translationProgress.current / props.translationProgress.total) * 100
          : 0,
      );

      const progressPath = computed(() => props.translationProgress?.path ?? []);

      const estimatedTime = computed(() => {
        if (!props.translationProgress) return '';

        const estimatedTimeInSeconds = props.translationProgress.estimatedTimeInMs / 1000;
        const estimatedTimeInMinutes = estimatedTimeInSeconds / 60;

        return estimatedTimeInSeconds < 60
          ? `${estimatedTimeInSeconds.toFixed(0)} seconds`
          : `${estimatedTimeInMinutes.toFixed(0)} minutes`;
      });

      const groupedErrors = computed(() =>
        _.pipe(
          _.groupBy('path'),
          Object.entries,
          _.map(([, values]) => {
            return {
              path: values[0].path,
              errors: _.uniq(values.map((i: TranslationError) => i.error)),
            };
          }),
        )(props.translationErrors),
      );

      const targetLanguage = computed(() =>
        getLanguageLabel(props.translationProgress?.language ?? ''),
      );

      return {
        finishTranslation,
        cancelTranslate,
        completed,
        percent,
        progressPath,
        estimatedTime,
        groupedErrors,
        currentValue,
        totalValue,
        targetLanguage,
      };
    },
  });
</script>

<style scoped lang="scss">
  .errors-container {
    max-height: 40vh;
    overflow: auto;
  }

  .error-path {
    color: var(--v-secondary-base);
  }
</style>
