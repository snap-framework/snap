define([
	'jquery',
	'settings-core',
	'modules/BaseModule'
], function($, CoreSettings, BaseModule) {
	'use strict';
	
	return BaseModule.extend({

		initialize: function(options) {
			Logger.log("INIT: Print Controller");
			this.setListeners();
		},

		setListeners: function() {
			var that = this;
			if (window.matchMedia) {
				var mediaQueryList = window.matchMedia('print');
				mediaQueryList.addListener(function(mql) {
					if (mql.matches) {
						that.beforePrint();
					} else {
						that.afterPrint();
					}
				});
			}
		},

		printAll: function() {
			$(CoreSettings.contentContainer).html("<div id='printall'></div>");
			masterStructure.loadAll("#printall");

			$("html").addClass("print");
		},

		beforePrint: function() {
			$("html").addClass("print");
			$('details').attr("open", "true");
			$("input[type='radio'].ra").parent().css("border", "1px green solid");
			$(".btn").hide();
		},
		
		afterPrint: function() {
			$("html").removeClass("print");
			$('details').removeAttr("open");
			$("input[type='radio'].ra").parent().css("border", "none");
			$(".btn").show();
		}
	});
});