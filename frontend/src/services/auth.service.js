import axios from 'axios'

const url = process.env.VUE_APP_API_BASE

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
  async newEvent (event) {
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
  async getEventsNearby (minLongitude, maxLongitude, minLatitude, maxLatitude) {
    const response = await axios
      .get(url + `event/${minLongitude}/${maxLongitude}/${minLatitude}/${maxLatitude}`)
      .catch(error => console.log(error))
    return response.data
  },
  async getEventDetails (id) {
    const response = await axios
      .get(url + `event/${id}`)
      .catch(error => console.log(error))
    return response.data
  },
  async reportEvent (id) {
    const response = await axios
      .patch(url + `event/${id}/report/`)
      .catch(error => console.log(error))
    return response.data
  },
  async getUserDetails (email) {
    const response = await axios
      .get(url + `event/${email}`)
      .catch(error => console.log(error))
    return response.data
  },
  async getAlertCodes () {
    const response = await axios
      .get(url + 'alert/codes/')
      .catch(error => console.log(error))
    return response.data
  }
}
