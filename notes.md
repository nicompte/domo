Événement de connexion au socket
```js
io.sockets.on('connection', function () {
  // TODO
});
```

Déclaration capteur luminosité et del
```js
var photoSensor = new five.Sensor({
  pin: 'A1',
  freq: updateFrequence
});

var led = new five.Led({
  pin: 13
});
```

Utilisation capteur luminosité
```js
photoSensor.on('read', function(err, value){
  //console.log(value, this.normalized);
  //lampe : 51 - 13
  // TODO : revoir calcul
  var rldr, lux, vout;

  vout = value * 0.0048828125;

  rldr = (100 * (4.6 - vout))/vout;

  lux = 500 / rldr;

  if(value > 50) led.off();
  else led.on();

  io.sockets.emit('photo', lux.toFixed(2));
});

```

Remise à 0 des valeurs sur redis
```js
// Reset
client.del('temps_15mn')
for(var i=0; i<96; i++){
  client.rpush('temps_15mn', 20);
}
client.del('week_i');
client.del('temps_360mn')
for(var i=0; i<24; i++){
  client.rpush('temps_360mn', 0);
}
client.del('month_i');
client.del('temps_720mn')
for(var i=0; i<61; i++){
  client.rpush('temps_720mn', 0);
}
client.del('temps_720mn_a')
  for(var i=0; i<731; i++){
  client.rpush('temps_720mn_a', 0);
 }
```

Vieille version
```js
/*
* Store the week temperature
*/
storeWeekTemp: function(temp){
  client.llen('temps_360mn', function(err, len){
    // Store only 28 values : ( (28*360) / 60) / 24 = 7 days
    if(len === 28){
      client.lpop('temps_360mn');
    }
    client.rpush('temps_360mn', temp);
    console.log('------ week')
  });
},
/*
* Store the month temperature
*/
storeMonthTemp: function(temp){
  client.llen('temps_720mn', function(err, len){
    // Store only 61 values : ( (61*720) / 60) / 24 = 30,5 days
    if(len === 61){
      client.lpop('temps_720mn');
    }
    client.rpush('temps_720mn', temp);
    console.log('--------- month')
  });
},
/*
* Store the year temperature
*/
storeYearTemp: function(temp){
  client.llen('temps_720mn_a', function(err, len){
    // Store only 731 values : ( (731*720) / 60) / 24 = 365,5 days
    if(len === 731){
      client.lpop('temps_720mn_a');
    }
    client.rpush('temps_720mn_a', temp);
    console.log('------------ year')
  });
}
};
```

Image size: 300*312
