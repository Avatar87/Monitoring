const request = require('request-promise');
const config = require('./config');
const {apiUrl} = config;
const fs = require('fs');
const trueLog = console.log;

const leadingZero = (number) => {
    return (number < 10 ? '0' : '') + number;
}
  
const parseValue = (date) => {
    var dateArray = date.split('.'), result;
    result = dateArray[2].trim()+'/'+dateArray[1].trim()+'/2020';
    return result;
}

const parseStartDate = (date) => {
  var newDate = new Date(date).toLocaleDateString();
  return newDate.split('. ')[1];
}

const parseEndDate = (date) => {
  var d = new Date(date);
  var prevDay = d.getDate() - 1;
  d.setDate(prevDay);
  var newDate = new Date(d).toLocaleDateString();
  return newDate.split('. ')[1];
}

const localeDateStringOverride = (dateObj) => {
    const dayNumber = dateObj.getDay();
    var day;
    switch(dayNumber){
      case 0:
        day = 'вс. '
        break;
      case 1:
        day = 'пн. '
        break;
      case 2:
        day = 'вт. '
        break;
      case 3:
        day = 'ср. '
        break;
      case 4:
        day = 'чт. '
        break;
      case 5:
        day = 'пт. '
        break;
      case 6:
        day = 'сб. '
        break;
      default:
        break;
    }
    return `${day}${leadingZero(dateObj.getDate())}.${leadingZero(dateObj.getMonth() + 1)}`;
}

const ISOStringOverride = (dateObj) => {
  return dateObj.getFullYear() +
    '-' + leadingZero(dateObj.getMonth() + 1) +
    '-' + leadingZero(dateObj.getDate()) +
    'T' + leadingZero(dateObj.getHours()) +
    ':' + leadingZero(dateObj.getMinutes()) +
    ':' + leadingZero(dateObj.getSeconds()) +
    '+03:00';
}

const getFacesByPage = (monitoring, page = '', faces = []) => {
    return request(apiUrl+'monitoring/'+monitoring+'/face/?page='+page)
    .then(response => JSON.parse(response))
    .then(response => {
      console.log('GET faces PAGE ' + page);
      if(response.next_page && response.next_page !== null){
         return getFacesByPage(
          monitoring,
          response.next_page,
          faces.concat(response.faces)
        );
      }
      console.log('LAST PAGE REACHED');
      return faces.concat(response.faces);
    })
    .catch(err => {
        return err;
    });
}

const getEventsByPage = (startDate, endDate, page = '', events = []) => {
    return request(apiUrl+'events/?start='+startDate+'&end='+endDate+'&page='+page)
    .then(response => JSON.parse(response))
    .then(response => {
      console.log('GET events PAGE ' + page);
      if(response.next_page !== null){
         return getEventsByPage(
          startDate,
          endDate,
          response.next_page,
          events.concat(response.events)
        );
      }
      console.log('LAST PAGE REACHED');
      return events.concat(response.events);
    })
    .catch(err => {
        return err;
    });
}

const getUniqueFaces = (faces) => {
  const uniqueFaces = {faces: 0, photos: 0}
  const facesMap = new Map();
  for (const face of faces) {
    if(face.labels){
      if(face.labels.title){
        if(!facesMap.has(face.labels.title)){
          facesMap.set(face.labels.title, true);
          if(face.photo){
            uniqueFaces.photos++;
          }
        }
      }
      else if(face.labels.name && !face.labels.title){
        if(!facesMap.has(face.labels.name)){
          facesMap.set(face.labels.name, true);
          if(face.photo){
            uniqueFaces.photos++;
          }
        }
      }
      else if(face.labels.fio && !face.labels.title && !face.labels.name){
        if(!facesMap.has(face.labels.fio)){
          facesMap.set(face.labels.fio, true);
          if(face.photo){
            uniqueFaces.photos++;
          }
        }
      }
      else if(face.id.face && !face.labels.title && !face.labels.name && !face.labels.fio){
        if(!facesMap.has(face.id.face)){
          facesMap.set(face.id.face, true);
          if(face.photo){
            uniqueFaces.photos++;
          }
        }
      }           
    }
  }

  uniqueFaces.faces = facesMap.size;

  return uniqueFaces;
}

const getUniqueEvents = (events) => {
  var uniqueEvents = 0;
  const eventsMap = new Map();
  for (const event of events) {
    if(event.matched_face !== null){
      if(event.matched_face.labels){
        if(event.matched_face.labels.title){
          if(!eventsMap.has(event.matched_face.labels.title)){
            eventsMap.set(event.matched_face.labels.title, true);
          }
        }
        else if(event.matched_face.labels.name){
          if(!eventsMap.has(event.matched_face.labels.name)){
              eventsMap.set(event.matched_face.labels.name, true);
          }
        }
        else if(event.matched_face.labels.fio && !event.matched_face.labels.name){
          if(!eventsMap.has(event.matched_face.labels.fio)){
            eventsMap.set(event.matched_face.labels.fio, true);
          }
        }
      }
    }
  }
  uniqueEvents = eventsMap.size;

  return uniqueEvents;
}

const updateDays = (groups, startDate, endDate) => {
  groups.forEach((group) => {
    group.days = [];
    date1 = new Date(startDate);
    date2 = new Date(endDate);
    for (let date = date1; date < date2; date.setDate(date.getDate() + 1)) {
      let day = {events: [], uniqueEvents: 0, faces: []};
      let nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      nextDay.setHours(0);
      nextDay.setMinutes(0);
      nextDay.setSeconds(0);
      for(let event of group.events){
        let eventDate = new Date(event.face.timestamp);
        if(eventDate >= date && eventDate < nextDay){
          day.events.push(event);
        }
      }
      day.date = date.toLocaleDateString('ru-RU').split(' ')[1];
      group.days.push(day);
      day.uniqueEvents = getUniqueEvents(day.events);               
    }
  })
}

const getGlobalStartDate = () => {
  var date = new Date();
  var monthAgo = new Date().getMonth() - 1;
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMonth(monthAgo);
  return date.toISOString();
}

const getGlobalEndDate = () => {
  var date = new Date();
  var nextDay = date.getDate() + 1;
  date.setDate(nextDay);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date.toISOString();
}

const mustBeAuthenticated = (req, res, next) => {
  if(req.user && req.user !== 'notfound') {
    return next();
  } 
  res.redirect('/auth');
}

const getMainData = async (mongoClient, mongoUrl, monitorings) => {
  let client, currentDB, date1 = new Date(), date2 = new Date(), date3 = new Date(), date4 = new Date(), date5 = new Date(), endDate, startDate;
  try{
    client = await mongoClient.connect(mongoUrl);
    currentDB = client.db('monitoring');
    date1.setHours(0);
    date1.setMinutes(0);
    date1.setSeconds(0);
    date1.setMonth(date1.getMonth() - 1);
    date2.setMonth(date1.getMonth());
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    date2.setDate(date1.getDate() + 7);
    startDate = date1.toISOString();
    endDate = date2.toISOString();
    console.log('writing events from '+startDate+' to '+endDate);

    let events = await getEventsByPage(startDate, endDate)
    if(events.length){
      var filteredEvents = events.filter(event => {
          return event.matched_face !== null && monitorings.includes(event.matched_face.id.monitoring);
      })
      console.log('inserting '+filteredEvents.length+' events');
      const writeWeekOne = async () => {
        for(var event of filteredEvents){
            if(event.matched_face.labels.status !== 'cancelled'){
                await currentDB.collection('events').findOneAndUpdate({id: event.id}, {$set: event}, {upsert: true})
            }
        }

        return 'success';
      }
      await writeWeekOne();
      console.log('writing 1 week done!');
    }
    else{
      console.log('no events found');
    }
                                    
    startDate = date2.toISOString();
    date3.setMonth(date2.getMonth());
    date3.setHours(0);
    date3.setMinutes(0);
    date3.setSeconds(0);
    date3.setDate(date2.getDate() + 7);                
    endDate = date3.toISOString();
    console.log('writing events from '+startDate+' to '+endDate);
                    
    events = await getEventsByPage(startDate, endDate)
    if(events.length){
      filteredEvents = events.filter(event => {
        return event.matched_face !== null && monitorings.includes(event.matched_face.id.monitoring);
      })
      console.log('inserting '+filteredEvents.length+' events');
      const writeWeekTwo = async () => {
        for(var event of filteredEvents){
          if(event.matched_face.labels.status !== 'cancelled'){
            await currentDB.collection('events').findOneAndUpdate({id: event.id}, {$set: event}, {upsert: true})
          }
        }

        return 'success';
      }
      await writeWeekTwo();
      console.log('writing 2 week done!');
    }
    else{
      console.log('no events found');
    }

    startDate = date3.toISOString();
    date4.setMonth(date3.getMonth());
    date4.setHours(0);
    date4.setMinutes(0);
    date4.setSeconds(0);
    date4.setDate(date3.getDate() + 7);
    endDate = date4.toISOString();
    console.log('writing events from '+startDate+' to '+endDate);

    events = await getEventsByPage(startDate, endDate)
    if(events.length){
      filteredEvents = events.filter(event => {
        return event.matched_face !== null && monitorings.includes(event.matched_face.id.monitoring);
      })
      console.log('inserting '+filteredEvents.length+' events');
      const writeWeekThree = async () => {
        for(var event of filteredEvents){
          if(event.matched_face.labels.status !== 'cancelled'){
            await currentDB.collection('events').findOneAndUpdate({id: event.id}, {$set: event}, {upsert: true})
          }
        }

        return 'success';
      }
      await writeWeekThree();
      console.log('writing 3 week done!');
    }
    else{
      console.log('no events found');
    }

    startDate = date4.toISOString();
    date5.setMonth(date4.getMonth());
    date5.setHours(0);
    date5.setMinutes(0);
    date5.setSeconds(0);
    date5.setDate(date4.getDate() + 10);
    endDate = date5.toISOString();
    console.log('writing events from '+startDate+' to '+endDate);

    events = await getEventsByPage(startDate, endDate)
    if(events.length){
      filteredEvents = events.filter(event => {
        return event.matched_face !== null && monitorings.includes(event.matched_face.id.monitoring);
      })
      console.log('inserting '+filteredEvents.length+' events');
      const writeWeekFour = async () => {
        for(var event of filteredEvents){
          if(event.matched_face.labels.status !== 'cancelled'){
            await currentDB.collection('events').findOneAndUpdate({id: event.id}, {$set: event}, {upsert: true})
          }
        }

        return 'success';
      }
      await writeWeekFour();
      console.log('writing 4 week done!');
    }
    else{
      console.log('no events found');
    }
  }
  catch(err){
     console.error(err);
  }
  finally{ 
    client.close();
  }
}

const logFunction = (msg) => {
  fs.appendFile('./logs/log.log', msg+'\n', function(err) {
      if(err) {
          return trueLog(err);
      }
  });
  trueLog(msg);
}

module.exports = {
    leadingZero,
    parseValue,
    parseStartDate,
    parseEndDate,
    localeDateStringOverride,
    ISOStringOverride,
    getFacesByPage,
    getEventsByPage,
    getUniqueFaces,
    getUniqueEvents,
    updateDays,
    getGlobalStartDate,
    getGlobalEndDate,
    mustBeAuthenticated,
    getMainData,
    logFunction
}