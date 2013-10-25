module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	,	uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
		,	build: {
				src: 'build/concat.js'
			,	dest: 'build/<%= pkg.name %>.min.js'
			}
		}
	,	concat: {
			js: {
				src: ['src/scheduler.global.js', 'src/scheduler.util.js', 'src/scheduler.cmd.js', 'src/scheduler.js']
			,	dest: 'build/concat.js'
			}
		}
	,	cssmin: {
			minify: {
				src: 'src/<%= pkg.name %>.css'
			,	dest: 'build/<%= pkg.name %>.min.css'
			}
		}
	});
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};
