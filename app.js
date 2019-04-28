const express = require('express')
const app = express()
var cors = require('cors')
const port = 3000

var indico = require('indico.io');
var moment = require('moment');
indico.apiKey = '0c57960008b38f63bf0b7fb85f1f3eeb';

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('b71d9eefeca94a1487e7fc9bf9964af8');
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBwAVNOae9jb_gJeA69QIxxJs_BPl8A3LA",
  authDomain: "happynews-647f0.firebaseapp.com",
  databaseURL: "https://happynews-647f0.firebaseio.com",
  projectId: "happynews-647f0",
  storageBucket: "happynews-647f0.appspot.com",
  messagingSenderId: "836323731660"
};
firebase.initializeApp(config);

general()
setInterval(general, 86400001);

function general() {
  console.log('Running General Function')
  var stamp = moment().format('l')
  var timestamp = stamp.replace(/\//g, '');
  newsapi.v2.topHeadlines({
      language: 'en',
      category: 'general',
      country: 'us',
      sortBy: 'publishedAt',
      page: 1
    })
    .then(newsObject => {
      var obj = newsObject.articles;
      for (let i in obj) {
        indico.sentiment(obj[i].title)
          .then(function (resTitle) {
            indico.sentiment(obj[i].description)
              .then(function (resDesc) {
                firebase.database().ref(`/master/${timestamp}/general`)
                  .push({
                    title: obj[i].title,
                    description: obj[i].description,
                    image: obj[i].urlToImage,
                    url: obj[i].url,
                    publishedAt: obj[i].publishedAt,
                    scoreTitle: resTitle * 100,
                    scoreDesc: resDesc * 100,
                  });
                   console.log('Push ' + i)
              })
          })
          .catch(
            function (err) {
              console.log(error)
            }
          );
      }
       console.log('200 OK')
    });
}

app.listen(port, () => console.log(`Running on port ${port}!`))