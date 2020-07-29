const passportmodule = require('../passport');
const {authHandler} = passportmodule;
const functions = require('../functions');
const {mustBeAuthenticated, parseValue, parseStartDate, parseEndDate, getUniqueFaces, getUniqueEvents, updateDays} = functions;
const config = require('../config');
const {dbUrl} = config;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

exports.authenticate = mustBeAuthenticated;

exports.renderDashboard = (req, res) => {
    var date = new Date();
    var monthAgo = new Date().getMonth() - 1;
    date.setMonth(monthAgo);
    currentFromDate = date.toLocaleDateString('ru-RU');
    currentToDate = new Date().toLocaleDateString('ru-RU');
    groups.forEach(group => {
        group.fromGroupDate = null;
        group.toGroupDate = null;
    })
    res.render('main', {groups, fromdate: currentFromDate, todate: currentToDate, lastUpdate: lastUpdate, displayAll});
}

exports.renderAuth = (req, res) => {
    if(req.user === 'notfound'){
      req.session.destroy();
    }
    res.render('loginform', {displayError: req.user === 'notfound'});
}

exports.authController = authHandler;

exports.groupListController = (req, res) => {
    let items = JSON.parse(groupsData.toString('utf8').replace(/^\uFEFF/, ''));
    res.status(200).send({
        success: 'true',
        message: 'groups retrieved successfully',
        items
    })
}

exports.groupsController = (req, res) => {
  res.send({response: 'success', groups: renderedGroups});
}

exports.groupDaysController = (req, res) => {
    let groupDays = [];
    groups.forEach((group, index) => {
        groupDays[index] = group.days;
    })
    res.send({response: 'success', groupdays: groupDays});
}

exports.dateController = (req, res) => {
    currentFromDate = req.body.fromdate ? req.body.fromdate : currentFromDate;
    currentToDate = req.body.todate ? req.body.todate : currentToDate;
    var date1, date2, endDate, nextDay, startDate, targetGroup;
  
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
    else if(req.body.fromgroupdate){
      date1 = new Date(parseValue(req.body.fromgroupdate));
      startDate = date1.toISOString();
      groups.forEach((group, index) => {
        if(group.title == req.body.group){
          group.fromGroupDate = startDate;
          targetGroup = group;
        }
      })
      date2 = targetGroup.toGroupDate ?  new Date(targetGroup.toGroupDate) : new Date(parseValue(currentToDate));
      if(!targetGroup.toGroupDate){
        nextDay = date2.getDate() + 1;
        date2.setDate(nextDay);
      }
      date2.setHours(0);
      date2.setMinutes(0);
      date2.setSeconds(0);
      endDate = date2.toISOString();
      displayAll = false;
    }
    else if(req.body.togroupdate){
      date2 = new Date(parseValue(req.body.togroupdate));
      nextDay = date2.getDate() + 1;
      date2.setDate(nextDay);
      date2.setHours(0);
      date2.setMinutes(0);
      date2.setSeconds(0);
      endDate = date2.toISOString();
      groups.forEach((group, index) => {
        if(group.title == req.body.group){
          group.toGroupDate = endDate;
          targetGroup = group;
        }
      })
      date1 = targetGroup.fromGroupDate ?  new Date(targetGroup.fromGroupDate) : new Date(parseValue(currentFromDate));
      startDate = date1.toISOString();
      displayAll = false;
    }
    else if(req.body.displayall){
      date1 = new Date(parseValue(currentFromDate));
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

    if(req.body.group){
      res.send({response: 'success', index: targetGroup.index, startDate, endDate});
    }
    else{
      res.send({response: 'success', startDate, endDate, displayAll});
      // MongoClient.connect(dbUrl, function(err, db) {
      //   if (err) throw err;
      //   let currentDB = db.db('monitoring');
      //   let promises = [];
      //   groups.forEach((group) => {
      //       group.events = [];
      //       group.uniqueEvents = [];
      //       group.faces = [];
      //       group.uniqueFaces = [];
      //       group.photos = 0;
      //       group.days = [];
      //       group.displayAll = displayAll;
      //       group.startDate = parseStartDate(startDate);
      //       group.endDate = parseEndDate(endDate);
      //       promises.push(currentDB.collection('faces').find({'id.monitoring': {$in: group.monitorings}, 'labels.status': {$ne: 'cancelled'}, 'timestamp': {$lt: endDate}}).
      //       toArray().
      //         then((items) => {
      //           for(let face of items){
      //             group.faces.push(face);
      //           }
      //           console.log(group.title+' faces: '+group.faces.length);
      //           group.uniqueFaces = getUniqueFaces(group.faces);
      //         }));
      //       promises.push(currentDB.collection('events').find({'matched_face.id.monitoring': {$in: group.monitorings}, 'matched_face.labels.status': {$ne: 'cancelled'}, 'face.timestamp': {$lt: endDate, $gte: startDate}}).
      //       toArray().
      //         then((items) => {
      //           for(let event of items){
      //             group.events.push(event);
      //           }
      //           group.uniqueEvents = getUniqueEvents(group.events);
      //           console.log(group.title+' events: '+group.events.length);
      //           console.log(group.title+' unique events: '+group.uniqueEvents.length);
      //         }));
      //     })
      //     Promise.all(promises).
      //     then(() => {
      //       targetGroup = targetGroups[0];
      //       updateDays(targetGroups, startDate, endDate);
      //       res.send({response: 'success'});
      //       targetGroup = null;
      //     });
      // })
    }
}