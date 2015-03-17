module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-simple-mocha');
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      options: {
        // Override the command used to start the server.
        // (do not use 'coffee' here, the server will not be able to restart
        //  see below at opts for coffee-script support)
        cmd: process.argv[0],

        // Will turn into: `node OPT1 OPT2 ... OPTN path/to/server.js ARG1 ARG2 ... ARGN`
        // (e.g. opts: ['node_modules/coffee-script/bin/coffee'] will correctly parse coffee-script)
        opts: [ ],
        args: [ ],

        // Setting to `false` will effectively just run `node path/to/server.js`
        background: true,

        // Called when the spawned server throws errors
        fallback: function() {
          console.log("opps");
        },

        // Override node env's PORT
        port: 9999,

        // Override node env's NODE_ENV
        node_env: undefined,

        // Consider the server to be "running" after an explicit delay (in milliseconds)
        // (e.g. when server has no initial output)
        delay: 0,

        // Regular expression that matches server output to indicate it is "running"
        output: ".+",

        // Set --debug
        debug: false
      },
      dev: {
          options: {
            script: 'server.js'
          }
      }
    },
    jshint: {
        options: {
          curly: true,
          eqeqeq: true,
          eqnull: true,
          browser: true,
          globals: {
            jQuery: true
          },
        },
        files: {
          src: ['Gruntfile.js', 'server.js' ]
        }
    },
    clean: {
      build: {
        src: [ 'dist' ]
      },
      all: {
        src: ['node_modules']
      }
    },
    copy: {
      build: {
        expand: true,
        cwd: 'static/',
        src: '**',
        dest: 'dist/',
      },
      scripts: {
        expand: true,
        cwd: 'client/',
        src: '**',
        dest: 'dist/scripts',
      }
    },
    watch: {
      scripts: {
        files: ['Gruntfile.js', 'server.js' ],
        tasks: ['jshint'],
        options: {
          interrupt: true,
        }
      },
      express: {
        files:  [ 'server.js' ],
        tasks:  [ 'express:dev', 'simplemocha' ],
        options: {
          spawn: false
        }
      },
      tests: {
        files: [],
        tasks: [ 'simplemocha' ],
        options: {
          interrupt: true,
        }
      }
    },
    simplemocha: {
        options: {
            globals: ['should'],
            timeout: 3000,
            ignoreLeaks: false,
//            reporter: 'nyan',
            ui: 'bdd'
        },

        all: {
            src: ['test/**/*.test.js']
        }
    }
  });
  grunt.registerTask('build', ['jshint', 'copy:scripts', 'copy:build' ]);
  grunt.registerTask('default', ['express:dev', 'watch']);
  grunt.registerTask('test', ['jshint', 'simplemocha' ]);

};
