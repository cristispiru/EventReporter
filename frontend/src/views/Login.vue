<template>
  <div class="login">
    <h3>Login</h3>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="email"
    ></b-form-input>
    <b-form-input
      class="input-form"
      :type="'password'"
      v-model="password"
    ></b-form-input>
    <b-button variant="success">Enter</b-button>
    <p>
      Don't have an account ? Go to
      <router-link to="/signup">Sign up</router-link> page
    </p>
  </div>
</template>

<script>

export default {
  name: 'login',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
  }
}
</script>

<style scoped>
.login {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}
.input-form {
  margin: 10px 0;
  width: 20%;
  padding: 15px;
}
</style>
