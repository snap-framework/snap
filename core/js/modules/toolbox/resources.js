define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../BaseModule'
], function(_, $, Logger, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		ui: {	
			resourcesBtn: ".top-menu .resources"
		},
		
		templateUrl: "content/tools/resources_" + Utils.lang,

		initialize: function(options) {
			Logger.log("INIT: Resources");
		},

		setListeners: function() {},

		serializeData: function() {
			return {};
		},

		render: function() {
			if (!this.isRendered) {
				this.template = this.template(this.serializeData());
				
				this.setMagnificPopupTemplate();
				this.setListeners();
				this.isRendered = true;
			}
		},

		onPageLoaded: function() {
			this.render();
		},

		setMagnificPopupTemplate: function() {
			this.ui.resourcesBtn.magnificPopup({
			    items: { src: this.template },
			    type: 'inline'
			});
		}
	});
});