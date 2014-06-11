(function () {

  'use strict';

  var redis, client, timeClient, moment;

  redis = require('redis');
  client = redis.createClient('6379', '127.0.0.1');
  moment = require('moment');

  timeClient = {
    /*
    * Store temperature
    *
    * temp: temperature
    * lastMeasureKey: redis key for the last measure
    * iKey: redis key for the counter
    * key: redis key for the measure
    * timeBetweenMeasures: time between measures, in mn
    * maxTimeBetweenMeasures: maximum time between tow measures, in mn
    */
    storeTemp: function(temp, lastMeasureKey, iKey, key, timeBetweenMeasures, maxTimeBetweenMeasures, numberOfMeasures){

      client.get(lastMeasureKey, function (err, last) {

        var nbOfTimes, nbOfTimesW, nbOfTimesD, nbTokens, now;
        last = parseInt(last, 10);

        now = new Date().getTime();

        // If too much time between two measures
        if (now - last > moment.duration(maxTimeBetweenMeasures, 'minutes').asMilliseconds()) {
          // Number of times the measure was missed
          nbOfTimes = (now - last) / moment.duration(timeBetweenMeasures, 'minutes').asMilliseconds();
          // Number of measure we have to "fill"
          nbOfTimesW = Math.floor(nbOfTimes);
          // Convert the rest to count, and add it to the counter
          nbOfTimesD = nbOfTimes - nbOfTimesW;
          nbTokens = (nbOfTimesD * numberOfMeasures).toFixed(0);
          client.get(iKey, function(err, iKeyValue){
            iKeyValue = parseInt(iKeyValue, 10);
            if (iKeyValue + nbTokens > numberOfMeasures) {
              nbOfTimesW ++;
              nbTokens = iKeyValue + nbTokens - numberOfMeasures;
              client.set(iKey, nbTokens);
            }
            console.log('---');
            console.log('Must catch up for ' + key + ', missed ' + moment.duration(now - last).asMinutes().toFixed(0) + 'mn while max authorized is ' + maxTimeBetweenMeasures + 'mn.');
            console.log('Adding ' + nbTokens + ' to counter.');
            console.log('Adding ' + nbOfTimesW + ' measures.');
            console.log('---');
            // Add measures for missing times
            for (var i=0; i < nbOfTimesW; i++) {
              client.llen(key, function(err, len){
                if(len === numberOfMeasures){
                  client.lpop(key);
                }
                client.rpush(key, 0);
              });
            }
            client.set(lastMeasureKey, now);
          });

        } else {

          client.llen(key, function(err, len){
            // Store only 96 values : (15*96) / 60 = 24h
              if(len === numberOfMeasures){
                client.lpop(key);
              }
            client.rpush(key, temp, function () {
              client.set(lastMeasureKey, now);
            });
          });

        }


      });

    }

  };

  module.exports = timeClient;

})();
