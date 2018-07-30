define([
    'jquery',
    'logger',
    'settings-core',
    'utils',
    '../../BaseModule',
    'modules/objSub/objSub-utils'
], function($, Logger, CoreSettings, Utils, BaseModule, ObjSubUtils) {
	'use strict';

	var favAddedClass = "fav-added";
	
	return BaseModule.extend({
		initialize: function(options) {
			Logger.log("INIT: Favorite model, page: " + options.page + ", target: " + options.target);
			
			this.options = options;
			this.target = this.options.target; //the ID
			this.page = this.options.page; //the changePage page
			
			//this.params=obj;//what IS this?

			this.active = true;
			this.isPage = this.target === "";
		
			this.parent = ObjSubUtils.findSub(Utils.getArrayFromString(this.page));
			this.parent.aFav[this.parent.aFav.length] = this;

		},

		activate: function() {
			this.active = true;
			//$(this.targetObj).addClass("favorite");
			if (this.isPage) {
				if (this.page == masterStructure.currentSub.sPosition) {
					$(CoreSettings.contentContainer).addClass("favorite");
					//disable the button for pages
					$("[data-fav='']").addClass(favAddedClass);
				}
				$("[data-fav='" + this.page + "']").addClass(favAddedClass);
			} else {
				//$(targetObj).add("favorite")
				$(CoreSettings.contentContainer).find(this.target).addClass("favorite");
				//disable the button
				$("[data-fav*='" + this.target + "']").addClass(favAddedClass);
			}
		},
		disable: function() {
			this.active = false;
			//$(this.targetObj).addClass("favorite");
			if (this.isPage) {
				$(CoreSettings.contentContainer).removeClass("favorite");
				$("[data-fav='']").removeClass(favAddedClass);
				$("[data-fav='" + this.page + "']").removeClass(favAddedClass);

			} else {
				//$(targetObj).add("favorite")
				$(CoreSettings.contentContainer).find(this.target).removeClass("favorite");
				//enable the button
				$("[data-fav*='" + this.target + "']").removeClass(favAddedClass);
			}
		},

		toggle: function() {
			//toggling between stuff.
			this.active = !this.active;
			if (this.page == masterStructure.currentSub.sPosition) {
				//on this page
				if (this.active) {
					this.activate();
				} else {
					this.disable();
				}
			} else {
				//on a different page
				if (this.active) {
					this.active = true;
				} else {
					this.active = false;
				}
				if (this.isPage) {
					$("[data-fav='" + this.page + "']").toggleClass(favAddedClass);
				} else {
					$("[data-fav*='" + this.target + "']").toggleClass(favAddedClass);
				}
			}
		}
	});
});