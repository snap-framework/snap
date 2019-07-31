define([
   'labels',
   "settings-core",
   'utils',
   'logger',
   'modules/BaseModule',
   'modules/objSub/objSub-utils'
], function(labels, CoreSettings, Utils, Logger, BaseModule, ObjSubUtils) {
   'use strict';

   var pageName = "index";

   return BaseModule.extend({
      initialize: function(options) {
         this.options = options;
         this.lockingSystem = this.options.lockingSystem;
      },
      addPageToHistory: function(itemID) {
         History.pushState({
            _index: History.getCurrentIndex()
         }, document.title, pageName + "_" + Utils.lang + ".html?state=" + itemID);
      },

      changePage: function(itemID) {
            var isLockedIn = masterStructure.allowedLockedInExit
                          ? false
                          : CoreSettings.enableLockingSystem
                          ? this.lockingSystem.isLockedIn(masterStructure.currentNav)
                          : null;
                          
         if (isLockedIn) {
			 
             //locked in, CANCEL EVERYTHING
            alert(labels.nav.lockedIn);
            return false;

			 
         }
			 if(masterStructure.isSoftLocked){
				 
				 if(!confirm(labels.nav.isSoftLockedMessage)){
					 return false;
				 }
				 masterStructure.isSoftLocked=false
			 }

         var currentPos = masterStructure.currentSub.sPosition;
         //don't change page if target is the current one
         if (itemID !== currentPos) {
            var aPosition = Utils.getArrayFromString(itemID);
            var isLocked = CoreSettings.enableLockingSystem ? this.lockingSystem.isLocked(aPosition) : null;
            if (isLocked ) {
               //locked out
               alert(labels.nav.lockedOut);
               return false;
            } else {
               if (itemID.indexOf("lvl") == -1) {
                  //this is a SUB
                  masterStructure.targetNav = aPosition;
                  masterStructure.loadTarget();
                  // verify if we are loading content

                  if (ObjSubUtils.findSub(aPosition).isPage) {
                     this.addPageToHistory(itemID); // CSPS add page to history sc     
                  }
               }
               return false;
            }
         }
      },

      prepareLoadPage: function() {
         //close popup if any, then show loading box
         $.magnificPopup.close();
      },
      loadPage: function(params) {   
     
         var that = this;
         var scriptPath = params.scriptPath || "";
         var pagePath = params.pagePath || "";
         var subIsMissing = params.isMissing || false;

         var context = masterStructure.firstPageLoad ? '' : 'main';
         
         //200ms equals to the transition duration in wet.scss
         var loadDelay = $.magnificPopup.instance.isOpen ? 200 : 0;
         
         this.prepareLoadPage();

         _.delay(function() {
            Utils.showLoadingBox(function() {
				$("html").removeClass("page404");
               $(that).trigger('Router:loadPage');
               
               //unload the page
               /*CSPS-TD ↓ */
               window.fQsEventDispatcher = null;
               /* ↑ CSPS-TD*/
				if(CoreSettings.editMode){subIsMissing=false;}
               if (!subIsMissing) {
                  var targetDiv = (masterStructure.loadAllMode) ? masterStructure.loadAllPlace() : CoreSettings.contentContainer;
                  $(targetDiv).load(pagePath, function(response, status, xhr) {
                     //did the load succeed or fail?
                     var success = (status != 'error');
                     if (!success) {
                        masterStructure.loadFailed(xhr);
                     }
                     //checks for override on require loading a script for every page
                     if(CoreSettings.requireLoadPageScript){
                     
                        //look for JS file with same name without language if any
                        //NOTE: js files that do not follow AMD will still be loaded
                        //      but not interpreted as a "module".
                        //      JS files loaded through require are loaded once and cached.
                        require([scriptPath], function(module) {
                           var urlsFetched = Object.keys(require.s.contexts._.urlFetched);
                           //get the last one fetched
                           var lastFetched = urlsFetched[urlsFetched.length-1];
                           Logger.log("Custom JS file: " + lastFetched + " initialize");
                           
                           //script has been found, load it!
                           if (_.isFunction(module)) {
                              new module();
                           }

                           masterStructure.loadSuccessful();
                           $(that).trigger('Navigation:refreshNavState');
                        }, function(error) {

                           //no JS file found or no define found inside JS file,
                           //too bad! Life goes on.
                           //It could be any error, from syntax to not found errors.
                           //So pass it to the logger, and it will filter.
                           Logger.error(error.stack);

                           //still a successful load since the html has been loaded
                           masterStructure.loadSuccessful();
                           $(that).trigger('Navigation:refreshNavState');
                        });
                     }else{
                        //still a successful load since the html has been loaded
                        masterStructure.loadSuccessful();
                        $(that).trigger('Navigation:refreshNavState');
                     }
                  });
               } else {
                  //param xhr here doesn't exist
                  //but since we already know that the sub is missing,
                  //we already went ahead and add the xhr response to the sub instead
                  //see 'Diagnosis:addMissingPage' event
                  masterStructure.loadFailed();
                  $(that).trigger('Navigation:refreshNavState');
               }
            }, context);
         }, loadDelay);
      },

      // replace history
      replacePage: function(page) {                  
         History.replaceState(null, document.title, pageName + "_" + Utils.lang + ".html?state=" + page);         
      },

      changeLang: function(newLang) {
         if (this.lockingSystem.isSoftLocked()) {
            return false;
         } //Intercept if page is locked
         window.amINavigating = true;
         var currentState = Utils.queryString("state");

         // log the current state language page 
         window.location.href = pageName + "_" + newLang + ".html?state=" + currentState;
         History.replaceState(null, document.title, pageName + "_" + newLang + ".html?state=" + currentState);
      }
   });
});
