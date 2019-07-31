define([
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../BaseModule',
	'router'
], function($, Logger, CoreSettings, Utils, BaseModule, Router) {
	'use strict';

	return BaseModule.extend({
		el: ".top-menu",

		events: {
			"click .lang": "onChangeLang",
			"click .home": "onLoadHome",
			"click .quit": "onQuitCourse"			
		},

		initialize: function(options) {
			Logger.log("INIT: Navigation");
			
			this.options = options;

			this.router = this.options.router;
			this.lockingSystem = this.options.lockingSystem;

			this.setListeners();

			this.showTopMenu();
		},		
		setListeners: function() {
			var that = this;
			$(this).on('Navigation:goToNextPage', _.throttle(_.bind(this.goToNextPage, this), 750));
			$(this).on('Navigation:goToPrevPage', _.throttle(_.bind(this.goToPrevPage, this), 750));
			$(this).on('Navigation:loadHome', _.bind(this.onLoadHome, this));
			$(this).on('Navigation:changePage', function(e, itemID) {
				that.changePage(itemID);
			});

			$(this.router).on('Navigation:refreshNavState', _.bind(this.refreshNavState, this));
			$(this.lockingSystem).on('Navigation:refreshNavState', _.bind(this.refreshNavState, this));
			
			$(window).on("resize", _.bind(this.onResize, this));
		},

		// clicked on a menu item
		// fnav
		changePage: function(itemID) {
			this.router.changePage(itemID);
		},

		onLoadHome: function() {
			this.changePage(masterStructure.flatList[0].sPosition);

			//return false so that links are not followed
			return false;
		},
		loadLast: function() {
			this.changePage(masterStructure.flatList[masterStructure.flatList.length - 1].sPosition);

			//return false so that links are not followed
			return false;
		},
		onQuitCourse: function() {
			if (window.confirm(labels.nav.quitConfirm)) {				
				window.opener.closeCourse();
			}			
		},

		refreshNavState: function() {
			var isLocked, locked;
			var nextObj = masterStructure.nextPage();
			var prevObj = masterStructure.prevPage();
			var currentSub = masterStructure.currentSub;
			var isLockedIn = masterStructure.allowedLockedInExit
								  ? false
								  : CoreSettings.enableLockingSystem
								  ? this.lockingSystem.isLockedIn(currentSub.aPosition)
								  : null;
			if (CoreSettings.enableLockingSystem){
				if (nextObj) {
					isLocked = CoreSettings.enableLockingSystem ? this.lockingSystem.isLocked(nextObj.aPosition) : null;
					locked = isLocked || isLockedIn;
					$(".next").toggleClass("disabled", locked);
				}
				if (prevObj) {
					isLocked = CoreSettings.enableLockingSystem ? this.lockingSystem.isLocked(prevObj.aPosition) : null;
					locked = isLocked || isLockedIn;
					$(".back").toggleClass("disabled", locked);
				}
			}
		},

		goToNextPage: function() {
			if (!$("footer .next").hasClass("disabled")) { //had to add this so that IE would stop causing errors.
				var nextObj = masterStructure.nextPage();
				this.router.changePage(nextObj.sPosition);
			}

			//return false so that links are not followed
			return false;
		},
		goToPrevPage: function() {
			if (!$(".back").hasClass("disabled")) { //had to add this so that IE would stop causing errors.
				var prevObj = masterStructure.prevPage();
				this.router.changePage(prevObj.sPosition);
			}

			//return false so that links are not followed
			return false;
		},

		onChangeLang: function() {
			var newLang = Utils.lang === "en" ? "fr" : "en";

			this.router.changeLang(newLang);

			//return false so that links are not followed
			return false;
		},

		// clicked browser back forward button
		popPage: function(itemID) {
			var aPosition = Utils.getArrayFromString(itemID);
			masterStructure.targetNav = aPosition;
			masterStructure.loadTarget();
		},
		fClickedOutsideMenuNav: function() {
			//Clicked outside , so set the target as current
			masterStructure.targetNav = masterStructure.currentNav;
			masterStructure.resetNav();
			//now reset the menu
			//level.disable/enable
		},
		onResize: function() {
			this.showTopMenu();
		},
		showTopMenu: function() {
			var width = window.innerWidth
						|| document.documentElement.clientWidth
						|| document.body.clientWidth;
			//find the correct top-menu based on the width of the screen
			var $topMenu = width <= Utils.breakpoints.medium ? this.$el.find("#mb-pnl") : this.$el.find("ul.text-right");
			var settingsButtonsMap = {
				showLangSwitch: ".lang",
				showHome: ".home",
				showHelp: ".help",
				showSitemap: ".sitemap",
				showToolbox: ".toolbox",
				showGlossary: ".glossary",
				showFavorites: ".favorites",
				showResources: ".resources",
				showPrint: ".print",
				showExit: ".quit"
			};

			_.each(_.keys(settingsButtonsMap), function(key, index) {
				if (!CoreSettings[key]) {
					if(CoreSettings.editMode){
						$topMenu.find(settingsButtonsMap[key]).parent().hide();
					}else{
						$topMenu.find(settingsButtonsMap[key]).parent().remove();
					}
				} else {
					$topMenu.find(settingsButtonsMap[key]).removeClass("hide");
				}
			});
		}
	});
});
