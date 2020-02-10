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
			this.$el=options.$el;
			
			this.term=this.$el.children("dt").text();
			this.definition=this.$el.children("dd").html();

		},
/*---------------------------------------------------------------------------------------------
		-------------------------houseKeeping
---------------------------------------------------------------------------------------------*/	
		

/*---------------------------------------------------------------------------------------------
		-------------------------
---------------------------------------------------------------------------------------------*/	
		generateInstance:function($el){
			var link = document.createElement("a");
			link.setAttribute("href", "#"+this.id); 
			//link.setAttribute("class", "csps-glossary"); 
			link.setAttribute("class", "csps-glossary wb-lbx"); 
			link.textContent=this.term;

			this.replaceInstance($el,link);
			
			this.insertInlinePopup();
			
			
			return false;
		},
		cleanUpInstance:function($el){			
			var link = document.createElement("a");
			link.setAttribute("href", "#"+this.id); 
			link.setAttribute("class", "csps-glossary"); 
			link.textContent=this.term;
			
			this.replaceInstance($el,link);
			this.deleteInlinePopup();
			return false;
		},		
		replaceInstance:function($el, html){
			
			$el.replaceWith(html);
			
		},
		
		insertInlinePopup:function(){
			var html="";
			var def=(Utils.lang==="en")?"Definition : ":"Définition:";
			html+="<section id=\""+this.id+"\" class=\"mfp-hide  modal-dialog modal-content overlay-def\">";
			html+="<header class=\"modal-header\"><h2 class=\"modal-title\">"+def+this.term+"</h2></header>";
			html+="<div class=\"modal-body\"><div>"+this.definition+"</div></div></section>"
			$(CoreSettings.contentContainer).append(html);
			
		},
		deleteInlinePopup:function(){
			var $el=$("#"+this.id);
			$("#"+this.id).remove();
		}
		


	});
});