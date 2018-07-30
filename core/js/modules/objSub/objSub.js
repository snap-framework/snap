define([
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'modules/objSub/objSub-utils',
	'modules/toolbox/favorites/favorite-list'
], function(labels, CoreSettings, Utils, BaseModule, ObjSubUtils, FavoriteList) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;
			this.depth = this.options.depth;

			this.router = options.router;

			//place the sub inside a 2D hierarchy (everything under its level)
			this.parentLevel = this.options.parentLevel;

			this.title = this.$el.text();
			//get the (formerly ID)data-target position as a string
			this.sPosition = this.$el.attr("data-target");
			//mobile equiv
			this.mbObj = $(".mb-menu").find("a[data-target='" + this.sPosition + "']");
			//get the ID or whatever M01S01P01 and set it as an array
			this.aPosition = Utils.getArrayFromString(this.sPosition);
			// prepare for the eventual subs
			this.subs = [];
			this.aFav = [];
			this.active; //flag to tell if active or not
			this.isMissing = false;
			this.isPage = (this.$el.attr("href") == "#") ? false : true;
			this.isLastOf; // lvl de depth qu'il est last of
			this.completed = false;
			this.viewed = false; // CSPS SC added to ckeck page/modules visited
			this.moduleStatus = "unattempted";
			this.next; // reference in flatList to next page;
			this.previous; // reference in flatList to previous page;
			this.totalViews; //total number of views. must be dyn populated
			this.activitiesSubs = []; //points to subs of activity type
			this.quizSubs = []; //points to subs of activity type
			this.aBugs = [];
			this.aTypesScanned = [];
			this.totalPages; //number of pages;
			this.viewCount;
			this.isLocked;

			//initialize the favoriteList constructor so that we can trigger events later on
			new FavoriteList({objSub: this});

			//this is a function to call when all is created.
			this.nest();

			if (this.isQuiz()) {
				if (this.depth > 1) {
					this.parent.parent.addQuiz(this);
				}
				this.parent.addQuiz(this);
			}

			if (this.isActivity()) {
				if (this.depth > 1) {
					this.parent.parent.addActivity(this);
				}
				this.parent.addActivity(this);
			}
			this.checkLockPage();
			//this.updateLockPages();
		},

		/*
		 * @return string of viewed subs for this sub
		 */
		saveViewedSubs: function() {
			var stringViewed = "";
			if ((!this.isPage && this.viewed) || this.isPage && this.viewed)
				return this.aPosition.join("-") + ";"; // we can stop here we know all under were viewed

			for (var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++) {
				if (this.subs[childSubsCounter].viewed) {
					if (this.subs[childSubsCounter].isPage) {
						stringViewed += this.subs[childSubsCounter].aPosition.join("-") + ";";
					} else {
						stringViewed += this.subs[childSubsCounter].aPosition.join("-") + ";"; // we can stop here we know all under were viewed
					}

				} else { // continue with child subs to see if viewed
					if (!this.subs[childSubsCounter].isPage) {
						stringViewed += this.subs[childSubsCounter].saveViewedSubs();
					}
				}
			}
			return stringViewed;
		},

		/*
		 * goes through each child of a sub and set viewed affect ojbSub and html
		 */
		setViewedSubs: function() {
			//set current object to viewed
			this.setViewedPage();
			for (var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++) {
				if (this.subs[childSubsCounter].isPage) {
					this.subs[childSubsCounter].setViewedPage();
				} else {
					this.subs[childSubsCounter].viewed = true; //update the object
					this.subs[childSubsCounter].setViewedSubs();
				}
			}
		},

		/*
		 * goes through each child of a sub and set viewed affect ojbSub and html
		 */
		setViewedPage: function() {
			//ne pas faire viewed si c'est déjà fait.
			if (!this.$el.hasClass("viewed") ){
				this.$el.addClass('viewed'); // CSPS SJ add class without using ID
				var invViewed = "<span class=\"wb-inv\">(" + labels.nav.viewed + ")</span>";
				this.$el.append(invViewed); //CSPS SJ added to add accessible text.
				$(this.mbObj)
					.addClass('viewed') // CSPS SJ add class without using ID
					.append(invViewed); //CSPS SJ added to add accessible text.			
				if (this.viewed != true) {
					this.viewed = true; // CSPS update the flatList		
				
					//set the module as attempted
					var topModule = ObjSubUtils.findSub([this.aPosition[0]]);
					if (topModule.moduleStatus == "unattempted") {
						topModule.moduleStatus = "attempted";
						topModule.$el.addClass("attempted");
					}
				}
			}
		},

		checkViewedSubs: function() {
			var viewed = true;
			for (var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++) {
				// is this sub a page
				if (this.subs[childSubsCounter].isPage) {

					if (!this.subs[childSubsCounter].viewed) {
						viewed = false; //at least one page was not viewed						
					}
				} else { // this is not a page but a level
					if (!this.subs[childSubsCounter].viewed) {
						viewed = this.subs[childSubsCounter].checkViewedSubs(); // recall to check with child subs
						if (!viewed) {
							viewed = false; //at least one page was not viewed
						} else { // this sub and its children were all viewed
							this.subs[childSubsCounter].setViewedPage();
							//viewed = true && viewed; // make sure it stays false if one page or level was not seen
						}
					}
				}
			}
			return viewed;
		},

		/*
		 * place the sub inside a 3D hierarchy 
		 * (master > Module > Section > Page)
		 */
		nest: function() {
			if (this.depth == 0) { //if this item is a module (depth 0)
				masterStructure.subs[masterStructure.subs.length] = this;
			} else {
				//find the parent within the previous level 
				//aNewLevel is the previous depth's level (if this is in a section, it contains all the modules
				// if it is in a page, it contains all the sections.
				var aNewLevel = masterStructure.levels[this.depth - 1].subs;
				for (var i = 0; i < aNewLevel.length; i++) {
					var toCheck = masterStructure.levels[this.depth - 1].subs[i];
					// Need to compare with the number
					if (Utils.compareArrayDepth(this.aPosition, toCheck.aPosition)) {
						//make the connection!
						this.parent = toCheck;
						//add Aria dependancy
						this.parent.$el.attr("aria-controls", "nav" + (this.depth + 1));
						//yes, son.
						toCheck.subs[toCheck.subs.length] = this;
					}
				}
			}
		},
		checkLockPage:function(){
			
			if(this.$el.hasClass('locked') && CoreSettings.enableLockingSystem)
				this.isLocked = true;
			else this.isLocked = false;

			if(this.$el.hasClass('lockedin') && CoreSettings.enableLockingSystem)
				this.isLockedIn = true;
			else
				this.isLockedIn = false;
		},
		
		//this checks and updates the subs isLocked and isLockedIn property to true
		updateLockPages: function() {
			var flatList = masterStructure.flatList;
			for (var i = 0; i < flatList.length; i++) {
				flatList[i].isLocked = flatList[i].$el.hasClass('locked');
				flatList[i].isLockedIn = flatList[i].$el.hasClass('lockedin');
			}
		},

		lock: function() {
			this.$el.addClass("locked");
			this.isLocked = true;
		},

		unlock: function() {
			this.$el.removeClass("locked");
			this.isLocked = false;
		},

		lockIn: function() {
			this.$el.addClass("lockedin");
			this.isLockedIn = true;
		},

		unlockIn: function() {					
			this.$el.removeClass("lockedin");			
			this.isLockedIn = false;
		},

		getTop: function() {
			var obj = this;
			var flag = false;
			while (flag != true) {
				//is obj the top?
				if (obj.depth == 0) {
					flag = true;
					return obj;
				} else {
					obj = obj.parent;
				}
			}
		},

		/*
		 * goes through next level, disables everything and re-enable all pertinent ones.
		 */
		activateSubs: function() {
			this.enable();
			if (!this.isPage) { //if it'S a standard sub
				//for each level
				for (var lvlLoop = this.depth + 1; lvlLoop < masterStructure.levels.length; lvlLoop++) {
					//loop from next level til the last level.
					if (lvlLoop < masterStructure.levels.length - 1) {
						//disable the next level
						masterStructure.levels[lvlLoop + 1].disable();
					}
					//hide everything in next Levels
					masterStructure.levels[lvlLoop].hideSubs();
					//show related things in the next levels
					masterStructure.levels[lvlLoop].showArray(this.aPosition);
				}
			} //else { //this is a PAGE }
			//change the title
			this.parentLevel.setTitle(this.title);
			//enable the next level now that it's done being messed with
			masterStructure.levels[this.depth + 1].enable();
			masterStructure.levels[this.depth + 1].resetTitle();
			//set the focus to the next menu element
			masterStructure.levels[this.depth + 1].$el.trigger(cspsWetMenu.focusEvent);
			$($(".mb-menu").children("li").eq(this.depth + 1)).find("summary").trigger("click") //(cspsWetMenu.focusEvent)
				// SET FOCUS ON FIRST ELEMENT.next("ul").find("a[aria-hidden!='true']:first")
				.trigger("setfocus.wb");
		},

		/*
		 * retrofix is to fix the menu when an element is selected 
		 * from outside the menu (loading a page from the content
		 * for example, so gotta update the menu, hide all the unwanted elements.
		 */
		retroFix: function() {
			if (this.depth > 0) {
				for (var lvlLoop = 1; lvlLoop <= this.depth; lvlLoop++) {
					masterStructure.levels[lvlLoop].hideSubs();
					masterStructure.levels[lvlLoop].showArray(this.aPosition.slice(0, lvlLoop));
				}
			}
		},

		/*
		 * enable and show subs 
		 */
		enable: function() {
			// show and aria
			this.$el.parent().show().attr("aria-hidden", "false");
			$(this.mbObj).parent().show().attr("aria-hidden", "false");
		},

		/*
		 * disable and hide subs 
		 */
		disable: function() {
			//hide in main version and aria hidden true
			this.$el.parent().hide().attr("aria-hidden", "true");
			$(this.mbObj).parent().hide().attr("aria-hidden", "true");
		},

		/*
		 * @return the html path of a sub
		 */
		pagePath: function() {
			var contentfolder = "content";
			var moduleFolder = "module" + this.aPosition[0];
			var loadContent = contentfolder + "/" + moduleFolder + "/" + this.sPosition + "_" + Utils.lang  + ".html";
			return loadContent;
		},
		
		/*
		 * @return the script path of a sub
		 */
		scriptPath: function() {
			var contentfolder = "content";
			var moduleFolder = "module" + this.aPosition[0];
			var loadContent = contentfolder + "/" + moduleFolder + "/" + this.sPosition  + ".js";
			return loadContent;
		},

		/*
		 * @return the first page.
		 */
		findFirst: function() {
			if (this.isPage) {
				return this;
			} else {
				return this.subs[0].findFirst();
			}
		},	

		upSomeLevels: function(countdown) {
			if (countdown == 0) {
				return this;
			} else {
				return this.parent.upSomeLevels(countdown - 1);
			}
		},

		/*
		 * this is to assign a numeric value to a sub for the purpose of sorting it.
		 */
		getNumeric: function() {
			var numeric = 0;
			var multiplyer = 0;
			var position = 0;

			for (var loop = 0; loop < this.aPosition.length; loop++) {
				multiplyer = Math.pow(10, ((masterStructure.maxDepth - loop) * 3));
				position = this.aPosition[loop];
				numeric += position * multiplyer;
			}

			return (numeric);
		},

		/*
		 * this method assigns "aria set" values to children subs
		 * this would be better if it were recursive, but it'll do for now.
		 */
		setChildrenAria: function() {
			if (this.subs.length > 0) {
				for (var subLoop = 0; subLoop < this.subs.length; subLoop++) {
					this.subs[subLoop].$el.attr("aria-posinset", (subLoop + 1));
					this.subs[subLoop].$el.attr("aria-setsize", (this.subs.length));
				}
			}
		},

		/*
		 * this method checks the settings if there are breadcrumbs and loads them
		 */
		loadBreadCrumbs: function() {
			var bread = "";
			var currentObj = this;
			for (var i = this.depth; i > 0; i--) {
				currentObj = currentObj.parent;
				bread = currentObj.title + " " + labels.nav.breadSeparator + " " + bread;
			}
			$(".breadcrumb").html(bread);
		},

		isQuiz: function() {
			return this.$el.hasClass("csps-quiz");
		},
		isActivity: function() {
			return this.$el.hasClass("csps-activity");
		},
		isIntro: function() {
			return this.$el.hasClass("csps-intro");
		},

		viewCount: function() {
			var viewedCount = 0;
			var totalPages = 0;
			var dpt = this.depth;
			for (var page = 0; page < masterStructure.flatList.length; page++) {
				checkingPage = masterStructure.flatList[page];
				if (checkingPage.aPosition[dpt] == this.aPosition[dpt] && !checkingPage.isIntro()) {

					//if this is a relevant page (because we're going through all pages.
					totalPages++;
					viewedCount += (checkingPage.viewed) ? 1 : 0;
				}
			}
			this.totalViews = viewedCount;
			this.totalPages = totalPages;

			return viewedCount;
		},
		addQuiz: function(child) {
			this.quizSubs[this.quizSubs.length] = child;
		},
		addActivity: function(child) {
			this.activitiesSubs[this.quizSubs.length] = child;
		},

		generateProgress: function(targetObj) {
			// check first if initialized
			if(this.totalPages == undefined){
				masterStructure.progressController.updateViewCount();
			}
			//aller chercher les views et le total
			
			var totview = this.viewCount;
			var totalPages = this.totalPages;
			var percent = Math.round(totview / totalPages * 100);
			//un peu d'accessibilité
			var span = "<span class=\"wb-inv\">" + percent + "%</span>";
			//on intèggre
			var baseHTML = "<progress class=\"progress-bar\" value=\"" + totview + "\" max=\"" + totalPages + "\" aria-label=\""+labels.nav.progressBar+"\">" + span + "</progress>";
			$(targetObj).html(baseHTML);
		},


		/*
		 * this method loads this sub's target pagePath in the proper
		 * div (dynamic_content) and then activates isLoaded.
		 */
		loadPage: function() {
			var that = this;
			if (this.isPage) {
				this.router.loadPage({
					scriptPath: this.scriptPath(),
					pagePath: this.pagePath(),
					isMissing: this.isMissing
				});
			}
		}
	});
});