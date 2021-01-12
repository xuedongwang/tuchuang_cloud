import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/scss/index.scss';
import { http, uuid } from './utils';

Vue.config.productionTip = false

window.$http = http;
window.$uuid = uuid;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
