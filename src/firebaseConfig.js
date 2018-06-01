import firebase from 'firebase';

// copy/paste this from your firebase console
/* eslint-disable */
const config = {
  apiKey: 'AIzaSyBhpUKnkFnYslY6ZliCRc40t6RduS7_siU',
  authDomain: 'term-ninja.firebaseapp.com',
  databaseURL: 'https://term-ninja.firebaseio.com',
  projectId: 'term-ninja',
  storageBucket: 'term-ninja.appspot.com',
  messagingSenderId: '121670279902',
};

firebase.initializeApp(config);


export const db = firebase.database();
/* eslint-enable */
