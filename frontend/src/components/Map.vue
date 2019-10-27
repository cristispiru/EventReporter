<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-4">
        <div
          class="form-check"
          v-for="alert in alerts"
          :key="alert.id"
        >
          <label class="form-check-label">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="alert.active"
              @change="layerChanger()"
            />
            {{ alert.name }}
          </label>
        </div>
      </div>
      <div class="col-lg-8 map-container">
          <div id="map" class="map"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import API from '@/api'

export default {
  name: 'Map',
  data () {
    return {
      map: null,
      tileLayer: null,
      markerLayer: null,
      alerts: [],
      events: []
    }
  },
  mounted () {
    this.initMap()
    this.getAlerts()
    this.getEvents()
  },
  methods: {
    initMap () {
      this.map = L.map('map').setView(
        [44.42765069807356, 26.10252857208252],
        12
      )
      this.tileLayer = L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }
      )
      this.tileLayer.addTo(this.map)
      this.markerLayer = L.layerGroup()
      this.map.addLayer(this.markerLayer)
      var thisTmp = this
      this.map.on('dragend', function (myMap) {
        var bounds = thisTmp.map.getBounds()
        var minLat = bounds._southWest.lat
        var maxLat = bounds._northEast.lat
        var minLon = bounds._southWest.lng
        var maxLon = bounds._northEast.lng
        thisTmp.getEventsNearby(minLat, maxLat, minLon, maxLon)
      })

      this.map.on('zoomend', function (myMap) {
        var bounds = thisTmp.map.getBounds()
        var minLat = bounds._southWest.lat
        var maxLat = bounds._northEast.lat
        var minLon = bounds._southWest.lng
        var maxLon = bounds._northEast.lng
        thisTmp.getEventsNearby(minLat, maxLat, minLon, maxLon)
      })
    },
    initLayers () {
      this.markerLayer.clearLayers()
      this.events.forEach((event) => {
        var coords = [event.latitude, event.longitude]
        var info = event.description + '<br> Latitude: ' + event.latitude + '<br> Longitude: ' + event.longitude + '<br> Alert: ' + event.alert_code + '<br> Time: ' + this.splitDate(event.timestamp) + '<br> <img class="event-info" src="' + event.image + '" />'
        event.leafletObject = L.marker(coords).bindPopup(info).openPopup()
      })
      this.layerChanger()
    },
    layerChanger () {
      this.events.forEach((event) => {
        this.alerts.forEach((alert) => {
          if (alert.active === true) {
            if (alert.name === event.alert_code) {
              if (event.active === false) {
                event.leafletObject.addTo(this.markerLayer)
                event.active = true
              }
            }
          } else {
            if (alert.name === event.alert_code) {
              if (event.active === true) {
                event.leafletObject.removeFrom(this.markerLayer)
                event.active = false
              }
            }
          }
        })
      })
    },
    getEvents () {
      API.GetEvents()
        .then(response => {
          var i
          this.events = []
          for (i = 0; i < response.list.length; i++) {
            response.list[i].active = false
            this.events.push(response.list[i])
          }
          this.initLayers()
        })
        .catch(response => {
          console.log(response)
        })
    },
    getEventsNearby (minLat, maxLat, minLon, maxLon) {
      API.GetEventsNearby(minLat, maxLat, minLon, maxLon)
        .then(response => {
          var i
          this.events = []
          for (i = 0; i < response.list.length; i++) {
            response.list[i].active = false
            this.events.push(response.list[i])
          }
          this.initLayers()
        })
        .catch(response => {
          console.log(response)
        })
    },
    getAlerts () {
      API.GetAlerts()
        .then(response => {
          var i
          for (i = 0; i < response.length; i++) {
            response[i].active = true
            this.alerts.push(response[i])
          }
        })
        .catch(response => {
          console.log(response)
        })
    },
    splitDate (date) {
      var year = date.split('T')[0]
      var time = date.split('T')[1].split('Z')[0].split('.')[0]
      var response = year + ' ' + time
      return response
    }
  }
}
</script>

<style scoped>
.map-container {
  margin: 50px 0px;
}

.map {
  height: 500px;
  width: 100%;
}

.form-check {
  margin: 50px;
}

/deep/ .event-info {
  width: 200px;
  height: 200px;
  display: block;
  margin: 10px auto;
}
</style>
