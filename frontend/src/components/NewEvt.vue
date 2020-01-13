<template>
  <div class="container">
    <div class="row">
      <div class="col col-lg-8 map-container">
        <div id="mapSelect" class="mapSelect"></div>
      </div>
      <form class="col-lg-4" id="newEvtForm">
        <div class="form-group">
          <label for="exampleFormControlSelect1">Event type:</label>
          <select class="form-control" id="ChooseEvt" v-model="alertName">
            <option v-for="alert in alerts" :key="alert.id">{{alert.name}}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="Description">Description:</label>
          <textarea class="form-control" id="Description" rows="3" v-model="event.description"></textarea>
        </div>
        <div class="form-group">
          <label for="Description">Tags: (separate by comma)</label>
          <textarea class="form-control" id="Tags" rows="3" v-model="tagString"></textarea>
        </div>
        <div class="form-group">
            <label for="image">Image</label>
            <input type="file" class="form-control-file" id="Image" accept="image/*" @change="getImage">
        </div>
        <div class="form-group">
          <label class="input">
            <input id="Latitude" placeholder="Latitudine" name="Location.Latitude" v-model="event.latitude">
          </label>
          <label class="input">
            <input id="Longitude" placeholder="Longitudine" name="Location.Longitude" v-model="event.longitude">
          </label>
        </div>
        <button type="button" class="btn btn-warning" @click="submitNewEvt">Adauga Eveniment</button>
      </form>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import $ from 'jquery'
import auth from '@/services/auth.service.js'

export default {
  name: 'NewEvt',
  props: ['componentSwitch'],
  data () {
    return {
      map: null,
      titleLayer: null,
      tags: [],
      newAlert: false,
      alertName: null,
      alerts: [],
      event: {
        id: null,
        description: null,
        longitude: 0,
        latitude: 0,
        image: ''
      },
      tagString: '',
      errors: []
    }
  },
  mounted () {
    this.initMapSelect()
    this.getAlertCodes()
  },
  methods: {
    initMapSelect () {
      this.map = L.map('mapSelect').setView(
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
      /* eslint-disable new-cap */
      var marker = new L.marker([44.42765069807356, 26.10252857208252], { draggable: 'true' })
      var thisTmp = this
      marker.on('dragend', function (event) {
        var position = marker.getLatLng()
        marker
          .setLatLng(position, { draggable: 'true' })
          .bindPopup(position)
          .update()
        thisTmp.event.latitude = marker.getLatLng().lat
        thisTmp.event.longitude = marker.getLatLng().lng
        $('#Latitude').val(position.lat)
        $('#Longitude')
          .val(position.lng)
          .keyup()
      })
      this.map.addLayer(marker)
    },
    separateTags () {
      this.tags = this.tagString.split(',').slice()
    },
    getImage () {
      var input = event.target
      if (input.files && input.files[0]) {
        var reader = new FileReader()
        reader.onload = new FileReader()
        reader.onload = (e) => {
          this.event.image = e.target.result
        }
        reader.readAsDataURL(input.files[0])
      }
    },
    formValidation (e) {
      if (this.alertName && this.event.description && this.event.longitude !== 0 && this.event.latitude !== 0) {
        return true
      }
      this.errors = []
      if (!this.alertName) {
        this.errors.push('Choose alert type.')
      }
      if (!this.event.description) {
        this.errors.push('Add description.')
      }
      if (this.event.longitude === 0 && this.event.latitude === 0) {
        this.errors.push('Move marker to event location.')
      }
    },
    submitNewEvt () {
      this.separateTags()
      this.getImage()
      if (this.formValidation()) {
        this.newEvent()
      } else alert('Complete required fields.')
    },
    async getAlertCodes () {
      let response = await auth.getAlertCodes()
      this.alerts = response
    },
    async newEvent () {
      let event = {
        name: this.alertName,
        description: this.event.description,
        longitude: this.event.longitude,
        latitude: this.event.latitude,
        image: this.event.image
      }
      let response = await auth.newEvent(event)
      console.log(response)
      if (response.status !== undefined && response.status === 1) {
        this.$emit('update:componentSwitch', true)
      }
    }
  }
}
</script>

<style scoped>

.map-container {
  margin: 50px 0px;
}

.mapSelect {
  height: 500px;
  width: 100%;
}

#newEvtForm {
  margin-top: 50px;
}

img.preview {
  width: 200px;
  background-color: white;
  border: 1px solid #DDD;
  padding: 5px;
}

</style>
