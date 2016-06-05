module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');


    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-css');

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
            js: {
                src: ["public/js/initialize.js", "public/js/services/thirdParty.js", "public/js/services/persist.js", "public/js/services/fetch.js", "public/js/services/auth.js",
                    "public/js/directives/input.js", "public/js/directives/rendering.js", "public/js/controllers/controllers.js"
                ],
                dest: 'public/dist/built.js'
            },
            css: {
                src: ['public/css/bootstrap.css', 'public/css/angular-wizard.css', 'public/css/angular-toastr.css', 'public/css/rzslider.css', 'public/css/style.css'],
                dest: 'public/dist/built.css'
            }
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
        },
        cssmin: {
            css: {
                src: 'public/dist/built.css',
                dest: 'public/dist/built.min.css'
            }
        }
    });


};