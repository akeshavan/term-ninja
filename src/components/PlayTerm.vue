<template>
  <div id="playterm">
    <b-container>
      <!-- Modal Component -->
      <b-modal id="levelUp" ref="levelUp" title="You've Levelled Up!" ok-only>
        <p class="my-4">
          <h3>Level {{currentLevel.level}}</h3>
          <img :src="currentLevel.img" width="120px" height="120px"/>
          <p class="lead">You've unlocked: {{currentLevel.character}}</p>
        </p>
      </b-modal>

      <transition name="fade" mode="out-in">
        <span v-if="status === 'loading'"> {{status}} </span>
      </transition>

      <b-form-input
            type="text"
            v-model="filter"
            placeholder="Search for terms"></b-form-input>

      <!--<transition-group name="list" tag="p">-->

        <b-card v-for="def in filteredDefinitions"
         class="mt-3 mb-3"
         :key="def['.key']"
         :title="def.name"
         v-if="def.name"
         :border-variant="isSelected[def['.key']]"
         @click="submitVote(def)">
          <p>
            {{def.desc}}
          </p>

          <p class="text-muted">
            added by: {{def.addedBy}}
          </p>

          <p>
            <small>Number of votes: {{def.nVotes}}</small>
          </p>
        </b-card>
      <!--</transition-group>-->
      <b-card title="Add new definition" class="mt-3 mb-3">
        <b-container fluid>
          <b-form @submit="addDef">
            <b-row class="my-1">
              <b-col sm="2"><label for="input-large">Name:</label></b-col>
              <b-col sm="10">
                <b-form-input v-model="filter" id="input-large" size="lg" type="text" placeholder="Enter the definition"></b-form-input>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="2"><label for="input-large">Description:</label></b-col>
              <b-col sm="10">
                <b-form-textarea v-model="newDefDesc" id="textarea-large" size="lg" type="text" placeholder="Enter the definition description"  :rows="3"></b-form-textarea>
              </b-col>
            </b-row>
            <b-button type="submit" class="mt-3" size="lg" variant="primary" @click="addDef">Submit</b-button>
          </b-form>
        </b-container>
      </b-card>
    </b-container>

    <b-navbar toggleable="md" type="dark" variant="success"
      class="navbar-fixed-bottom" id="bottonNav"
      style="">
      <b-navbar-nav is-nav-bar class="mx-auto">
        <b-nav-form>
          <!--<b-button size="md"
           class="my-2 my-sm-0" variant="default" v-b-modal.manualModal> <!-- v-b-tooltip.hover.focus.bottom="'Manual entry'">
            <i class="fa fa-pencil"></i>
          </b-button>-->
          <b-btn variant="secondary" size="lg" :to="'/play'"> <i class="fa fa-arrow-left"></i> Go Back </b-btn>
          <b-btn variant="outline-secondary" size="lg" @click="votes=[]"> Start Over <i class="fa fa-arrow-right"></i>  </b-btn>

        </b-nav-form>
      </b-navbar-nav>

    </b-navbar>

  </div>
</template>

<style>
  #playterm {
    margin-top: 40px;
    margin-bottom: 120px;
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
  import _ from 'lodash';
  import { db } from '../firebaseConfig';

  export default {
    name: 'termdefs',
    props: ['userInfo', 'userData', 'levels', 'currentLevel'],
    firebase() {
      return {
        definitions: {
          source: db.ref('termDefs').child(this.$route.params.id),
          readyCallback() {
            this.status = 'ready';
          },
        },
      };
    },
    data() {
      return {
        newDefDesc: '',
        newDefName: '',
        points: 0,
        votes: [],
        filter: '',
        status: 'loading',
      };
    },
    computed: {
      isSelected() {
        const output = {};
        _.map(this.definitions, (v) => {
          if (this.votes.indexOf(v['.key']) >= 0) {
            output[v['.key']] = 'success';
          } else {
            output[v['.key']] = 'default';
          }
        });
        return output;
      },
      filteredDefinitions() {
        return this.definitions.filter(def =>
          def.name.toLowerCase().includes(this.filter.toLowerCase()) ||
          def.desc.toLowerCase().includes(this.filter.toLowerCase()),
        );
      },
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
    methods: {
      addDef(e) {
        e.preventDefault();
        // TODO: make sure this term name isn't already in the list!
        // HINT: do import _ from 'lodash'; and use _.filter to iterate

        // add a new def
        this.$firebaseRefs.definitions.push({
          name: this.filter,
          desc: this.newDefDesc,
          nVotes: 1,
          addedBy: this.userInfo.displayName,
        }).then((d) => {
          this.votes.push(d.key);
        });

        // update term count;
        db.ref('terms').child(this.$route.params.id)
          .child('nTerms')
          .transaction((s) => {
            if (s || s === 0) {
              return s + 1;
            }
            return s;
          });

        // award 5 points for creating a new def
        db.ref('users')
          .child(this.userInfo.displayName)
          .child('score')
          .set(this.userData.score + 5);
      },
      submitVote(def) {
        // increment the vote of the key.

        // if it hasn't already been voted on this screen
        if (this.votes.indexOf(def['.key']) < 0) {
          this.$firebaseRefs.definitions.child(def['.key']).child('nVotes').transaction((s) => {
            if (s || s === 0) {
              return s + 1;
            }
            return s;
          });
          this.votes.push(def['.key']);
          // award 1 point for a vote
          db.ref('users')
            .child(this.userInfo.displayName)
            .child('score').transaction((s) => {
              if (s || s === 0) {
                return s + 1;
              }
              return s;
            });
        }
      },
    },
    created() {

    },
  };
</script>
