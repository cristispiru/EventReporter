import Vue from 'vue'
import Vuex from 'vuex'
// import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
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
    loginOrSignUp: ({ commit, dispatch }, jwt) => {
      commit('SET_JWT_TOKEN', jwt.token)
    },
    logout: ({ commit }) => {
      commit('RESET_JWT_TOKEN', '')
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
