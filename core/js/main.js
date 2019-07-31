'use strict';

//Load the configs, then load the app.
require(['require-configs'], function() {
	require([
		'jquery',
		'logger',
		'utils',
		"app",
		"settings-core",
		"settings-general",
		"settingsOverride"
	], function($, Logger, Utils, App, CoreSettings, GeneralSettings, settingsOverride) {
		$.ajaxSetup({ cache: false });

		require(['wet-boew'], function() {
			var courseTitle = Utils.lang === "en" ? CoreSettings.courseTitle_en : CoreSettings.courseTitle_fr;
			var courseSubtitle = Utils.lang === "en" ? CoreSettings.courseSubtitle_en : CoreSettings.courseSubtitle_fr;
			var seriesTitle = Utils.lang === "en" ? CoreSettings.seriesTitle_en : CoreSettings.seriesTitle_fr;
			var altLang=(lang!=="en")?"en":"fr";

		    $(function(e) {
		    	//custom theme css
		    	document.getElementById('theme-style').href = "./theme/" + CoreSettings.cssFileName;

		    	//setup titles
				//document.title = CoreSettings.courseLegacyCode + " - " + courseTitle;
				$("#wb-sttl>a>span").html(courseTitle);
				if (courseSubtitle.length > 0) {
					$("#wb-sttl>a").append("<span class='subtitle'>"+courseSubtitle+"</span>");
				}
				if (seriesTitle.length > 0) {
					$("#wb-bar").children("div.container").prepend("<h2 class='series-title'><a href='#'>"+seriesTitle+"</a></h2>");
				}

				//// START THE FRAMEWORK
				//catch when the supermenu is injected in the navigation by the wet-boew
				$(document).on("wb-ready.wb", function(event) {
					Logger.log('App Initialize');
					//preload supermenu
					$.get("content/supermenu/supermenu_"+altLang+".html", function (data) {
						App.initialize(data);
					});
					
				});
			});
		});
	});
});