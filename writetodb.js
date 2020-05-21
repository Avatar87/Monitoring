const request = require('request-promise');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const config = require('./config');
const {dbUrl} = config;
const functions = require('./functions');
const {getFacesByPage, getEventsByPage} = functions;

var monitorings = [];
request('http://localhost:8888/api/groups/')
.then(response => {
  return JSON.parse(response);
})
.then(response => {
    response.items.forEach(group => {
        for(const monitoring of group.monitorings){
            getFacesByPage(monitoring)
            .then(faces => {
                if(faces.length){
                    MongoClient.connect(dbUrl, function(err, db) {
                        if (err) throw err;
                        var currentDB = db.db('monitoring');
                        monitorings.push(monitoring)
                        console.log(monitoring);
                        console.log('inserting '+faces.length+' faces');
                        for(var face of faces){
                            currentDB.collection('faces').findOneAndUpdate({id: face.id}, {$set: face}, {upsert: true}, (err) => {
                                if (err) throw err;
                            });
                        }
                        console.log('writing done!');
                        db.close();
                    });
                }
                else{
                    console.log(monitoring+': no faces found');
                }
            })
            .catch(error => {
                console.log('Error: ', error);
            })
        }
    });
})
.then(() => {
    var date1 = new Date();
    date1.setHours(0);
    date1.setMinutes(0);
    date1.setSeconds(0);
    var allTime = process.argv.includes('-full');
    if(allTime){
        date1.setMonth(date1.getMonth() - 1);
    }
    else{
        date1.setMonth(date1.getMonth());
    }
    var date2 = new Date();
    var nextDay = new Date().getDate() + 1;
    date2.setDate(nextDay);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
  
    var startDate = date1.toISOString();
    var endDate = date2.toISOString();
    console.log('writing events from '+startDate+' to '+endDate);

    getEventsByPage(startDate, endDate)
    .then(events => {
        MongoClient.connect(dbUrl, function(err, db) {
            if (err) throw err;
            var currentDB = db.db('monitoring');
            var filteredEvents = events.filter(event => {
                return event.matched_face !== null && monitorings.includes(event.matched_face.id.monitoring);
            })
            console.log('inserting '+filteredEvents.length+' events');
            for(var event of filteredEvents){
                currentDB.collection('events').findOneAndUpdate({id: event.id}, {$set: event}, {upsert: true}, (err) => {
                    if (err) throw err;
                });                
            }
            console.log('writing done!');
            db.close();
        });
    })
    .catch(error => {
        console.log('Error: ', error);
    })
})