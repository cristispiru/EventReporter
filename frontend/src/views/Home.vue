<template>
  <div class="home">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="/">Event Reporter</b-navbar-brand>
      <b-navbar-nav>
        <b-button
          v-if="isLoggedIn !== '' && componentSwitch == true"
          variant="dark"
          size="sm"
          class="my-2 my-sm-0"
          @click="componentSwitch = !componentSwitch"
          >New event</b-button
        >
        <b-button
          v-if="isLoggedIn !== ''"
          variant="danger"
          size="sm"
          class="my-2 my-sm-0"
          @click="showReportModal = true"
          >Report event</b-button
        >
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-button v-if="isLoggedIn === ''" variant="dark" size="sm" class="my-2 my-sm-0" @click="goToLogin"
          >Go to Login page</b-button
        >
        <b-button v-else variant="dark" size="sm" class="my-2 my-sm-0" @click="logout"
          >Logout</b-button
        >
      </b-navbar-nav>
    </b-navbar>
    <Map v-if="componentSwitch" />
    <NewEvt v-else/>
    <b-modal
      id="modal-1"
      title="Report an event"
      v-model="showReportModal"
      header-bg-variant="danger"
      header-text-variant="dark"
      ok-only
      ok-variant="dark"
      @ok="reportEvent">
        <b-form-input v-model="reportedEventId" placeholder="Enter event id"></b-form-input>
    </b-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import Map from '@/components/Map.vue'
import NewEvt from '@/components/NewEvt.vue'
import { mapGetters } from 'vuex'
import auth from '@/services/auth.service.js'

export default {
  name: 'home',
  data () {
    return {
      componentSwitch: true,
      showReportModal: false,
      reportedEventId: ''
    }
  },
  components: {
    Map,
    NewEvt
  },
  computed: {
    ...mapGetters({ isLoggedIn: 'isLoggedIn' })
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
      this.$router.push({ name: 'Login' })
    },
    goToLogin () {
      this.$router.push({ name: 'Login' })
    },
    async reportEvent () {
      let response = await auth.reportEvent(this.reportedEventId)
      return response
    }
  }
}
</script>

<style scoped>
</style>
