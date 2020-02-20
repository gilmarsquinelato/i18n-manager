import Vue from 'vue';
import VueVirtualScroller from 'vue-virtual-scroller';
import VueCompositionApi from '@vue/composition-api';

import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import { sendIpc } from '@/store/plugins/ipc';
import * as ipcMessages from '@common/ipcMessages';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

Vue.config.productionTip = false;

Vue.use(VueVirtualScroller);
Vue.use(VueCompositionApi);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');

sendIpc(ipcMessages.settings);
