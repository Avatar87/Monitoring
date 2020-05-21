const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const consolidate = require('consolidate');
const functions = require('./functions');
const {parseValue, localeDateStringOverride, ISOStringOverride, getUniqueFaces, getUniqueEvents, mustBeAuthenticated} = functions;
const config = require('./config');
const {dbUrl,configStartDate} = config;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const express = require('express');
const session = require('express-session')
const app = express();
const hour = 60*60000;
app.use(cors());
app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));
app.use(express.static(path.resolve(__dirname, 'assets')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'keyboard',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: hour*3}
}))
app.use(bodyParser.json());

const passportmodule = require('./passport');
const {passport, authHandler} = passportmodule;
app.use(passport.initialize());
app.use(passport.session());

Date.prototype.toLocaleDateString = function(){
  return localeDateStringOverride(this);
}

Date.prototype.toISOString = function(){
  return ISOStringOverride(this);
}

var currentFromDate, currentToDate, displayAll = false, groups = [];

app.get('/auth', (req, res) => {
  res.render('loginform');
});

app.post('/auth', authHandler);

app.all('/dashboard', mustBeAuthenticated);

app.get('/dashboard', (req, res) => {
  for(let group of groups){
      group.uniqueFaces = getUniqueFaces(group.faces);
      group.uniqueEvents = getUniqueEvents(group.events);
  }
    res.render('main', {groups, fromdate: currentFromDate, todate: currentToDate, displayAll});
});

app.post('/date', (req, res) => {
  currentFromDate = req.body.fromdate ? req.body.fromdate : currentFromDate;
  currentToDate = req.body.todate ? req.body.todate : currentToDate;
  var date1, date2, endDate, nextDay, startDate;

  if(req.body.fromdate && req.body.todate){
    date1 = new Date(parseValue(req.body.fromdate));
    startDate = date1.toISOString();
    date2 = new Date(parseValue(req.body.todate));
    nextDay = date2.getDate() + 1;
    date2.setDate(nextDay);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    endDate = date2.toISOString();
    displayAll = false;
  }
  else if(req.body.fromdate){
    date1 = new Date(parseValue(req.body.fromdate));
    startDate = date1.toISOString();
    date2 = new Date(parseValue(currentToDate));
    nextDay = date2.getDate() + 1;
    date2.setDate(nextDay);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    endDate = date2.toISOString();
    displayAll = false;
  }
  else if(req.body.todate){
    date1 = new Date(parseValue(currentFromDate));
    startDate = date1.toISOString();
    date2 = new Date(parseValue(req.body.todate));
    nextDay = date2.getDate() + 1;
    date2.setDate(nextDay);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    endDate = date2.toISOString();
    displayAll = false;
  }
  else if(req.body.displayall){
    date1 = new Date(configStartDate);
    startDate = date1.toISOString();
    date2 = new Date(parseValue(currentToDate));
    nextDay = date2.getDate() + 1;
    date2.setDate(nextDay);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    endDate = date2.toISOString();
    displayAll = true;
  }
  console.log('\nshowing events from '+startDate+' to '+endDate);

  MongoClient.connect(dbUrl, function(err, db) {
    if (err) throw err;
    let currentDB = db.db('monitoring');
    let promises = [];
      groups.forEach((group) => {
        group.events = [];
        group.faces = [];
        promises.push(currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'timestamp': {$lt: endDate, $gte: configStartDate}}).
        toArray().
          then((items) => {
            for(let face of items){
              group.faces.push(face);
            }
            console.log(group.title+' faces: '+group.faces.length);
          }));
        promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: startDate}}).
        toArray().
          then((items) => {
            for(let event of items){
              group.events.push(event);
            }
            console.log(group.title+' events: '+group.events.length);
          }));
      })
      Promise.all(promises).
      then(() => {
        res.send({response: 'success'});
      });
  })
});

const getData = () => {
  groups = [];
  let promises = [];
  let date1 = new Date();
  date1.setHours(0);
  date1.setMinutes(0);
  date1.setSeconds(0);
  let date2 = new Date();
  let nextDay = new Date().getDate() + 1;
  date2.setDate(nextDay);
  date2.setHours(0);
  date2.setMinutes(0);
  date2.setSeconds(0);
  let date3 = new Date();
  let monthAgo = new Date().getMonth() - 1;
  date3.setHours(0);
  date3.setMinutes(0);
  date3.setSeconds(0);
  date3.setMonth(monthAgo);

  let startDate = date1.toISOString();
  let endDate = date2.toISOString();
  let globalStartDate = date3.toISOString();

  console.log('\nshowing events from '+startDate+' to '+endDate);

  request('http://localhost:8888/api/groups/').
    then((response) => JSON.parse(response)).
    then((response) => {
      response.items.forEach((group) => {
        group.faces = [];
        group.events = [];
        group.days = [];
        groups.push(group);
      })
    }).
    then(() => {
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) throw err;
        let currentDB = db.db('monitoring');
        groups.forEach((group) => {
          promises.push(currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'timestamp': {$lt: endDate, $gte: configStartDate}}).
          toArray().
            then((items) => {
              for(let face of items){
                group.faces.push(face);
              }
              console.log(group.title+' faces: '+group.faces.length);
            }));
          promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: startDate}}).
          toArray().
            then((items) => {
              for(let event of items){
                group.events.push(event);
              }
              console.log(group.title+' events: '+group.events.length);
            }));
          promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: globalStartDate}}).
          toArray().
            then((items) => {
                let now = new Date();
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);
                for (let date = new Date(globalStartDate); date <= now; date.setDate(date.getDate() + 1)) {
                  let day = {events: [], uniqueEvents: 0, faces: []};
                  let nextDay = new Date(date);
                  nextDay.setDate(date.getDate() + 1);
                  nextDay.setHours(0);
                  nextDay.setMinutes(0);
                  nextDay.setSeconds(0);
                  for(let event of items){
                    let eventDate = new Date(event.face.timestamp);
                    if(eventDate >= date && eventDate < nextDay){
                      day.events.push(event);
                    }
                  }
                  day.date = date.toLocaleDateString('ru-RU').split(' ')[1];
                  group.days.push(day);
                  day.uniqueEvents = getUniqueEvents(day.events);               
                }
              console.log(group.title+' events: '+group.events.length);
            }).
            then(() => {
              currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'timestamp': {$lt: endDate, $gte: globalStartDate}}).
              toArray().
              then((items) => {
                  let now = new Date();
                  now.setHours(0);
                  now.setMinutes(0);
                  now.setSeconds(0);
                  for (var date = new Date(globalStartDate); date <= now; date.setDate(date.getDate() + 1)) {
                    let day = group.days.find((day) => day.date == date.toLocaleDateString('ru-RU').split(' ')[1])
                    let nextDay = new Date(date);
                    nextDay.setDate(date.getDate() + 1);
                    nextDay.setHours(0);
                    nextDay.setMinutes(0);
                    nextDay.setSeconds(0);
                    for(let face of items){
                      let faceDate = new Date(face.timestamp);
                      if(faceDate >= date && faceDate < nextDay){
                        day.faces.push(face);
                      }
                    }
                  }
              })
            }));
          Promise.all(promises).
          then(() => {
             //console.log(group.days)
          })          
        });
        console.log('Data retrieved! '+new Date().toTimeString());
    });
  });
  currentFromDate = new Date().toLocaleDateString('ru-RU');
  currentToDate = new Date().toLocaleDateString('ru-RU');
  displayAll = false;
  let minute = 60000;
  setTimeout(getData, minute*15);
} 
getData();

fs.readFile('groups.json', 'utf8', (err, data) => {
  if (err) throw err;
  let items = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
  app.get('/api/groups', (req, res) => {
    res.status(200).send({
      success: 'true',
      message: 'groups retrieved successfully',
      items
    })
  });
});

app.listen(8888, () => {
  console.log('Server has been started');
});