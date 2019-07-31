define([
	"settings-core",
	'labels',
	'utils',
	'modules/BaseModule'
], function(CoreSettings, labels, Utils, BaseModule) {
	'use strict';
	
	/*
	 * L’objet niveau (levels) permet de regrouper les subs par leur niveau (depth).
     * La plupart du temps référencés à partir de navStructure, 
     * les modules (lvl 1) seraient retrouvés comme ceci:
	 *     masterStructure.levels[0]
	 * les sections (lvl 2) comme ceci :
	 *     masterStructure.levels[1]
     * Et donc, le 4e sub qui est dans les sections (lvl 2) se trouve comme ceci:
	 *     masterStructure.levels[1].subs[3]
	*/
	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;
			this.depth = this.options.depth; // acts as an index, depth is the level
			this.parent = this.options.parent; // this will always be masterStructure... 
			this.title = this.options.title; // name of the level
			this.defaultTitle = this.options.title; //default name ("module" or "sous-module")

			this.objMb = $("#sm-pnl").children("ul.mb-menu")
							.children("li")
							.eq(this.depth)
							.children("details")
							.children("summary"); //reference to mobile html object
			this.subs = []; //could be sous-niveau or sousPages
			$(this.objMb).parent().parent().attr("data-depth", this.depth);
		},

		/*
		 * hides all subs from a level
		 */
		hideSubs: function() {
			for (var subsLoop = 0; subsLoop < this.subs.length; subsLoop++) {
				this.subs[subsLoop].disable();
			}
		},
		/*
		 * Shows subs which match the aLookFor criteria
		 * @param {array} aLookFor: a position array to look for
		 */
		showArray: function(aLookFor) {
			var levels = aLookFor.length;
			var subCount = 0;
			for (var subsLoop = 0; subsLoop < this.subs.length; subsLoop++) {
				var aLookingAt = this.subs[subsLoop].aPosition.slice(0, levels);
				if (Utils.arrays_equal(aLookingAt, aLookFor)) {
					subCount++;
					this.subs[subsLoop].enable();
				}
			}
		},

		/*
		 * set the title and add the correct span to make sure the arrow is pointing in the right direction
		 * @param {string} newTitle 
		 */
		setTitle: function(newTitle) {
			var mbNum;
			var chevronHtml;
			if(CoreSettings.navigationMode===1){
				this.title = newTitle;
				
				chevronHtml = "<span class='expicon glyphicon glyphicon-chevron-down'></span>";
				this.$el.html(this.title + chevronHtml);
				if (CoreSettings.navigationMode === 2) {
					mbNum = this.depth + 1;
				} else {
					mbNum = this.depth + 0;
				}
				$(this.objMb).html("<span class='mb-lvl-nb'>"+mbNum+ "</span> <span class='mb-lvl-title'>"+this.title+"</span> <span class='mb-title-instr'>("+labels.nav.selectToChange+")</span>");
			}else{
				var lastLevel=parent.levels.length-1;

				//if this is a page, don't update the menu
				if (this.depth<lastLevel){
					this.title = newTitle;

					chevronHtml = "<span class='expicon glyphicon glyphicon-chevron-down'></span>";
					parent.levels[this.depth+1].$el.html(this.title + chevronHtml);
					if (CoreSettings.navigationMode === 2) {
						mbNum = this.depth + 1;
					} else {
						mbNum = this.depth + 0;
					}
					$(this.objMb).html("<span class='mb-lvl-nb'>"+mbNum+ "</span> <span class='mb-lvl-title'>"+this.title+"</span> <span class='mb-title-instr'>("+labels.nav.selectToChange+")</span>");
				}
			}
		},

		resetTitle: function() {
			this.setTitle(this.defaultTitle);
		},

		/*
		 * enable and show the menubar element with animation.
		 */
		enable: function() {
			$(".mb-menu").children("li").eq(this.depth).attr("disable", "false").show();
			this.$el.attr("disable", "false").show();
		},

		/*
		 * disable and hides the menubar element with animation.
		 */
		disable: function() {
			this.resetTitle();
			$(".mb-menu").children("li").eq(this.depth).attr("disable", "true").hide();
			this.$el.attr("disable", "true").hide();
		},
/* ---------------------------------------------------------------------------------------------		
		                                         LOM
--------------------------------------------------------------------------------------------- */		
		/*
		 * return subs which match the aLookFor criteria
		 * @param {array} aLookFor: a position array to look for
		 */
		getSubIndex: function(aLookFor) {
			for(var i=0;i<this.subs.length;i++){
				if(Utils.arrays_equal(aLookFor,this.subs[i].aPosition)){
					return i;
				}
			}
		},
		generateSupermenu:function($html){
			var $html_en=$html.children("[lang='en']").find(".supermenu").eq(0);
			var $html_fr=$html.children("[lang='fr']").find(".supermenu").eq(0);

			//LI>A
			$html_en.append("\n\t\t\t<li><a href=\"#\" data-ID=\"lvl"+(this.depth+1)+"\" class=\"item\">Choose</a>\n\t\t\t\t<ul class=\"sm list-unstyled\" data-ID=\"nav"+(this.depth+1)+"\" role=\"menu\"></ul></li>");
			$html_fr.append("\n\t\t\t<li><a href=\"#\" data-ID=\"lvl"+(this.depth+1)+"\" class=\"item\">Choisissez</a>\n\t\t\t\t<ul class=\"sm list-unstyled\" data-ID=\"nav"+(this.depth+1)+"\" role=\"menu\"></ul></li>");


			
			for (var i=0;i<this.subs.length;i++){
				this.subs[i].generateSupermenu($html);
			}




			//html_en+="\n\t\t</ul>";
			//html_en+="\n\t</li>";	
			return $html;
		}
		

	});
});