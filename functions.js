const request = require('request-promise');
const config = require('./config');
const {apiUrl} = config;

const leadingZero = (number) => {
    return (number < 10 ? '0' : '') + number;
}
  
const parseValue = (date) => {
    var dateArray = date.split('.'), result;
    result = dateArray[2].trim()+'/'+dateArray[1].trim()+'/2020';
    return result;
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
        if(!facesMap.has(face)){
          facesMap.set(face, true);
        }
      }
      else if(face.labels.name && !face.labels.title){
        if(!facesMap.has(face)){
          facesMap.set(face, true);
        }
      }
      else if(face.labels.fio && !face.labels.title && !face.labels.name){
        if(!facesMap.has(face)){
          facesMap.set(face, true);
        }
      }
      else if(face.id.face && !face.labels.title && !face.labels.name && !face.labels.fio){
        if(!facesMap.has(face)){
          facesMap.set(face, true);
        }
      }           
    }
  }

  uniqueFaces.faces = facesMap.size;
  facesMap.forEach((key, value) => {
    if(value.photo){
      uniqueFaces.photos++;
    }
  })

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

const mustBeAuthenticated = (req, res, next) => {
  if(req.user) {
    return next();
  } 
  res.redirect('/auth');
}

module.exports = {
    leadingZero,
    parseValue,
    localeDateStringOverride,
    ISOStringOverride,
    getFacesByPage,
    getEventsByPage,
    getUniqueFaces,
    getUniqueEvents,
    mustBeAuthenticated
}