import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
import dotenv from 'dotenv'

dotenv.config()
Vue.config.productionTip = false

Vue.use(VueResource)
Vue.http.options.root = process.env.VUE_APP_API_BASE

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
