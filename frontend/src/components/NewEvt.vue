<template>
  <div class="container">
    <div class="row">
      <div class="col col-lg-8 map-container">
        <div id="mapSelect" class="mapSelect"></div>
      </div>
      <form class="col-lg-4" id="newEvtForm">
        <div class="form-group">
          <label for="exampleFormControlSelect1">Tip Eveniment:</label>
          <select class="form-control" id="ChooseEvt" v-model="alertName">
            <option v-for="alert in alerts" :key="alert.id">{{alert.name}}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="Description">Descriere:</label>
          <textarea class="form-control" id="Description" rows="3" v-model="event.description"></textarea>
        </div>
        <div class="form-group">
          <label for="Description">Tags: (separate by comma)</label>
          <textarea class="form-control" id="Tags" rows="3" v-model="tagString"></textarea>
        </div>
        <div class="form-group">
            <label for="image">Imagine</label>
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
import API from '@/api'
import $ from 'jquery'
export default {
  name: 'NewEvt',
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
    this.getAlerts()
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
    getAlerts () {
      API.GetAlerts()
        .then(response => {
          var i
          for (i = 0; i < response.length; i++) {
            this.alerts.push(response[i])
          }
        })
        .catch(response => {
          console.log(response)
        })
    },
    getTags () {
      API.GetTags()
        .then(response => {
        })
        .catch(response => {
          console.log(response)
        })
    },
    addAlert () {
      API.AddAlert(this.alertName)
        .then(response => {
        })
        .catch(response => {
          console.log(response)
        })
    },
    addTags () {
      this.tags.forEach((tag) => {
        this.addTagToEvent(tag)
      })
    },
    addEvent () {
      API.AddEvent(
        this.alertName,
        this.event.description,
        this.event.longitude,
        this.event.latitude,
        this.event.image
      )
        .then(response => {
          if (response.status === 1) {
            this.event.id = response.eventId
            this.addTags()
            alert('Eveniment adăugat cu succes.')
          } else {
            alert('Un Eveniment asemanator a fost deja semnalat')
          }
        })
        .catch(response => {
          console.log(response)
        })
    },
    addTagToEvent (tagName) {
      API.AddTagToEvent(this.event.id, tagName)
        .then(response => {
        })
        .catch(response => {
          console.log(response)
        })
    },
    formValidation (e) {
      if (this.alertName && this.event.description && this.event.longitude !== 0 && this.event.latitude !== 0 && this.event.image.length !== 0) {
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
      if (this.event.image.length === 0) {
        this.errors.push('Add image.')
      }
    },
    submitNewEvt () {
      this.separateTags()
      this.getImage()
      if (this.formValidation()) {
        this.addEvent()
      } else alert('Completați câmpurile libere.')
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
