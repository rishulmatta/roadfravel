module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-contrib-concat');


  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

 // on the dev server, only concat
grunt.registerTask('default', ['concat']);

// on production, concat and minify
grunt.registerTask('prod', ['concat', 'uglify']);


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
       options: {
         separator: ';',
       },
       dist: {
         src: ["public/js/lib/oms.min.js","public/js/lib/jquery.js","public/js/lib/angular.js","public/js/lib/angular-ui-router.js","public/js/lib/ui-bootstrap.js","public/js/lib/bootstrap.js","public/js/lib/angular-wizard.js","public/js/lib/angular-toastr.js","public/js/lib/rzslider.js",
"public/js/initialize.js","public/js/services/thirdParty.js","public/js/services/persist.js","public/js/services/fetch.js","public/js/services/auth.js",
"public/js/directives/input.js","public/js/directives/rendering.js","public/js/controllers/controllers.js"],
         dest: 'public/dist/built.js',
       },
     },
    uglify: {
      options: {
       
           report: 'min',
           mangle: false,
       
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/dist/built.js',
        dest: 'public/dist/built.min.js'
      }
    }
  });


};