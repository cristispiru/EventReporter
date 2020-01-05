<template>
  <div class="signup">
    <h3>Sign up</h3>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="firstName"
      placeholder="First Name"
    ></b-form-input>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="lastName"
      placeholder="Last Name"
    ></b-form-input>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="email"
      placeholder="Email"
    ></b-form-input>
    <b-form-input
      class="input-form"
      :type="'password'"
      v-model="password"
      placeholder="Password"
    ></b-form-input>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="number"
      placeholder="Number (optional)"
    ></b-form-input>
    <b-button variant="success" @click="signUp">Sign up</b-button>
    <p>
      Already have an account ? Go to
      <router-link to="/login">Login</router-link> page
    </p>
  </div>
</template>

<script>
import auth from '@/services/auth.service.js'

export default {
  name: 'signUp',
  data () {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      number: '',
      jwt: ''
    }
  },
  methods: {
    signUp () {
      let complexCredentials = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        number: this.number
      }
      let response = auth.signUp(complexCredentials)
      this.$store.dispatch('loginOrSignUp', { response })
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.signup {
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
