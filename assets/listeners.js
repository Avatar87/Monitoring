window.onload = () => {
    document.getElementById('from').addEventListener('change', () => {
        document.getElementById('loader').style.display='block';
        const data = {fromdate: document.getElementById('from').value};
        const url = 'http://'+window.location.host+'/date';
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

    document.getElementById('to').addEventListener('change', () => {
      document.getElementById('loader').style.display='block';
      const data = {todate: document.getElementById('to').value};
      const url = 'http://'+window.location.host+'/date';
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

  document.getElementById('all').addEventListener('change', () => {
    document.getElementById('loader').style.display='block';
    var data;
    if(document.getElementById('all').checked){
      data = {displayall: document.getElementById('all').value};
    }
    else{
      data = {fromdate: document.getElementById('from').value, todate: document.getElementById('to').value};
    }
    const url = 'http://'+window.location.host+'/date';
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

}