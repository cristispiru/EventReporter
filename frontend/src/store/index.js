import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState],
  state: {
    jwt: ''
  },
  mutations: {
    SET_JWT_TOKEN: (state, jwt) => {
      state.jwt = jwt
    },
    RESET_JWT_TOKEN: (state, jwt) => {
      state.jwt = ''
    }
  },
  actions: {
    loginOrSignUp: ({ commit, dispatch }, { jwt }) => {
      commit('SET_JWT_TOKEN', jwt)
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    },
    logout: ({ commit }) => {
      commit('RESET', '')
    }
  },
  getters: {
    isLoggedIn: state => {
      return state.jwt
    }
  },
  modules: {
  }
})
