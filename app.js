const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const consolidate = require('consolidate');
const functions = require('./functions');
const {leadingZero, parseStartDate, parseEndDate, getDayDate, localeDateStringOverride, ISOStringOverride, getUniqueFaces, getUniqueEvents, getGlobalStartDate} = functions;
const config = require('./config');
const {dbUrl} = config;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const express = require('express');
const session = require('express-session');
const hbs = require('handlebars');
const app = express();
const hour = 60*60000;

app.use(cors());
app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
hbs.registerHelper('splitDate', function(date) {
  var d = date.split('.');
  return d.slice(0,-1).join('.');
});
hbs.registerHelper('getDateYear', function(date) {
  var d = date.split('.');
  return d[d.length - 1];
});
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
const {passport} = passportmodule;
app.use(passport.initialize());
app.use(passport.session());

Date.prototype.toLocaleDateString = function(){
  return localeDateStringOverride(this);
}

Date.prototype.toISOString = function(){
  return ISOStringOverride(this);
}

global.currentFromDate = null; global.currentToDate = null; global.displayAll = false; global.groups = []; global.renderedGroups = []; global.groupsData = fs.readFileSync('groups.json', 'utf8');

var routes = require('./routes.js');
app.use(routes);

const getData = () => {
  console.log('global memory usage: '+JSON.stringify(process.memoryUsage()));
  let promises = [];
  groups = [];
  let date1 = new Date();
  date1.setHours(0);
  date1.setMinutes(0);
  date1.setSeconds(0);
  date1.setMonth(date1.getMonth() - 1);
  let date2 = new Date();
  // let nextDay = new Date().getDate() + 1;
  // date2.setDate(nextDay);
  date2.setHours(0);
  date2.setMinutes(0);
  date2.setSeconds(0);

  let globalStartDate = getGlobalStartDate();
  let startDate = date1.toISOString();
  let endDate = date2.toISOString();

  console.log('\nshowing events from '+startDate+' to '+endDate);

  fs.readFile('./logs/lastupdate.log', 'utf8', (err, data) => {
    if(data){
      let updateDate = new Date(data);
      global.lastUpdate = leadingZero(updateDate.getHours())+':'+leadingZero(updateDate.getMinutes())+' '+leadingZero(updateDate.getDate())+'.'+leadingZero(updateDate.getMonth() + 1)+'.'+updateDate.getFullYear();
      console.log('last update: '+lastUpdate);
    }
    if(err){
      console.log('no last update found');
    }
  });

  request('http://localhost:8888/api/grouplist/').
    then((response) => JSON.parse(response)).
    then((response) => {
      response.items.forEach((group) => {
        group.displayAll = displayAll;
        group.startDate = parseStartDate(startDate);
        group.endDate = parseEndDate(endDate);
        groups.push(group);
      })
    }).
    then(() => {
        groups.forEach((group, index) => {
          MongoClient.connect(dbUrl, function(err, db) {
          let currentDB = db.db('monitoring');
          if (err) throw err;
          group.events = [];
          group.uniqueEvents = [];
          group.faces = [];
          group.uniqueFaces = [];
          group.days = [];
          group.totalevents = [];
          promises.push(currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'labels.status': {$ne: 'cancelled'}, 'timestamp': {$lt: endDate}}).
          toArray().
            then((items) => {
              for(let face of items){
                group.faces.push(face);
              }
              group.uniqueFaces = getUniqueFaces(group.faces);
              group.index = index;
              console.log(group.title+' faces: '+group.faces.length);
              items = null;
            }));
          promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: globalStartDate}}).
          toArray().
            then((items) => {
              for(let event of items){
                group.events.push(event);
                group.totalevents.push(event);
              }
              group.uniqueEvents = getUniqueEvents(group.events);
              console.log(group.title+' events: '+group.events.length);
              console.log(group.title+' unique events: '+group.uniqueEvents.length);
              items = null;
            }));
          promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: globalStartDate}}).
          toArray().
            then((items) => {
                let uniqueItems = getUniqueEvents(items);
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
                  day.events = 0;
                  day.uniqueEvents = 0;
                  for(let event of items){
                    let eventDate = new Date(event.face.timestamp);
                    if(eventDate >= date && eventDate < nextDay){
                      day.events++;
                    }
                  }
                  for(let event of uniqueItems){
                    let eventDate = new Date(event.face.timestamp);
                    if(eventDate >= date && eventDate < nextDay){
                      day.uniqueEvents++;
                    }
                  }
                  day.date = getDayDate(date);
                  group.days.push(day);
                  day = null;
                }
                items = null;
              console.log(group.title+' events: '+group.events.length);
            }).
            then(() => {
              currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'labels.status': {$ne: 'cancelled'}, 'timestamp': {$lt: endDate}}).
              toArray().
              then((items) => {
                  let uniqueItems = getUniqueFaces(items);
                  let now = new Date();
                  now.setHours(0);
                  now.setMinutes(0);
                  now.setSeconds(0);
                  for (var date = new Date(globalStartDate); date <= now; date.setDate(date.getDate() + 1)) {
                    let day = group.days.find((day) => day.date == getDayDate(date))
                    let nextDay = new Date(date);
                    nextDay.setDate(date.getDate() + 1);
                    nextDay.setHours(0);
                    nextDay.setMinutes(0);
                    nextDay.setSeconds(0);
                    day.faces = 0;
                    for(let face of uniqueItems.faces){
                      let faceDate = new Date(face.timestamp);
                      if(faceDate < nextDay){
                        day.faces++;
                      }
                    }
                    day = null;
                  }
                  items = null;
              })
            }));
          Promise.all(promises).
          then(() => {
              renderedGroups[index] = {
                title: group.title,
                uniqueFaces: {faces: group.uniqueFaces.faces.map(face => {return face.timestamp}), photos: group.uniqueFaces.photos},
                events: group.events.map(event => {return event.face.timestamp}),
                uniqueEvents: group.uniqueEvents.map(event => {return event.face.timestamp}),
                totalevents: group.totalevents.length,
                displayAll: group.displayAll,
                startDate: group.startDate,
                endDate: group.endDate,
                index: group.index
              };
              setTimeout(() => {
                db.close();
              }, 10000)
          })          
        });
    });
    console.log('Data retrieved! '+new Date().toTimeString());
  });
  var date = new Date();
  var monthAgo = new Date().getMonth() - 1;
  date.setMonth(monthAgo);
  currentFromDate = date.toLocaleDateString('ru-RU');
  currentToDate = new Date().toLocaleDateString('ru-RU');
  displayAll = false;
  setTimeout(getData, hour*2);
}
getData();

app.listen(8888, () => {
  console.log('Server has been started');
});