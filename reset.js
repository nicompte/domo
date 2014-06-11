(function () {

  'use strict';

  var redis, client, now;

  now = new Date().getTime();

  // Connect to redis
  redis = require('redis');
  client = redis.createClient('6379', '127.0.0.1');

  // Day data
  client.del('day_i');
  client.del('temps_15mn');
  client.set('last_15mn', now);
  for(var i=0; i<96; i++){
    client.rpush('temps_15mn', 0);
  }

  // Week data
  client.del('week_i');
  client.del('temps_360mn');
  client.set('last_360mn', now);
  for(var j=0; j<28; j++){
    client.rpush('temps_360mn', 0);
  }

  // Month data
  client.del('month_i');
  client.del('temps_720mn');
  client.set('last_720mn', now);
  for(var k=0; k<61; k++){
    client.rpush('temps_720mn', 0);
  }

  // Year data
  client.del('temps_720mn_a');
  client.set('last_1720mn_a', now);
    for(var l=0; l<731; l++){
    client.rpush('temps_720mn_a', 0);
  }

  //client.end();

})();
