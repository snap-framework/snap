define([
	'underscore',
	'jquery',
	'logger',
	'labels',
	'settings-core',
	'../../BaseModule',
	'./favorite-model'
], function(_, $, Logger, labels, CoreSettings, BaseModule, FavoriteModel) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			Logger.log("INIT: Favorite list, objSub: ", options.objSub);

			this.options = options;
			this.objSub = this.options.objSub;

			this.setListeners();
		},

		/**
		 * listen to events from the objSub
		 */
		setListeners: function() {
			var that = this;
			var $objSub = $(this.objSub);
			$objSub.on("FavoriteList:findFavoriteIndexByTarget", function(e, target) {
				//call with that context
				return that.findFavoriteIndexByTarget.call(that, target);
			});
			$objSub.on("FavoriteList:toggleFavorite", function(e, target) {
				//call with that context
				that.toggleFavorite.call(that, target);
			});
			$objSub.on("FavoriteList:generateFavArray", function(e) {
				//call with that context
				return that.generateFavArray.call(that);
			});
			$objSub.on("FavoriteList:spitFavContent", function(e) {
				//call with that context
				return that.spitFavContent.call(that);
			});
		},

		/**
		 * finds favorite index by anchor (target)
		 * @param  {string}	target: index of the favorite in the favorite list, ex: "#fav2"
		 * @return {number}
		 */
		findFavoriteIndexByTarget: function(target) {
			var index = -1;
			//try to find the fav
			for (var i = 0; i < this.objSub.aFav.length; i++) {
				if (target === this.objSub.aFav[i].target) {
					index = i;
				}
			}
			return index;
		},

		/**
		 * looks through the objects, toggles the one found; if not found, adds one.
		 * @param  {string}	target: anchor location of the favorite, ex: #fav2
		 */
		toggleFavorite: function(target) {
			var index = this.findFavoriteIndexByTarget(target);
			//is it found?
			if (index === -1) {
				//not found, addNew
				this.createFavorite(target);
				var list = this.objSub.aFav;
				list[list.length - 1].activate();

				this.reorderFavorite();
			} else {
				this.objSub.aFav[index].toggle();
			}
			//return false so that links are not followed
			return false;
		},

		createFavorite: function(target) {
			this.objSub.aFav[this.objSub.aFav.length] = new FavoriteModel({
				page: this.objSub.sPosition, target: target
			});
		},

		/**
		 * Reorder favorites by page
		 * ex: [m70-2-15#fav2, m70-2-15] => [m70-2-15, m70-2-15#fav2]
		 * 					   isPage		 isPage
		 * Note: since this function is only called when toggling a favorite,
		 * 		 we *won't* have a case where we have more than one page in the array of favorites.
		 * 		 ex: [m70-2-14, m70-2-15, m70-2-15#fav2]
		 * 		 	  isPage    isPage
		 */
		reorderFavorite: function() {
			var pageFlag = false;
			var pageObj;
			var newArray = [];
			for (var i = 0; i < this.objSub.aFav.length; i++) {
				if (this.objSub.aFav[i].isPage) {
					pageFlag = true;
					pageObj = this.objSub.aFav[i];
				} else {
					newArray[newArray.length] = this.objSub.aFav[i].target;
				}
			}
			//now we got an array of items, and we know if we have a page.
			//reorder the items
			newArray = newArray.sort();
			for (var x = 0; x < newArray.length; x++) {
				//look through only the items.
				newArray[x] = this.objSub.aFav[this.findFavoriteIndexByTarget(newArray[x])];
			}
			var tmpArray = [];
			if (pageFlag) {
				tmpArray[0] = pageObj;
			}
			tmpArray = tmpArray.concat(newArray);

			//update the objSub's aFav property so that it is usable elsewhere
			this.objSub.aFav = tmpArray;
		},

		generateFavArray: function() {
			var returnArray = [];
			var start = 0;
			if (this.objSub.aFav[0].isPage) {
				if (this.objSub.aFav[0].active) {
					returnArray[0] = this.objSub.sPosition;
				}
				start = 1;
			}
			var stringTarget;

			for (var i = start; i < this.objSub.aFav.length; i++) {
				stringTarget = "";
				if (i === start && (start === 0 || (start === 1 && !this.objSub.aFav[0].active))) {
					//if this is the first that's active, make sure to add the page.
					//either because there's no "page" fav or because it's disabled.
					stringTarget += this.objSub.sPosition;
				}

				stringTarget += this.objSub.aFav[i].target;
				if (this.objSub.aFav[i].active) {
					returnArray[returnArray.length] = stringTarget;
				}
			}
			return returnArray;
		},

		spitFavContent: function() {
			var returnArray = [];
			if (this.objSub.aFav[0].isPage && this.objSub.aFav[0].active) {
				return [this.objSub.aFav[0]];
			} else {
				for (var i = 0; i < this.objSub.aFav.length; i++) {
					//filter out the ones that are not active
					if (this.objSub.aFav[i].active) {
						returnArray[returnArray.length] = this.objSub.aFav[i];
					}
				}
				return returnArray;
			}
		}
	});
});