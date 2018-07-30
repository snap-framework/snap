define([
	'underscore',
	'jquery',
	'../BaseModule',
	'utils',
	'json!ga-List',
	'logger',
	'settings-core'
], function(_, $, BaseModule, Utils, AnalyticsList, Logger, CoreSettings) {
	'use strict';

	return BaseModule.extend({

		initialize: function(options) {
			Logger.log("INIT: google analytics Controller");
         	this.options = options;
			this.gaTracker();
			this.bindElements();

			
      },

		onPageLoaded: function() {
			
			var path = Utils.lang + '/' + masterStructure.currentSub.sPosition;
			var title = masterStructure.currentSub.title;

			ga('set', { page: path, title: title });
			ga('send', 'pageview');					
		},

	


		gaTracker: function (){
			$.getScript('//www.google-analytics.com/analytics.js'); // jQuery shortcut
			window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
      		ga('create', CoreSettings.googleAnalyticsID , 'auto');
			var path = Utils.lang + '/' + masterStructure.currentSub.sPosition;
			var title = masterStructure.currentSub.title;
			ga('set', { page: path, title: title });
			ga('send', 'pageview');			
			

		},
      bindElements: function() {
			var that = this;
		 

		 	//bind navigation, (catégorie, action libellé)
			_.each(_.keys(AnalyticsList.Navigation), function(action, index) {
				
				
				_.each(_.keys(AnalyticsList.Navigation[action]), function(libel, index) {
					//console.log("ga('send', 'event', 'Navigation', '"+action+"', '"+Utils.lang+"-"+libel+"');")
					//bind to AnalyticsList.Navigation[action][libel]
					//ga('send', 'event', 'Navigation', action, lang-libel);
					$(AnalyticsList.Navigation[action][libel]).attr("onclick", "ga('send', 'event', 'Navigation', '"+action+"', '"+Utils.lang+"-"+libel+"' );");
				});

			});
			//bind other things... erm.
         	//$("a.wb-sl").on("click", function() {ga('send', 'event', 'Navigation', 'TopNav', Utils.lang+'-SkipContent');});
      }		
	  
	  
	});
});



	/*
		//GA Track Audio Fr-audio-mod00_01
	$("audio").bind("play", function(){
	_gaq.push(["_trackEvent","Audio", "play", $(this).attr('src')]);
	});
	*/