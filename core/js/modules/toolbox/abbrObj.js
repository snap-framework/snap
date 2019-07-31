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


		initialize: function(options) {
			this.master=options.master;
			this.parent=options.parent;
			this.id=options.id;

			this.description=options.$dd.text();
			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------houseKeeping
---------------------------------------------------------------------------------------------*/	
		

/*---------------------------------------------------------------------------------------------
		-------------------------LAUNCH CKE
---------------------------------------------------------------------------------------------*/	
		generateInstance:function($el){
			var abbr = document.createElement("abbr");
			abbr.setAttribute("title", this.description); 
			abbr.textContent=$el.text();
			this.replaceInstance($el,abbr);
			return false;
		},
		cleanUpInstance:function($el){			
			var abbr = document.createElement("abbr");
			abbr.textContent=$el.text();
			
			this.replaceInstance($el,abbr);
			return false;
		},		
		replaceInstance:function($el, html){
			
			$el.replaceWith(html);
			
		}
		
		


	});
});