import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/home/views/Home.vue';
import Folder from '@/folder/views/Folder';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home as any,
  },
  {
    path: '/folder',
    name: 'folder',
    component: Folder as any,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
