<template>
  <a href="#" @click.prevent="openLink">
    <slot>
      {{ href }}
    </slot>
  </a>
</template>

<script lang="ts">
  import { defineComponent } from '@vue/composition-api';

  const shell = (window as any).require('electron').shell;

  export default defineComponent({
    name: 'RemoteLink',
    props: {
      href: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      function openLink() {
        shell.openExternal(props.href);
      }

      return {
        openLink,
      };
    },
  });
</script>
