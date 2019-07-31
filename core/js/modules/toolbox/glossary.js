define([
	'underscore',
	'jquery',
	'logger',
	'labels',
	'settings-core',
	'utils',
	'../BaseModule',
	'modules/toolbox/glossary-term',
	'hbs!templates/glossary/glossary-term'
], function(_, $, Logger, labels, CoreSettings, Utils, BaseModule,glossaryTerm,templateTerm) {
	'use strict';

	return BaseModule.extend({
		ui: {	
			glossaryBtn: ".top-menu .glossary"
		},
		
		templateUrl: "content/tools/glossary_" + Utils.lang,
		
		initialize: function(options) {
			Logger.log("INIT: Glossary");
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
			//this.scan();
		},

		setMagnificPopupTemplate: function() {
			this.ui.glossaryBtn.magnificPopup({
			    items: { src: this.template },
			    type: 'inline',
			    callbacks: {
    				open: function() {
    					$('ul#glossaryIndex').listnav({
							includeAll:  false,
							includeNums: false,
							noMatchText: labels.glossary.emptyTerm,
							showCounts:  false
						});
    				}
    			}
			});
		}
	});
});