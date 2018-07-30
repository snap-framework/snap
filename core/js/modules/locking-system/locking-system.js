define([
    'underscore',
	'jquery',
	'utils',
	'logger',
    '../BaseModule',
    'settings-core',
    'modules/objSub/objSub-utils'
], function(_, $, Utils, Logger, BaseModule, CoreSettings, ObjSubUtils) {
	'use strict';
	
	return BaseModule.extend({
		initialize: function(options) {
			Logger.log("INIT: Locking Sytem");

			this.setListeners();
		},

		setListeners: function() {
			var that = this;
			$(this).on('LockingSystem:lockPage', function(e, target) {
				that.lockPage(target);
			});
			$(this).on('LockingSystem:unlockPage', function(e, target) {
				that.unlockPage(target);
			});
		},

		onPageLoaded: function() {
			var gettingData = trackingObj.getData("lockList");
			//gettingData="m2-3,m3-3";
			if (typeof gettingData === "undefined") {
				//clear table, nothing entered
				this.lockList = this.updateLockList();
			} else {
				Logger.log("trackingObj loaded");
				//get the array from trackingObj
				var aLockList = gettingData.split(",");
				//update the list
				this.lockList = this.updateLockList(aLockList);
			}
			// check the Allowexit flag
			if(CoreSettings.persistentLockedIn){
				if(masterStructure.allowedLockedInExit)	masterStructure.allowedLockedInExit = false;
			}			
		},

		//checks whats currently locked (class) and refreshes our memory.
		updateLockList: function(updatedList) {
			var lockList = [];

			var modulesLocked = [];
			for (var subLoop = 0; subLoop < masterStructure.subs.length; subLoop++) {
				if (!masterStructure.subs[subLoop].isPage) {
					modulesLocked[modulesLocked.length] = masterStructure.subs[subLoop];
				}
			}
			modulesLocked = this.checkLockLoop(modulesLocked, lockList, updatedList);

			var pagesLocked = this.checkLockLoop(masterStructure.flatList, lockList, updatedList);

			lockList = modulesLocked.concat(pagesLocked);
			lockList.sort();
			lockList = _.uniq(lockList);

			trackingObj.saveData("lockList", lockList.toString());
			trackingObj.syncData();

			return lockList;
		},

		// send a collection of objects to check for loops
		//collection is the list of all pages or all modules		
		//lockList is the new list being populated
		//updatedList is the saveObj
		checkLockLoop: function(collection, lockList, updatedList) {
			//check locked modules
			for (var i = 0; i < collection.length; i++) {
				if (collection[i].isLocked || collection[i].isLockedIn) {
					//lets check if it's still in memory
					if (typeof updatedList != "undefined") {
						//going through memory using "update"
						 var found = false;					
						 for(var j=0;j<updatedList.length && !found;j++){
							if(updatedList[j] ==collection[i].sPosition)
							found=true;
						}
						//is this sub still locked?
						if (found) {
							//this sub should stay locked;
							lockList[lockList.length] = collection[i].sPosition;
						} else {
							//lockList.splice(_.indexOf(this.lockList, "m1-1-1"), 1);
							//unlock this sub
							if (collection[i].isLocked) {
								collection[i].unlock();
							} else if (collection[i].isLockedIn) {
								//if(!CoreSettings.persistentLockedIn)
									collection[i].unlockIn();
							}
						}
					} else {
						lockList[lockList.length] = collection[i].sPosition;
					}
				}
			}
			return lockList;
		},

		isSoftLocked: function() {
			//Check if locked, confirm if user really wants leave
			if (masterStructure.isSoftLocked) {
				var lockCheck = confirm(labels.nav.isSoftLockedMessage);
				masterStructure.isSoftLocked = !lockCheck;
			}
			return masterStructure.isSoftLocked;
		},

		/**
		 * handles the locking status of the current page and targeted page
		 * @param  {[object]}  subObj: the page
		 * @return {Boolean}
		 */
		isLocked: function(sPosition) {			
			//checks whether the current page is locked or the entire section is locked 
			var targetSub = ObjSubUtils.findSub(sPosition);
			return !!(targetSub && (targetSub.isLocked || targetSub.getTop().isLocked));
		},

		isLockedIn: function(sPosition) {
			//checks whether the current page is lockedin or the entire section is lockedin
			var targetSub = ObjSubUtils.findSub(sPosition);
			return !!(targetSub && (targetSub.isLockedIn || targetSub.getTop().isLockedIn));
		},

		/**
		 * locks a specific page
		 * 	called without params: locks current page (lockedin)
		 * 	called with target param: locks target page
		 * 	called with 1 boolean param:
		 * 		will softLock current page.
		 * 		This will lock the user inside the current page.
		 * @param  {String} target   	[module's page name]
		 * @param  {Boolean} softLock [soft lock current page]
		 */
		lockPage: function(target, softLock) {
			//if we have only one argument, and it is a boolean,
			//means that we are trying to softLock
			//we need this since we are not supporting ES6's default param value feature :( 
			if (typeof target === 'boolean' && arguments.length === 1) {
				softLock = target;
			}
			//if softLock is provided, block user from going anywhere else
			if (softLock) {
				masterStructure.isSoftLocked = true;
				return;
			}
			target = target || masterStructure.currentSub;
			var subToLock = ObjSubUtils.findSub(Utils.getArrayFromString(target));
			subToLock.lock();
			//grab all the elements from menu and sitemap, and lock them
			$('[data-target='+target+'], [data-position='+target+']').addClass('locked');

			this.lockList = this.updateLockList();

			$(this).trigger('Navigation:refreshNavState');
			$(this).trigger('AdminMode:addUnlocks');
		},
		/**
		 * unlocks a specific page
		 * 	called without params: unlocks current page (lockedin)
		 * 	called with target param: unlocks target page
		 * 	called with 1 boolean param:
		 * 		will remove softLock from current page.
		 * @param  {String} target   	[module's page name]
		 * @param  {Boolean} softLock [remove soft lock of current page]
		 */
		unlockPage: function(target, softUnlock) {
			//if we have only one argument, and it is a boolean,
			//means that we are trying to softUnlock
			//we need this since we are not supporting ES6's default param value feature :( 
			if (typeof target === 'boolean' && arguments.length === 1) {
				softUnlock = target;
			}
			//if softUnlock is provided, block user from going anywhere else
			if (softUnlock) {
				masterStructure.isSoftLocked = false;
				return;
			}
			//if undefined, just take the current page
			target = target || Utils.queryString("state");
			var subToUnlock = ObjSubUtils.findSub(Utils.getArrayFromString(target));
			subToUnlock.unlock();
			//grab all the elements from menu and sitemap, and unlock them
			$('[data-target='+target+'], [data-position='+target+']').removeClass('locked');

			this.lockList = this.updateLockList();

			$(this).trigger('Navigation:refreshNavState');
			$(this).trigger('AdminMode:addUnlocks');
		},

		unlockInPage: function(target) {
			//if undefined, just take the current page
			target = target || Utils.queryString("state");

			if (CoreSettings.persistentLockedIn) {
				//set global flag
				masterStructure.allowedLockedInExit = true;
			} else {
				var subToUnlock = ObjSubUtils.findSub(Utils.getArrayFromString(target));
				subToUnlock.unlockIn();
				
				this.updateLockList();
			}
			//grab all the elements from menu and sitemap, and unlock them
			//$('[data-target='+target+'], [data-position='+target+']').removeClass('lockedin');

			$(this).trigger('Navigation:refreshNavState');
			//no need to addUnlocks here since lockedin pages
			//are not taken into account by the admin-mode yet
		}
	});
});