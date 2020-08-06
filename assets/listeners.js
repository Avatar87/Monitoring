window.onload = () => {
    document.getElementById('from').addEventListener('change', () => {
        document.getElementById('loader').style.display='block';
        var year = document.getElementById('fromyear').innerText;
        const data = {fromdate: document.getElementById('from').value+'.'+year};
        const url = 'http://'+window.location.host+'/api/date';
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
              //'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        })
        .then(response => {  
            if (response.status !== 200) {  
              console.log('Looks like there was a problem. Status Code: ' +  
                response.status);  
              return;  
            }
            response.json().then(function(data) {  
              if(data.response == 'success'){
                //document.location.reload();
                var groups = JSON.parse(localStorage.getItem('groups'));
                var startDate  = new Date(data.startDate);
                var endDate  = new Date(data.endDate);
                var facesSelectors = Array.from(document.getElementsByClassName('faces'));
                var eventSelectors = Array.from(document.getElementsByClassName('events'));
                var uniqueEventSelectors = Array.from(document.getElementsByClassName('uniquevents'));
                var uniqueEventFromSelectors = Array.from(document.getElementsByClassName('uniqueventsfrom'));
                var eventFromSelectors = Array.from(document.getElementsByClassName('eventsfrom'));

                groups.forEach((group) => {
                  group.uniqueFaces.faces = group.uniqueFaces.faces.filter(face => { return new Date(face) < endDate });
                  group.events = group.events.filter(event => { return new Date(event) >= startDate && new Date(event) < endDate });
                  group.uniqueEvents = group.uniqueEvents.filter(event => { return new Date(event) >= startDate && new Date(event) < endDate });
                  facesSelectors[group.index].innerText = formatNumber(group.uniqueFaces.faces.length);
                  eventSelectors[group.index].innerText = formatNumber(group.events.length);
                  uniqueEventSelectors[group.index].innerText = formatNumber(group.uniqueEvents.length);
                  if(uniqueEventFromSelectors.length){
                    uniqueEventFromSelectors[group.index].innerText = leadingZero(startDate.getDate())+'.'+leadingZero(startDate.getMonth() + 1);
                  }
                  if(eventFromSelectors.length){
                    eventFromSelectors[group.index].innerText = leadingZero(startDate.getDate())+'.'+leadingZero(startDate.getMonth() + 1);
                  }
                })
                
                document.getElementById('loader').style.display='none';
              }
            });
        });        
    })

    document.getElementById('to').addEventListener('change', () => {
      document.getElementById('loader').style.display='block';
      var year = document.getElementById('toyear').innerText;
      const data = {todate: document.getElementById('to').value+'.'+year};
      const url = 'http://'+window.location.host+'/api/date';
      fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
            //'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify(data)
      })
      .then(response => {  
          if (response.status !== 200) {  
            console.log('Looks like there was a problem. Status Code: ' +  
              response.status);  
            return;  
          }
          response.json().then(function(data) {  
            if(data.response == 'success'){
              //document.location.reload();
              var groups = JSON.parse(localStorage.getItem('groups'));
              var startDate  = new Date(data.startDate);
              var endDate  = new Date(data.endDate);
              var facesSelectors = Array.from(document.getElementsByClassName('faces'));
              var eventSelectors = Array.from(document.getElementsByClassName('events'));
              var uniqueEventSelectors = Array.from(document.getElementsByClassName('uniquevents'));
              var uniqueEventToSelectors = Array.from(document.getElementsByClassName('uniqueventsto'));
              var eventToSelectors = Array.from(document.getElementsByClassName('eventsto'));
              var endDateSelectors = Array.from(document.getElementsByClassName('enddate'));

              groups.forEach((group) => {
                group.uniqueFaces.faces = group.uniqueFaces.faces.filter(face => { return new Date(face) < endDate });
                group.events = group.events.filter(event => { return new Date(event) >= startDate && new Date(event) < endDate });
                group.uniqueEvents = group.uniqueEvents.filter(event => { return new Date(event) >= startDate && new Date(event) < endDate });
                facesSelectors[group.index].innerText = formatNumber(group.uniqueFaces.faces.length);
                eventSelectors[group.index].innerText = formatNumber(group.events.length);
                uniqueEventSelectors[group.index].innerText = formatNumber(group.uniqueEvents.length);
                if(uniqueEventToSelectors.length){
                  uniqueEventToSelectors[group.index].innerText = leadingZero(endDate.getDate() - 1)+'.'+leadingZero(endDate.getMonth() + 1);
                }
                if(eventToSelectors.length){
                  eventToSelectors[group.index].innerText = leadingZero(endDate.getDate() - 1)+'.'+leadingZero(endDate.getMonth() + 1);
                }
                endDateSelectors[group.index].innerText = 'на момент 23:59 '+ leadingZero(endDate.getDate() - 1)+'.'+leadingZero(endDate.getMonth() + 1)+'.'+leadingZero(endDate.getFullYear());
              })
                
              document.getElementById('loader').style.display='none';
            }
          });
      });
    })

  document.getElementById('all').addEventListener('change', () => {
    document.getElementById('loader').style.display='block';
    var fromyear = document.getElementById('fromyear').innerText;
    var toyear = document.getElementById('toyear').innerText;
    var data;
    if(document.getElementById('all').checked){
      data = {displayall: document.getElementById('all').value};
    }
    else{
      data = {fromdate: document.getElementById('from').value+'.'+fromyear, todate: document.getElementById('to').value+'.'+toyear};
    }
    const url = 'http://'+window.location.host+'/api/date';
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
          //'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    .then(response => {  
        if (response.status !== 200) {  
          console.log('Looks like there was a problem. Status Code: ' +  
            response.status);  
          return;  
        }
        response.json().then(function(data) {  
          if(data.response == 'success'){
            document.location.reload();
            document.getElementById('loader').style.display='none';
          }
        });
    });
  })

  document.addEventListener('mousedown', function (event) {
    if (event.detail > 1) {
      event.preventDefault();
    }
  }, false);

  document.getElementById('menu').addEventListener('click', (e) => {
    if(e.target.src.includes('/images/menu-closed.png')){
      e.target.src = '/images/menu-open.png';
      document.getElementById('aside').style.width = '362px';
      setTimeout(() => {
        document.getElementById('theme-select').style.display = 'flex';
      }, 300)
    }
    else{
      e.target.src = '/images/menu-closed.png';
      document.getElementById('aside').style.width = '90px';
      document.getElementById('theme-select').style.display = 'none';
    }
  })

  document.getElementById('theme-switch').addEventListener('click', (e) => {
    if(e.target.src.includes('/images/switch-disabled.png')){
      localStorage.setItem('theme', 'dark');
      e.target.src = '/images/switch-enabled.png';
      document.getElementById('light').disabled = true;
      document.getElementById('dark').disabled = false;
    }
    else{
      localStorage.setItem('theme', 'light');
      e.target.src = '/images/switch-disabled.png';
      document.getElementById('light').disabled = false;
      document.getElementById('dark').disabled = true;
    }

  })

  var triggerEvent = function(elem) {
    var event;
    if(typeof window.Event == 'function'){
        event = new Event('click');
        elem.dispatchEvent(event);
    } else {
        event = document.createEvent('HTMLEvents');
        event.initEvent('click', false, false);
        elem.dispatchEvent(event);
    }
  }
  
  if(localStorage.getItem('theme') && localStorage.getItem('theme') == 'dark'){
    triggerEvent(document.getElementById('theme-switch'));
  }

}

var dragFunction = function(e, obj){
  var className = obj.getAttribute('class');
  var parent = obj.parentElement;
  var cointainer = parent.parentElement.parentNode;
  var parentWidth = parent.offsetWidth;
  var parentRect = parent.getBoundingClientRect();
  var currentLeft = parent.parentElement.style.paddingLeft ? parseFloat(parent.parentElement.style.paddingLeft) : 0;
  var currentRight = parent.parentElement.style.paddingRight ? parseFloat(parent.parentElement.style.paddingRight) : 0;
  var moveAt = function(e, obj) {
    if(obj){
        var circleRect = obj.getBoundingClientRect();
        cointainer.childNodes.forEach(el => {
            if(el.className && el.className.includes('dates')){
                el.childNodes.forEach(child => {
                    if(child.tagName == 'SPAN'){
                        var rect = child.getBoundingClientRect();

                        if(e.clientX < rect.right && e.clientX > rect.left){
                            child.classList.add('highlight');
                        }
                        else{
                            if(e.clientX - rect.left > -40 && rect.right  - e.clientX > -40){
                                child.classList.remove('highlight');
                            }
                        }
                        if(circleRect.right > rect.right && className == 'circle-left'){
                          child.classList.remove('highlight');
                        }
                        else if(circleRect.left < rect.left && className == 'circle-right'){
                          child.classList.remove('highlight');
                        }
                    }
                })
            }
        })
        if(className == 'circle-left'){
            var rightCircle = document.getElementsByClassName('circle-right')[0];
            var rightCircleRect = rightCircle.getBoundingClientRect();
            if(e.pageX + 1 < rightCircleRect.left){
              parent.parentElement.style.paddingLeft = currentLeft + parentWidth + e.pageX - parentRect.right + 'px';
            }
        }
        if(className == 'circle-right'){
            var leftCircle = document.getElementsByClassName('circle-left')[0];
            var leftCircleRect = leftCircle.getBoundingClientRect();
            if(e.pageX - 1 > leftCircleRect.right){
              parent.parentElement.style.paddingRight = currentRight + parentWidth - e.pageX + parentRect.left + 'px';
            }
        }
    }
  }

  var parseValue = function(date) {
    var dateArray = date.split('.'), result;
    result = dateArray[2].trim()+'/'+dateArray[1].trim()+'/'+dateArray[3];
    return result;
  }

  moveAt(e, obj);

  $('.date-selector').mousemove(function(event, obj) {
      moveAt(e, obj);
  })

  document.onmousemove = function(e) {
      e.preventDefault();
      moveAt(e, obj);
  };

  document.onmouseup = function(e) {
      var circleRect = obj.getBoundingClientRect(), isValidEvent;
      if(e.clientX >= circleRect.left && e.clientX - circleRect.left < 10){
        if(e.clientY <= circleRect.bottom && e.clientY >= circleRect.top || e.clientY >= circleRect.bottom && e.clientY - circleRect.bottom < 40 || circleRect.top >= e.clientY && circleRect.top - e.clientY < 40){
          isValidEvent = true;
        }
      }
      cointainer.childNodes.forEach(el => {
          if(el.className && el.className.includes('dates') && isValidEvent){
              el.childNodes.forEach(child => {
                  if(child.tagName == 'SPAN'){
                      var rect = child.getBoundingClientRect();
                      if(e.clientX < rect.right && e.clientX > rect.left){
                          var groupTitle = obj.getAttribute('group-id');
                          var data, url;
                          var fromyear = document.getElementById('fromyear').innerText;
                          var toyear = document.getElementById('toyear').innerText;
                          if(obj.className == 'circle-left'){
                            data = {fromgroupdate: 'date.'+child.innerText+'.'+fromyear, group: groupTitle};
                            url = 'http://'+window.location.host+'/api/date';
                          }
                          else if(obj.className == 'circle-right'){
                            data = {togroupdate: 'date.'+child.innerText+'.'+toyear, group: groupTitle};
                            url = 'http://'+window.location.host+'/api/date';
                          }
                              document.getElementById('loader').style.display='block';
                              fetch(url, {
                                  method: 'POST',
                                  mode: 'cors',
                                  headers: {
                                      'Content-Type': 'application/json'
                                      //'Content-Type': 'application/x-www-form-urlencoded',
                                  },
                                  redirect: 'follow',
                                  referrerPolicy: 'no-referrer',
                                  body: JSON.stringify(data)
                              })
                              .then(response => {  
                                  if (response.status !== 200) {  
                                      console.log('Looks like there was a problem. Status Code: ' +  
                                      response.status);  
                                      return;
                                  }
                                  response.json().then(function(data) {  
                                      if(data.response == 'success'){
                                      //document.location.reload();
                                      var darkTheme;
                                      if(localStorage.getItem('theme') == 'dark'){
                                          darkTheme = true;
                                      }
                                      document.getElementById('loader').style.display='none';
                                      var chartData = new google.visualization.DataTable();
                                      chartData.addColumn('string', 'Day');
                                      chartData.addColumn('number', 'лица');
                                      chartData.addColumn('number', 'сработки');
                                      chartData.addColumn('number', 'уникальные сработки');

                                      var rows = [];

                                      var groupDays = JSON.parse(localStorage.getItem('groupdays'));
                                      var days = groupDays[data.index];
                                      days.forEach(day => {
                                          if(new Date(parseValue('date.'+day.date+'.'+fromyear)) >= new Date(data.startDate) && new Date(parseValue('date.'+day.date+'.'+toyear)) < new Date(data.endDate)){
                                            rows.push([day.date, day.faces, day.events, day.uniqueEvents]);
                                          }
                                      })

                                      chartData.addRows(rows);
                                      
                                      var formatter = new google.visualization.NumberFormat({negativeColor: 'red', groupingSymbol: ' ', fractionDigits: 0});
                                      formatter.format(chartData, 0);
                                      formatter.format(chartData, 1);
                                      formatter.format(chartData, 2);
                                      formatter.format(chartData, 3);

                                      var firstAxisTicks = [];
                                      var firstAxisRange = chartData.getColumnRange(1);
                                      var increment;
                                      if(firstAxisRange.max < 1000){
                                          increment = 100;
                                      }
                                      else if(firstAxisRange.max < 10000){
                                          increment = 1000;
                                      }
                                      else if(firstAxisRange.max < 100000){
                                          increment = 10000;
                                      }
                                      else if(firstAxisRange.max < 1000000){
                                          increment = 100000;
                                      }
                                      else{
                                          increment = firstAxisRange.max/10;
                                      }
                                      var i;
                                      for (i = 0; i <= firstAxisRange.max; i=i+increment) {
                                          firstAxisTicks.push({
                                              v: i,
                                              f: formatter.formatValue(i)
                                          });
                                      }

                                      var secondAxisTicks = [];
                                      var secondAxisRange = chartData.getColumnRange(2);
                                      for (i = secondAxisRange.min; i <= secondAxisRange.max; i=i+100) {                               
                                          secondAxisTicks.push({
                                              v: i,
                                              f: formatter.formatValue(i)
                                          });
                                      }

                                      var options = {
                                          chart: {
                                          title: 'Events and faces',
                                          subtitle: 'grouped by days'
                                          },
                                          width: 1600,
                                          height: 400,
                                          backgroundColor: darkTheme ? '#171822' : '',
                                          tooltip: {
                                              textStyle: { 
                                                  color: '#3A4276',
                                                  fontName: 'Roboto',
                                                  fontSize: 14,
                                                  bold: false,
                                                  italic: false
                                              },
                                              trigger: 'focus'                                  
                                          },
                                          legend: {
                                              position: 'none',
                                              alignment: 'center',
                                              textStyle: { 
                                                  color: '#3A4276',
                                                  fontName: 'Roboto',
                                                  fontSize: 14,
                                                  bold: false,
                                                  italic: false
                                              }
                                          },
                                          colors: ['#FF4C61', '#FFB800', '#58D8F4'],
                                          hAxis: {textStyle: { 
                                              color: '#7B7F9E',
                                              fontName: 'Roboto',
                                              fontSize: 12,
                                              bold: false,
                                              italic: false
                                          }
                                          },
                                          series: {
                                              0: {targetAxisIndex: 0},
                                              1: {targetAxisIndex: 1},
                                              2: {targetAxisIndex: 1}
                                          },
                                          vAxes: {
                                              // Adds titles to each axis.
                                              0: {
                                                  //title: 'Лица',
                                                  textStyle: { 
                                                      color: '#7B7F9E',
                                                      fontName: 'Roboto',
                                                      fontSize: 12,
                                                      bold: false,
                                                      italic: false,
                                                  },
                                                  ticks: firstAxisTicks
                                                      //titleTextStyle: {
                                                      //color: '#7B7F9E',
                                                      //fontName: 'Roboto',
                                                      //fontSize: 14,
                                                      //bold: false,
                                                      //italic: false
                                                  //}
                                              },
                                              1: {
                                                  //title: 'Сработки',
                                                  textStyle: { 
                                                      color: '#7B7F9E',
                                                      fontName: 'Roboto',
                                                      fontSize: 12,
                                                      bold: false,
                                                      italic: false
                                                  },
                                                  ticks: secondAxisTicks
                                                  //titleTextStyle: {
                                                      //color: '#7B7F9E',
                                                      //fontName: 'Roboto',
                                                      //fontSize: 14,
                                                      //bold: false,
                                                      //italic: false
                                                  //},
                                              }
                                          },
                                          focusTarget: 'category'
                                      };

                                      var chart = new google.visualization.LineChart(document.getElementById(groupTitle));
                                      chart.draw(chartData, options);

                                      var showHideLines = function(selector){
                                        var color;
                                        switch(selector) {
                                          case 'faces':
                                              color = options.colors[0];
                                              if(color === '#FF4C61'){
                                                  options.colors[0] = darkTheme ? '#171822' : '#FFFFFF';
                                                  options.series[0].lineWidth = 0;
                                                  options.vAxes[0].textStyle.color = darkTheme ? '#171822' : '#FFFFFF';
                                                  if(darkTheme){
                                                      $('.firstaxis').css('color', '#171822');
                                                  }
                                                  else{
                                                      $('.firstaxis').css('color', '#FFFFFF');
                                                  }
                                              }
                                              else{
                                                  options.series[0].lineWidth = 2;
                                                  options.colors[0] = '#FF4C61';
                                                  if(darkTheme){
                                                      options.vAxes[0].textStyle.color = '#A7ACD3';
                                                      $('.firstaxis').css('color', '#A7ACD3');
                                                  }
                                                  else{
                                                      options.vAxes[0].textStyle.color = '#7B7F9E';
                                                      $('.firstaxis').css('color', '#7B7F9E');
                                                  }
                                              }
                                          break;
  
                                          case 'events':
                                              color = options.colors[1];
                                              if(color === '#FFB800'){
                                                  options.colors[1] = darkTheme ? '#171822' : '#FFFFFF';
                                                  options.series[1].lineWidth = 0;
                                                  if(darkTheme){
                                                      if(options.colors[2] === '#171822'){
                                                          options.vAxes[1].textStyle.color = '#171822';
                                                          $('.secondaxis').css('color', '#171822');
                                                      }
                                                  }
                                                  else{
                                                      if(options.colors[2] === '#FFFFFF'){
                                                          options.vAxes[1].textStyle.color = '#FFFFFF';
                                                          $('.secondaxis').css('color', '#FFFFFF');
                                                      }
                                                  }
                                              }
                                              else{
                                                  options.series[1].lineWidth = 2;
                                                  options.colors[1] = '#FFB800';
                                                  if(darkTheme){
                                                      options.vAxes[1].textStyle.color = '#A7ACD3';
                                                      $('.secondaxis').css('color', '#A7ACD3');
                                                  }
                                                  else{
                                                      options.vAxes[1].textStyle.color = '#7B7F9E';
                                                      $('.secondaxis').css('color', '#7B7F9E');
                                                  }
                                              }
                                          break;
  
                                          case 'uniqueEvents':
                                              color = options.colors[2];
                                              if(color === '#58D8F4'){
                                                  options.series[2].lineWidth = 0;
                                                  options.colors[2] = '#171822';
                                                  if(darkTheme){
                                                      if(options.colors[1] === '#171822'){
                                                          options.vAxes[1].textStyle.color = '#171822';
                                                          $('.secondaxis').css('color', '#171822');
                                                      }                                           
                                                  }
                                                  else{
                                                      if(options.colors[1] === '#FFFFFF'){
                                                          options.vAxes[1].textStyle.color = '#FFFFFF';
                                                          $('.secondaxis').css('color', '#FFFFFF');
                                                      }
                                                  }
                                              }
                                              else{
                                                  options.series[2].lineWidth = 2;
                                                  options.colors[2] = '#58D8F4';
                                                  if(darkTheme){
                                                      options.vAxes[1].textStyle.color = '#A7ACD3';
                                                      $('.secondaxis').css('color', '#A7ACD3');
                                                  }
                                                  else{
                                                      options.vAxes[1].textStyle.color = '#7B7F9E';
                                                      $('.secondaxis').css('color', '#7B7F9E');
                                                  }
                                              }
                                          break;
  
                                          default:
                                              break;
                                      }
                                      chart.draw(chartData, options);
                                    }

                                    var groups = JSON.parse(localStorage.getItem('groups'));

                                    groups.forEach(group => {                                            
                                      document.getElementById(String('faces-box-label-'+group.title)).addEventListener('click', () => { showHideLines('faces') })
                                      document.getElementById(String('uniquevents-box-label-'+group.title)).addEventListener('click', () => { showHideLines('uniqueEvents') })
                                      document.getElementById(String('events-box-label-'+group.title)).addEventListener('click', () => { showHideLines('events') })
                                    })

                                    var handleSelect = function(){
                                        var targetX = document.getElementsByTagName('circle')[0].getAttribute('cx');
                                        var isFilled = document.getElementsByTagName('circle')[0].getAttribute('fill') !== 'none';
                                        var textCollection = document.getElementsByTagName('text');
                                        Array.from(textCollection).forEach(element => {
                                            if(element.getAttribute('x') == targetX && isFilled){
                                                element.style.fontSize = '14px';
                                                element.style.fontWeight = 'bold';
                                            }
                                            else{
                                                element.style.fontSize = '12px';
                                                element.style.fontWeight = 'normal';
                                            }
                                        })
                                    }
        
                                    google.visualization.events.addListener(chart, 'select', handleSelect);

                                    }
                                  });
                              })
                          }
                      }
              })
          }
      })
      document.onmousemove = null;
      obj.onmouseup = null;
  }

  obj.onmouseup = function() {
      document.onmousemove = null;
      obj.onmouseup = null;
  }

  obj.ondragstart = function() {
      return false;
  };
}