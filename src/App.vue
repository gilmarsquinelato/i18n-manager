<template>
  <v-app>
    <v-content class="app">
      <router-view />
    </v-content>

    <Settings />
  </v-app>
</template>

<script lang="ts">
  import { provideStore } from '@/store/utils';
  import { defineComponent } from '@vue/composition-api';
  import Settings from '@/settings/views/Settings.vue';

  export default defineComponent({
    name: 'App',
    components: {
      Settings,
    },
    setup(props, ctx) {
      provideStore(ctx.root.$store);
    },
  });
</script>

<style lang="scss">
  html,
  body,
  .app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .app {
    background-image: url('./assets/logo.png');
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 500px 125px;
    background-blend-mode: lighten;
    background-color: #fafaffb3;
  }

  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.4);
  }
</style>
