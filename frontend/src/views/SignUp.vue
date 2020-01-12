<template>
  <div class="signup">
    <h3>Sign up</h3>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="firstName"
      placeholder="First Name"
    ></b-form-input>
    <div class="form-validation-message" v-if="submitted && !$v.firstName.required">First name is required.</div>
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="lastName"
      placeholder="Last Name"
    ></b-form-input>
    <div class="form-validation-message" v-if="submitted && !$v.lastName.required">Last name is required.</div>
    <b-form-input
      class="input-form"
      :type="'text'"
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
    <b-form-input
      class="input-form"
      :type="'text'"
      v-model="number"
      placeholder="Number (optional)"
    ></b-form-input>
    <b-button style="margin: 10px" variant="success" @click="signUp">Sign up</b-button>
    <b-alert style="margin-top: 1rem" v-model="showDismissibleAlert" variant="danger" dismissible>
        The email is already used.
    </b-alert>
    <p>
      Already have an account ? Go to
      <router-link to="/login">Login</router-link> page
    </p>
  </div>
</template>

<script>
import auth from '@/services/auth.service.js'
import { required, email, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'signUp',
  data () {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      number: '',
      jwt: '',
      showDismissibleAlert: false,
      submitted: false
    }
  },
  validations: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    password: { required, min: minLength(8) }
  },
  methods: {
    async signUp () {
      this.submitted = true
      this.$v.$touch()
      if (!this.$v.$error) {
        let complexCredentials = {
          first_name: this.firstName,
          last_name: this.lastName,
          email: this.email,
          password: this.password,
          number: this.number
        }
        console.log(complexCredentials)
        let response = await auth.signUp(complexCredentials)
        if (response.errors === undefined && response.errors.length > 0) {
          let token = response.token
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

.form-validation-message {
    color: red;
}
</style>
