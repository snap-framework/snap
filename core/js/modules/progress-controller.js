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

			this.scorm = this.options.scorm;
			this.sitemapController = this.options.sitemapController;

			this.setListeners();
			this.initViewedSubs();
		},

		setListeners: function() {
			var that = this;
			$(this).on('ProgressController:updateViewed', function(e) {
				that.updateViewed();
			});
			$(this).on('ProgressController:updateViewCount', function(e) {
				that.updateViewCount();
			});
		},

		/*
		 * this method is used by LoadTarget to check if all pages from the structure were viewed
		 */
		checkViewedCompletion: function() {
			for (var i = 0; i < masterStructure.subs.length; i++) {
				if (!masterStructure.subs[i].viewed) return false;
			}
			return true;
		},

		updateViewed: function() {
			if (!masterStructure.currentSub.viewed) {
				//set its viewed page
				masterStructure.currentSub.setViewedPage();

				$(this.sitemapController).trigger("SitemapController:updateViewed", [masterStructure.currentSub]);

				var parentNode = masterStructure.currentSub.parent;
				var viewed = true;
				var originalDepth = masterStructure.currentSub.depth;
				// Verify if all pages were viewed from the top level menu
				while (typeof parentNode != "undefined" && viewed && parentNode.depth >= 0) {
					if (parentNode.depth >= 0 || parentNode.depth < originalDepth) {
						viewed = parentNode.checkViewedSubs();
						if (viewed) {
							parentNode.setViewedPage();
						}
					}
					parentNode = parentNode.parent; // now go check this parent's parent
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
			if (masterStructure.isLastOfLevel() < masterStructure.maxDepth && CoreSettings.markModuleAsViewedOnLastPage) {
				if (masterStructure.flatList[masterStructure.flatList.length-1].flatID==masterStructure.currentSub.flatID){
					masterStructure.currentSub.getTop().setViewedSubs();
				}else if(masterStructure.currentNav[0]!=masterStructure.subs[masterStructure.subs.length-1].aPosition[0]){
					//console.log(masterStructure.subs[masterStructure.currentSub.getTop().modnum+1].findFirst().previous.flatID+" "+masterStructure.currentSub.flatID)
					if(masterStructure.subs[masterStructure.currentSub.getTop().modnum+1].findFirst().previous.flatID==masterStructure.currentSub.flatID){
						masterStructure.currentSub.getTop().setViewedSubs();
					}
				}
			}
			var stringViewed = "";
			// save viewed subs in scorm	
			for (var i = 0; i < masterStructure.subs.length; i++) {
				stringViewed += masterStructure.subs[i].saveViewedSubs();
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
			
			masterStructure.modCount = 0;
			masterStructure.totalViews = 0;
			for (var modLoop = 0; modLoop < masterStructure.subs.length; modLoop++) {
				if (!masterStructure.subs[modLoop].isPage) {
					masterStructure.modCount++;
					masterStructure.subs[modLoop].viewCount = 0;
					masterStructure.subs[modLoop].totalPages = 0;
				}
			}

			for (var flatLoop = 0; flatLoop < masterStructure.flatList.length; flatLoop++) {
				//console.log(masterStructure.flatList[flatLoop].aPosition[0])

				// causing problem when aPosition is a module greater than 9 (string with lenght = 2)
				//var topMod = ObjSubUtils.findSub(String(masterStructure.flatList[flatLoop].aPosition[0]));
				var tab = [];
				tab.push(masterStructure.flatList[flatLoop].aPosition[0])
				var topMod = ObjSubUtils.findSub(tab);
				
				if (topMod) {
					topMod.totalPages++;
					if (masterStructure.flatList[flatLoop].viewed) {
						topMod.viewCount++;
						masterStructure.totalViews++;
					}
				}
			}
		}
	});	
});