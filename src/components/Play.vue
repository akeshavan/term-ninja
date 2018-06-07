<template name="play">
  <div id="play">
    <div class="container">
    <!-- Modal Component -->
    <b-modal id="levelUp" ref="levelUp" title="You've Levelled Up!" ok-only>
      <p class="my-4">
        <h3>Level {{currentLevel.level}}</h3>
        <img :src="currentLevel.img" width="120px" height="120px"/>
        <p class="lead">You've unlocked: {{currentLevel.character}}</p>
      </p>
    </b-modal>

    <div class="main pt-3 pb-3 mb-3">
      <transition name="fade" mode="out-in">
        <span v-if="status === 'loading'"> {{status}} </span>
      </transition>

      <transition-group name="list" tag="p">
        <b-card v-for="term in terms"
          :key="term.id"
          :title="term.name"
          class="mt-3 mb-3"
          @click="goto(term.id)"
        >
          <p>
            {{term.desc}}
          </p>

          <p class="text-muted">
            {{term.addedBy}}
          </p>

          <p>
            <small>Number of terms: {{term.nTerms}}</small>
          </p>

        </b-card>
      </transition-group>

      <b-card title="Add a new term">

        <b-container fluid>

          <b-row class="my-1">
            <b-alert :show="showError" variant="danger">{{error}}</b-alert>
            <b-col sm="2"><label for="input-large">ID [A-Z,a-z,0-9]:</label></b-col>
            <b-col sm="10">
              <b-form-input v-model="newTermID" id="input-large" size="lg" type="text" placeholder="Enter the term ID"></b-form-input>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2"><label for="input-large">Name:</label></b-col>
            <b-col sm="10">
              <b-form-input v-model="newTermName" id="input-large" size="lg" type="text" placeholder="Enter the term name"></b-form-input>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2"><label for="input-large">Description:</label></b-col>
            <b-col sm="10">
              <b-form-textarea v-model="newTermDesc" id="textarea-large" size="lg" type="text" placeholder="Enter the description"  :rows="3"></b-form-textarea>
            </b-col>
          </b-row>
          <b-button type="submit" class="mt-3" size="lg" variant="primary" @click="newTerm">Submit</b-button>
        </b-container>

      </b-card>

      <b-alert :show="dismissCountDown"
         :variant="score.variant"
         class="toast"
         @dismissed="dismissCountdown=0"
         @dismiss-count-down="countDownChanged">
         {{score.message}}
      </b-alert>

    </div>

  </div>
  </div>
</template>

<style>


  #bottonNav {
    position: fixed !important;
    bottom: 0;
    width: 100%;
    height: 56px;
  }

  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

</style>

<script>
  import Vue from 'vue';
  // import _ from 'lodash';
  import { VueHammer } from 'vue2-hammer';
  // import firebase from 'firebase';
  import GridLoader from 'vue-spinner/src/PulseLoader';
  import { db } from '../firebaseConfig';
  // import config from '../config';

  window.db = db;

  Vue.use(VueHammer);

  Vue.use(require('vue-shortkey'));

  /* function randomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  } */


  export default {
    name: 'play',
    props: ['userInfo', 'userData', 'levels', 'currentLevel', 'anonID'],
    firebase() {
      return {
        terms: {
          source: db.ref('terms'),
          readyCallback() {
            this.status = 'ready';
          },
        },
      };
    },
    data() {
      return {
        status: 'loading',
        newTermName: '',
        newTermDesc: '',
        newTermID: '',
        error: null,
        showError: false,
        startTime: null,
        dismissSecs: 1,
        dismissCountDown: 0,
        countDownChanged: false,
        score: {
          variant: 'warning',
          message: '',
        },
        status: 'loading',
      };
    },
    computed: {

    },
    watch: {
      currentLevel() {
        // console.log('detected change', this.userData.score, this.currentLevel.min);
        if (this.userData.score === this.currentLevel.min && this.currentLevel.min) {
          this.$refs.levelUp.show();
          db.ref(`/users/${this.userInfo.displayName}`).child('level').set(this.currentLevel.level);
        }
      },
    },
    mounted() {
      this.startTime = new Date();
    },
    components: { GridLoader },
    directives: {
    },
    methods: {
      newTerm() {
        // this.$firebaseRefs.terms.c
        const currentIDs = Object.keys(this.terms);
        if (currentIDs.indexOf(this.newTermID) > 0) {
          this.error = 'This ID already exists. please use a new one';
          this.showError = true;
        } else {
          this.$firebaseRefs.terms.child(this.newTermID).set({
            name: this.newTermName,
            desc: this.newTermDesc,
            id: this.newTermID,
            nTerms: 0,
            addedBy: this.userInfo.displayName,
          });
          // reward person for adding a new term
          db.ref('users').child(this.userInfo.displayName).child('score').set(this.userData.score + 5);
          db.ref('termDefs').child(this.newTermID).set({ });
        }
      },
      goto(id) {
        this.$router.replace(`/play/${id}`);
      },
      showAlert() {
        this.dismissCountDown = this.dismissSecs;
      },
    },
  };
</script>
