(function () {

	'use strict';

	var five, express, io, redis,
		app, server, client,
		timeClient,
		tempSensor,
		updateFrequence, currentTemp;

	five = require('johnny-five');
	// Get data from sensor every 30 seconds
	updateFrequence = 30*1000;
	currentTemp = 0;

	// When Arduino board is ready
	five.Board().on('ready', function(){

		// Define express server and socket.io
		express = require('express');
    app = express();
    server = require('http').Server(app);
    io = require('socket.io')(server);

		// Connect to redis
		redis = require('redis');
	  client = redis.createClient('6379', '127.0.0.1');
		timeClient = require('./timeClient');

	  // Express configuration
	  app.use(express.static(__dirname + '/public'));
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');

		// Start express
	  server.listen(8080);
	  console.log('Listening on port 8080');

		// Homepage
	  app.get('/', function (req, res) {

			client.lrange('temps_15mn', 0, -1, function(err, nodes){
				res.render('index', {currentTemp: currentTemp, previousTemps: nodes});
			});

	  });

		// Get data for specific period
		app.get('/data/:period', function(req, res){

			client.lrange(req.params.period, 0, -1, function(err, nodes){
				res.json(nodes);
			});

		});

		// Define the temperature sensor
	  tempSensor = new five.Sensor({
	    pin: 'A0',
	    freq: updateFrequence
	  });

		// When receiving temperature (freq: updateFrequence)
	  tempSensor.on('data', function(err, value){

			var celsius, voltage;

			// Convert voltage to celsius
			voltage = (value * 5000) / 1024;
			celsius = (voltage - 500) / 10;

			// toFixed 0 because of the 1° TMP36 precision
			currentTemp = celsius.toFixed(0);

			// Send temperature to everyone connected
			io.sockets.emit('temp', currentTemp);

			// Store every 15 minutes : 15
			// So store every 30 30 seconds period : 30 * 30 = 900 seconds
			client.get('day_i', function(err, dayI){
				if (dayI === '29') {
					client.set('day_i', 0);
					//timeClient.storeDayTemp(currentTemp);
					timeClient.storeTemp(currentTemp, 'last_15mn', 'day_i', 'temps_15mn', 15, 20, 96);

					// Store every 360 minutes : 360 / 60 = 6h
					// So we store every 24 15 minutes period : 24 * 15 = 360 minutes
					client.get('week_i', function(err, weekI){
						if(weekI === '23'){
							client.set('week_i', 0);
							timeClient.storeTemp(currentTemp, 'last_360mn', 'week_i', 'temps_360mn', 360, 375, 28);
						}else{
							client.incr('week_i');
						}
					});

					// Store every 720 minutes : 720 / 60 = 12h
					// So we store every 48 15 minutes period : 48 * 15 = 720 minutes
					client.get('month_i', function(err, monthI){
						if(monthI === '47'){
							client.set('month_i', 0);
							timeClient.storeTemp(currentTemp, 'last_720mn', 'month_i', 'temps_720mn', 720, 780, 61);
							timeClient.storeTemp(currentTemp, 'last_720mn_a', 'year_i', 'temps_720mn_a', 720, 780, 731);
						}else{
							client.incr('month_i');
						}
					});

				} else {
					client.incr('day_i');
				}
			});


	  }); // End of tempSensor read

	}); // End of board ready

})();
