module.exports = function( grunt ){
	"use strict";
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		concat:{
			options: {
				banner:'/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			mainstyle: {
				files: {
					'build/css/app.min.css': ['<%= mainstyle %>']
				}
			},
			mainjs: {
				files: {
					'build/js/app.min.js': ['<%= mainjs %>']
				}
			}
		},
		uglify: {
			options: {
				banner:'/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			template: {
				files :{
					'assets/js/lib/template-0.7.1.min.js': ['assets/js/lib/template-0.7.1.js']
				}
			}
		},
		less: {
			options: {
				compress:true	
			},
			appcss: {
				files: {
					'assets/css/app.min.css': ['assets/css/app.less']
				}
			},
			animate: {
				files: {
					'assets/css/animate.min.css': ['assets/css/lib/animate.css']
				}
			}
		},
		
		watch: {
			appless: {
				files: ['<%= appless %>'],
				tasks:['less:appcss','concat:mainstyle']
			}
			
		}, 
		appless: ['assets/less/app.variables.less', 'assets/less/app.mixins.less', 'assets/less/app.reset.less', 'assets/less/app.buttons.less', 'assets/less/app.components.less', 'assets/less/app.colors.less', 'assets/less/app.utilities.less', 'assets/less/app.svg.less', 'assets/less/app.common.less', 'assets/less/app.layout.less', 'assets/less/app.page.less'],
		
		mainstyle: ['assets/css/jquery.mobile-1.4.5.min.css','assets/css/animate.min.css','assets/css/bootstrap.min.css','assets/css/app.min.css'],
		mainjs: ['assets/js/lib/jquery-1.11.3.min.js','assets/js/lib/jquery.mobile-1.4.5.min.js','assets/js/lib/bootstrap.min.js','assets/js/lib/template-0.7.1.min.js']
		
	})
	grunt.registerTask('default',['watch:appless']);
}




