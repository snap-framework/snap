'use strict';

define({
	debugMode: false,
	enableAdminMode : true,

	contentContainer: "#dynamic_content",
	
	cssFileName: "theme.css",		//name of the css theme file to load.


	skipSplash: false,

	/*------------------ Course info -----------------*/
	courseLegacyCode:"C000",
	courseTitle_en: "The Catalog",
	courseTitle_fr: "Le catalogue",
	courseSubtitle_en: "",
	courseSubtitle_fr: "",
	seriesTitle_en: "The CSPS Framework",
	seriesTitle_fr: "La plateforme EFPC",	

	/*------------------ Toolbar -----------------*/
	showLangSwitch: true,
	showHome: true,
	showHelp: true,
	showSitemap: true,
	showToolbox: true,
	showFavorites: false,
	showGlossary: false,
	showResources: true,
	showExit: false,	
	showPrint: false, 		//PLEASE don't turn this on!!
	showSecondHome: false,
	//in construction
	addToolboxPage:[
		//example
		//local page loaded through ajax (remember to add the lightbox code (copy paste from Glossary))
		//{ "name_en":"Custom popup", "name_fr":"popup \"custom\"", "filename_en":"custom_en", "filename_fr":"custom_fr"},
		//execute javascript, must end with ; '.js' or '.exe' to be sure
		//{ "name_en":"Code Javascript", "name_fr":"Javascript", "filename_en":"alert('anglais');.exe", "filename_fr":"alert('français');.exe"},
		//PDF
		//{ "name_en":"Print Version(PDF)", "name_fr":"Version imprimable(PDF)", "filename_en":"print_version.pdf", "filename_fr":"print_version_fr.pdf"},
		//External link
		//{ "name_en":"External Link", "name_fr":"Liens Externe", "filename_en":"www.google.com", "filename_fr":"www.google.com"}


	],

	/*------------------ System settings ---------------*/

	requireLoadPageScript: false, 	
	
	enablePopClose:null, 
	environment: null, //local, public, prod
	connectionMode: null,//"scorm", 	//currently only supports "scorm" , noscorm

	/*------------------ LEARN-O-MATIC ---------------*/
	editMode: false, 
	
	
	
	/*------------------ Scorm settings ---------------*/	
	trackAllPages: true,
	triggerCompletionWhenAllPagesViewed: false,
	markModuleAsViewedOnLastPage: false, //broken	

	/*------------------ DATA / Google Analytics -----------------*/
	
	googleAnalyticsID: "",	/*UA-101907595-7*/

	/*------------------ Navigation -----------------*/
	topNavFullwidth:     true,
	breadCrumbs: 	     true,
	loopLevel: 		     3,		// 0 is a course loop, 1 takes you back to home after each module, 3 is none (2 makes no sense so far)
	lvlPageOf:  	     0,		//Level at which the pageOf acts (lvlTimeline)
	pageOfPermissive:    true, 	//determines if the pageOf will take into account subPages (tlPermissive)
	navigationMode:      1, //1 is legacy, 2 is P930, 3 is newNav
	

	/*------------------ TIMELINE Object -----------------*/
	//deprecated.
	activateTimeline: false,
	tlContent: 		  true, 	//is the timeline within the content (not in the frame).
	tlPlace: 		  "",		//this is the spot where we need to append and add the timeline div. default is below the first h1

	
	/*------------------ External Links-----------------*/
	extMethod: "",		//default is target=_blank, other valudes : "lightbox" "popup". overridé local avec data-extmethod="value"

	/*------------------ Favorites -----------------*/
	autoAddFavoriteBtn: false,		//adds the favorite button on every page

	/*------------------ Loading Box ---------------*/
	loadingBoxTransitionSpeed: 1000,

	/*------------------ Locking System ---------------*/
	enableLockingSystem: true,
	//This will keep any lockedin pages locked-in even
	//after quitting the course or after completing the course
	//and returning to that page. Persistent.
	persistentLockedIn: true,


	/*------------------ Tutorial ---------------*/
	enableTutorial: false,

	/*------------------ Micro learning ---------------*/
	enableMicroLearning: false,

	//this enables the Micro learning feature. 
	//It includes:
	//- the micro-menu navigation
	//- the fixed page (navigate sections as you scroll)
	//- navigation through modules instead of pages
	microLearning: {
		//micro-menu position; valid values: "left", "right"
		navPosition: "left",
		//table of content marker position;
		//this will align the marker next to the list but on the specified position
		//valid values: "left", "right"
		tocMarkerPosition: "right",
		//speed at which the sections transition (in miliseconds)
		//*Be sure to change the $SECTION_ANIM_SPEED in micro-section.scss
		//if you change this setting, so that both are identical.*
		scrollingSpeed: 1000,
		//speed at which the elements inside the sections animate. 
		//valid values: "slow", "normal", "fast"
		animationSpeed: "normal",
		// Factor of screen size (%) that the section must cross
   	// before it's considered visible/invisible
		TOP_MARGIN: 0.1,
		BOTTOM_MARGIN: 0.1,
        //Enables/disables the window resize warning & refresh dialog
        windowResizeDialog: true


	}
});