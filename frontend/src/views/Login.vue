<template>
  <div class="login">
    <h3>Login</h3>
    <b-form-input
      class="input-form"
      :type="'email'"
      v-model="email"
      placeholder="Email"
    ></b-form-input>
    <div v-if="submitted && $v.email.$error">
        <span class="form-validation-message" v-if="!$v.email.required">Email is required.</span>
        <span class="form-validation-message" v-if="!$v.email.email">Email is invalid.</span>
    </div>
    <b-form-input
      class="input-form"
      :type="'password'"
      v-model="password"
      placeholder="Password"
    ></b-form-input>
    <div v-if="submitted && $v.password.$error">
        <span class="form-validation-message" v-if="!$v.password.required">Password is required.</span>
        <span class="form-validation-message" v-if="!$v.password.min">Password must be at least 8 characters.</span>
    </div>
    <b-button style="margin: 10px" variant="success" @click="login">Enter</b-button>
    <b-alert style="margin-top: 1rem" v-model="showDismissibleAlert" variant="danger" dismissible>
      Incorrect email or password.
    </b-alert>
    <p>
      Don't have an account ? Go to
      <router-link to="/signup">Sign up</router-link> page
    </p>
  </div>
</template>

<script>
import auth from '@/services/auth.service.js'
import { required, email, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'login',
  data () {
    return {
      email: '',
      password: '',
      showDismissibleAlert: false,
      submitted: false
    }
  },
  validations: {
    email: { required, email },
    password: { required, min: minLength(8) }
  },
  methods: {
    async login () {
      this.submitted = true
      this.$v.$touch()
      if (!this.$v.$error) {
        let simpleCredentials = {
          email: this.email,
          password: this.password
        }
        let response = await auth.login(simpleCredentials)
        let msg = response.msg
        let token = response.token
        if (msg === 'Login successful') {
          this.$store.dispatch('loginOrSignUp', { token })
          this.$router.push({ name: 'Home' })
        } else {
          this.showDismissibleAlert = true
        }
      }
    }
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
.form-validation-message {
    color: red;
}
</style>
