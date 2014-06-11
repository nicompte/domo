module.exports = function (grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
        '*.js',
        'public/scripts/**/*.js',
        '!public/scripts/lib/**/*.js',
        '!public/scripts/*.min.js'
      ],
      options: {
        browser: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        trailing: true,
        strict: true,
        predef: [
          '$', 'd3', 'io',
          'previousTemps', 'currentTemp',
          '_gaq', 'ga',
          'console', 'self',
          'module', 'require',
          '__dirname'
        ]
      }
    },
    less: {
      production: {
        files: {
          'public/css/main.css': 'public/css/main.less'
        },
        options: {
          compress: true
        }
      }
    },
    watch: {
      less: {
        files: ['**/*.less'],
        tasks: ['less']
      }
    }
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Task definition.
  grunt.registerTask('default', ['less']);
  grunt.registerTask('lint', ['jshint']);

};
