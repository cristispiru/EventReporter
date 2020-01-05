<template>
  <div id="app">
    <!-- <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <router-link to="/" class="nav-link">
        <a class="nav-link">EventReporter</a>
      </router-link>
      <router-link to="/new" class="nav-link">
        <a class="nav-link">Raporteaza Eveniment</a>
      </router-link>
    </nav> -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.nav-link {
  color: #fff !important;
  text-decoration: none !important;
}
</style>
