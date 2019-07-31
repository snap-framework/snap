define([
	'logger',
	'settings-core',
	'./BaseModule',
	'modules/objSub/objSub-utils'
], function(Logger, CoreSettings, BaseModule, ObjSubUtils) {
	'use strict';
	
	return BaseModule.extend({
		initialize: function(options) {
			this.options = options || {};
			this.master=options.master;

			this.scorm = this.options.scorm;
			this.sitemapController = this.options.sitemapController;

			this.setListeners();
			this.initViewedSubs();
		},

		setListeners: function() {
			var that = this;
			$(this).on('ProgressController:updateViewed', function() {
				that.updateViewed();
			});
			$(this).on('ProgressController:updateViewCount', function() {
				that.updateViewCount();
			});
		},

		/*
		 * this method is used by LoadTarget to check if all pages from the structure were viewed
		 */
		checkViewedCompletion: function() {
			for (var i = 0; i < this.master.subs.length; i++) {
				if (!this.master.subs[i].viewed){ return false;}
			}
			return true;
		},

		updateViewed: function() {
			if (!this.master.currentSub.viewed) {
				
				//set its viewed page
				this.master.currentSub.setViewedPage();
				$(this.sitemapController).trigger("SitemapController:updateViewed", [this.master.currentSub]);

				var parentNode = this.master.currentSub.parent;
				var viewed = true;
				var originalDepth = this.master.currentSub.depth;
				if (parentNode !== null){
				// Verify if all pages were viewed from the top level menu
				while (typeof parentNode !== "undefined" && viewed && parentNode.depth >= 0) {
					if (parentNode.depth >= 0 || parentNode.depth < originalDepth) {
						viewed = parentNode.checkViewedSubs();
						if (viewed) {
							parentNode.setViewedPage();
						}
					}
					parentNode = parentNode.parent; // now go check this parent's parent
				}
				}
			}
			//trigger complete on page view
			if (CoreSettings.triggerCompletionWhenAllPagesViewed) { //CSPS-SJ && CSPS-TD	
				this.allViewed = this.checkViewedCompletion();
				if (this.allViewed) {
					this.scorm.complete();
				}
			}
			//on last, mark module as done.
			if (this.master.isLastOfLevel() < this.master.maxDepth && CoreSettings.markModuleAsViewedOnLastPage) {
				if (this.master.flatList[this.master.flatList.length-1].flatID===this.master.currentSub.flatID){
					this.master.currentSub.getTop().setViewedSubs();
				}else if(this.master.currentNav[0]!==this.master.subs[this.master.subs.length-1].aPosition[0]){
					//console.log(this.master.subs[this.master.currentSub.getTop().modnum+1].findFirst().previous.flatID+" "+this.master.currentSub.flatID)
					if(this.master.subs[this.master.currentSub.getTop().modnum+1].findFirst().previous.flatID===this.master.currentSub.flatID){
						this.master.currentSub.getTop().setViewedSubs();
					}
				}
			}
			var stringViewed = "";
			// save viewed subs in scorm	
			for (var i = 0; i < this.master.subs.length; i++) {
				stringViewed += this.master.subs[i].saveViewedSubs();
			}
			trackingObj.saveData("vp", stringViewed);
		},
		
		/*
		 * goes through the scorm object to set if viewed
		 * affect objSubs and html were viewed
         * get info from scorm object
		 */
		initViewedSubs: function() {
			var viewedList = trackingObj.getData("vp");
			var viewedObj = [];
			if (viewedList) { // if we have viewed pages/subs
				viewedList = viewedList.split(";");
				for (var i = 0; i < viewedList.length - 1; i++) {
					viewedObj = viewedList[i].split("-");
					ObjSubUtils.findSub(viewedObj).setViewedSubs(); // set viewed for objSub and html			
				}
			}
		},
		
		/*
		 * goes through the scorm object to set if viewed
		 * affect objSubs and html were viewed
		 * get info from scorm object
		 */
		updateViewCount: function() {
			Logger.log("ProgressController:updateViewCount");
			
			this.master.modCount = 0;
			this.master.totalViews = 0;
			for (var modLoop = 0; modLoop < this.master.subs.length; modLoop++) {
				if (!this.master.subs[modLoop].isPage) {
					this.master.modCount++;
					this.master.subs[modLoop].viewCount = 0;
					this.master.subs[modLoop].totalPages = 0;
				}
			}

			for (var flatLoop = 0; flatLoop < this.master.flatList.length; flatLoop++) {
				//console.log(this.master.flatList[flatLoop].aPosition[0])

				// causing problem when aPosition is a module greater than 9 (string with lenght = 2)
				//var topMod = ObjSubUtils.findSub(String(this.master.flatList[flatLoop].aPosition[0]));
				var tab = [];
				tab.push(this.master.flatList[flatLoop].aPosition[0]);
				var topMod = ObjSubUtils.findSub(tab);
				
				if (topMod) {
					topMod.totalPages++;
					if (this.master.flatList[flatLoop].viewed) {
						topMod.viewCount++;
						this.master.totalViews++;
					}
				}
			}
		}
	});	
});