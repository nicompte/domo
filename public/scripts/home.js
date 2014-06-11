(function () {

  'use strict';

  var x, y, line, svg, xAxis, yAxis, path, tempText, now, temp, margin, width, height, confs, conf, socket, myFormatters, tooltip;

  // Get page width
  function getWidth() {
    var x = 0;
    if (self.innerHeight) {
      x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
      x = document.documentElement.clientWidth;
    }
    else if (document.body) {
      x = document.body.clientWidth;
    }
    return x;
  }

  // Get page height
  function getHeight() {
    var y = 0;
    if (self.innerHeight) {
      y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
      y = document.documentElement.clientHeight;
    }
    else if (document.body) {
      y = document.body.clientHeight;
    }
    return y;
  }

  // Create graph
  function setupGraph() {

    // x scale
    if (conf.live === true) {
      x = d3.time.scale()
        .domain([now - (conf.n - 2) * conf.d, now - conf.d])
        .range([0, width]);
    } else {
      x = d3.time.scale()
          .domain([now - (conf.n) * conf.d, now])
          .range([0, width]);
    }

    // y scale
    y = d3.scale.linear()
        .domain([5, 40])
        .range([height, 0]);

    line = d3.svg.line()
        .interpolate('basis')
        .x(function (d, i) { return x(now - (conf.n - 1 - i) * conf.d); })
        .y(function (d) { return y(d); });

    // Destroy previous graph
    $('p').remove();

    tooltip = d3.select('body')
    	.append('div')
        //.attr('class', 'tooltip')
      	.style('position', 'absolute')
      	.style('z-index', '10')
      	.style('visibility', 'hidden')
      	.style('font-size', '1.2em')
        .style('color', '#e95d4f')
        .style('font-weight', 'bold');

    svg = d3.select('body')
      .append('p')
      .append('svg')
        .attr('width', width + 150)
        .attr('height', height + 200)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .append('defs')
      .append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('width', width)
        .attr('height', height);

    tempText = svg
      .append('text')
        .attr('class', 'tempText')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        .text(currentTemp + ' °');

    xAxis = svg
      .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x.axis = d3.svg.axis().scale(x).orient('bottom').tickFormat(conf.timeFormat).ticks(conf.ticks));

    yAxis = svg
      .append('g')
        .attr('class', 'y axis')
        .call(y.axis = d3.svg.axis().scale(y).orient('left'))
        .append('text').text('T (C°)').attr('transform', 'translate(-15, -15)');

    if (conf.live) {
      path = svg
        .append('g')
          .attr('id', 'path')
          .attr('clip-path', 'url(#clip)')
          .append('path')
            .data([conf.data])
            .attr('class', 'line');
    } else {
      path = svg
        .append('g')
          .attr('id', 'path')
          .attr('clip-path', 'url(#clip)')
          .append('path')
            .data([conf.data])
            .attr('class', 'line')
            .on("mouseover", function(){
              var m = d3.mouse(this)
              tooltip.text(y.invert(m[1]).toFixed(0) + ' °')
              tooltip.style("visibility", "visible");
              //return tooltip;
            })
          	.on("mousemove", function(){
              var m = d3.mouse(this)
              tooltip.text(y.invert(m[1]).toFixed(0) + ' °')
              tooltip.style("top", (event.pageY-25)+"px").style("left",(event.pageX+15)+"px");
              //return tooltip;
            })
          	.on("mouseout", function(){
              tooltip.style("visibility", "hidden");
            });
    }


  }

  function mMove() {
    /* jshint strict: false */
    var m = d3.mouse(this);

    // d3.select('#path').select('title').text(y.invert(m[1]).toFixed(0) + ' °');
    // $('.logo').tooltip({  container: 'svg', title: y.invert(m[1]).toFixed(0) + ' °' });
    // $('.logo').tooltip('show');
    tempText.text('(' + y.invert(m[1]).toFixed(0) + ' °)');

  }

  function tick() {

    tempText.text(temp + ' °');

    now = new Date();

    if (conf.live === true) {
      x.domain([now - (conf.n - 2) * conf.d, now - conf.d]);
    } else {
      x.domain([now - (conf.n) * conf.d, now]);
    }

    conf.data.push(temp);

    // Redraw the line
    svg.select('.line')
      .attr('d', line)
      .attr('transform', null);

    // Slide the x-axis left
    xAxis.transition()
      .duration(conf.d)
      .ease('linear')
      .call(x.axis);

    // Slide the line left
    path.transition()
      .duration(conf.d)
      .ease('linear')
      .attr("transform", "translate(" + x(now - (conf.n - 1) * conf.d) + ")")
      .each('end', function() { return (function(conf) { tick(conf); })(conf) } );

    // Pop the old data point off the front
    conf.data.shift();

  }

  // En français, que Diable !
  myFormatters = d3.locale({
    'decimal': ',',
    'thousands': ' ',
    'grouping': [3],
    'currency': ['€', '\''],
    'dateTime': '%a %b %e %X %Y',
    'date': '%d/%m/%Y',
    'time': '%H:%M:%S',
    'periods': ['AM', 'PM'],
    'days': ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    'shortDays': ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    'months': ['Janvier', 'Février', 'Mars', 'Avril', 'Mail', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    'shortMonths': ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  });

  d3.time.format = myFormatters.timeFormat;

  // SOCKET EVENTS
  socket = io.connect();
  socket.on('temp', function (data) {
    temp = parseFloat(data);
  });
  socket.on('photo', function (data) {
    console.log('Photo:' + data);
  });

  /*
  * n is the number of values
  * d is the time (in ms) between two values
  */
  confs = {
    /*
    * Every 10 seconds, during 10 minutes
    * n = ( 10 * 60 ) / 10 = 60
    * msIn10mn = 1000 * 60 * 10 = 600000
    * d = msIn10mn / 60 = 10000
    */
    direct: { n: 802, d: 750, data: d3.range(802).map(function () { return currentTemp; }), ticks: 20, live: true,
    timeFormat: function (d) {
      if (d.getSeconds() === 30) {
        return '';
      } else {
        var format = d3.time.format('%H:%M');
        return format(d);
      }
    }},
    /*
    * Every 15 minutes, during 24 hours
    *
    * n = ( 24 * 60 ) / 15 = 96
    * msIn24h = 1000 * 3600 * 24 = 86,400,000
    * d = msIn24h / 96 = 900,000
    */
    temps15mn: { n: 96, d: 900000, data: previousTemps, timeFormat: d3.time.format('%Hh'), ticks: 24, live: false },
    /*
    * Every 360 minutes, during 7 days
    *
    * n = ( 7 * 24 * 60 ) / 360 = 28
    * msIn1week = 1000 * 3600 * 24 * 7 = 604,800,000
    * d = msIn1week / 28 = 21,600,000
    */
    temps360mn: { n: 28, d: 21600000, timeFormat: d3.time.format('%a'), ticks: 7, live: false },
    /*
    * Every 720 minutes, during 30.5 days
    *
    * n = ( 30.5 * 24 * 60 ) / 720 = 61
    * msIn1month = 1000 * 3600 * 24 * 30.5 = 2,635,200,000
    * d = msIn1month / 61 = 43,200,000
    */
    temps720mn: { n: 61, d: 43200000, timeFormat: d3.time.format('%d'), ticks: 31, live: false },
    /*
    * Every 720 minutes, during 365.5 days
    *
    * n = ( 365.5 * 24 * 60 ) / 720 = 731
    * msIn1year = 1000 * 3600 * 24 * 365.5 = 31,579,200,000
    * d = msIn1year / 731 = 43,200,000
    */
    temps720mna: { n: 731, d: 43200000, timeFormat: d3.time.format('%b'), ticks: 12, live: false }
  };

  // Set the 1 day confifuration as default

  now = new Date();
  temp = confs.temps15mn.data[confs.temps15mn.data.length - 1] || 0;

  margin = {top: 150, right: 150, bottom: 150, left: 150};
  width = getWidth() - margin.right - margin.left - 0;
  height = getHeight() - margin.top - margin.bottom - 100; //100 : padding boutons

  // Create first graph, with default 1 day configuration
  conf = confs.temps15mn
  setupGraph();
  tick();

  /*
  * DOM EVENTS
  */

  // Resize graph on window resize
  var doIt;
  $(window).on('resize', function(){
    clearTimeout(doIt);
    doIt = setTimeout(function () {
      width = getWidth() - margin.right - margin.left - 0;
      height = getHeight() - margin.top - margin.bottom - 100;
      $('.active').click();
    }, 500);
  });

  // Button events
  $('button').on('click', function () {

    var resourceName, variableName;

    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    resourceName = $(this).attr('data-temps');
    variableName = $(this).attr('data-temps-name');

    if (resourceName === 'direct') {
      conf = confs.direct;
      setupGraph();
      tick();
    } else {
      $.ajax({
        url: '/data/' + resourceName
      }).done(function (data) {
        conf = confs[variableName];
        conf.data = data;
        setupGraph();
        tick();
      });
    }

  });

})();
