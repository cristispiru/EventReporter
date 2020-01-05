import axios from 'axios'

const url = 'http://localhost:3000/api/'

export default {
  async login (simpleCredentials) {
    const response = await axios
      .post(url + 'login/', simpleCredentials)
      .catch(error => console.log(error))
    return response.data
  },
  async signUp (complexCredentials) {
    const response = await axios
      .post(url + 'user/', complexCredentials)
      .catch(error => console.log(error))
    return response.data
  },
  async signUpAdmin (complexCredentials) {
    const response = await axios
      .post(url + 'user/admin/', complexCredentials)
      .catch(error => console.log(error))
    return response.data
  },
  async newEventt (event) {
    const response = await axios
      .post(url + 'event/', event)
      .catch(error => console.log(error))
    return response.data
  },
  async getEvents () {
    const response = await axios
      .get(url + 'event/')
      .catch(error => console.log(error))
    return response.data
  },
  async getEventDetails (id) {
    const response = await axios
      .get(url + 'event/' + id)
      .catch(error => console.log(error))
    return response.data
  },
  async reportEvent (id) {
    const response = await axios
      .patch(url + 'event/' + id + '/report/')
      .catch(error => console.log(error))
    return response.data
  },
  async getUserDetails (email) {
    const response = await axios
      .get(url + 'event/' + email)
      .catch(error => console.log(error))
    return response.data
  }
}
