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
			
			this.html=options.html;
		},
/*---------------------------------------------------------------------------------------------
		-------------------------houseKeeping
---------------------------------------------------------------------------------------------*/	
		

/*---------------------------------------------------------------------------------------------
		-------------------------
---------------------------------------------------------------------------------------------*/	
		generateInstance:function($el){
			var div = document.createElement("div");
			div.setAttribute("data-csps-replace", this.id); 
			div.innerHTML=this.html;

			this.replaceInstance($el,div);
			return false;
		},
		cleanUpInstance:function($el){			
			var div = document.createElement("div");
			div.setAttribute("data-csps-replace", this.id); 
			div.textContent="";
			
			this.replaceInstance($el,div);
			return false;
		},		
		replaceInstance:function($el, html){
			if($el.is("span") || $el.is("li")){
				$el.html(this.html);
			}else{
				$el.replaceWith(html);
			}
			
		}
		
		


	});
});