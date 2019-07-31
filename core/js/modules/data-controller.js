define([
	'logger',
    'modules/BaseModule'
], function(Logger, BaseModule) {
	
	'use strict';
	
	//unescape(encodeURIComponent(str)).length NO MAX THAN 4096

	//SYNC MODE: ("agressive" || "passive")
	//  -AGRESSIVE = SAVE AS SOON AS SOMETHING IS MODIFIED IN this.data{}
	//  -PASSIVE = SAVE WHEN NECESSARY (ON CALL?)
	var syncMode = "agressive";

	return BaseModule.extend({
		//ASSUMES doLMSGetValue(X); and doLMSSetValue(X,Y); exists (STANDARD SCORM FUNCTIONS)
		/*
		IMPORTANT
			cmi.comments = 
		USEFULL; eventually maybe
			cmi.core.lesson_location = 
			cmi.core.lesson_status = 
		USELESS; for now
			cmi.core.student_id = 
			cmi.core.student_name = 
			cmi.launch_data = 
			cmi.suspend_data = 
			cmi.core.score.raw = 
			cmi.core.score.min = 
			cmi.core.score.max = 
			cmi.core.total_time = 
			cmi.student_data.mastery_score = 
			cmi.student_data.max_time_allowed = 
			cmi.student_data.time_limit_action = 
			cmi.student_preference.audio = 
			cmi.student_preference.text = 
			cmi.student_preference.language = 
			cmi.student_preference.speed = 
		*/

		//jQuery.parseJSON
		//JSON.parse()
		//JSON.stringify() 
		//OLD BROWSERS USE EVAL(terrible idea)
		
		//INITIALIZE SAVE OBJ; preparing the thing to work
		initialize: function(options) {
			Logger.log("INIT: Data Controller");
			
			this.options = options;
			this.scorm = this.options.scorm;

			//DATA CONTAINS DATA IN OBJ FORMAT; used for everything...
			this.data = {};

			//IS LOADED? (BOOL) THAT SIGNIFIES IF INITIAL TRACKING HAS BEEN RETRIEVED FROM iLMS
			this.isLoaded = false;

			//IS SYNCHRONIZE? (BOOL) THAT SPECIFIES IF this.data{} IS SYNCHRONIZED WITH (THE SAME AS) WHATS IN THE iLMS
			this.isSynchronized = false;

			//PURE STRING OF WHATS IN THE CMI.COMMENTS; it's what the iLMS gives and takes when loading/saving
			this.stringData = "";

			//LOAD 
			this.stringData = this.fGetLMSData();
			if (this.stringData === undefined || typeof this.stringData != "string" || this.stringData === "") {
				//EMPTY STRING DATA
				this.stringData = "";
				//console.log("DataController.initialize: seems like there's nothing to load right now.");
			} else {
				//CONVERT TO OBJECT
				//console.log("|"+this.stringData+"|");
				this.data = JSON.parse(this.stringData);

			}

			//ONCE LOADED...
			this.isLoaded = true;
			this.isSynchronized = true;
			
			if (this.scorm !== null){this.initPing();}
		},
		
		//ping the ILMS to keep an active connection and avoid losing data
		initPing: function() {
			if (this.scorm.getStatus() == "online") {
				var that = this;
				var time = 1200000; //20min
				
				var pingInterval = setInterval(function() {
					that.scorm.saveSuspendData(JSON.stringify(that.data));
				}, time);
			}
		},
		
		//SAVE DATA; you know, save stuff
		saveData: function(id, dat) {

			//NOT SYNCHRONIZED NO MORE
			this.isSynchronized = false;

			if (!this.fValidateData(dat, -1)) {
				//console.error('cannot save, failed basic data validation.');
				return false;
			}

			if (this.data[id] === undefined) {
				//create new entry
				//console.log('DataController.data: creating new entry: '+id+' --->\n'+dat+'\n<---');
				this.data[id] = dat;
			} else {
				//update existing entry
				//console.log('DataController.data: updating entry: '+id+' --->\n'+dat+'\n<---');
				this.data[id] = dat;
			}

			//READY JSON STRING
			this.stringData = JSON.stringify(this.data);


			//SAVE DATA TO iLMS
			if (syncMode == "agressive") {
				this.syncData();
			}

		},

		//RETRIEVE DATA; you know, return stuff you asked for
		getData: function(id) {
			if (this.data[id] === undefined) {
				//console.log('DataController.getData('+id+'): trying to retrieve data that doesnt exist.');
				return undefined;
			} else {
				return this.data[id];
			}
		},

		//SYNCHRONIZE DATA; take current this.data{} and save it in iLMS
		syncData: function() {
			if (this.scorm !== null){
				this.scorm.saveSuspendData(JSON.stringify(this.data));
				this.isSynchronized = true;
			}
		},

		//GET TRACKING STRING FROM iLMS
		fGetLMSData: function() {
			if (this.scorm!== null){
				return this.scorm.getSuspendData();
			}else{
				return false;
			}
		},

		//VALIDATE DATA
		fValidateData: function(dat, mode) {
			var isValid = true;
			//IMPERATIVELY CHANGE UNDEFINEDs TO NULLs (JSON DOESNT LIKE UNDEFINED)
			dat = (dat === undefined) ? null : dat;

			//*TMP, should also crawl through objects & arrays to get rid of undefineds, unefinedes, undefinds...we

			mode = (isNaN(mode)) ? 0 : mode;
			switch (mode) {
				case -1:
					//Loose - don't care
					//obvious passthrough *TMP
					isValid = true;
					break;
				case 0:
					//Strict - Check if String
					if (typeof dat != "string") {
						isValid = false;
					}
					break;
				default:
					//console.error('DataController.fValidateData: validation mode does not exist');
			}
			return isValid;
		},

		//REPLACE DATA IF NECESSARY (2ND PARAM FOR JSON.stringify())
		fReplaceData: function(chk) {
			//ESCAPES AND ENCODES...*TMP
			return chk; //obvious passthrough is *TMP
		},

		//SETS THE FINAL cmi.score.raw SCORE - TYPICALLY CALLED IN CONJUNCTION WITH this.scorm.complete();//CSPS-TD-AJOUT G313
		setFinalScore: function(score) {
			if(this.scorm!== null){
				this.scorm.saveScoreData(score);
			}
		}
	});


	//
	// *TMP, GOES SOMEWHERE ELSE OF COURSE
	//
	/*
	$(document).ready(function() {
		//AUTO-INIT
		trackingObj = new DataController();
		
		
		//TESTING
		
		// SAVE STUFF
		// trackingObj.saveData("unestring","textestextes"); //String
		// trackingObj.saveData("unarray",{"array pos0","array pos1":"array pos2","array pos3":"array pos4"}); //Obj
		// trackingObj.saveData("unobj",["132423","3asda24","a4353sd3",true,false,0]) //Array
		
		
		// GET STUFF
		// trackingObj.getData("myvar2");
		// trackingObj.getData("myvar2342"); //Should return undefined + throw error
		
	});*/
});