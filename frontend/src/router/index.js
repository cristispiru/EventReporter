import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'
import NewEvt from '@/components/NewEvt'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.VUE_APP_BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Map',
      component: Map
    },
    {
      path: '/new',
      name: 'NewEvt',
      component: NewEvt
    }
  ]
})
