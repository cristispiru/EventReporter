<template>
  <div class="home">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="#">Event Reporter</b-navbar-brand>
      <b-navbar-nav>
        <b-button
          variant="dark"
          size="sm"
          class="my-2 my-sm-0"
          >New Event</b-button
        >
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-button variant="dark" size="sm" class="my-2 my-sm-0" @click="logout"
          >Logout</b-button
        >
      </b-navbar-nav>
    </b-navbar>
    <Map />
    <NewEvt />
  </div>
</template>

<script>
// @ is an alias to /src
import Map from '@/components/Map.vue'
import NewEvt from '@/components/NewEvt.vue'

export default {
  name: 'home',
  components: {
    Map,
    NewEvt
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
      this.$route.push({ name: 'Login' })
    }
  }
}
</script>

<style scoped>
</style>
