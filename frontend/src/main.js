import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
import dotenv from 'dotenv'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import axios from 'axios'
import Vuelidate from 'vuelidate'

dotenv.config()
Vue.config.productionTip = false

Vue.use(VueResource)
Vue.use(BootstrapVue)
Vue.use(Vuelidate)
Vue.http.options.root = process.env.VUE_APP_API_BASE
axios.defaults.headers.common['Authorization'] = `${store.state.jwt}`

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
