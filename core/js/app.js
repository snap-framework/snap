define([
	'underscore',
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'logger',
	'history',
	'router',
	'legacy',
	'modules/micro-learning/micro-learning',
	'modules/scorm/scorm-controller',
	'modules/data-controller',
	'plugins/regular',
	'modules/locking-system/locking-system',
	'modules/objNiveau',
	'modules/objSub/objSub',
	'modules/objSub/objSub-utils',
	'modules/print/print-controller',
	'modules/mobile/mobile-interactions',
	'modules/admin-mode/admin-mode',
	'modules/navigation/navigation',
	'modules/help/help-controller',
	'modules/sitemap/sitemap-controller',
	'modules/toolbox/resources-manager',
	'modules/toolbox/toolbox',
	'modules/toolbox/glossary',
	'modules/toolbox/resources',
	'modules/toolbox/favorites/favorite-controller',
	'modules/progress-controller',
	'modules/google-analytics/google-analytics-controller',
	'modules/matomo-analytics/matomo-analytics-controller',
	'popper/browserstate',
	'popper/browsercloseeventscript'

], function (_, $, labels, CoreSettings, Utils, Logger, History, Router, Legacy, MicroLearning, ScormController, DataController, Regular, LockingSystem, ObjNiveau, ObjSub, ObjSubUtils, PrintController, MobileInteractions, AdminMode, Navigation, HelpController, SitemapController, ResourcesManager, Toolbox, Glossary, Resources, FavoriteController, ProgressController, googleAnalytics, matomoAnalytics, BrowserState, CloseScript) {
	'use strict';

	/*---------------------------------------------------------------------------------------
										  NavStructure
	---------------------------------------------------------------------------------------									  
			COMMENTS:
	---------------------------------------------------------------------------------------*/
	function navStructure() {
		this.version = "2.0.4";
		this.WETversion = "4.0.37";
		this.levels = []; //=new ObjNiveau(0, this)
		this.menuHtml; //this is the jquery object for the menu (UL.supermenu) from ajax/supermenu_en.html
		this.maxDepth; //number of levels total
		this.subs = []; //this is where we'll stick sub elements (li's in the menu)
		this.flatList = []; //this is the list of all page objects (subs that lead to an actual page)
		this.currentNav = []; //array of current position
		this.currentSub; //sub that's currently loaded

		this.targetNav = []; // this is the array of a page that is to be loaded
		this.isSoftLocked = false; //specifies if navigation is locked (lockPage() || unlockPage())

		this.firstPageLoad;

		/*--------------------------------------------------------------------------------
							METHODS of NavStructure
		---------------------------------------------------------------------------------*/
		/*
		 * populate the structure, generate all subobjects
		 * reading the menuHTML, set the maxdepth, then loop through
		 * all the levels, create all the lvl and sub objects and set 
		 * the relations between them, then add them to flatList.
		 */
		//Method to populate the structure, generate subobjects
		this.populate = function () {
			//CSPS-KR
			//add to global namespace for now. 
			//Init Scorm
			if (CoreSettings.connectionMode === "scorm") {

			} else {
				this.scorm = null;
			}
			this.initTracking();

			this.initLockingSystem();

			this.router = new Router({
				lockingSystem: this.lockingSystem
			});

			//go get the information as it is in the supermenu once Wet did its thing.
			this.initSupermenuInfo();
			//delete what's not supposed to be!
			$(".destroy").parent().remove();
			if (CoreSettings.removeFooter) {
				$("#wb-info").remove();
			}
			//if (!CoreSettings.addSpinner) { $(".spinner").remove(); }
			//since the list is populated in 2D (lvl 1, then lvl2, etc, so it would go m1, m8, and then m2-1 and so on.
			this.reorderFlatList();
			//initialize menubar
			this.initMenuBar();
			if (!CoreSettings.showSupermenu) {
				$(".supermenu.menu").hide(); // or remove?
			}

			this.initModules();

			this.initEvents();

			//identifies that this is the first page loading.
			this.firstPageLoad = true;
			//fresh start, history load or bookmark load?
			this.getFirstPage();
			//load it!
			this.loadTarget();
			//everything that's wrong with our WET-FrameWork couple
			this.initPostWetFixes();
			//Initialize Editor (LEARNOMATIC)
			this.initEditor();
		};

		this.initTracking = function () {
			//Init DataController
			this.scorm = window.scorm = new ScormController();
			//CSPS-KR add to global namespace for now since it is used everywhere
			window.trackingObj = new DataController({
				scorm: this.scorm
			});

			if (scorm.getLessonStatus() === "not attempted") {
				scorm.incomplete();
			}
		};

		this.initModules = function () {
			var that = this;
			if (CoreSettings.enableMicroLearning) {
				//Prepare the stage for the microLearning feature
				//this needs to be applied asap in the loading sequence.
				//This actually fixes a visual bug when the spinner is shown,
				//and that the content is displayed under;
				//there will be a small lapse where a scrollbar will be visible,
				//and then quickly hidden. This make sure that overflow: hidden; on html element
				$('html').addClass('microLearning');
			}

			this.navigation = new Navigation({
				router: this.router,
				lockingSystem: this.lockingSystem
			});
			//CSPS-KR add to global namespace since it is used in html pages
			//keep fNav naming for legacy purposes
			window.changePage = window.fNav = _.bind(this.navigation.changePage, this.navigation);
			//add to global namespace since it is used in wet-boew.js
			window.fClickedOutsideMenuNav = _.bind(this.navigation.fClickedOutsideMenuNav, this.navigation);
			if (CoreSettings.enableAdminMode) {

				this.adminMode = new AdminMode({
					scorm: this.scorm,
					navigation: this.navigation,
					lockingSystem: this.lockingSystem,
					masterStructure: that
				});
			}

			if (CoreSettings.trackAllPages) {
				this.progressController = new ProgressController({
					scorm: this.scorm,
					sitemapController: this.sitemapController,
					master: this
				});
			}
		};

		this.initEvents = function () {
			var that = this;
			$(window).on("Framework:systemInfo", function () {
				return {
					version: that.version,
					WETversion: that.WETversion,
					debug: CoreSettings.debugMode,
					editMode: CoreSettings.editMode,
					connectionMode: CoreSettings.connectionMode,
					scormInfo: {
						status: that.scorm.status
					}
				};
			});
		};

		this.initLockingSystem = function () {
			if (CoreSettings.enableLockingSystem) {
				//init LockingSystem
				this.lockingSystem = new LockingSystem();
				//CSPS-KR: Add to global namespace since it is used throughout the app
				this.isLocked = this.lockingSystem.isLocked;
				//CSPS-KR: allow global use so that we can control the access
				//			  of pages inside a course 
				window.lockPage = _.bind(this.lockingSystem.lockPage, this.lockingSystem);
				window.unlockPage = _.bind(this.lockingSystem.unlockPage, this.lockingSystem);
				window.unlockInPage = _.bind(this.lockingSystem.unlockInPage, this.lockingSystem);
			}
		};

		/**
		 * Used in order to create the micro-learning feature 
		 * that is a clone of the supermenu's current module's pages
		 * and populate them in the DOM.
		 * Also sets up the navigation on the left or right side
		 * depending on the settings.
		 * The entire course becomes a one pager for each module.
		 */
		this.initMicroLearning = function () {
			var settings = CoreSettings.MicroLearning;
			if (this.isFirstPage()) {
				if (this.microLearning) {
					$(this.microLearning).trigger("MicroLearning:destroy");
				}
				return;
			}

			this.microLearning = new MicroLearning({
				router: this.router
			});
		};

		/**
		 * used to be under populate gathers menu information
		 */
		this.initSupermenuInfo = function () {
			var that = this;
			this.menuHtml = $(".supermenu-wrapper").find("ul.supermenu");
			//mobile menu
			this.menuHtmlMb = $("#sm-pnl").find("ul.mb-menu");
			var targetNav, parentTargetNav;
			this.maxDepth = this.menuHtml.children("li").length;
			//loop through the levels
			var modnum = 0;
			var destroy;
			// roll through the levels
			for (var x = 0; x < this.maxDepth; x++) {
				//if this is the first lvl, the parent is the root structure aka this;
				//otherwise, pass the previous level as the parent
				var thisParent = (x === 0) ? this : this.levels[x - 1];
				// get title from HTML
				var thisTitle = this.menuHtml.children().eq(x).children("a").text();
				//add a level to the structure, pass its depth and parent, and obj
				this.levels[this.levels.length] = new ObjNiveau({
					depth: this.levels.length,
					parentLevel: thisParent,
					title: thisTitle,
					el: this.menuHtml.children().eq(x).children("a")
				});
				var $thisSubs = this.menuHtml.children("li").eq(x).children("ul").children("li");
				var $thisSubsMb = this.menuHtmlMb.children("li").eq(x).children("details").children("ul").children("li");

				// loop for all elements within this level
				for (var i = 0; i < $thisSubs.length; i++) {
					targetNav = $thisSubs.children().eq(i).attr("data-target");
					destroy = false;


					//if THIS is to be destroyed, do it. just not in edit mode
					if (!CoreSettings.editMode &&
						(
							$thisSubs.children().eq(i).hasClass("not-" + CoreSettings.environment) ||
							($thisSubs.children().eq(i).hasClass("only-local") && CoreSettings.environment !== "local") ||
							($thisSubs.children().eq(i).hasClass("only-prod") && CoreSettings.environment !== "prod") ||
							($thisSubs.children().eq(i).hasClass("only-public") && CoreSettings.environment !== "public")
						)
					) {

						destroy = true;
						$thisSubs.children().eq(i).addClass("destroy");

					}

					//if this object belongs to a parent that should be destroyed
					if (x > 0) {
						//if for subs beyond lvl 1
						parentTargetNav = targetNav.substr(0, targetNav.lastIndexOf("-"));
						if ($("[data-target='" + parentTargetNav + "']").hasClass("destroy")) {
							$thisSubs.children().eq(i).addClass("destroy");
							destroy = true;
						}
					}

					//don't create the sub if it should be destroyed
					if (!destroy) {
						//add click effects to object

						$thisSubs.children().eq(i).on("click", function () {
							$(that.navigation).trigger("Navigation:changePage", this.getAttribute('data-target'));
						}); //added to remove redundance in menu syntax (supermenu)
						$thisSubsMb.children().eq(i).on("click", function () {
							$(that.navigation).trigger("Navigation:changePage", this.getAttribute('data-target'));
						}); //added to remove redundance in menu syntax (supermenu)

						//Créé un nouveau Sub à l'intérieur du niveau									
						this.levels[x].subs[this.levels[x].subs.length] = new ObjSub({
							depth: x,
							parentLevel: this.levels[x],
							el: $thisSubs.children().eq(i),
							router: this.router,
							master: that,
							wetMenu: cspsWetMenu
						});
						if (this.levels[x].subs[this.levels[x].subs.length - 1].isPage) {
							//set aria-controls
							this.levels[x].subs[this.levels[x].subs.length - 1].$el.attr("aria-controls", "dynamic_content");
							//add to flatList
							this.flatList[this.flatList.length] = this.levels[x].subs[this.levels[x].subs.length - 1];
						} else {
							if (x === 0) {
								modnum++;
								this.levels[x].subs[this.levels[x].subs.length - 1].modnum = modnum;
							}
						}
					}
				}
				$("[data-id='lvl1']").html(labels.nav.defaultMenuName + "<span class='expicon glyphicon glyphicon-chevron-down'></span>");

			}
		};

		/*
		 * flatList is generated in a 2D manner
		 * (all the pages inLevel 1, then all the pages in Level 2, etc)
		 * this method is to reorganize them all.
		 */
		this.reorderFlatList = function () {
			var newList = [];

			if (CoreSettings.enableMicroLearning) {
				//since the micro-learning only works with modules and doesn't understand pages,
				//we need to filter out dupplicates data-targets from the supermenu (without touching it)
				//get unique data-target items, that will correspond to the module
				this.flatList = _.uniq(this.flatList, function (x) {
					return x.sPosition;
				});
			}
			for (var i = 0; i < this.flatList.length; i++) {
				newList[i] = this.flatList[i];
			}
			newList.sort(function (a, b) {
				return a.getNumeric() - b.getNumeric();
			});

			for (var x = 0; x < this.flatList.length; x++) {
				this.flatList[x] = newList[x];
				this.flatList[x].flatID = x;
				//check if first, do the previous
				if (x === 0) {
					this.flatList[x].previous = null;
				} else {
					this.flatList[x].previous = this.flatList[x - 1];
					if (x === this.flatList.length - 1) {
						this.flatList[x - 1].next = this.flatList[x];
						this.flatList[x].next = null;
					} else {
						this.flatList[x - 1].next = this.flatList[x];
					}
				}
			}
		};

		/*
		 * used to be under populate, sets the aria of the menu.
		 */
		//now since the hierarchy is setup, we need to set the aria stuff, starting at the root subs
		//originally we were supposed to use something recursive. .. that failed.... ... 
		//CSPS SJ maybe someday do the recursive thing... for fun's sake.		
		this.setMenuAria = function () {
			for (var lvl = 0; lvl < this.levels.length; lvl++) {
				for (var sub = 0; sub < this.levels[lvl].subs.length; sub++) {
					if (this.levels[lvl].subs[sub].subs.length > 0) {
						this.levels[lvl].subs[sub].setChildrenAria();
						//add an if for 1st levels
					}
				}
			}
		};
		this.initPostWetFixes = function () {
			//adds the aria into the menu
			this.setMenuAria();

			//add mobile interactions
			new MobileInteractions({
				navigation: this.navigation
			});

			//HTML version link post-fix
			$("#wb-tphp")
				.attr("role", "navigation")
			/*.append("<li class='wb-slc'><a class='wb-sl htmlVersion' href='#'>" + labels.nav.versionHTML + "</a></li>")
			.find("a.htmlVersion")
			.on("click", htmlVersion);*/

			this.fixBackNext();
			$("#sm-pnl").attr("aria-label", $("#sm-pnl>h3").html());
		};

		this.initMenuBar = function () {
			this.help = new HelpController();

			//initialize the toolbox
			this.initToolbox();

			//set the navigation default
			if (CoreSettings.showSecondHome) {
				this.addSecondHome();
			}

			//load sitemap
			if (CoreSettings.showSitemap) {
				this.sitemapController = new SitemapController({
					subs: this.subs,
					router: this.router
				});
			}

			//init the print controller in General Settings (Needed for courses like G110 CS)
			if (CoreSettings.showPrint) {
				this.printController = new PrintController();
				window.printAll = _.bind(this.printController.printAll, this.printController);
				window.onafterprint = _.bind(this.printController.afterPrint, this.printController);
				window.onbeforeprint = _.bind(this.printController.beforePrint, this.printController);
			}
			//info-pnl is not used by the framework (WET component)
			$(".info-pnl").remove();
		};
		this.initToolbox = function () {
			if ($(".toolbox").length > 0) {
				this.toolbox = new Toolbox();

				//init Resources Manager
				this.resourcesManager = new ResourcesManager({
					master: this
				});

				//load resources and links
				//if (CoreSettings.showResources) {
				this.resources = new Resources();
				//}
				//load glossary
				//if (CoreSettings.showGlossary) {
				this.glossary = new Glossary();
				//}
				//favorites
				if (CoreSettings.showFavorites) {
					this.favoriteController = new FavoriteController();
				}
			}
		};

		/*
		 * this is where we'll add things to check and do across the board
		 */
		this.runAutomations = function () {
			var that = this;

			//remove duplicate IDs generated by lbx bewing copied over by wet
			$("#wb-glb-mn").find(".wb-lbx").each(function (index) {
				if ($(this).attr("id").substring(0, 3) != "mb-") {
					$(this).attr("id", "mb-" + $(this).attr("id"));
				}
			});
			//add empty alt tag on images.
			$(CoreSettings.contentContainer).find("img:not([alt])").attr("alt", "");
			//removes the simplified html version(we'll add it again later)
			$("#wb-tphp").children(".wb-slc").eq(1).remove();

			//collapsible box
			$(".collapsible-box").each(function (index) {
				Regular.initCollapsible($(this));
			});

			//cards flip
			$(".cards .card").on("click", function (e) {
				$(this).toggleClass('flipped');
			});

			//change navigation type if need be
			this.modifyHeader();

			if ($(CoreSettings.contentContainer).find(".qs-elearning-activity").length > 0) {
				this.qs = $.getScript(require.s.contexts._.config.baseUrl + "plugins/qs/qsbeta.js");
			}

			//automate WB ADD wb-add whatever.
			if (!this.loadAllMode) {
				$("#dynamic_content summary:not('.wb-details')").addClass("wb-details");
				this.initWbs();
			}

			$(this.sitemapController).trigger("SitemapController:setModuleIndexHtml");
			//add custom animation transition for magnific popups
			//http://codepen.io/dimsemenov/pen/GAIkt
			$('.wb-lbx').on("mfpBeforeOpen", function (e, mfp) {
				var $el = mfp.st.el;
				//check if wet inited
				($el.hasClass('wb-lbx-inited')) ? true: $el.trigger("wb-init.wb-lbx");
				// check if we have an effect
				if (mfp.st.el.attr('data-effect') != undefined) {
					mfp.st.mainClass = mfp.st.el.attr('data-effect');
					mfp.st.removalDelay = 500;
				}
			});
			$(".wb-lbx").on("mfpOpen", function (e, mfp) {
				if (mfp.st.type == 'ajax') {
					// wait for content and look for resources and wb-add
					var scanDone = false;
					$(this).on("mfpAjaxContentAdded", function (e, mfp) {
						//avoid scanning multiple times						
						if (!scanDone) {
							scanDone = true;
							var $el = mfp.content;
							that.resourcesManager.scan($el);
							that.initWbs($el);
						}
					});
				} else { // look inside inline content for resources and wb-add				
					var $el = mfp.content;
					that.resourcesManager.scan($el);

					that.initWbs($el);
				}

			});

			//look for resources, glossary and wb-add entries if we have ajaxed in content as well			
			$(CoreSettings.contentContainer).on("wb-contentupdated", function (event, data) {
				that.resourcesManager.scan($(data.content));
				that.initWbs($(data.content));
			});

		};

		this.initWbs = function ($selector) {
			var $el;
			($selector == undefined) ? $el = $(CoreSettings.contentContainer): $el = $selector;
			initWbAdd(".wb-lbx", $el);
			initWbAdd(".wb-mltmd", $el);
			initWbAdd(".wb-tabs", $el);
			initWbAdd(".wb-details", $el);
			initWbAdd(".wb-charts", $el);
			initWbAdd(".wb-toggle", $el);
			//equal heights
			initWbAdd(".wb-eqht", $el);
			initWbAdd(".wb-filter", $el);
		};

		/*--------------------------------------------------------------------------
							LOADTARGET: (NavStructure)
		  --------------------------------------------------------------------------							
							this function takes the content from targetNav
							and loads its content, adjusts ... 
							
		----------------------------------------------------------------------------*/
		this.loadTarget = function () {
			//this is the sub we're trying to reach
			var targetObj = ObjSubUtils.findSub(this.targetNav);

			// verify if targetObj exists (coming from other lang)
			if (typeof (targetObj.isPage) === 'undefined') {
				alert("loadTarget: 404");
				return false;
			}

			if (!targetObj.isPage) {
				//not a page but a Sub, needs to open stuff!
				targetObj.activateSubs();
			} else { //this is a page, not a sub.
				//currentNav is the array
				this.currentNav = this.targetNav;
				//currentSub is the object
				this.currentSub = targetObj;
				//hey you! yeah you! load yourself!
				targetObj.loadPage();
			}
			//on the first load.
			if (this.firstPageLoad) {
				this.disableExcessLevels();
				//click here to start
				if (this.currentSub === this.flatList[0]) {
					$("#lvl1").html(labels.nav.clickStart);
				}
			}
		};

		/*--------------------------------------------------------------------------
							LOAD SUCCESSFUL/FAILED: (NavStructure)
		  --------------------------------------------------------------------------							
							
		----------------------------------------------------------------------------*/
		/**
		 * Called when the html is loaded, or, after the JS file is loaded if found
		 */
		this.loadSuccessful = function () {
			this.isLoaded();
			$(this.progressController).trigger('ProgressController:updateViewCount');

			//SCORM interactions
			if (this.scorm !== null) {
				this.scorm.saveBookmark();
			}


			if (CoreSettings.enableMicroLearning && !this.isFirstPage()) {
				this.initMicroLearning();
			} else {
				Utils.hideLoadingBox();
			}

			//GoogleAnalytics check for setting (moved down to accomodate late loading of menu in micro-learning (CSPS-TD))
			if (this.googleAnalytics === undefined && typeof CoreSettings.googleAnalyticsID !== 'undefined' && CoreSettings.googleAnalyticsID.length > 2) {
				this.googleAnalytics = new googleAnalytics({
					subs: this.subs,
					router: this.router
				});
				// the variable is defined
			}
			//MatomoAnalytics: check setting and 
			if (this.matomoAnalytics === undefined && typeof CoreSettings.matomoAnalytics !== 'undefined' && CoreSettings.matomoAnalytics) {
				//console.log('ACTIVATE MATOMO!');
			}

			Logger.log("------------Page Loaded------------");
			//trigger pageLoaded for interactions.js (global event)
			$(this).trigger("Framework:pageLoaded");
			//trigger pageLoaded for page sub specific (page event)
			$(this).trigger("Framework:pageLoaded#" + Utils.getStringFromArray(this.currentNav));

			if (this.scorm !== null && this.scorm.status === "online") {
				//if scorm is active, commit!
				scorm.forceCommit();
			}
			this.runAutomations();
		};

		this.loadFailed = function (xhr) {
			if (!$("html").hasClass("page404")) {
				$("html").addClass("page404");
			}
			this.isLoaded();
			//so in that case just use the stored info
			xhr = xhr || this.currentSub.xhr || {};
			var errorMsgHTML = "<h1>" + this.currentSub.title + "</h1><br /><span class='error'>Error loading content. " + xhr.status + ":" + xhr.statusText + "</span>";


			$(CoreSettings.contentContainer).html(errorMsgHTML);
			//add useful info about load failed in sub
			Utils.hideLoadingBox();
		};

		/*
		 * this method is called once the AJAX for the page is done 
		 * this method is used everytime a page is loaded.
		 * @xhr {Object} Optional
		 */
		this.isLoaded = function (xhr) {
			//system Ready
			if (this.firstPageLoad) {

				Logger.log("------------System Ready------------");
				$(this).trigger("Framework:systemReady");
				this.firstPageLoad = false;
				if (CoreSettings.autoComplete) {
					scorm.complete()
				}

			}
			//track viewed subs
			if (CoreSettings.trackAllPages) {
				$(this.progressController).trigger('ProgressController:updateViewed');
			}

			//wetObj this!
			cspsWetMenu.menuClose($("li.active.sm-open"), true);

			//find the summaries opened, and close them
			$("#sm-pnl").find("details[open]").children('summary').trigger('click');
			//close the  menu
			$(".mfp-close").trigger("click");

			//set the menu titles and actual breadcrumbs
			this.updateBreadcrumbs();

			//update menu setsize
			var $openMenus = $(".supermenu").children("li").children("a[disable='false']");
			$openMenus.attr("aria-setsize", $openMenus.length);

			//getLocalList
			if (_.isUndefined(this.currentSub.localListInfo)) {
				this.currentSub.localListInfo = getLocalList(this.currentSub, CoreSettings.lvlPageOf, CoreSettings.pageOfPermissive);
			}



			if (!this.loadAllMode) {
				this.pageLoadFix();
			} else {
				this.loadAllNext();
			}
		};

		/*--------------------------------------------------------------------------
							NEXTPAGE/BACKPAGE: (NavStructure)
		  --------------------------------------------------------------------------
							this method returns the SUB that follows or 
							precedes the current page.
		----------------------------------------------------------------------------*/
		this.nextPage = function () {
			return this.currentSub.next;
		};
		this.prevPage = function () {
			return this.currentSub.previous;
		};

		this.disableBacknext = function () {
			var that = this;
			var backTxt = labels.nav.backBtn;
			var nextTxt = labels.nav.nextBtn;
			var disabledEl = "<span class='wb-inv'>(" + labels.nav.disabled + ")</span>";
			//Logger.log("854 "+this.isLastPage())
			$(".backnext").css("visibility", "visible");
			$(".backnext").children("a").removeClass("disabled")
				.attr("style", "")
				.attr("tabindex", "0");

			if (this.isFirstPage()) {
				if (CoreSettings.loopLevel === 0) {
					$(".backnext .back").off("click").on("click", this.navigation.loadLast);
				} else {
					if (CoreSettings.loopLevel > 0 && CoreSettings.loopLevel < this.maxDepth) {
						$(".backnext").css("visibility", "hidden");
					}

					backTxt = labels.nav.backBtn + "<span class='wb-inv'>(" + labels.nav.disabled + ")</span>";
					$(".backnext .back")
						.addClass("disabled")
						.attr("tabindex", "-1")
						.on('click', function (e) {
							return false;
						});
				}
			} else {
				$(".backnext .back").off("click").on("click", function () {
					$(that.navigation).trigger("Navigation:goToPrevPage");
					//do not follow links
					return false;
				});
			}

			if (this.isLastPage() && CoreSettings.loopLevel >= this.maxDepth) {
				$(".next").addClass("disabled").attr("tabindex", "-1")
				//.append("<span class='wb-inv'>("+labels.nav.disabled+")<span/>");
				nextTxt = labels.nav.nextBtn + "<span class='wb-inv'>(" + labels.nav.disabled + ")</span>";

			}

			if (CoreSettings.loopLevel < this.maxDepth && (this.isLastOfLevel() <= CoreSettings.loopLevel)) { //if it's gonna loop n it's the right loop
				$(".backnext .next").off("click").on("click", function () {
					$(that.navigation).trigger("Navigation:loadHome");
					//do not follow links
					return false;
				});
			} else {
				$(".backnext .next").off("click").on("click", function () {
					$(that.navigation).trigger("Navigation:goToNextPage");
					//do not follow links
					return false;
				});
			}
			$(".backnext .next").html(nextTxt);
			$(".backnext .back").html(backTxt);
		};

		this.isLastPage = function () {
			var lastFlag = (this.flatList[this.flatList.length - 1] == this.currentSub) ? true : false;
			return lastFlag;
		};
		this.isFirstPage = function () {
			var firstFlag = (this.flatList[0] == this.currentSub) ? true : false;
			return firstFlag;
		};


		this.fixBackNext = function () {
			var that = this;
			//some weird bug about tabindex.... 
			$(".backnext").children("a").attr("tabindex", "0");
			//add top backnext mobile
			$(".supermenu-wrapper").after("<div id='topbacknext' class='visible-xxs visible-xs visible-sm'></div>");

			if (!CoreSettings.topNavFullwidth) {
				//this will actually shorten the width of the top nav, hence the negate on the setting
				$("#topbacknext").addClass("container");
			}
			//pageOf
			$("#topbacknext").html("<nav class='backnext' aria-label=\"" + labels.nav.backnextLblTxt + "\"><a href='#' class='back'></a><span>" + labels.vocab.pageOf + "</span><a href='#' class='next'></a></nav>");

			$(".backnext .back")
				.off("click")
				.on("click", function () {
					$(that.navigation).trigger("Navigation:goToPrevPage");
				})
				.attr("title", labels.nav.backBtnTxt)
				.html(labels.nav.backBtn);
			$(".backnext .next")
				.off("click")
				.on("click", function () {
					$(that.navigation).trigger("Navigation:goToNextPage");
				})
				.attr("title", labels.nav.nextBtnTxt)
				.html(labels.nav.nextBtn);
		};

		this.disableExcessLevels = function () {
			//check depth
			var localDepth = this.levels.length;
			//check  length of aTarget and hides excess
			var targetDepth = (this.firstLaunch) ? 1 : this.targetNav.length;
			for (var lvlLoop = 0; lvlLoop < localDepth; lvlLoop++) {
				if (lvlLoop >= targetDepth) { //put this back in if you want the click here to start as it was
					//remove levels that are unused (too far deep)
					this.levels[lvlLoop].disable();
				}
			}
		};

		this.modifyHeader = function () {
			var that = this;
			if (CoreSettings.navigationMode == 2 || CoreSettings.enableMicroLearning) {
				//CSPS-KR: Accessibility issue where the first lvl could be shown by tabbing to it.
				//Hide it so that it is not percieved by a screen reader at all
				$("[data-id='lvl1']").attr("tabindex", -1);

				if (!$("html").hasClass("removeLvl1")) {
					$("html").addClass("removeLvl1");
				}
				if (this.currentSub == this.flatList[0]) {
					$("body").addClass("welcome");
				} else {
					$("body").removeClass("welcome");
				}

				var titleHTML = (lang == "en") ? CoreSettings.courseTitle_en : CoreSettings.courseTitle_fr;
				var module = ObjSubUtils.findSub([this.currentSub.aPosition[0]]);
				var modnum = module.modnum;
				var modTitle = module.title;
				var firstNav = module.findFirst().sPosition;

				var moduleHTML = "";
				if (CoreSettings.enableMicroLearning) {
					moduleHTML = "<span class='wb-inv'>" + titleHTML + "</span><div id='csps-modulenum'>" + Utils.pad(modnum, 1, 0) + "</div><div id='csps-modulename'>" + modTitle + "</div>";
				} else {
					moduleHTML = "<span class='wb-inv'>" + titleHTML + "</span><div id='csps-modulename'><a href='#'>Module " + modnum + " - " + modTitle + "</a></div><div id='csps-modulenum'>" + Utils.pad(modnum, 1, 0) + "</div>";
				}
				$("#wb-sttl")
					.html(moduleHTML)
					.find("a")
					.off("click")
					.on("click", function () {
						$(that.navigation).trigger("Navigation:changePage", firstNav);
					});
			}

			var seriesTitleHTML = (lang == "en") ? CoreSettings.seriesTitle_en : CoreSettings.seriesTitle_fr;

			$("h2.series-title")
				.html("<a href='#' tabindex='0'>" + seriesTitleHTML + "</a>")
				.find("a")
				.off("click")
				.on("click", function () {
					$(that.navigation).trigger("Navigation:loadHome");
					//do not follow links
					return false;
				});
		};

		/*
		 * this is called on the "click" outside
		 */
		this.resetNav = function () {
			var nbSetsize = 0;
			for (var resetLoop = this.levels.length - 1; resetLoop >= 0; resetLoop--) {
				if ((this.targetNav.length - 1) < resetLoop) {
					this.levels[resetLoop].$el.attr("disable", "true").hide();
				} else {
					nbSetsize++;
					this.currentSub;
					this.targetNav;
					var temparray = this.targetNav.slice(0, (resetLoop + 1));
					this.levels[resetLoop].setTitle(ObjSubUtils.findSub(temparray).title);
					//update setsize
					this.levels[resetLoop].$el.attr("aria-setsize", this.targetNav.length);
					//removes the chevron if menu is closed
					if (this.targetNav.length == resetLoop + 1) {
						this.levels[resetLoop].$el.children("span").remove();
					}
				}
			}
		};


		/*--------------------------------------------------------------------------
							getFirstPage: (NavStructure)
		  --------------------------------------------------------------------------							
							history and bookmark
							
		----------------------------------------------------------------------------*/
		//is this a new thing, a history thing or a bookmark thing?
		this.getFirstPage = function () {
			var that = this;
			var bookmark;
			if (this.scorm !== null) {
				bookmark = (this.scorm.getBookmark()) ? this.scorm.getBookmark() : "";
			} else {
				bookmark = "";
			}
			//just a flag
			this.firstLaunch = true;
			//Set the first page of the product for history.js
			var firstPage = this.flatList[0].sPosition;

			var stateUrl = History.getState().hash;
			// first check if already on some page								
			if (stateUrl.indexOf('state') > -1 || stateUrl.indexOf('./') > -1) {
				this.firstLaunch = false;
				var statePage = Utils.queryString("state");

				this.targetNav = Utils.getArrayFromString(statePage);
				// verrify if targetNav is a page
				if (typeof (ObjSubUtils.findSub(this.targetNav).isPage) == 'undefined') { // CSPS-SC the page does not exist in this language
					this.targetNav = firstPage; // CSPS-SC go back to first page
					this.router.replacePage(firstPage);
				} else { // page exists						
					this.router.replacePage(statePage); // CSPS-SC add first page to history					
				}
			}
			// check if coming from bookmark
			else if (bookmark.length > 0) { //there's a bookmark
				this.firstLaunch = false;
				this.targetNav = Utils.getArrayFromString(bookmark);
				this.router.replacePage(bookmark); // CSPS-SC add first page to history

			} else { //there's no bookmark and not coming from other language or page			
				this.targetNav = this.flatList[0].aPosition;
				this.router.replacePage(firstPage); // CSPS-SC add first page to history
			}
			// Add history capability for all browssers
			var State = History.getState(); // init the history states object
			History.options.disableSuid = true; // avoid IE problems with suid

			History.Adapter.bind(window, 'statechange', function (e) {
				// Log the State
				var State = History.getState();
				History.options.disableSuid = true;
				var currentIndex = History.getCurrentIndex();
				var stateData = State.data._index;
				// prevent from loading twice when pushing state
				var internal = (stateData == (currentIndex - 1));
				var itemID = "";
				if (!internal) {
					itemID = State.url.substr(State.url.lastIndexOf("=") + 1);

					that.navigation.popPage(itemID);
				}
				return false;
			});
		};

		this.addSecondHome = function () {
			$(".supermenu").prepend("<li>" + $(".home").parent().html() + "</li>");
		};

		this.updateBreadcrumbs = function () {
			var foundSub;
			//set the title
			//loop through all the levels and update the topnav with the proper title
			//this needs to be moved.
			for (var lvlLoop = 0; lvlLoop < this.levels.length; lvlLoop++) {
				if (lvlLoop < this.targetNav.length) {
					//enable the level so that it's present
					this.levels[lvlLoop].enable();
					//for this level, find the sub that'S refered and push the title to the level
					foundSub = ObjSubUtils.findSub(this.targetNav.slice(0, lvlLoop + 1));
					foundSub.parentLevel.setTitle(foundSub.title);
				} else {
					//disable the level
					this.levels[lvlLoop].disable();
				}
			}
			//load the breadcrumb if it is activated
			if (CoreSettings.breadCrumbs) this.currentSub.loadBreadCrumbs();
			//go back and fix the menu
			foundSub.retroFix();
		};

		this.pageLoadFix = function () {
			//add pageOf
			$(".backnext").children("span").html(" <span class='pagelbl'>" + labels.vocab.pageLbl + "</span> " + (this.currentSub.localListInfo[1] + 1) + " " + labels.vocab.pageOf + " " + this.currentSub.localListInfo[0].length + " ");
			this.disableBacknext();
			//if this is the first page of a module, add a pre-title for print and accessibility
			if (this.currentNav.length > 1) {
				var module = ObjSubUtils.findSub([this.currentNav[0]]);
				//var firstPageObj=
				if (this.currentSub == module.findFirst() && !$("html").hasClass("LOM-pageEdit-active")) {
					$(CoreSettings.contentContainer).find("h1").eq(0).prepend("<span class='wb-inv'>Module : " + module.title + "<br></span>");
				}
			}
			if ($(".supermenu>li>a:first-child").is(":visible")) {
				$(".supermenu>li>a:first-child").attr("tabindex", "0");
			} // adding second level menu tabindex

			//a class for every page.
			$(CoreSettings.contentContainer).attr("class", masterStructure.originalClass).addClass(this.currentSub.sPosition);
			$("html").attr("data-nav", this.currentSub.sPosition)
			//remove excess items
			$(".supermenu>li").children(".item").eq(this.currentNav.length - 1).children().remove();
		};

		this.loadAll = function (target) {
			$("#printall").before("<div id='loading_placeholder'>Loading Content...</div>");
			//$("#printall").hide();
			this.loadAllMode = true;
			this.currentSub = this.flatList[0];
			this.currentNav = this.currentSub.aPosition;
			this.currentSub.loadPage();
		};

		this.loadAllNext = function () {
			if (this.flatList[this.flatList.length] == this.currentSub.next) {
				//alert("last is "+this.currentSub.title)
				this.loadAllComplete();
			} else {
				this.currentSub = this.currentSub.next;
				this.currentNav = this.currentSub.aPosition;
				this.currentSub.loadPage();
			}
		};

		this.loadAllPlace = function () {
			var generated_ID = "loadall_" + this.currentSub.sPosition;
			$("#printall").append("<section class='row page-copy' id='" + generated_ID + "'></section>");

			return "#" + generated_ID;
		};

		this.loadAllComplete = function () {
			//put the currentSub back normally.
			this.runAutomations();
			this.loadAllFixes();
			$("#printall").show();
			$("#loading_placeholder").remove();
			this.currentNav = this.targetNav;

			for (var loopPages = 0; loopPages < this.flatList.length; loopPages++) {
				this.loadAllChangeHeader(this.flatList[loopPages]);
			}
			this.loadAllMode = false;
		};

		this.loadAllChangeHeader = function (currentSub) {
			var firstOfLevel = this.isFirstOfLevel();
			var headerIncrement = currentSub.depth;

			for (var headerLevel = 6; headerLevel > 0; headerLevel--) {
				foundHeader = $("#loadall_" + currentSub.sPosition).find("h" + headerLevel);
				foundHeader.each(function (index, element) {
					Utils.tagSwitch($(this), "h" + (headerLevel + headerIncrement + 1));
				});
			}

			if (firstOfLevel == 0) {
				//this is a normal page
				$("#loadall_" + currentSub.sPosition).addClass("normal-page");
			} else {
				//this is first of ... something
				$("#loadall_" + currentSub.sPosition).attr("first-of", firstOfLevel);
				//upSomeLevels
				if (firstOfLevel == 1) {
					$("#loadall_" + currentSub.sPosition).prepend("<h1>course title</h1>");

				} else {
					$("#loadall_" + currentSub.sPosition).prepend("<h1 style='color:coral!important;'>" + currentSub.parent.title + "</h1>");
				}
			}
		};

		this.loadAllFixes = function () {
			//external links?
			$("#printall").find("a").each(function (index, element) {
				if ($(this).hasClass("external")) {
					$(this).append("(External link to " + $(this).attr("href") + ")");
				}
			});
			$(".mod-list").remove();
			$(".checkmark-viewed").remove();
			$(".autofav").remove();
		};


		/*
		 * this method returns the level for which this sub is last of
		 *     0 for course
		 *     1 for module
		 *     2 for section
		 *     3 for not last
		 */
		this.isLastOfLevel = function () {
			if (typeof this.currentSub.isLastOf === "undefined") {
				var objSub = this.currentSub;
				var isStillLast = true;
				var lowestDepth = this.maxDepth;
				var parentSub = objSub.parent;

				for (var i = objSub.depth; i > 0; i--) {

					if (objSub.parent.subs[objSub.parent.subs.length - 1] == objSub && isStillLast == true) {
						lowestDepth = objSub.depth;
						objSub = objSub.parent;
					} else {
						isStillLast = false;
					}
				}
				if (this.isLastPage()) {
					lowestDepth = 0;
				}
				this.currentSub.isLastOf = lowestDepth;
			}
			return this.currentSub.isLastOf;
		};

		this.isFirstOfLevel = function () {
			var subObj = this.currentSub;
			var returnDepth;
			if (subObj == this.flatList[0]) {
				return 1;
			}
			if (subObj == subObj.parent.subs[0]) {
				return subObj.depth + 1;
			} else {
				return 0;
			}
		};
		/*---------------------------------------------------------------------------------------
											   LOM
		---------------------------------------------------------------------------------------*/
		this.initEditor = function () {
			if (typeof masterStructure.editor === "undefined" && CoreSettings.editMode) {
				// EDITMODE
				var that = this;
				//require(['modules/editor/editorObj'], function (Editor) {
				require(['./../../../../js/editor/editorObj'], function (Editor) {
					var fullpath = window.location.pathname;
					var directory = "";
					directory = fullpath.substring(0, fullpath.lastIndexOf('/'));
					directory = directory.substring(directory.lastIndexOf('/') + 1);


					that.editor = new Editor({
						parent: that,
						courseFolder: directory
					});
					that.editor.pageLoaded();
					//Load custom 404 page for LOM
					$(masterStructure).on("Framework:pageLoaded", function () {
						if (this.editor.ui.currentMode.name === "pageEdit" && $("html").hasClass("page404")) {
							that.editor.page404();
						}
					});
				});

			}
		}


	}


	/*---------------------------------------------------------------------------------------
										   Local
	---------------------------------------------------------------------------------------*/


	//pass an object and a maximum depth. get a list of matching objects and an index
	//permissive it to allow multi-level acceptance.
	function getLocalList(thisObj, targetDepth, permissive) {
		var thisDepth = thisObj.aPosition.length - 1;
		var returnList = [];
		var returnIndex, listCounter = 0;
		var foundFlag;

		//loop through flatIndex and check the aPosition
		for (var i = 0; i < masterStructure.flatList.length; i++) {
			foundFlag = 1;
			//go through all the levels and compare
			for (var lvlLoop = 0; lvlLoop < targetDepth; lvlLoop++) {
				if (thisObj.aPosition[lvlLoop] != masterStructure.flatList[i].aPosition[lvlLoop]) {
					foundFlag = 0;
				}
			}
			if (foundFlag == 1) {
				if (permissive || (masterStructure.flatList[i].aPosition.length == thisObj.aPosition.length)) {
					if (masterStructure.flatList[i].aPosition == thisObj.aPosition) {
						returnIndex = listCounter;
					}
					returnList[returnList.length] = masterStructure.flatList[i];
					listCounter++;
				}
			}
		}
		return [returnList, returnIndex];
	}

	/*---------------------------------------------------------------------------------------
										  NAVIGATION
	---------------------------------------------------------------------------------------*/

	function htmlVersion() {
		$("footer").html($("[data-id=sitemap_pop]").html());
		$("nav").remove();
		Regular.openDetails();
		Regular.hideVideos();

		//return false since we do not want to follow links
		return false;
	}

	/*---------------------------------------------------------------------------------------
										  DEVELOPMENT
	---------------------------------------------------------------------------------------*/

	// ON WINDOW RESIZE (CSPS TD)
	//Attribute a max-height to the menu so it can scroll
	function fAttributeMenuMaxHeight() {
		var tOffset = $("nav#wb-sm").offset();
		var tMaxh = $(window).height() - (tOffset.top + $("nav#wb-sm .nvbar div.row").height());
		//CSPS SJ this causes a BUG (white menu) in IE8
		$("#wb-sm .active .sm").css('max-height', tMaxh + 'px');
	}
	//CSPS-KR
	//add to global namespace since it is used in wet-boew.js
	window.fAttributeMenuMaxHeight = fAttributeMenuMaxHeight;

	$(window).resize(function () {
		fAttributeMenuMaxHeight();
	});
	//Initial
	fAttributeMenuMaxHeight();


	function initWbAdd(obj, $selector) {
		var $el;
		($selector == undefined) ? $el = $(CoreSettings.contentContainer): $el = $selector;
		if ($el.find(obj).length > 0) {
			wb.add(obj);
		}
	}

	//CSPS-KR: Add to global namespace since it is used in html pages
	window.initWbAdd = initWbAdd;

	function initialize(altLang) {
		if (typeof masterStructure === "undefined") {
			//generate the object
			window.masterStructure = new navStructure();
			masterStructure.altLang = altLang;
			Legacy.backwardCompat();
		}

		//once the masterStructure is created, import the custom script
		require(['interactions'], function () {
			masterStructure.populate();

			//default dynamic content class
			var attr = $(this).attr('class') || "";
			masterStructure.originalClass = attr;
		});
	}

	return {
		initialize: initialize
	};
});