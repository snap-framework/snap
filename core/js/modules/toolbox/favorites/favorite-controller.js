define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../../BaseModule',
	'modules/objSub/objSub-utils',
	'./favorite-model'
], function(_, $, Logger, CoreSettings, Utils, BaseModule, ObjSubUtils, FavoriteModel) {
	'use strict';

	var favAddedClass = "fav-added";
	
	return BaseModule.extend({
		ui: {
			favoritesBtn: ".top-menu .favorites"
		},
		
		templateUrl: "content/tools/favorites_" + Utils.lang,
		
		initialize: function(options) {
			Logger.log("INIT: Favorite Controller");
			
			masterStructure.aFav = []; //as of 1.5.1, a bookmark object

			this.setListeners();
			
			this.loadFavorites();
			
			this.render();
		},

		serializeData: function() {
			return {};
		},

		render: function() {
			this.template = this.template(this.serializeData());

			this.setMagnificPopupTemplate();
		},

		setMagnificPopupTemplate: function() {
			this.ui.favoritesBtn.magnificPopup({
				items: { src: this.template },
				type: 'inline'
			});
		},

		setListeners: function() {},

		onPageLoaded: function() {
			this.run();
		},

		run: function() {
			//runs on every page.
			//check if there are fav buttons in the page.
			this.autoFav();
			this.scanForButtons();
		},

		loadFavorites: function() {
			var aFavList = trackingObj.getData("favList");
			//aFavList=["m70-2-14","m70-2-15#fav2", "#fav3"]
			if (typeof aFavList === "undefined") {
				//initialize
				//favList is empty, no need to load the FavoriteModels
			} else {
				aFavList = aFavList.split(",");
				console.log("aFavList : ");

				console.log(aFavList);
				var page;
				var target;

				for (var fLoop = 0; fLoop < aFavList.length; fLoop++) {
					target = "";
					//does it contain an ID 
					var searchID = aFavList[fLoop].indexOf("#");
					if (searchID === -1) {
						//it'S a page
						page = aFavList[fLoop];
						target = "";
						//create object as page
					} else if (searchID === 0) {
						// it's just an ID, use previous page
						page = page;
						target = aFavList[fLoop];

					} else {
						//it's an ID, but use THIS page
						page = aFavList[fLoop].substring(0, searchID);
						target = aFavList[fLoop].substring(searchID);

					}

					//build the object
					new FavoriteModel({page: page, target: target});
				}
				//rebuild the list?
				//this.rebuildList
			}
		},

		//this is to add the favorite button automatically.
		autoFav: function() {
			if (CoreSettings.autoAddFavoriteBtn && (!masterStructure.currentSub.isQuiz()) && (!masterStructure.currentSub.isIntro()) && (!masterStructure.currentSub.isActivity())) {
				$("#dynamic_content h1").before("<span data-fav='' class='autofav'>" + labels.nav.togglefav + "</span>");
				$("#dynamic_content h1").addClass("has-fav");
			}
		},
		scanForButtons: function() {
			var btnList = $("[data-fav]");
			this.btnInit(btnList);

			//scan the page object
			for (var fLoop = 0; fLoop < masterStructure.currentSub.aFav.length; fLoop++) {
				//activate favorite class
				//if they're not active?
				if (masterStructure.currentSub.aFav[fLoop].active) {
					masterStructure.currentSub.aFav[fLoop].activate();
				} else {
					masterStructure.currentSub.aFav[fLoop].disable();
				}
			}
		},
		//initialize all the buttons in the page.
		btnInit: function(btnList) {
			var $thisBtn;
			var that = this;
			for (var btnLoop = 0; btnLoop < btnList.length; btnLoop++) {
				$thisBtn = $(btnList[btnLoop]);
				//console.log(btnList[btnLoop])
				//$(btnList[btnLoop]).html("wow")
				$thisBtn.on("click", function() {
					that.toggleFavorite(this);
					return false;	
				}).addClass("btn-fav")
					.append("<span class='debug'>&nbsp;" + $thisBtn.attr("data-fav") + "</span>");
					
				var attrFav = $thisBtn.attr("data-fav");
				var objIndex = attrFav.indexOf("#");
				var tempSub, favIndex;
				if (objIndex == -1 && attrFav.length > 0) {
					//entire other page
					tempSub = ObjSubUtils.findSub(Utils.getArrayFromString(attrFav));
					favIndex = $(tempSub).triggerHandler("FavoriteList:findFavoriteIndexByTarget", [""]);
					if (favIndex >= 0) {
						if (tempSub.aFav[favIndex].active) {
							$thisBtn.addClass(favAddedClass);
						}
					} else {
						$thisBtn.removeClass(favAddedClass);
					}
				}
				if (objIndex > 0) {
					//item on other page
					var target = attrFav.substring(objIndex);
					tempSub = ObjSubUtils.findSub(Utils.getArrayFromString(attrFav.substring(0, objIndex)));
					favIndex = $(tempSub).triggerHandler("FavoriteList:findFavoriteIndexByTarget", [target]);
					if (favIndex >= 0) {
						if (tempSub.aFav[favIndex].active) {
							$thisBtn.addClass(favAddedClass);
						}
					} else {
						$thisBtn.removeClass(favAddedClass);
					}
				}
			}
		},

		toggleFavorite: function(btn) {
			var dataTarget = $(btn).attr("data-fav");
			var target;
			var page;
			var searchID = dataTarget.indexOf("#");

			if (searchID >= 0) {
				//isObj
				if (searchID == 0) {
					//item on this page
					target = dataTarget;
					page = masterStructure.currentSub.sPosition;
				} else {
					//item on another page
					page = dataTarget.substring(0, searchID);
					target = dataTarget.substring(searchID);
				}
			} else {
				if (dataTarget == "") {
					//thisPage
					page = masterStructure.currentSub.sPosition;
				} else {
					//any other page
					page = dataTarget;
				}
				target = "";
			}

			var objSub = ObjSubUtils.findSub(Utils.getArrayFromString(page));
			$(objSub).trigger("FavoriteList:toggleFavorite", [target]);
			this.updateFav();
		},

		updateFav: function() {
			var saveFav = this.listFav();
			//save to scorm!
			trackingObj.saveData('favList', saveFav.toString());
			trackingObj.syncData();
			$("#displayFav").html(saveFav.toString());
		},

		listFav: function() {
			var totalArray = [];
			var pageList = masterStructure.flatList;
			for (var i = 0; i < pageList.length; i++) {
				//going through all the pages. maybe someday it'll work with modules but this is it.
				var tmpPage = pageList[i];
				if (tmpPage.aFav.length) {
					//there are favorites here.
					//console.log(tmpPage.aFav)

					//triggerHandler instead of normal trigger since we expect to return data instead of the jQuery object
					totalArray = totalArray.concat($(tmpPage).triggerHandler("FavoriteList:generateFavArray"));
				}
			}
			return totalArray;
		},

		prepareFavContent: function() {
			var totalArray = [];
			var pageList = masterStructure.flatList;
			for (var i = 0; i < pageList.length; i++) {
				if (pageList[i].aFav.length > 0) {
					//triggerHandler instead of normal trigger since we expect to return data instead of the jQuery object
					totalArray = totalArray.concat($(pageList[i]).triggerHandler("FavoriteList:spitFavContent"));
				}
			}
			return totalArray;
		}
	});
});