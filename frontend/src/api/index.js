import Vue from 'vue'

export const Test = function () {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/').then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const AddEvent = function (
  alertCode,
  description,
  longitude,
  latitude,
  image
) {
  var info = {}
  info.alert_code = alertCode
  info.description = description
  info.longitude = longitude
  info.latitude = latitude
  info.image = image
  return Vue.http.post(process.env.VUE_APP_API_BASE + '/event', info).then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const GetEvents = function () {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/event').then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const GetEventsNearby = function (minLat, maxLat, minLon, maxLon) {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/event/' + minLon + '/' + maxLon + '/' + minLat + '/' + maxLat)
    .then(response => {
      if (response.body.errors) {
        throw response.body
      }
      return response.body
    })
}

export const GetEvent = function (eventId) {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/event/' + eventId)
    .then(response => {
      if (response.body.errors) {
        throw response.body
      }
      return response.body
    })
}

export const AddTagToEvent = function (eventId, tagName) {
  var info = {}
  info.name = tagName
  return Vue.http.post(process.env.VUE_APP_API_BASE + '/event/' + eventId + '/tag', info)
    .then(response => {
      if (response.body.errors) {
        throw response.body
      }
      return response.body
    })
}

export const GetTags = function () {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/tag').then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const GetTag = function (tagName) {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/tag/' + tagName)
    .then(response => {
      if (response.body.errors) {
        throw response.body
      }
      return response.body
    })
}

export const AddTag = function (tagName) {
  var info = {}
  info.name = tagName
  return Vue.http.post(process.env.VUE_APP_API_BASE + '/tag', info).then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const GetAlerts = function () {
  return Vue.http.get(process.env.VUE_APP_API_BASE + '/alert/codes').then(response => {
    if (response.body.errors) {
      throw response.body
    }
    return response.body
  })
}

export const AddAlert = function (alertName) {
  var info = {}
  info.name = alertName
  return Vue.http.post(process.env.VUE_APP_API_BASE + '/alert/codes', info)
    .then(response => {
      if (response.body.errors) {
        throw response.body
      }
      return response.body
    })
}

export default {
  Test,
  AddEvent,
  GetEvents,
  GetEventsNearby,
  GetEvent,
  AddTagToEvent,
  GetTags,
  GetTag,
  AddTag,
  GetAlerts,
  AddAlert
}
