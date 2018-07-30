/*
   ____        _      _____                                      ____       __       
  / __ \__  __(_)___ / ___/____  ____ __      ______  ___  _____/ __ )___  / /_____ _
 / / / / / / / /_  / \__ \/ __ \/ __ `/ | /| / / __ \/ _ \/ ___/ __  / _ \/ __/ __ `/
/ /_/ / /_/ / / / /____/ / /_/ / /_/ /| |/ |/ / / / /  __/ /  / /_/ /  __/ /_/ /_/ / 
\___\_\__,_/_/ /___/____/ .___/\__,_/ |__/|__/_/ /_/\___/_/  /_____/\___/\__/\__,_/  
                       /_/                                                           

					   V0.9036_C
//TESTED USING JQuery 1-11-1

ADDED IN 0.9036_C
-New settings files path + alternative
-Fixed fCl() needing settings.debugMode to operate

ADDED IN 0.9036_B
-Added proper ancestryIDARR reference in qsSwitchQuestion
-removed (tmp) some verification in qsValidateSemantic() - causing errors that were not necessary when .qs-feedback not found with data-feedback-type=none

ADDED IN 0.9036
-removed qsNextQuestion() ... if(excpt !== "final-submit") ... else ... ~1199 static value definition

WORKING IN 0.9033/4 - (TESTED)

ADDED IN 0.9033/4 - (STILL NEEDS TESTING)
-Adding custom params on script tag in page before load
-qsObjParams.qsLabelsOverride/qsSettingsOverride (paths)
-Custom paths for settings (settingsPath, settingsFilename, settingsLabelsFilename)
-Settings.json validation
-Confirm that identical IDs throws error, not just console.error
-Consolider qsObjParams et qssettings.json
-Custom url for settings + change regular default CSPS eLearning Framework settings folder to simply /settings/ (get rid of new(WIP))
-custom settings loading (paramObj AND JSON settings paths)
-auto-start blocker (for outside of Framework, being able to decide when it initiates) (in custom params)
-Critical errors should always display (fCe override?)
-Fix/simply this.settings + order-up importance: 1-Override, 2-settings.json
-Check tout les JQUERY EACH() s'assurer que les références à this (this.settings/this.activities) sont mThis
-Add auto-tabing (with settings switch) *WIP*: getting there, after submit = ok, after qs-continue = not good
-QS-FINAL-SUBMIT ALWAYS TRY TO SUBMIT ACTIVITY NO MATTER WHERE (~1193 (qsnextquestion exception),~2176 (qsnextquestion call appended with exception "final-submit"))


CURRENTLY WORKING ON:

pushed back-qsValidateSemantic!!!! Needs a param to overwrite validation error throws, or only do it on demand (debug mode!!!)
|-MAKE SURE DEFAULT QUESTION TYPE IS TAKEN IN CONSIDERATION IF NO TYPES ARE EVER SET! (objDefVal.question.question_type)

pushed back-consolidate objDefVal.domButtons and objDefVal.domAHref


CURRENT PRIORITIES:

!!IMPORTANT @~2142
	-qs-final-submit-placeholder gets qs-submit-final inserted in it after having submitted the last question but without having completed the activity (question-skipping-enabled=true)
	...same with qs-finallinkto-unanswered when then using previous instead of a qs-finallinkto-unanswered
	...once the last unanswered question is finally answered, NOW fillin with qs-final-submit
!!IMPORTANT
-Add global framework reference variable (KEVEN) ---var fwSystemInfo = $(window).triggerHandler("Framework:systemInfo"); @partir de 1.6.2 seulement /-"Keven" var to check if in framework or not + fallback on masterStructure
-type-5, input type=button, instant submit...
|-CLEAN UP QSVALIDATE ANSWER FOR TYPE-5
-Multiple instances on same page (long overdue...) *WIP*



COMING SOON:
-Revisit qsValidateSemantic (missing qs-feedback causes problem even though data-feedback-type=none)
-.qs-resetretry vs .qs-retry-activity = what the ??? Merge 'em! + MAKE SURE SEMANTIC VALIDATION THROWS MESSAGE
-auto-scroll, switch in settings please
-data-specific-positive-feedback/data-specific-negative-feedback (type-4) for all types!!

-reverse cheat mode (only wrong answers)
-random cheat mode (random answers mix)
-debug mode: add speedy (0ms animation, auto tab to necessary stuff, click n go)
-fix .qs-submit-activity to appear on all scenarios even though it makes no sense sometimes (still needs qs-feedback-final)
-seperate labels.json from system settings.json

-multiple qs instances in one page, needs more work and testing!
-Add auto-save feature (saves to trackingObj on each question answered, insert disclaimer as to why it's a bad idea)
-Add auto-scoring on data-scorm-completion (switch in settings)
-Complete and test auto adding qs-submit, qs-final-submit buttons
-Test some SAAO along with next-back nav + return to unanswered question
-qs-vsfbh: make settings accessible to show only users answers or all (type-1 && type2 :checked vs :all)... type-1 watch for screw-up on:checked for tElem and Racheck
-dispatch function: give numID as well as domID since it's easier to access activities[numID]{...}
-dispatch function: seems like the last question is dispatched after the activity is completed... fix it!
-debug mode: add little tiny button(s) with functions such as "display all questions/exercises at once+correct numbering of questions", fill in the activity and get to last question, complete the activity with x score, control panel type thing you know?
-debug mode: add ctrl+f12 (when no iLMS) debug panel with many many cool options!
-Add auto-numbering a), A), 1., etc... of answers so that randomizing them keeps em ordered
-Fix randomizing <SELECT> ... randomize chunks associated OR randomize <OPTION>s...or even both, why not both?
-Debug mode hides fCl() but NOT fCe() !!! Clean up all error messages
-Menage dans les mThis VS this[objAcc]...can this not be so @#$%#$

WISHLIST:


*WIP*
Work-In-Progress: Needs more work, not done yet...
*SIMPLIFY* / *OPTIMIZE*
Working but could be better, more optimized
*/

// <<THANK YOU SO MUCH IE8 FOR NOT SUPPORTING TRIM() CORRECTLY>> FIX
if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	}
}

// <<THANK YOU SO MUCH IE8 FOR NOT SUPPORTING ARRAY.INDEXOF CORRECTLY>> FIX
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		 for (var i = (start || 0), j = this.length; i < j; i++) {
			 if (this[i] === obj) { return i; }
		 }
		 return -1;
	}
}
// <<THANK YOU SO MUCH IE8 FOR NOT SUPPORTING THE CONSOLE CORRECTLY>> FIX by jpswain
var alertFallback = false;
if (typeof console === "undefined" || typeof console.log === "undefined") {
	console = {};
	if (alertFallback) {
		console.log = function(msg) {alert(msg);};
		console.error = function(msg) {alert(msg);};
	}else{
		console.log = function() {};
		console.error = function() {};
	}
}

//Main Quiz Spawner Control
function qsBeta(objAcc,paramObj) {

	//MAIN REFERENCE
	mThis=this;

	//NORMALIZE qsObjParams -> paramObj
	if(paramObj===undefined){
		paramObj = {};
	}else{
		//VALIDATE paramObj
		//*WIP* -> CREATE FUNCTION TO TEST STRING AGAINST STRING LIST ::> USE REGEX INSTEAD OF indexOf()');
		var validParamsNames = "debugMode,cheatMode,autoStart,encodeAnswers,animBaseDuration,masterIntTester,illegalCharsList,settingsFilename,settingsPath,settingsLabelsFilename,autoTabbing,language";
		for(var i in paramObj){
			if(validParamsNames.indexOf(i)<0){
				throw new Error('Invalid param detected: '+i);
			}
		}
	}
	
	//
	//  LOAD SETTINGS & LABELS
	//
	///////////////
	
	//SET LANGUAGE (PRIORITIES: 1-OVERRIDE, 2-HTML[lang], 3-DEFAULT(fr))
	var lang = (paramObj.language!==undefined)?paramObj.language:($("html").attr("lang")!==undefined)?$("html").attr("lang"):'fr';

	//SET DEFAULT PATHS IF OVERRIDES ARE UNDEFINED
	var settingsPath = (paramObj.settingsPath!==undefined)?paramObj.settingsPath:'settings/';
	var settingsFilename = (paramObj.settingsFilename!==undefined)?paramObj.settingsFilename:'qssettings';
	var settingsLabelsFilename = (paramObj.settingsLabelsFilename!==undefined)?paramObj.settingsLabelsFilename:'qslabels_';
	//SET FALLBACKDEFAULTS IF PREVIOUS ONES 404'ed
	var fallbackSettingsPath = 'core/js/plugins/qs/';
	var fallbackSettingsFilename = 'qssettings';
	var fallbackSettingsLabelsFilename = 'qslabels_';
	//VALIDATE SETTING DATA PARAMS ONCE LOADED, RETURNS BOOLEAN
	this.qsValidateSettingData = function (sData){
		fCl('qsValidateSettingData()');
		//VALIDATE SETTINGS DATA
	  	var validSettingsAttributes = {
	  		settings:["autoTabbing","animBaseDuration","masterIntTester","encodeAnswers","illegalCharsList"],
	  		activity:["activity_type","question_skipping_enabled","tracking_enabled","recap_required","trigger_course_completion","trigger_completion_score","final_feedback_score_threshold","submit_all_at_once","submit_aao_disable_right_anwers","simple_act_disable_mode","reset_retry_enabled","animations_and_transitions","auto_scroll_to_question","force_insert_final_submit"],
	  		exercise:["exercise_type","pool_picks","random_order","feedback_type","randomize_answers","submit_all_at_once"],
	  		question:["question_type","branching_type","question_value"],
	  		type_0:["empty_allowed","min_char_required"],
	  		type_1:["crypt_answers","persistent_vsfb"],
	  		type_2:["crypt_answers","empty_allowed"],
	  		type_3:["ignore_case"],
	  		type_4:["allow_duplicate_answer","substitute_recap_label","randomize_options"],
	  		type_5:["crypt_answers"]
	  	};
	  	var invalidSettingsStack = "";
  		for(var i in validSettingsAttributes){
  			for(var ii in validSettingsAttributes[i]){
  				if(sData[0][i][validSettingsAttributes[i][ii]] === undefined){
					invalidSettingsStack += i+' / '+validSettingsAttributes[i][ii]+"\n";
  				}

  			}
  		}

  		//STOP IF MISSING SETTING FOUND
  		if(invalidSettingsStack!==""){
		  	throw new Error('Missing setting:\n'+invalidSettingsStack);
		  	return false;
		}else{
			return true;
		}
	}
	//LOAD QS SETTINGS DATA
	var qsData;
	$.ajax({
		type: 'GET',
		url: settingsPath+settingsFilename+'.json',
		dataType: 'json',
		async: false,
		error:function(err,msg,errMsg){
			fCe("qsData not loaded: "+msg + " : " + errMsg);
		},
		statusCode:{
			404: function(){
				fCl('fallback '+fallbackSettingsPath);
				$.ajax({
					type: 'GET',
					url: fallbackSettingsPath+fallbackSettingsFilename+'.json',
					dataType: 'json',
					async: false,
					error: function(){
						fCe("qsData not loaded: "+msg + "  " + errMsg );
					},
					success: function(data){
						if(mThis.qsValidateSettingData(data)){
							qsData = data[0];
						}else{
							fCe('Invalid settings, check error log for details.');
						}
					}
				});
			}
		},
		success: function(data) {
			if(mThis.qsValidateSettingData(data)){
				qsData = data[0];
			}else{
				fCe('Invalid settings, check error log for details.');
			}
		}
	});	
	//LOAD QS LABELS
	var qsLabels;
	$.ajax({
		type: 'GET',
		url: settingsPath+settingsLabelsFilename+lang+'.json',
		dataType: 'json',
		async: false,
		error:function(err,msg,errMsg){
			fCe("qsLabels not loaded: "+msg + "  " + errMsg );
		},
		statusCode:{
			404: function(){
				fCl('Labels fallback');
				$.ajax({
					type: 'GET',
					url: fallbackSettingsPath+fallbackSettingsLabelsFilename+lang+'.json',
					dataType: 'json',
					async: false,
					error:function(){
						fCe("qsLabels not loaded: "+msg + "  " + errMsg );
					},
					success:function(data){
						qsLabels = data[0];	
					}
				});
			}
		},
		success: function(data) { 	  	
			qsLabels = data[0];		
		}
	});
	
	//!!!!!!!!!!HALTS UNTIL qsData is loaded .... ASYNC TO FALSE OR CATASTROPHY!!!!!!!!!!!!
	
	//ENVIRONMENT VARS
	/*
	this.environment = {};
		this.environment.iLMS_active = 
		
	*/
	
	//DEFAULT SETTINGS
	this.settings = qsData.settings;
		//SET TOP LEVEL DEFAULT SETTINGS (CAN BE OVERRIDEN WITH qsObjParams BUT NOT SET IN SETTINGS.JSON)
		this.settings.debugMode = (paramObj.debugMode!=undefined)?paramObj.debugMode:false;
		this.settings.cheatMode = (paramObj.cheatMode!=undefined)?paramObj.cheatMode:false;
		this.settings.autoStart = (paramObj.autoStart!=undefined)?paramObj.autoStart:true;
		//SET POST DEFAULTS FROM OVERRIDE (qsObjParams/paramObj)
		for(var i in paramObj){
			this.settings[i] = paramObj[i];
			}
		
	//DEFAULT MSG STRINGS
	this.msgs = qsLabels.msgs;
	
	//DEFAULT MASTER OBJ VALUES IF OMITTED
	this.objDefVal = {};
	this.objDefVal.activity = qsData.activity;
	this.objDefVal.exercise = qsData.exercise;
	this.objDefVal.question = qsData.question;
	
	//DEFAULT ELEMENTS IF MISSING
	this.objDefVal.domButtons = qsLabels.domButtons;
	//this.objDefVal.domAHref = qsLabels.domAHref;
	this.objDefVal.domVisuals = qsLabels.domVisuals;
	
	//CHECK IF TRACKING OBJ EXISTS, IF NOT BUILD FAKE ONE!
	try{
		fCl(trackingObj.isLoaded);
	}
	catch(err){
		fCl("NO TRACKING OBJECT DETECTED, ALL TRACKING DISABLED\n"+err);
		trackingObj = {};
		if(this.settings.debugMode){
			trackingObj.getData = function(){return $("#qs-tracking-debug").val();}; //'PURE GENIUS' he said sarcastically!
		}else{
			trackingObj.getData = function(){return false;};
		}
		trackingObj.saveData = function(){return false;};
	}
	
	//ENCODE ANSWERS AUTOMATICALLY -> PUT IN THIS.SETTINGS
	this.settings.encodeAnswers = (paramObj.encodeAnswers!=undefined)?paramObj.encodeAnswers:false; //EVENTUALLY *OBSOLETE, USE this.settings
	
	/*WIP*/
	if(this.settings.cheatMode){
		if(this.settings.encodeAnswers){fCl('Answers are encoded, cheatMode not will not work!');}
		//type-0 (**NOTHING TO DO**)
		//type-1,type-2, type-5 (**UNTESTED**)
		$('.qs-elearning-activity .ra').prop('checked',true).parent().css('border','1px solid green'); //#raware!
		$('.qs-elearning-activity .wa').parent().css('border','1px solid red'); //#raware!
		//type-3
		$('.qs-elearning-activity input[type=text]').each(function(){
			if($(this).attr('data-rep').indexOf('|')>-1){
				$(this).val($(this).attr('data-rep').split('|')[0]);
			}else{
				$(this).val($(this).attr('data-rep'));
			}
		});
		//type-4
		$('.qs-elearning-activity select').each(function(){
			$(this).val($(this).attr('data-rep'));
		});
		
		
		
		//FOCUS ON RIGHT ANSWER (OR ONE OF THE)
	}
	
	//ARE YOU USING THE BEST BROWSER IN THE WORLD? (Will come in handy if you know what I mean!)
	var isIE=(!detectIE())?false:true;
	
	//DATA HOLDERS
	this.activities; //Objet contenant les infos des activités ... 
	this.activitiesArr = new Array(); //Array list des activités...
	

	
	
	//TRACKING VARS
	//  -DEFINE MARKERS
	// qsMarkerStart = "░QS▒{";	// qsMarkerEnd = "}▒QS▓";		// qsActMarkerStart = "░ACT▒{";	// qsActMarkerEnd = "}▒ACT▓";		// qsExMarkerStart = "░EX▒{";	// qsExMarkerEnd = "}▒EX▓";
	var qsMarkerStart = "¹{",qsMarkerEnd = "}¹",qsActMarkerStart = "²{",qsActMarkerEnd = "}²",qsExMarkerStart = "³{",qsExMarkerEnd = "}³";
	
	//TEST AGAINST THESE AS THEY MAY BREAK EVERYTHING (THEY ARE RESERVED FOR STRING SPLITING)
	//"░▒▓╠╣┌┐║♥♦♠♣";"¼½¾Ð¶¢®©ª¤£¦§±þ§Þß¥º·¹²³¨÷|";
	this.settings.illegalCharsList = (paramObj.illegalCharsList!=undefined)?paramObj.illegalCharsList:"¼½¾Ð¶¢®©ª¤£¦§±þ§Þß¥º·¹²³¨÷|";

	// ║ -> ¦
	// ┌ -> §
	// ┐ -> ¤
	// ╠ -> ±
	// ╣ -> º
	//--------
	// ♥ -> ¼
	// ♦ -> ½
	//--------
	var tSplt = ['¦','§','¤','±','º'],qSplt = ['¼','½'],replaceIllegalCharWith = "¿";
	
	//LOW LEVEL VARS
	//GENERIC BASE SPEED (IN MS) FOR ANIMATIONS
	this.settings.animBaseDuration = (paramObj.animBaseDuration!=undefined)?paramObj.animBaseDuration:200;
	
	//SECURITY "SEED" VALIDATION INTEGER
	this.settings.masterIntTester = (paramObj.masterIntTester!=undefined||paramObj.masterIntTester<4)?paramObj.masterIntTester:33; //KEEP IT OVER 3 AND UNDER 100 PLS! THE HIGHER THE NUMBER THE MORE COMPLEX TO DECODE (FOR END USER SNOOPING AROUND THAT IS!)
	
	//STATUSES *WIP
	//  -unattempted: Never saw
	//  -incomplete: user saw the question but didn't score anything (yet)... pending validation
	//  -failed: score < 100%, answered and didn't get everything right (might be partial scoring eventually *TMP)
	//  -completed: 100% score, answered and got correct all around (type-0 automatically gets completed if passes basic validation ie isn't "empty")
	var statusStrings = ["unattempted", "incomplete", "failed", "completed"];
	
	//DYNAMIC (don't change anything!)
	var trackingString = "";//:String = eventuellement contenu de iLMS "cmi.content" si existant
	
	//DEFAULT QUESTION TYPES PARAMS//QUESTION TYPES
	//
	//type-0 = whatever you want, aucune vrai validation *(non-empty still in effect for some...)
	//  *TEST pour le textarea ou rien n'est validé, feedback generique seulement + submit si textarea != empty	
	this.objDefVal.type_0 = qsData.type_0;

	//type-1 = choix reponse, unique (radio)
	//  *don't forget labels and proper form formatting
	this.objDefVal.type_1 = qsData.type_1;

	//type-2 = choix reponse, multiple (checkbox)
	//  *don't forget labels and proper form formatting
	this.objDefVal.type_2 = qsData.type_2;

	//type-3 = réponse tapée, possibilités multiples (1 ou + reponse par textfield, 1 ou + textfield) (textfield)
	//  *don't forget maxchars to limit users if needed, please DON'T use textarea unless necessary, currently won't match complex formatting and \n
	//  *4k total MAX par produit pour tracking, don't track too much! (entre 1024 et 4096 caracteres excluant tout le reste so...don't be greedy!)
	this.objDefVal.type_3 = qsData.type_3;

	//type-4 = dropdown choix reponse, single ou multiple (dropdown(s))
	//  *don't forget labels and proper form formatting
	this.objDefVal.type_4 = qsData.type_4;
	
	//type-5 = **UNTESTED** button type
	this.objDefVal.type_5 = qsData.type_5;
	
	//FUNCTIONS
	//
	this.qsInit = function (){
		fCl("QS INIT...");
		
		//VALIDATION PHASE
		if(!this.qsValidateSemantic()){
			fCe('FAILED TO VALIDATE HTML, PLEASE CONTACT YOUR NETWORK ADMINISTRATOR!');
		};
		
		
		var it,i,ii,iii,iRandom,iPrep,iQuest;
		//FIND AND PARSE ACTIVITIES
		//activities  -->  exercises  -->  Questions  -->  ANSWERS/FEEDBACK
		//    I                II             III                IIII
		//
		//
		//CLASS STEPS (on .qs-elearning-activity)
		//  .qs-step1 = Intro
		//  .qs-step2 = Quiz
		//  .qs-step3 = Recap, Final feedback
		//
		//ASSIGN STEP CLASS
		$('.qs-elearning-activity').addClass('qs-step1');
		
		//GET TRACKING STRING (IF REQUIRED BY ANY ACTIVITY)
		for(it=0;it<$('.qs-elearning-activity[data-tracking=true]').length;it++){
			this.qsGetTrackingString($('.qs-elearning-activity[data-tracking=true]').eq(it).attr('id'));
		}
		//
		//	I
		//
		for(i=0;i<$(".qs-elearning-activity").length;i++){
		
			currElem = $(".qs-elearning-activity").eq(i);
			
			//ACTIVITIES PARAMS
			this.activitiesArr[this.activitiesArr.length] = {
				"elem":currElem,
				"id":$(currElem).attr('id'),
				"nb_exercises":$(currElem).find(".qs-exercise").length,
				"activity_type":($(currElem).attr('data-activity-type')==undefined)?this.objDefVal.activity.activity_type:$(currElem).attr('data-activity-type'),
				"question_skipping_enabled":($(currElem).attr('data-question-skipping')==undefined)?this.objDefVal.activity.question_skipping_enabled:eval($(currElem).attr('data-question-skipping')), //So users can skip incomplete questions
				"tracking_enabled":($(currElem).attr('data-tracking')==undefined)?this.objDefVal.activity.tracking_enabled:eval($(currElem).attr('data-tracking')), //*iLMS tracking answers for this activity...
				"recap_required":($(currElem).attr('data-force-final-recap')==undefined)?this.objDefVal.activity.recap_required:eval($(currElem).attr('data-force-final-recap')), //To force recap after activity no matter the feedback type for questions
				//"trigger_course_completion":($(currElem).attr('data-trigger-completion-score')==undefined)?eval(this.objDefVal.activity.trigger_course_completion):true,
				"trigger_course_completion":($(currElem).attr('data-trigger-scorm-completion')==undefined)?eval(this.objDefVal.activity.trigger_course_completion):eval($(currElem).attr('data-trigger-scorm-completion')),
				"trigger_completion_score":($(currElem).attr('data-trigger-completion-score')!=undefined)?eval($(currElem).attr('data-trigger-completion-score')):-1,
				"final_feedback_score_threshold":($(currElem).attr('data-trigger-completion-score')!=undefined)?eval($(currElem).attr('data-trigger-completion-score')):this.objDefVal.activity.final_feedback_score_threshold, //*TMP, needs data-SOMETHING from DOM eventually *WIP
				//"final_feedback_score_threshold":this.objDefVal.activity.final_feedback_score_threshold, //*TMP, needs data-SOMETHING from DOM eventually *WIP
				"submit_all_at_once":($(currElem).attr('data-submit-all-at-once')==undefined)?this.objDefVal.activity.submit_all_at_once:eval($(currElem).attr('data-submit-all-at-once')),
				"submit_aao_disable_right_anwers":($(currElem).attr('data-submit-aao-disable-right-answers')==undefined)?this.objDefVal.activity.submit_aao_disable_right_anwers:eval($(currElem).attr('data-submit-aao-disable-right-answers')),
				"simple_act_disable_mode":($(currElem).attr('data-simple-act-disable-mode')==undefined)?this.objDefVal.activity.simple_act_disable_mode:$(currElem).attr('data-simple-act-disable-mode'),//SIMPLE ACTIVITY DISABLE MODE (NEEDS activity_type=simple): 'any'||'onright'||'never' **WIP**
				"animations_and_transitions":this.objDefVal.activity.animations_and_transitions, //*TMP, needs data-SOMETHING from DOM eventually *WIP
				"auto_scroll_to_question":this.objDefVal.activity.auto_scroll_to_question, //*TMP, needs data-SOMETHING from DOM eventually *WIP
				"force_insert_final_submit":this.objDefVal.activity.force_insert_final_submit, //*TMP: G313 EXCEPTION, forces final submit button placement via span/div.qs-final-submit-placeholder, needs data-SOMETHING from DOM eventually *WIP
				"exercises":new Object(),
				"dv":new Object({ //Dynamic variables
						"status":"unattempted", //*from tracking..."unattempted, incomplete, completed, failed"
						"current_exercise_id": 0, //0 unless tracking...
						"current_question_id": 0 //0 unless tracking...
						})
				};
			
			this.activities = this.activitiesArr;
			
			//
			//	II
			//
			this.exercisesArr = new Array(); //Array list des exercises...
			
			for(ii=0;ii<$(currElem).find(".qs-exercise").length;ii++){
				
				currElem_ii = $(currElem).find(".qs-exercise").eq(ii);
				
				//Inheriters (QUESTIONS MIGHT INHERIT FROM EXERCISES)
				inherit_question_type = ($(currElem_ii).attr('data-question-type')===undefined)?this.objDefVal.question.question_type:$(currElem_ii).attr('data-question-type');
				inherit_feedback_type = ($(currElem_ii).attr('data-feedback-type')===undefined)?this.objDefVal.exercise.feedback_type:$(currElem_ii).attr('data-feedback-type');
				inherit_random_answers = eval(($(currElem_ii).attr('data-random-answers')===undefined)?this.objDefVal.exercise.randomize_answers:$(currElem_ii).attr('data-random-answers'));
				inherit_score_value = ($(currElem_ii).attr('data-score-value')===undefined)?1:Number($(currElem_ii).attr('data-score-value'));
				//EXERCISES PARAMS
				this.exercisesArr[this.exercisesArr.length] = {
					"elem":currElem_ii,
					"id":$(currElem_ii).attr('id'),
					"nb_questions":$(currElem_ii).find(".qs-question").length,
					"exercise_type":($(currElem_ii).attr('data-exercise-type')===undefined)?this.objDefVal.exercise.exercise_type:$(currElem_ii).attr('data-exercise-type'),
					"branching_passing_grade":eval($(currElem_ii).attr('data-branching-passing-grade')),
					"branching_pass_redirection":$(currElem_ii).attr('data-branching-pass-redirection'),
					"branching_fail_redirection":$(currElem_ii).attr('data-branching-fail-redirection'),
					"questions_type":inherit_question_type, //*children will inherit...
					"feedback_type":inherit_feedback_type, //*children will inherit... "instant, deferred, none"
					"recap_required":false,
					"submit_all_at_once":($(currElem_ii).attr('data-submit-all-at-once')==undefined)?this.objDefVal.exercise.submit_all_at_once:eval($(currElem_ii).attr('data-submit-all-at-once')),
					"randomize_answers":inherit_random_answers, //*children will inherit...
					"randomize_questions":$(currElem_ii).attr('data-random-questions'), //*randomize questions...
					"pool_picks":($(currElem_ii).attr('data-random-questions')=="true")?parseInt($(currElem_ii).attr('data-pool-picks')):"null", //*Choose only X questions from exercise to show, "randomize_questions" has to be true in order to work (duh!)...
					"random_order":"null", //*remember order or random questions if needed...tracking
					"score_value":inherit_score_value, //*Children will inherit...
					"dv":new Object({
						"status":"unattempted" //*from tracking..."unattempted, incomplete, completed, failed"
						}),
					"questions":new Object()
					};
					
					
				this.activities[i].exercises = this.exercisesArr;
				
				//PREPARE RANDOM INDEXES IF NEEDED
				if(this.activities[i].exercises[ii].randomize_questions == "true"){
					qRandomStackArr = this.qsGetRandomQuestionStack(i,ii);
					this.activities[i].exercises[ii].random_order = qRandomStackArr.join(',');
				}else{
					qRandomStackArr = undefined;
				}
				
				//
				//   III
				//
				
				this.questionsArr = new Array();//Array list des questions...
				
				for(iii=0;iii<$(currElem_ii).find(".qs-question").length;iii++){
					
					fCl("Parsing Question - index:"+iii);
					
					//FOR RANDOM PURPOSES, INDEX
					if(qRandomStackArr != undefined){
						//THIS SHOULD BE SORTED BEFORE...
						for(iRandom=0;iRandom<qRandomStackArr.length;iRandom++){
							if(iii == qRandomStackArr[iRandom]){
									nID = iRandom;
							}
						}
					}else{
						nID = this.questionsArr.length;
					}
					
					currElem_iii = $(currElem_ii).find(".qs-question").eq(iii);
					
					//QUESTIONS PARAMS
					this.questionsArr[nID] = {
						"elem":currElem_iii,
						"id":$(currElem_iii).attr('id'),
						"question_type":($(currElem_iii).attr('data-question-type')===undefined)?inherit_question_type:$(currElem_iii).attr('data-question-type'), //*can be inherited from parent...
						"branching_type":($(currElem_iii).attr('data-branching-type')===undefined)?this.objDefVal.question.branching_type:$(currElem_iii).attr('data-branching-type'),
						"feedback_type":($(currElem_iii).attr('data-feedback-type')===undefined)?inherit_feedback_type:$(currElem_iii).attr('data-feedback-type'), //*can be inherited from parent... "instant, deferred, none"
						"randomize_answers":($(currElem_iii).attr('data-random-answers')===undefined)?inherit_random_answers:eval($(currElem_iii).attr('data-random-answers')), //*can be inherited from parent...
						"score_value":($(currElem_iii).attr('data-score-value')===undefined)?inherit_score_value:Number($(currElem_iii).attr('data-score-value')), //*can be inherited from parent...
						"dv":new Object({
							"my_answer_id":"", //"" unless tracking (can be DOM id(s...separated by ","), or straight up answer [string] depending on type-? of question)...
							"status":"unattempted", //*from tracking..."unattempted, incomplete, completed, failed"
							}),
						"answers": new Object({
							"elem":$(currElem_iii).find(".qs-answers")
							})
						};
					
					//DEFAULT OVERRIDES DEPENDING ON QUESTION TYPE
					switch(this.questionsArr[nID].question_type){
						/*case "type-0":
							break;*/
						case "type-1":
							this.questionsArr[nID].persistent_vsfb = this.objDefVal.type_1.persistent_vsfb
							break;
						case "type-2":
							this.questionsArr[nID].empty_allowed = this.objDefVal.type_2.empty_allowed;
							break;
						case "type-3":
							this.questionsArr[nID].ignore_case = ($(currElem_iii).attr('data-question-ignore-case')==undefined)?this.objDefVal.type_3.ignore_case:eval($(currElem_iii).attr('data-question-ignore-case'));
							
							break;
						case "type-4":
							this.questionsArr[nID].allow_duplicate_answer = ($(currElem_iii).attr('data-allow-duplicate-answer')==undefined)?this.objDefVal.type_4.allow_duplicate_answer:eval($(currElem_iii).attr('data-allow-duplicate-answer'));
							this.questionsArr[nID].randomize_options = ($(currElem_iii).attr('data-randomize-options')==undefined)?this.objDefVal.type_4.randomize_options:eval($(currElem_iii).attr('data-randomize-options'));
							break;
						case "type-5":
							
							break;
						default:
							//fCe('INIT::DEFAULT OVERRIDES NOT IMPLEMENTED FOR:'+this.questionsArr[nID].question_type);
					}
					
					//SECOND SWITCH (WHY?)
					
					//CHANGE DOM PER QUESTION BEFORE LAUNCH IF NECESSARY
					switch(this.questionsArr[nID].question_type){
						case "type-1":
							if(!this.objDefVal.type_1.crypt_answers){
								fCl('Encryption disabled *WIP');
								break;
							}
							//GENERATE ENCODED ANSWER STRING
							if(this.settings.encodeAnswers){
								for(iQuest=0;iQuest<$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').length;iQuest++){ //#raware!
									this.qsGenerateEncodedValidationString('gonogo',($('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).hasClass('ra'))?1:0,$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).attr('id')); //#raware!
								}
								$('#'+this.questionsArr[nID].id+' input[type="radio"]').removeClass('wa ra'); //REMOVE NOW OBSOLETE WA/RA
							}
							break;
						case "type-2":
							if(!this.objDefVal.type_2.crypt_answers){
								fCl('Encryption disabled *WIP');
								break;
							}
							//GENERATE ENCODED ANSWER STRING
							if(this.settings.encodeAnswers){
								for(iQuest=0;iQuest<$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').length;iQuest++){ //#raware!
									this.qsGenerateEncodedValidationString('gonogo',($('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).hasClass('ra'))?1:0,$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).attr('id')); //#raware!
								}
								$('#'+this.questionsArr[nID].id+' input[type="checkbox"]').removeClass('wa ra'); //REMOVE NOW OBSOLETE WA/RA
							}
							break;
						case "type-3":
							//GENERATE ENCODED ANSWER STRING
							if(this.settings.encodeAnswers){
								for(iQuest=0;iQuest<$('#'+this.questionsArr[nID].id).find('input[type="text"]').length;iQuest++){
									this.qsGenerateEncodedValidationString('encrypt',$('#'+this.questionsArr[nID].id).find('input[type="text"]').eq(iQuest).attr('data-rep'),$('#'+this.questionsArr[nID].id).find('input[type="text"]').eq(iQuest).attr('id'));
								}
								$('#'+this.questionsArr[nID].id+' input[type="text"]').removeAttr('data-rep'); //REMOVE NOW OBSOLETE data-rep
							}
							//TMP MODIFIY DOM - STOP USERS FROM SUBMITTING USING ENTER ON TEXT FIELDS
							$("#"+this.questionsArr[nID].id+" input[type=text]").attr('onkeyup','return qsTFRestrictOnKey(this,event);');
							break;
						case "type-4":
							//RANDOMIZE SELECT OPTIONS IF NECESSARY
							fCl('TYPE-4 RANDOM SELECT OPTIONS WILL NOT BE TRACKED *WIP*');
							
							if(this.questionsArr[nID].randomize_options || this.questionsArr[nID].randomize_options ==="true"){
								//$('#'+this.questionsArr[nID].id+' select').each(function(){
								for(rsoi=0;rsoi<$('#'+this.questionsArr[nID].id+' select').length;rsoi++){
									dRep = $('#'+this.questionsArr[nID].id+' select').eq(rsoi).attr('data-rep');
									tmpBuffArr = [];
									//tmpBuffValArr = [];
									f1Dummy = false;
									//SAVE OPTIONS
									tmpBuffArr = ($('#'+this.questionsArr[nID].id+' select').eq(rsoi).html()).split('</option>');
									//REMOVE FROM DOM
									$('#'+this.questionsArr[nID].id+' select').eq(rsoi).empty();
									//STORE RANDOM INDEXES
									newMatrixArr = [];
									newMatrixArr = this.qsReturnRandomArr(tmpBuffArr.length-1);
									
									for(rsoii=0;rsoii<newMatrixArr.length;rsoii++){
										
										
										if(newMatrixArr[rsoii]==dRep){
											//$('#'+this.questionsArr[nID].id+' select').eq(rsoi).attr('data-rep',rsoii);
										}
										$('#'+this.questionsArr[nID].id+' select').eq(rsoi).append(tmpBuffArr[newMatrixArr[rsoii]]+'</option>');
										
									}
									
									var tmpBuff;
									//CHECK FOR DUMMY OPTION AND MOVE IT TO FIRST POSITION
									for(rsoii=0;rsoii<$('#'+this.questionsArr[nID].id+' select').eq(rsoi).find('option').length;rsoii++){
										if($('#'+this.questionsArr[nID].id+' select').eq(rsoi).find('option').eq(rsoii).attr('disabled')==='disabled' && $('#'+this.questionsArr[nID].id+' select').eq(rsoi).find('option').eq(rsoii).attr('selected')){
											tmpBuff = $('#'+this.questionsArr[nID].id+' select').eq(rsoi).find('option').get(rsoii).outerHTML;
											$('#'+this.questionsArr[nID].id+' select').eq(rsoi).find('option').eq(rsoii).remove();
										}
									}
									$('#'+this.questionsArr[nID].id+' select').eq(rsoi).prepend(tmpBuff);
									
							
								};
							}
							
						
							break;
						case "type-5":
							if(!this.objDefVal.type_5.crypt_answers){
								fCl('Encryption disabled *WIP');
								break;
							}
							//GENERATE ENCODED ANSWER STRING
							if(this.settings.encodeAnswers){
								for(iQuest=0;iQuest<$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').length;iQuest++){ //#raware!
									this.qsGenerateEncodedValidationString('gonogo',($('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).hasClass('ra'))?1:0,$('#'+this.questionsArr[nID].id).find('input.wa, input.ra').eq(iQuest).attr('id')); //#raware!
								}
								$('#'+this.questionsArr[nID].id+' input[type="button"]').removeClass('wa ra'); //REMOVE NOW OBSOLETE WA/RA
							}
							break;
						default:
					}

					
					//APPEND ACTIVITIES[i].RECAP_REQUIRED IF NECESSARY (FOUND A DEFERRED QUESTION FEEDBACK)
					if(this.questionsArr[nID].feedback_type == "deferred" && !this.activities[i].recap_required){
						this.activities[i].recap_required = this.activities[i].exercises[ii].recap_required = true;
					}
					
					//SCRAMBLE ANSWERS IN DOM IF NECESSARY (TYPE-1, TYPE-2)
					if(this.questionsArr[nID].randomize_answers && (this.questionsArr[nID].question_type == "type-1" || this.questionsArr[nID].question_type == "type-2" || this.questionsArr[nID].question_type == "type-5")){
						this.qsScrambleAnswers(this.questionsArr[nID].id,this.questionsArr[nID].question_type);
					}
					
				} //END QUESTION LOOP
				this.activities[i].exercises[ii].questions = this.questionsArr;
				//FOR POOLS OF RANDOM QUESTIONS, DONT KEEP OTHER QUESTIONS IN OBJ, DELETE
				if(this.activities[i].exercises[ii].pool_picks != "null" && iii > (this.activities[i].exercises[ii].pool_picks-1)){
					
					//REMOVE USELESS QUESTIONS AND REFERENCES OF
					this.activities[i].exercises[ii].questions.splice((this.activities[i].exercises[ii].pool_picks),(this.activities[i].exercises[ii].nb_questions-this.activities[i].exercises[ii].pool_picks));
					
					//fCl('Clean up pool\'s random_order (cut off the useless end)');
					
					//RE-AFFECT NB_QUESTIONS
					this.activities[i].exercises[ii].nb_questions = this.activities[i].exercises[ii].questions.length;
					
					//fCl('Pool, need '+this.activities[i].exercises[ii].pool_picks+' questions, contains '+this.activities[i].exercises[ii].nb_questions+' with the following random order: '+this.activities[i].exercises[ii].random_order);
				}

			}//END EXERCISE LOOP

		}; //END ACTIVITY LOOP

		//INSERT QUESTION NUMBERS AND QUESTION SCORE VALUES *(STATIC, INSERTED ONCE AFTER INIT AND RANDOMIZATION)
		tmpNH = [];
		tmpCounter = 1;
		//LOOP THROUGH ALL
		for(iqn=0;iqn<this.activities.length;iqn++){
			for(iiqn=0;iiqn<this.activities[iqn].exercises.length;iiqn++){
				if(this.activities[iqn].exercises[iiqn].randomize_questions=="true"){
					//IF RANDOM
					tmpNH = this.activities[iqn].exercises[iiqn].random_order.split(',');
					for(iiiqn=0;iiiqn<this.activities[iqn].exercises[iiqn].pool_picks;iiiqn++){ //POOL PICKS SHOULD BE MAX
						$("#"+this.activities[iqn].exercises[iiqn].questions[iiiqn].id+' .qs-insert-question-number').html(tmpCounter); //QUESTION NUMBER
						$("#"+this.activities[iqn].exercises[iiqn].questions[iiiqn].id+' .qs-insert-question-value').html(this.msgs.msgPtsPrefix+this.activities[iqn].exercises[iiqn].questions[iiiqn].score_value+this.msgs.msgPtsSuffix); //QUESTION VALUE
						tmpCounter++;
					}
				}else{
					//IF NOT RANDOM
					for(iiiqn=0;iiiqn<this.activities[iqn].exercises[iiqn].questions.length;iiiqn++){ //NO NEED TO GO THROUGH EVERYTHING
						$("#"+this.activities[iqn].exercises[iiqn].questions[iiiqn].id+' .qs-insert-question-number').html(tmpCounter); //QUESTION NUMBER
						$("#"+this.activities[iqn].exercises[iiqn].questions[iiiqn].id+' .qs-insert-question-value').html(this.msgs.msgPtsPrefix+this.activities[iqn].exercises[iiqn].questions[iiiqn].score_value+this.msgs.msgPtsSuffix); //QUESTION VALUE
						tmpCounter++;
					}
				}
			}
		}
		
		//CHECK TRACKING AND MODIFY DOM ACCORDINGLY *TMP (ONLY IF TRACKING REQUIRED)
		if($('.qs-elearning-activity[data-tracking=true]').length){
			this.qsRecallData('all');
		}
		
		//DONE, PREP ACTIVITIES (1 by 1)!
		for(iPrep=0; iPrep<this.activities.length;iPrep++){
			this.qsPrepActivities(iPrep);
		}
		
	}
	
	//PREPARE ACTIVITIES
	this.qsPrepActivities = function (activity_id){
		fCl('qsPrepActivities('+activity_id+')');

		//SHOW ACTIVITY
		//qsShow('#'+this.activities[activity_id].id+'.qs-elearning-activity');
		
		//ASSIGN STEP CLASS
		$('#'+this.activities[activity_id].id+'.qs-elearning-activity').removeClass('qs-step2 qs-step3').addClass('qs-step1');

		//MEGA Hide stuff... (TMP)
		qsHide($(this.activities[activity_id].elem).find(".qs-subvisit, .qs-question, .qs-exercise, .qs-feedback, .qs-specific, .qs-second-chance, .qs-feedback-final, .qs-finallinkto-unanswered-placeholder"));

		//MEGA show stuff... (TMP:AFTER RESET, QS-FIRST-VISIT NOT SHOWING!)
		qsShow($(this.activities[activity_id].elem).find(".qs-firstvisit"));
		
		//EMPTY VISUAL FEEDBACK HOLDERS
		$(this.activities[activity_id].elem).find('.qs-vsfbh').html('');
		//$(this.activities[activity_id].elem).find('.qs-vsfbh').attr('aria-hidden',true); //*WIP* NOT WORKING WHY???
		
		//ADD EXCEPTION IF NO QS-START-ACTIVITY (TMP)
		if($("#"+this.activities[activity_id].id+" .qs-start-activity").length){
			
			//MEGA SHOW STUFF (TMP)
			qsShow('#'+this.activities[activity_id].id+' .qs-start-activity');		
			fCl('FIND ME (in qsPrepActivities()) and hide stuff via CSS for added security and compatibility');
			
			//DISPlAY IF STATUS != UNATTEMPTED
			if(this.activities[activity_id].dv.status != "unattempted"){
				qsShow('.qs-start-activity .qs-subvisit'); //SHOW SUBVISIT CONTAINER
				qsHide('.qs-start-activity .qs-firstvisit'); //HIDE FIRST VISIT CONTAINER
				fCe('Show subvisit, hide firstvisit')
				//RESET ACTIVITY BUTTON
				$('#'+this.activities[activity_id].id+' .qs-start-activity .qs-subvisit .qs-resetretry').unbind('click');
				$('#'+this.activities[activity_id].id+' .qs-start-activity .qs-subvisit .qs-resetretry').click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- PRESSED RESET ACTIVITY ----------------------------');
						$(this).unbind();
						mThis.qsResetActivity(activity_id);
					}
				});
				
				//RETURN TO NEXT QUESTION (FROM SAVED STRING IF INCOMPLETE)
				$('#'+this.activities[activity_id].id+' .qs-start-activity .qs-subvisit .qs-getbacktoit').click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- GO BACK TO WHERE I LEFT OFF ----------------------------');
						$(this).unbind();
						mThis.qsActivityInitialLaunch($(this).closest('div.qs-elearning-activity').attr('id'));
					}
				});
				
			}
			
			
			//PRESSING ON START ACTIVITY
			$(this.activities[activity_id].elem).find(".qs-start-activity .qs-start").click(function (){
				if(!$(this).hasClass('qs-disabled')){
					fCl('---------------------------- PRESSED START ----------------------------');
					$(this).unbind();
					var activity_stringID = $(this).closest('div.qs-elearning-activity').attr('id');
					
					//FORCE RESTART AT EX=0 - Q=0
					mThis.activities[mThis.qsGetActivityIDFromStringID(activity_stringID)].dv.current_exercise_id = 0;
					mThis.activities[mThis.qsGetActivityIDFromStringID(activity_stringID)].dv.current_question_id = 0;
					
					//SETS ACTIVITY STATUS TO INCOMPLETE (AS OPPOSED TO UNATTEMPTED)
					mThis.activities[mThis.qsGetActivityIDFromStringID(activity_stringID)].dv.status = "incomplete";
					
					//LAUNCH
					mThis.qsActivityInitialLaunch(activity_stringID);
				}
			});
			
		}else{
			//FORCE RESTART AT EX=0 - Q=0
			this.activities[activity_id].dv.current_exercise_id = 0;
			this.activities[activity_id].dv.current_question_id = 0;
			//SETS ACTIVITY STATUS TO INCOMPLETE (AS OPPOSED TO UNATTEMPTED)
			this.activities[activity_id].dv.status = "incomplete";
			//(AUTO)LAUNCH
			this.qsActivityInitialLaunch(this.activities[activity_id].id);
		}
		
		//REFRESH DISPLAY
		this.qsUpdateScoreDisplay(activity_id);
			
	}
	
	//INITIAL LAUNCH
	this.qsActivityInitialLaunch = function (activity_stringID){
		
		//fCl('qsActivityInitialLaunch - id='+activity_stringID);
		//fCl('Launch exercise FORCED at-'+this.activities[this.qsGetActivityIDFromStringID(activity_stringID)].dv.current_exercise_id);
		//fCl('Launch question FORCED at-'+this.activities[this.qsGetActivityIDFromStringID(activity_stringID)].dv.current_question_id);
		
		//ASSIGN STRING IDS TO VARS FOR USE
		current_activity_ID = this.qsGetActivityIDFromStringID(activity_stringID);
		current_exercise_ID = this.activities[this.qsGetActivityIDFromStringID(activity_stringID)].dv.current_exercise_id;
		current_question_ID = this.activities[this.qsGetActivityIDFromStringID(activity_stringID)].dv.current_question_id;
		
		current_question_stringID = this.activities[current_activity_ID].exercises[current_exercise_ID].questions[current_question_ID].id;
		
		//BRANCHING QUIZZES
		if(this.activities[current_activity_ID].activity_type === "branching"){
			fCe('BRANCHING QUIZZES, WIP! -> Tracking not work correctly, recap not working, lots of options not working in conjonction with activity-type="branching"');
		}
		
		//ASSIGN STEP CLASS
		$('#'+activity_stringID+'.qs-elearning-activity').removeClass('qs-step1 qs-step3').addClass('qs-step2');
		
		//DISPLAY NEXT/BACK
		//qsShow('.qs-prevquestion, .qs-nextquestion');
		
		//DISPLAY QUESTION, Prepare entrance... (TMP)
		qsShow($("#"+current_question_stringID));
		
		//Hide <Start Quiz>, show first question...
		ancestrySTRARR = this.qsGetAncestryStringIDS($("#"+current_question_stringID));
		
		//HIDE .qs-start-activity/SHOW .qs-exercise IF NECESSARY
		if($("#"+activity_stringID+" .qs-start-activity").length){
			qsTransition($("#"+activity_stringID+" .qs-start-activity"),$("#"+activity_stringID+" #"+ancestrySTRARR[1]+".qs-exercise"))
		}else{
			//ADD++++ HIDE .qs-final-feedback/SHOW .qs-exercise IF NECESSARY
			qsFadeIn($("#"+activity_stringID+" #"+ancestrySTRARR[1]+".qs-exercise"));
		}
		//UPDATE QUESTION STATUS
		this.activities[current_activity_ID].exercises[current_exercise_ID].questions[current_question_ID].dv.status = (this.activities[current_activity_ID].exercises[current_exercise_ID].questions[current_question_ID].dv.status == "unattempted")?"incomplete":this.activities[current_activity_ID].exercises[current_exercise_ID].questions[current_question_ID].dv.status;
		
		//UPDATE EXERCISE STATUS
		this.activities[current_activity_ID].exercises[current_exercise_ID].dv.status = (this.activities[current_activity_ID].exercises[current_exercise_ID].dv.status === "unattempted")?"incomplete":this.activities[current_activity_ID].exercises[current_exercise_ID].dv.status;
		
		//UPDATE SCORE/PROGRESSION DISPLAY
		this.qsUpdateScoreDisplay(current_activity_ID);
		
		//
		//TYPE SUBMIT BUTTON (type-0, type-1, type-2, type-3, type-4...)*TMP NEEDS CASE
		//
		
		this.qsAddSubmitEvent(current_activity_ID,current_exercise_ID,current_question_ID);
		
		
		
		
		//Actions on quiz NAV
		//retry but target every single nav control in activity
		//RESET DISABLED NAV
		$("#"+activity_stringID+" .qs-prevquestion, #"+activity_stringID+" .qs-nextquestion").removeClass('qs-disabled');
		
		//DISABLE PREV QUESTION IF ON FIRST QUESTION
		if(this.activities[current_activity_ID].dv.current_exercise_id === 0 && this.activities[current_activity_ID].dv.current_question_id === 0){
			$("#"+activity_stringID+" .qs-prevquestion").addClass('qs-disabled');
		}
		
		
		//--------------
		
		
		
		
		//fCe(this.qsComputeProgression(current_activity_ID,'qat')+" === "+this.qsComputeProgression(current_activity_ID,'qtot'));
		//DISABLE NEXT QUESTION IF LAST QUESTION ***WIP (SHOULD NOT DISABLE IF QUESTION IS ANSWERED AND QS-FINAL-FEEDBACK IS PRESENT aka ENDING THE ACTIVITY USING NEXT BT!)
		if(this.qsComputeProgression(current_activity_ID,'qat')===this.qsComputeProgression(current_activity_ID,'qtot')){
			$("#"+activity_stringID+" .qs-nextquestion").addClass('qs-disabled');
		}
		//ELSE IF CHECK IF LAST QUESTION (ACTIVITY INITALLY LAUNCH MIGHT BE REDIRECT FROM qs-getbacktoit to the last question THEN DISABLE THE @#$5 QS-NEXTQUESTION)
		//this.qsComputeProgression(current_activity_ID,'qat')
		//this.qsComputeProgression(current_activity_ID,'qtot')
		
		
		
		
		
		//--------------
		
		
		
		
		
		
		
		$("#"+activity_stringID+" .qs-prevquestion, #"+activity_stringID+" .qs-nextquestion").unbind('click');
		$("#"+activity_stringID+" .qs-prevquestion, #"+activity_stringID+" .qs-nextquestion").click(function(){
			if(!$(this).hasClass('qs-disabled') && !$(this).hasClass('qs-tmp-disabled')){
				fCl('---------------------------- PRESSED NEXT/BACK ----------------------------');
				mThis.qsNavQuestions($(this));
			}
		});
		
		
		//DISPATCHER CALL!
		fQsEvDp('activity_started',{activity_dom_id:activity_stringID});
		
	}
	
	//DISPLAYS NEXT/PREVIOUS EXERCISE AND PREPS THE FIRST/LAST QUESTION ACCORDINGLY (DIRECTION === 1 || -1)
	this.qsSwitchExercise = function (current_activity_id,current_exercise_id,direction){
		//current_activity_id = eval(current_activity_id);
		//current_exercise_id = eval(current_exercise_id);
		//direction = eval(direction);
		fCl('qsSwitchExercise('+current_activity_id+" , "+current_exercise_id+" , "+direction+')');
		
		//fCe()
		
		
		//fCe('WATCH OUT, LAST EXERCISE IN BRANCHING ACTIVITIES NOT WORKING (THINKS ITS THE END BUT IT MIGHT NOT BE!):::'+((current_exercise_id+direction) < 0 || ((current_exercise_id+1)+direction)>this.activities[current_activity_id].nb_exercises)+"  &&  "+!(this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-score-redirect" || this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-selective-redirect"))
		//if((current_exercise_id+direction) < 0 || ((current_exercise_id+1)+direction)>this.activities[current_activity_id].nb_exercises){
		if(((current_exercise_id+direction) < 0 || ((current_exercise_id+1)+direction)>this.activities[current_activity_id].nb_exercises) && !(this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-score-redirect" || this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-selective-redirect")){
			//NOTHING'S NEXT, AT ACTIVITY'S END!
			return false;
		}else{
			//CHECK IF BRANCHING
			if(this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-score-redirect" || this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-selective-redirect"){
				//fCe("Passing grade: "+this.activities[current_activity_id].exercises[current_exercise_id].branching_passing_grade);
				//fCe("Pass redirection: "+this.activities[current_activity_id].exercises[current_exercise_id].branching_pass_redirection);
				//fCe("Fail redirection: "+this.activities[current_activity_id].exercises[current_exercise_id].branching_fail_redirection);
				
				if(this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-score-redirect"){ //*WIP THIS IS NOT COOL, LOOK AT THE PREVIOUS IF (SAME_THING)!
					//
					//SCORE REDIRECTION METHOD
					//
					
					exNaturalScore = 0;
					//LOOP THROUGH EXERCISES QUESTIONS TO TALLY SCORE
					for(i=0;i<this.activities[current_activity_id].exercises[current_exercise_id].questions.length;i++){
						//alert("Q-"+i+" status: "+this.activities[current_activity_id].exercises[current_exercise_id].questions[i].dv.status);
						if(this.activities[current_activity_id].exercises[current_exercise_id].questions[i].dv.status === "completed"){
							exNaturalScore +=1;
						}
					}
					//PONDERATE SCORE *WIP* NOT DONE
					
					//CHECK IF PASS REDIRECT OR FAIL REDIRECT
					if(exNaturalScore>=this.activities[current_activity_id].exercises[current_exercise_id].branching_passing_grade){
						gotoRedirection = this.activities[current_activity_id].exercises[current_exercise_id].branching_pass_redirection;
					}else{
						gotoRedirection = this.activities[current_activity_id].exercises[current_exercise_id].branching_fail_redirection;
					}
					
					
				}else if(this.activities[current_activity_id].exercises[current_exercise_id].exercise_type === "branching-selective-redirect"){
					//
					//SELECTIVE REDIRECTION METHOD
					//
					fCl("CHECK IF CORRECT Q TYPE BEFORE GOING ANY FURTHER, SHOULD BE DONE IN PRE LOADING PHASES OR qsValidateSemantic() + CAN'T HAVE RANDOM RIGHT NOW AS THE LAST QUESTION SHOULD ALWAYS BE THE SELECTIVE REDIRECTION ONE");
					gotoRedirection = $('#'+this.activities[current_activity_id].exercises[current_exercise_id].questions[this.activities[current_activity_id].exercises[current_exercise_id].nb_questions-1].dv.my_answer_id).attr('data-selective-redirection');
					//alert(gotoRedirection);
					
				}
				
				
				//CHECK IF REDIRECTION IS EXERCISE OF "f|" TYPE, GOTO FINAL FEEDBACK
				fCe('CHK:'+gotoRedirection+':'+gotoRedirection.indexOf('f|'));
				if(gotoRedirection.indexOf('f|')===0){
					qsHide("#"+this.activities[current_activity_id].id+" .qs-feedback-final .qs-final-branching-feedback");
					qsShow("#"+this.activities[current_activity_id].id+" .qs-feedback-final #"+gotoRedirection.substring(2,gotoRedirection.length)+".qs-final-branching-feedback");
					fCe('SHOW -> #'+gotoRedirection.substring(2,gotoRedirection.length))
					return false;
				}
				//GET FAKE "DIRECTION"
				nextExerciseID = this.qsGetExerciseIDFromStringID(gotoRedirection,current_activity_id);
				fCe("Pass ID: "+nextExerciseID);
				//ASSIGN DIRECTION OPERAND
				direction = nextExerciseID-current_exercise_id;
			}else{
			
			}
			
			
			//GET NEXT QUESTION ID
			next_question_id = (direction == -1) ? this.activities[current_activity_id].exercises[current_exercise_id+direction].nb_questions - 1 : 0 ;
			//DISPLAY TRANSITION BETWEEN CURRENT AND NEXT/PREVIOUS EXERCISE
			
			//Original
			qsHide("#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise .qs-question");
			fCl("---------- #"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise .qs-question")
			
			//NEW 1
			//qsHide("#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id].id+".qs-exercise .qs-question");
			//fCl("---------- #"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id].id+".qs-exercise .qs-question")
			
			qsShow("#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].id+".qs-question");
			fCl("++++++++++ #"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].id+".qs-question");
			
			qsTransition("#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id].id+".qs-exercise","#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise");
			fCl("--++--++-- #"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id].id+".qs-exercise, #"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise");
			
			//SETS DV
			this.activities[current_activity_id].dv.current_exercise_id = current_exercise_id+direction;
			this.activities[current_activity_id].dv.current_question_id	= next_question_id;
			
			//IF FIRST TIME SEEING QUESTION, MARK IT INCOMPLETE (AS OPPOSED TO UNATTEMPTED)			
			this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].dv.status = (this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].dv.status=="unattempted")?"incomplete":this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].dv.status;
			//MARK EXERCISE AS INCOMPLETE IF UNATTEMPTED
			this.activities[current_activity_id].exercises[current_exercise_id+direction].dv.status = (this.activities[current_activity_id].exercises[current_exercise_id+direction].dv.status === "unattempted")?"incomplete":this.activities[current_activity_id].exercises[current_exercise_id+direction].dv.status;
		
			//PREP NEXT QUESTION
			this.qsAddSubmitEvent(current_activity_id,current_exercise_id+direction,next_question_id);
			
			//RE-ENABLE CONTINUE BUTTONS IF ALREADY VISITED
			$("#"+this.activities[current_activity_id].id+".qs-elearning-activity  #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].id+".qs-exercise #"+this.activities[current_activity_id].exercises[current_exercise_id+direction].questions[next_question_id].id+".qs-question").find('.qs-continue').attr('disabled',false).removeClass('qs-disabled');
						
			//COMPUTE PARENT STATUSES
			this.qsComputeParentStatuses(current_activity_id);
			
			//UPDATE SCORE/PROGRESSION DISPLAY
			this.qsUpdateScoreDisplay(current_activity_id);
			
			return true;
		}
		
	}
	
	//DISPLAYS THE QUESTION #qNum (out of absolute total including exercises)
	//***WIP*** qsbeta0.89
	this.qsSwitchQuestion = function(elem,qNum){
		fCl('qsSwitchQuestion('+elem+','+qNum+')')
		ancestryIDARR = this.qsGetAncestryIDS(elem);
		current_activity = this.qsGetActivityIDFromStringID($(elem).closest('.qs-elearning-activity').attr('id'));
		
		current_exercise = this.activities[current_activity].dv.current_exercise_id;
		current_question = this.activities[current_activity].dv.current_question_id;
		nb_total_questions = this.qsComputeProgression(current_activity,"qtot");
		
		//REMOVE FINAL SUBMIT-ALL-AT-ONCE UNANSWERED QUESTIONS LIST HOLDER (DOESN'T NEED TO BE PERMANENT)
		$("#"+$(elem).closest('.qs-elearning-activity').attr('id')+" .qs-finallinkto-unanswered").remove();
		//HIDE HOLDER
		//console.log("-----> "+ancestryIDARR);
		qsHide('#'+this.activities[ancestryIDARR[0]].id+" .qs-finallinkto-unanswered-placeholder");
		
		//SAFETY CHECK
		if(qNum<=0||qNum>nb_total_questions){
			fCe("look's like you're going nowhere!(out of bounds)");
			return false;
		}
		
fCl("current_exercise:"+current_exercise+"  |current_question:"+current_question+"  |nb_questions_total:"+nb_total_questions);
		
		qAt = 0;
		qChecker = 0;
		target_exercise = -1; //ID, WHERE WERE GOING
		target_question = -1; //ID IN TARGET_EXERCISE
		target_exercise_STRID = "";
		qMatrixArr = [];
		//LOOP THROUGH EXERCISES
		for(i=0;i<this.activities[current_activity].nb_exercises;i++){
			qMatrixArr[i] = this.activities[current_activity].exercises[i].nb_questions;
			qAt+=this.activities[current_activity].exercises[i].nb_questions;
			if((qNum-1)<qAt&&target_exercise_STRID===""){
				//fCe(this.activities[current_activity].exercises[i].id);
				target_exercise = i;
				target_exercise_STRID = this.activities[current_activity].exercises[i].id;
			}
		}
		//FIND QUESTION ID IN EXERCISE (USE MATRIX)
		for(i=0;i<target_exercise;i++){
			qChecker += qMatrixArr[i];
		}
		target_question = (qNum-1)-qChecker;
		
		//CHECK IF ALREADY IN RIGHT EXERCISE
		if(current_exercise == target_exercise){
			//STAYS IN SAME EXERCISE AS CURRENT
			
			//TRANSITION FROM CURRENT QUESTION TO TARGET QUESTION
			qsTransition("#"+this.activities[current_activity].exercises[current_exercise].questions[current_question].id,"#"+this.activities[current_activity].exercises[current_exercise].questions[target_question].id)
		}else{
			//NEEDS TO CHANGE EXERCISE
			
			//HIDE ALL QUESTIONS IN TARGET EXERCISE EXCPT TARGET QUESTION
			qsHide("#"+target_exercise_STRID+" .qs-question");
			qsShow("#"+target_exercise_STRID+" #"+this.activities[current_activity].exercises[target_exercise].questions[target_question].id);
			//TRANSITION FROM CURRENT QUESTION/EXERCISE TO TARGET QUESTION/EXERCISE
			qsTransition("#"+this.activities[current_activity].exercises[current_exercise].id,"#"+this.activities[current_activity].exercises[target_exercise].id)
		}
		
		//SET NEW QUESTION DV
		this.activities[current_activity].dv.current_exercise_id = target_exercise;
		this.activities[current_activity].dv.current_question_id = target_question;
		
		//DEAL WITH NEXT BACK (DOUBLED IN QSNAVQUESTIONS) (PLEASE OPTMIZE THIS!!)
		$("#"+$(elem).closest('.qs-elearning-activity').attr('id')).find('.qs-prevquestion, .qs-nextquestion').removeClass('qs-disabled');
		//fCe(qNum +" / "+ nb_total_questions)
		if(target_exercise === 0 && target_question === 0){
			$("#"+$(elem).closest('.qs-elearning-activity').attr('id')).find('.qs-prevquestion').addClass('qs-disabled');
		}else if(qNum === nb_total_questions){
			$("#"+$(elem).closest('.qs-elearning-activity').attr('id')).find('.qs-nextquestion').addClass('qs-disabled');
		}
		
		//SUBMIT-ALL-AT-ONCE: SET FINAL SUBMIT NEW QUESTION ID (DATA-PASSTHROUGH)
		//*WIP!!
		
		this.qsUpdateScoreDisplay(current_activity);
		
		fCe("target_exercise:"+target_exercise+"  |target_question:"+target_question+"  |question_total_at:"+qNum);
		
	}
	
	//DISPLAY AND PREPARE NEXT/PREVIOUS QUESTION (CALLED FROM NEXT/PREVIOUS QUESTION BUTTONS IF NEEDED)
	this.qsNavQuestions = function (elem){
		fCl('qsNavQuestions()');
		
		//GET INFO
		current_activity = this.qsGetActivityIDFromStringID($(elem).closest('.qs-elearning-activity').attr('id'));
		current_exercise_ID = this.activities[current_activity].dv.current_exercise_id;
		current_question_ID = this.activities[current_activity].dv.current_question_id;
		
		//STOP USERS FROM GOING BACK WHEN ALREADY AT FIRST QUESTION
		if(this.activities[current_activity].dv.current_exercise_id === 0 && this.activities[current_activity].dv.current_question_id === 0 && $(elem).hasClass('qs-prevquestion')){
			fCl("cannot go back!");
			return false;
		}
		
		//STOP USERS FROM SKIPPING QUESTIONS IF NECESSARY (NEXT QUESTION ONLY, YOU CAN GO BACK ALL YOU WANT)
		if(!this.activities[current_activity].question_skipping_enabled && $(elem).hasClass('qs-nextquestion')){
			if(this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].dv.status == "unattempted" || this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].dv.status == "incomplete"){
				fCl('Cant go to the next question without answering the current first, please answer current question or contact your nextwork administrator');
				alert(this.msgs.msgQuestionUnanswered);
				return false;
			};
		}
		
		//TEMPORARILY DISABLE NEXT BACK TO STOP USER FROM SWITCHING FASTER THAN ANIMATION SEQUENCE
		//$(elem).prop('disabled',true).addClass('qs-disabled').delay(animBaseDuration*100).prop('disabled',false).removeClass('qs-disabled');
		//$(elem).addClass('qs-tmp-disabled'); //ONLY DISABLE THE ONE ACTIVATED
		$('#'+this.activities[current_activity].id).find('.qs-prevquestion, .qs-nextquestion').addClass('qs-tmp-disabled'); //DISABLE BOTH
		
		/*.delay(100).queue(function(){
			$(this).removeClass('qs-disabled');
		});*/
		setTimeout(function () { 
			//$(elem).removeClass('qs-tmp-disabled'); //ONLY DISABLE THE ONE ACTIVATED
			$('#'+$(elem).closest('.qs-elearning-activity').attr('id')).find('.qs-prevquestion, .qs-nextquestion').removeClass('qs-tmp-disabled'); //DISABLE BOTH
		}, this.settings.animBaseDuration+150);
		//$(elem).closest('.qs-elearning-activity .qs-prevquestion, .qs-elearning-activity .qs-nextquestion').prop('disabled',true).addClass('qs-disabled').delay(animBaseDuration*100).prop('disabled',false).removeClass('qs-disabled');
		
		//CALL qsNextQuestion with correct elem + logical offset (1||-1)
		if($(elem).hasClass('qs-prevquestion')){
			//BACK
			//this.qsNextQuestion("#"+$(elem).closest('.qs-elearning-activity').attr('id')+" #"+this.activities[current_activity].exercises[current_exercise_ID].id+" #"+this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].id+" .qs-submit",-1);
			this.qsNextQuestion("#"+this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].id,-1);
		}else if($(elem).hasClass('qs-nextquestion')){
			//NEXT
			//this.qsNextQuestion("#"+$(elem).closest('.qs-elearning-activity').attr('id')+" #"+this.activities[current_activity].exercises[current_exercise_ID].id+" #"+this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].id+" .qs-submit",1);
			this.qsNextQuestion("#"+this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].id,1);
			
		}
	}
	
	//DISPLAY AND PREPARE NEXT QUESTION (CALLED FROM NEXT/BACK/CONTINUE/SUBMIT BUTTON FROM LAST QUESTION)
	this.qsNextQuestion = function (elem,qOffset,excpt){
		fCl('qsNextQuestion('+elem+','+qOffset+','+excpt+')');
		//+qOffset in question queue...should be either 1, -1 or undefined (will revert to default of 1 or next question)
		qOffset = (qOffset == undefined) ? 1 : qOffset ;
		//GET ANCESTRY
		ancestryIDARR = this.qsGetAncestryIDS(elem);
		
		current_exercise = this.activities[ancestryIDARR[0]].dv.current_exercise_id;
		current_question = this.activities[ancestryIDARR[0]].dv.current_question_id;
		nb_question = this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].nb_questions;

		//DESTROY .qs-finallinkto-unanswered SINCE NAVIGATING AWAY
		$("#"+this.activities[ancestryIDARR[0]].id+' .qs-finallinkto-unanswered').remove();
		
		if(excpt !== "final-submit"){ //IGNORE ON FINAL-SUBMIT SINCE ITS NOT CHANGING QUESTION
			//DISABLE QS-PREVQUESTION IF CURRENT QUESTION IS FIRST
			//if(current_exercise === 0 && current_question+qOffset === 0){
			if(eval(this.qsComputeProgression(ancestryIDARR[0],"qat"))+qOffset === 1){
				$("#"+this.activities[ancestryIDARR[0]].id+" .qs-prevquestion").addClass('qs-disabled');
			}else{
				$("#"+this.activities[ancestryIDARR[0]].id+" .qs-prevquestion").removeClass('qs-disabled');
			}
			
			//DISABLE QS-NEXTQUESTION IF CURRENT QUESTION IS LAST UNLESS ACTIVITY STATUS IS COMPLETED
			//OLD -> if(current_question+qOffset >= nb_question && current_exercise >= this.activities[ancestryIDARR[0]].nb_exercises){
			//ORIGINAL - > if(eval(this.qsComputeProgression(ancestryIDARR[0],"qat")+1) >= eval(this.qsComputeProgression(ancestryIDARR[0],"qtot")) && qOffset === 1 && this.activities[ancestryIDARR[0]].dv.status !== "completed"){
			//fCe("TEST: "+(this.activities[ancestryIDARR[0]].dv.status !== "completed" && this.activities[ancestryIDARR[0]].submit_all_at_once));
			if(eval(this.qsComputeProgression(ancestryIDARR[0],"qat")+qOffset) >= eval(this.qsComputeProgression(ancestryIDARR[0],"qtot"))){
				//--> ADD EXCEPTION TO ALLOW NEXT ON LAST QUESTION TO COMPLETE ACTIVITY (GOTO STEP 3)
				$("#"+this.activities[ancestryIDARR[0]].id+" .qs-nextquestion").addClass('qs-disabled'); //FIX NEXT BT TO COMPLETE ACTIVITY (FINAL SUBMIT)
			}else{
				$("#"+this.activities[ancestryIDARR[0]].id+" .qs-nextquestion").removeClass('qs-disabled');
			}
			

		}else{
/*WIP*/
//TRY TO FORCE NEXT FROM LAST QUESTION EVEN IF SOMEWHERE ELSE
/*current_exercise = 0;
current_question = 3;*/
		}
		
		//DISABLE CONTINUE BUTTON *TMP IF FEEDBACK TYPE = INSTANT
		$(elem).closest('.qs-feedback').find('.qs-continue').attr('disabled',true).addClass('qs-disabled');
		
		
		
		/*HOLDER FINAL SUBMIT PLACEHOLDER*/
		
		//CHECK IF THIS IS THE LAST QUESTION (TO INSERT FINAL SUBMIT IN CASE ITS A SUBMIT ALL AT ONCE TYPE)
		if(this.activities[ancestryIDARR[0]].submit_all_at_once && eval(this.qsComputeProgression(ancestryIDARR[0],"qat")+1) == eval(this.qsComputeProgression(ancestryIDARR[0],"qtot")) && qOffset === 1){
		//if(eval(this.qsComputeProgression(ancestryIDARR[0],"qat")+1) == eval(this.qsComputeProgression(ancestryIDARR[0],"qtot")) && qOffset === 1){ //#7 XYZ

			//CHECK IF LAST QUESTION HAS FINAL SUBMIT BUTTON
			if(!$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').length){
				//NOT FOUND, ADD IT!
				//BUT ADD IT WHERE? CHECK IF HOLDER IN PLACE OR APPEND LAST QUESTION
				if($("#"+this.activities[ancestryIDARR[0]].id+" .qs-final-submit-placeholder").length){
					$("#"+this.activities[ancestryIDARR[0]].id+" .qs-final-submit-placeholder").append(this.objDefVal.domButtons.qs_submit_activity);
				}else{
					//$("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]+1].id).find('.qs-answers').append(this.objDefVal.domButtons.qs_submit_activity);
					$("#"+this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].questions[this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].nb_questions-1].id).find('.qs-answers').append(this.objDefVal.domButtons.qs_submit_activity);
				}
				
				
				//------------------
				/*
				tmpLastEx = this.activities[ancestryIDARR[0]].nb_exercises-1
				tmpLastQinLastEx = this.activities[ancestryIDARR[0]].exercises[tmpLastEx].nb_questions-1;
				fCe(ancestryIDARR[0]+" - "+ancestryIDARR[1]+" - "+ancestryIDARR[2]+" - ");
				fCe("#"+this.activities[ancestryIDARR[0]].id);
				fCe(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id);
				fCe('LAST: '+this.activities[ancestryIDARR[0]].exercises[tmpLastEx].questions[tmpLastQinLastEx].id);*/
				//fCe('LAST: '+this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises].questions[this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises].nb_question].id);
				//------------------
				
				
				//$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-passthrough',this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]+1].id);//#1


				$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-passthrough',this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].questions[this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].nb_questions-1].id);//#1b
			}
			//PASSTHROUGH INFO FOR LATER (TARGET ACTIVITY (THE ONE TO SUBMIT!))
			//$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-passthrough',this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]+1].id);//#1
			//$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-passthrough',ancestryIDARR[0]);//#2
			
			//RESET CLICK AND ADD NEW ONE
			$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').unbind('click');
			$("#"+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').click(function(){
				if(!$(this).hasClass('qs-disabled')){
					fCl('---------------------------- PRESSED FINAL ACTIVITY SUBMIT ----------------------------');
					//mThis.qsAnswerQuestion($(this),'final-submit');//,'final-submit-all-at-once'
					//FIND QUESTION ELEMENT
					

					mThis.qsAnswerQuestion($("#"+$(this).attr('data-passthrough')),'final-submit');//#1
					
					//mThis.qsAnswerQuestion($("#"+$(this).attr('data-passthrough')),'auto');//#7 XYZ
					
					//tmpAncestryIDArr = mThis.qsGetAncestryIDS($("#"+mThis.activities[$(this).attr('data-passthrough')].exercises[mThis.activities[$(this).attr('data-passthrough')].dv.current_exercise_id].questions[mThis.activities[$(this).attr('data-passthrough')].dv.current_question_id].id));//#2
					//mThis.qsAnswerQuestion($("#"+mThis.activities[tmpAncestryIDArr[0]].exercises[tmpAncestryIDArr[1]].questions[tmpAncestryIDArr[2]].id),'final-submit');//#2
				}
			});
		}/*else{
		//TMP V0.9003 ADD AUTO SUBMIT FINAL POUR SONYA (G313)
			if($("#"+this.activities[ancestryIDARR[0]].id+" .qs-final-submit-placeholder").length && eval(this.qsComputeProgression(ancestryIDARR[0],"qat")+1) == eval(this.qsComputeProgression(ancestryIDARR[0],"qtot"))){
				$("#"+this.activities[ancestryIDARR[0]].id+" .qs-final-submit-placeholder").append(this.objDefVal.domButtons.qs_submit_activity);
			}
		}*/
		
		
		if((current_question+qOffset)>=nb_question||(current_question+qOffset)<0){
			//GOING TO NEXT/PREVIOUS EXERCISE! MAYBE QUIZ COMPLETED?
			fCl('Going outside of current exercise: '+current_question+'+'+qOffset+'='+(current_question+qOffset));
			this.qsMarkExerciseDone(ancestryIDARR[0],current_exercise);
			
			//IF NEXT/PREVIOUS EXERCISE EXISTS
			if(!this.qsSwitchExercise(ancestryIDARR[0],ancestryIDARR[1],qOffset)){
				fCl('cant switch to an exercise that doesn exist');
				if(qOffset>0){
					this.qsActivityCompleted(elem);
				}
			}
			
			
		}else{
			//NEXT/PREVIOUS QUESTION...
			
			//Dispatch event
			fQsEvDp('question_navigation',{activity_dom_id:this.activities[ancestryIDARR[0]].id, direction:qOffset});
			
			this.activities[ancestryIDARR[0]].dv.current_question_id = current_question + qOffset;
			//fCe('NEW QAt='+this.activities[ancestryIDARR[0]].dv.current_question_id+' Status='+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[this.activities[ancestryIDARR[0]].dv.current_question_id].dv.status);
			
			//IF FIRST TIME SEEING QUESTION, MARK IT INCOMPLETE (AS OPPOSED TO UNATTEMPTED)
			this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question+qOffset].dv.status = (this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question+qOffset].dv.status == "unattempted")?"incomplete":this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question+qOffset].dv.status;
			//MARK EXERCISE AS INCOMPLETED IF UNATTEMPTED
			this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].dv.status = (this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].dv.status === "unattempted")?"incomplete":this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].dv.status;
			//COMPUTE PARENTS STATUSES
			this.qsComputeParentStatuses(ancestryIDARR[0]);
			
			qsTransition("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question].id,"#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question+qOffset].id);
			
			ancestrySTRARR = this.qsGetAncestryStringIDS($("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[current_question+qOffset].id));
			
			
			//
			//TYPE SUBMIT BUTTON (type-0, type-1, type-2, type-3, type-4...)
			//
			this.qsAddSubmitEvent(ancestryIDARR[0],ancestryIDARR[1],current_question+qOffset);
			
			
			//RE-ENABLE CONTINUE BUTTONS IF ALREADY VISITED *SIMPLIFY*
			$("#"+ancestrySTRARR[0]+" #"+ancestrySTRARR[1]+".qs-exercise #"+ancestrySTRARR[2]+".qs-question").find('.qs-continue').attr('disabled',false).removeClass('qs-disabled');
			
			//SCROLL TO QUESTION TOP
			if(this.activities[ancestryIDARR[0]].auto_scroll_to_question){
				$('html, body').animate({
					scrollTop: ($('#'+ancestrySTRARR[0]).offset().top)
				}, 20);
			}
			
		}
		
		//UPDATE SCORE/PROGRESSION DISPLAY
		this.qsUpdateScoreDisplay(current_activity_ID);
		
		//GIVE FOCUS TO QUESTION BLOCK *WIP*
		fFocus('#'+ancestrySTRARR[2]+'.qs-question');
		
	}
	
	//VALIDATE AND PROCESS AN ANSWER (CALLED FROM SUBMIT BUTTON IN CURRENT QUESTION): display feedback if necessary
	//qMode is used for silent answering (system, recall, etc not user pressing submit, shouldn't skip to next question on its own etc...)
	//qMode="final-all-at-once" //Batch validation from the last submit button from an exercise/activity. Disable alerts and warnings. No need to create/add events to continue buttons
	this.qsAnswerQuestion = function (elem,qMode){
		fCl('qsAnswerQuestion('+elem+" (#"+$(elem).attr('id')+")"+','+qMode+')');
		
		
		var raCheck;
		
		//GET ANCESTRY, QUESTION TYPE
		ancestryIDARR = this.qsGetAncestryIDS(elem);
		question_type = this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].question_type;
		
		qMode = (qMode === undefined)?"default":qMode;
		answerStatus = ""; //right, wrong, none ??? (maybe inbtween...)
		secondChanceNeeded = false; //true||false : 
		
		//RESET VISUAL FEEDBACK PLACEHOLDER
		if(!this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].persistent_vsfb){
			$(elem).closest('.qs-question').find('.qs-vsfbh').html('');
		}
		
		//VALIDATION
		switch(question_type){
			//
			//  TYPE-0
			//
			//OPEN ENDED QUESTION, YOU DECIDE... *FORCE TEXTAREA FOR NOW
			case "type-0":
			//CHECK IF NO ANSWER
				fCe('type-0: Needs to replace reserved chars...right now it doesnt...catastrophic failure can and will happen! FIX ME');
			
				right_answer = true;
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('textarea').each(function(){
					if($(this).val() === "" || $(this).val() === undefined || $(this).val().trim() === ""){
						right_answer = false;
					}
				});
				//SOMETHING IS EMPTY, FAIL
				if(!right_answer){
					if(qMode!=="final-submit-all-at-once"){
						alert(this.msgs.msgEmptyTextField);
					}
					return false;
				}
				//IMPLYING ANY ANSWER IS GOOD
				right_answer = true;
				answerStatus = "right";
				//DISABLE TEXTAREA UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER  -OR-  ACTIVITY_TYPE SIMPLE + SIMPLE_ACT_DISABLE_MODE
				if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
					//NOTHING FOR NOW...
				}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
					//DON'T DISABLE
				}else{
					$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('textarea').attr('disabled',true);
				}
				
				//SAVE ANSWER
				saveBuff = [];
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('textarea').each(function(){
					//CHECK FOR ILLEGAL CHARS
					$(this).val(mThis.qsValidateChars($(this).val()));
					saveBuff.push($(this).attr('id')+qSplt[0]+$(this).val());
				});
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = saveBuff.join(qSplt[1]);
				break;
			//
			//  TYPE-1
			//
			//CHOIX REPONSE UNIQUE (RADIO)
			case "type-1":
				//CHECK IF NO ANSWER
				if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').length <= 0){
					if(qMode!=="final-submit-all-at-once"){
						alert(this.msgs.msgNoSelection);
					}
					return false;
					
				}
				
				
				
				//CHECK IF RIGHT ANSWER
				raCheck = (this.settings.encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').attr('data-encoded-rep'))):($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').hasClass('ra'));
				//if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').hasClass('ra')){ //#raware!
				//if(this.qsTestAgainstEncodedValidationString('gonogo',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').attr('data-encoded-rep'))){
				if(raCheck){
					//GOOD ANSWER
					answerStatus = "right";
					//DISABLE RADIOS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').attr('disabled',true);
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).parent().find('input.qs-submit').attr('disabled',true); //CSPS-SJ disable valider
					}
				}else{
					//WRONG ANSWER
					answerStatus = "wrong";
					//SECOND CHANCE? TMP (.qs-second-chance)
					//MANAGE SECOND CHANCE(S)
					if(this.qsManageSecondChance(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id)){
						secondChanceNeeded = true;
						break;
					};
					//DISABLE RADIOS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright")){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').attr('disabled',true);
					}
				}
				//ANSWER SPECIFIC CUSTOM FEEDBACK
				qsShow($('#'+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+' .qs-feedback .qs-specific[data-specific-feedback-target='+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('input[type="radio"]:checked').attr('id')+']'));
				
				//DROP IN VSFBH
				
				//for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').length;vsfbhi++){ //<-HIGHLITE ALL MODE
				for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').length;vsfbhi++){ //<-HIGHLITE ONLY CHECKED
					//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]')[vsfbhi]
					tElem = this.qsGetClosestMatch('.qs-vsfbh',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi].id);
					
					raCheck = (this.settings.encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).attr('data-encoded-rep'))):($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).hasClass('ra'));
					//if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).hasClass('ra')){ //#raware!
					//if(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).attr('data-encoded-rep'))){
					if(raCheck){
						$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
					}else{
						$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
					}
					
					
					//$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
				}
				//SHOW VSFBH
				qsShow("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+" .qs-vsfbh");
				//END DROP IN VSFBH
				
				//SAVE ANSWER
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = $(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').attr('id');
				break;
			//
			//  TYPE-2
			//
			//CHOIX REPONSE MULTIPLE (CHECKBOX)
			case "type-2":
				//NO ANSWER SELECTED IS NOT A POSSIBILITY, VALIDATE NO SELECTION UNLESS EMPTY_ALLOWED
				if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked').length <= 0 && !this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].empty_allowed){
					if(qMode!=="final-submit-all-at-once"){
						alert(this.msgs.msgNoMultiSelection);
					};
					return false;
				}
				
				//...
				right_answer = true;
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]').each(function (){
					
					
					raCheck = (mThis.settings.encodeAnswers)?(mThis.qsTestAgainstEncodedValidationString('gonogo',$(this).attr('data-encoded-rep'))!=$(this).prop('checked')):($(this).hasClass('ra') != $(this).prop('checked'));

					//if($(this).hasClass('ra') != $(this).prop('checked')){ //#raware!
					//if(mThis.qsTestAgainstEncodedValidationString('gonogo',$(this).attr('data-encoded-rep'))!=$(this).prop('checked')){
					if(raCheck){
						right_answer = false;
						return false;
					}
				});
				if(right_answer){
					//GOOD ANSWERS
					answerStatus = "right";
					//DISABLE CHECKBOXES UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]').attr('disabled',true);
					}
				}else{
					//WRONG ANSWERS
					answerStatus = "wrong";
					//SECOND CHANCE? TMP (.qs-second-chance)
					//MANAGE SECOND CHANCE(S)
					if(this.qsManageSecondChance(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id)){
						secondChanceNeeded = true;
						break;
					};
					//DISABLE CHECKBOXES UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright")){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]').attr('disabled',true);
					}
				}
				
				//ANSWER SPECIFIC CUSTOM FEEDBACK
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('input[type="checkbox"]:checked').each(function(ind,val){
					qsShow($('#'+mThis.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+' .qs-feedback .qs-specific[data-specific-feedback-target='+$(this).attr('id')+']'));
				});
				
				//DROP IN VSFBH
				
				for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]').length;vsfbhi++){ //<-HIGHLITE ALL MODE
				//for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked').length;vsfbhi++){ //<-HIGHLITE ONLY CHECKED
					//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]
					tElem = this.qsGetClosestMatch('.qs-vsfbh',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi].id); //<-HIGHLITE ALL MODE
					//tElem = this.qsGetClosestMatch('.qs-vsfbh',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked')[vsfbhi].id); //<-HIGHLITE ONLY CHECKED
					
					//  \|/ HIGHLITE ALL MODE \|/
					raCheck=(this.settings.encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]).attr('data-encoded-rep'))):($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]).hasClass('ra'));
					//if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]).hasClass('ra')){ //#raware!
					//if(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]).attr('data-encoded-rep'))){
					if(raCheck){
						if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi].checked){
							$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
						}else{
							$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
						}
					}else{
						if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi].checked){
							$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
						}else{
							$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
						}
					}
					
					/*//  \|/ HIGHLITE ONLY CHECKED \|/ !!!IMPORTANT DON'T DELETE!!!
					if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked')[vsfbhi]).hasClass('ra')){
					//if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]')[vsfbhi]).hasClass('ra')){
						$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
					}else{
						$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
					}
					*/
					
					//$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
				}
				//SHOW VSFBH
				qsShow("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+" .qs-vsfbh");
				//END DROP IN VSFBH
				
				
				//SAVE ANSWER(S)
				saveBuff = [];
				for(i=0;i<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked').length;i++){
					saveBuff.push($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked').eq(i).attr('id'));
				}
				//this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = saveBuff.join(',');
				//this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = "";
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = ($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="checkbox"]:checked').length<1)?"":saveBuff.join(',');
				break;
				
			//
			//  TYPE-3
			//
			//TEXTFIELD(S) SIMPLE
			case "type-3":
				//CHECK IF NO ANSWER (ANY EMPTY TEXTFIELD)
				tfEmpty = false;
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').each(function(){
					if($(this).val() == "" || $(this).val() == undefined){
						tfEmpty = true;
					}
				});
				
				if(tfEmpty){
					if(qMode!=="final-submit-all-at-once"){
						alert(this.msgs.msgEmptyTextField);
					}
					return false;
				}
				
				//CHECK IF ALL GOOD ANSWERS + ADD CLASS TO TEXTFIELDS DEPENDING ON RESULT
				
				right_answer = true;
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').each(function (){
					
					var testFor = $(this).val();
					//var testAgainst = $(this).attr('data-rep'); //#raware2!
					var testAgainst = (mThis.settings.encodeAnswers)?mThis.qsTestAgainstEncodedValidationString('encrypt',$(this).attr('data-encoded-rep')):$(this).attr('data-rep'); 
					//CHECK IF IGNORE CASE					
					var isIgnoringCase = mThis.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].ignore_case;
					//COMPARE TO LOWERCASES
					if(isIgnoringCase){
						testFor = testFor.toLowerCase();
						testAgainst = testAgainst.toLowerCase();
					};
					//MULTIPLE POSSIBLE ANSWERS?
					if(testAgainst.split('|').length>1){
						fCl('Test against "|" other reserved chars');
						var iMulti;
						tmp_right_answer = false;
						for(iMulti=0;iMulti<testAgainst.split('|').length;iMulti++){
							if(testFor == testAgainst.split('|')[iMulti]){
								tmp_right_answer = true;
								break;
							}
						}
						if(!tmp_right_answer){
							right_answer = false;
							//ASSIGN CLASS DEPENDING ON RESULT
							$(this).addClass('qs_wrong_answer');
						}else{
							//ASSIGN CLASS DEPENDING ON RESULT
							$(this).addClass('qs_good_answer');
						}
					//SINGLE POSSIBLE ANSWER
					}else{
						if(testFor != testAgainst){
							right_answer = false;
							//ASSIGN CLASS DEPENDING ON RESULT
							$(this).addClass('qs_wrong_answer');
						}else{
							//ASSIGN CLASS DEPENDING ON RESULT
							$(this).addClass('qs_good_answer');
						}
					}
					
				});
	
				if(right_answer){
					
					//GOOD ANSWERS
					answerStatus = "right";
					//DISABLE TEXTFIELDS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').attr('disabled',true);
					}
				}else{
					
					//WRONG ANSWERS
					answerStatus = "wrong";
					//SECOND CHANCE? TMP (.qs-second-chance)
					//MANAGE SECOND CHANCE(S)
					if(this.qsManageSecondChance(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id)){
						secondChanceNeeded = true;
						break;
					};
					//DISABLE TEXTFIELDS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright")){
						//DON'T DISABLE
					}else{
						$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').attr('disabled',true);
					}
				}
				
				
				//DROP IN VSFBH
				for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').length;vsfbhi++){
					tElem = this.qsGetClosestMatch('.qs-vsfbh',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]')[vsfbhi].id);
					if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]')[vsfbhi]).hasClass('qs_good_answer')){
						$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
					}else{
						$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
					}
				}
				//SHOW VSFBH
				qsShow("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+" .qs-vsfbh");
				//END DROP IN VSFBH
				
				
				
				//SAVE ANSWER(S)
				var saveBuff = [];
				for(i=0;i<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').length;i++){
					//TEST FOR ILLEGAL CHARS (THIS SO NEEDS TO BE IN A FUNCTION SOMEWHERE)
					
					$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val(this.qsValidateChars($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val()));
					
					saveBuff.push($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).attr('id')+qSplt[0]+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val());
				}
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = saveBuff.join(qSplt[1]);
				
				break;
			//
			//  TYPE-4
			//
			//DROPDOWN(S)
			case "type-4":
				//CHECK IF EMPTIES
				dDEmpty = false;
				dDDuplicateArr = []; //FOR LATER USE TESTING AGAINST DUPLICATE ANSWERS
				dDAnswerArr = []; //PUSH TRUE/FALSE IN HERE IF GOOD/WRONG ANSWERS!
				$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('select').each(function(){
					//fCe('TYPE-4 (checkempties):: '+$(this).attr('id')+"  ->  "+$(this).val());
					//CHECK IF EMPTY
					if($(this).val() === null || $(this).val() == 0){
						dDEmpty = true;
					}
					//CHECK ANSWERS WHILE WERE AT IT
					dDAnswerArr.push([$(this).attr('id'),($(this).attr('data-rep') === $(this).val()),$(this).val()]);
					
					//FILL IN DUPLICATE TESTER ARR WHILE WERE AT IT
					dDDuplicateArr.push($(this).val());
				});
				//EMPTIES? ABORT!
				if(dDEmpty){
					if(qMode!=="final-submit-all-at-once"){
						alert(this.msgs.msgEmptyDropDown);
					}
					return false;
				}
				//CHECK IF DUPLICATE SELECTED (CHECK OPTIONS)
				//fCe("X  "+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].allow_duplicate_answer+"   ||   "+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('select').length);
				//CSPS-SJ check duplicate
				//console.log(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].allow_duplicate_answer)
				/*if(this.objDefVal.type_4.allow_duplicate_answer==false){
					
				}*/
				
				if(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].allow_duplicate_answer == false && $(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('select').length > 0){
				//fCe("Y");
					dDDuplicateSel = false;
					//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('select').each(function(){
					//	fCe('TYPE-4 (checkduplicatesanswers):: '+$(this).attr('id')+"  ->  "+$(this).val());
					//});

					//SORT DUPLICATE ARR
					dDDuplicateArr.sort();
					for(i in dDDuplicateArr){
						if(dDDuplicateArr[i] === dDDuplicateArr[i-1]){
							dDDuplicateSel = true;
						}
					}
					//DUPLICATED? ABORT!
					if(dDDuplicateSel){
						if(qMode!=="final-submit-all-at-once"){
							alert(this.msgs.msgDuplicateDropDown);
						}
						return false;
					}
				}
				
				//CHECK IF ALL GOOD ANSWERS
				right_answer = true;

				for(i=0;i< dDAnswerArr.length;i++){//for(i in dDAnswerArr){
					if(!dDAnswerArr[i][1]){
						right_answer = false;
					}
					//DISABLE SELECTS
					//fCl("select#"+dDAnswerArr[i][0]);
					//$("select#"+dDAnswerArr[i][0]).prop('disabled','disabled');
					//$("select#"+dDAnswerArr[i][0]).attr('disabled','disabled');
					
					//DROP IN VSFBH *WIP*
					//fCe('asda'+dDAnswerArr[i]);
					//fCe("#"+dDAnswerArr[i][0]);
					//CLEAR UP VSFBH
					
					
					//this.qsGetFarthestNonCommonParent(dDAnswerArr[i][0]);
					//fCe(this.qsGetClosestMatch('.qs-vsfbh',dDAnswerArr[i][0]));
					
					tElem = this.qsGetClosestMatch('.qs-vsfbh',dDAnswerArr[i][0]);
					
					if(dDAnswerArr[i][1]){
						//GOOD
						//$("#"+dDAnswerArr[i][0]).closest('label').find('.qs-vsfbh').html(this.objDefVal.domVisuals.positive_feedback);
						$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
						//$("#"+dDAnswerArr[i][0]).closest('label').find('.qs-vsfbh').show().css({'background-image':'url("images/ico_right.jpg")','width':'19px','height':'19px','display':'inline-block','background-size':'19px'});
					}else{
						//BAD
						//$("#"+dDAnswerArr[i][0]).closest('label').find('.qs-vsfbh').html(this.objDefVal.domVisuals.negative_feedback);
						$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
						//$("#"+dDAnswerArr[i][0]).closest('label').find('.qs-vsfbh').show().css({'background-image':'url("images/ico_wrong.jpg")','width':'19px','height':'19px','display':'inline-block','background-size':'19px'});
					}
					
					//SHOW
					qsShow($("#"+dDAnswerArr[i][0]).closest('.qs-answers').find('.qs-vsfbh')); //*WIP NEEDS TO BE OUTSIDE OF LOOP
					
					//END DROP IN VSFBH *WIP*
					
				}
			

				if(right_answer){
					//GOOD ANSWERS
					answerStatus = "right";
				}else{
					//WRONG ANSWERS
					answerStatus = "wrong";
					//MANAGE SECOND CHANCE(S)
					if(this.qsManageSecondChance(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id)){
						secondChanceNeeded = true;
						break;
					};
				}
				
				//ANSWER SPECIFIC CUSTOM FEEDBACK
				//LOOP THROUGH ALL AND SHOW PROPER SPECIFIC FEEDBACK IF NECESSARY DEPENDING ON ANSWER
				for(i in dDAnswerArr){
					//DISABLE SELECTS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
						//DON'T DISABLE
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright"){
						if(answerStatus==="right"){
							$("select#"+dDAnswerArr[i][0]).prop('disabled','disabled');
						}else if(dDAnswerArr.length>1 && dDAnswerArr[i][1]){//CSPS-SJ
							//if there are alot of answers in the same page.
							$("#"+dDAnswerArr[i][0]).prop('disabled','disabled');
						}//ELSE NOTHING!
						
					}else{
						$("select#"+dDAnswerArr[i][0]).prop('disabled','disabled');
					}
					//CHECK SPECIFIC NEGATIVES
					if($("#"+dDAnswerArr[i][0]).attr('data-specific-negative-feedback') !== undefined && dDAnswerArr[i][1] === false){
						qsShow($("#"+$("#"+dDAnswerArr[i][0]).attr('data-specific-negative-feedback')));
					}
					//CHECK SPECIFIC POSITIVES
					if($("#"+dDAnswerArr[i][0]).attr('data-specific-positive-feedback') !== undefined && dDAnswerArr[i][1] === true){
						qsShow($("#"+$("#"+dDAnswerArr[i][0]).attr('data-specific-positive-feedback')));
					}
				}
				
				
				
				//SAVE ANSWER(S)
				var saveBuff = [];
				//for(i=0;i<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('select').length;i++){
				for(i in dDAnswerArr){
					
					saveBuff.push(dDAnswerArr[i][0]+qSplt[0]+dDAnswerArr[i][2])
					
					//saveBuff.push($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).attr('id')+qSplt[0]+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val());
					
					
					//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val(this.qsValidateChars($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val()));
					
					//saveBuff.push($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).attr('id')+qSplt[0]+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="text"]').eq(i).val());
				}
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = saveBuff.join(qSplt[1]);
				
				break;
				
			//
			//  TYPE-4
			//
			//INPUT BUTTONS
			case "type-5":
				//CHECK IF NO ANSWER (UNNECESSARY!)
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				//CHECK IF RIGHT ANSWER
				raCheck = (this.settings.encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$(elem).attr('data-encoded-rep'))):($(elem).hasClass('ra'));

				if(raCheck){
					//GOOD ANSWER
					answerStatus = "right";
					//DISABLE RADIOS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"){
						//DON'T DISABLE
					}else{
						$(elem).closest('.qs-answers').find('input[type=button]').attr('disabled',true);
						//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').attr('disabled',true);
						//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).parent().find('input.qs-submit').attr('disabled',true); //CSPS-SJ disable valider
					}
				}else{
					//WRONG ANSWER
					answerStatus = "wrong";
					//SECOND CHANCE? TMP (.qs-second-chance)
					//MANAGE SECOND CHANCE(S)
					if(this.qsManageSecondChance(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id)){
						secondChanceNeeded = true;
						break;
					};
					//DISABLE RADIOS UNLESS SUBMIT-ALL-AT-ONCE && !SUBMIT-AAO-DISABLE-RIGHT-ANSWER
					if((qMode=="final-submit-all-at-once"||qMode=="final-submit")&&!this.activities[ancestryIDARR[0]].submit_aao_disable_right_anwers){
						//NOTHING FOR NOW...
					}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright")){
						//DON'T DISABLE
					}else{
						//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').attr('disabled',true);
						$(elem).closest('.qs-answers').find('input[type=button]').attr('disabled',true);
					}
				}
				
				//ANSWER SPECIFIC CUSTOM FEEDBACK
				qsShow($('#'+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+' .qs-feedback .qs-specific[data-specific-feedback-target='+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('input[type="radio"]:checked').attr('id')+']'));
				





				
				//Put classes to identify answer: .qs-answered vs .qs-unanswered				
				for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"]').length;vsfbhi++){
					//[id="'+$(elem).attr('id')+'"]
					//tElemId = $(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"]').attr('id');
					
					
					if($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"]')[vsfbhi].id === $(elem).attr('id')){
						$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"]')[vsfbhi]).addClass('qs-answered');
					}else{
						$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"]')[vsfbhi]).addClass('qs-unanswered');
					}
					

				}




				
				
fCe('type-5 → test for highlite all mode...');				
				//DROP IN VSFBH
				
				//for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').length;vsfbhi++){ //<-HIGHLITE ALL MODE
				//for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').length;vsfbhi++){ //<-HIGHLITE ONLY CHECKED
				
				//for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]').length;vsfbhi++){ //<-HIGHLITE ALL MODE
				for(vsfbhi=0;vsfbhi<$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"][id="'+$(elem).attr('id')+'"]').length;vsfbhi++){ //<-HIGHLITE ONLY CHECKED
				
					//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]')[vsfbhi]
					tElem = this.qsGetClosestMatch('.qs-vsfbh',$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"][id="'+$(elem).attr('id')+'"]')[vsfbhi].id);

					//raCheck = (encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).attr('data-encoded-rep'))):($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).hasClass('ra'));
					raCheck = (this.settings.encodeAnswers)?(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"][id="'+$(elem).attr('id')+'"]')[vsfbhi]).attr('data-encoded-rep'))):($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="button"][id="'+$(elem).attr('id')+'"]')[vsfbhi]).hasClass('ra'));


					//if($($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).hasClass('ra')){ //#raware!
					//if(this.qsTestAgainstEncodedValidationString('gonogo',$($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked')[vsfbhi]).attr('data-encoded-rep'))){
					if(raCheck){
						$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
					}else{
						$(tElem).html(this.objDefVal.domVisuals.negative_feedback);
					}
					
					
					//$(tElem).html(this.objDefVal.domVisuals.positive_feedback);
				}
				
				//SHOW VSFBH
				qsShow("#"+this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id+" .qs-vsfbh");
				//END DROP IN VSFBH
	
				
				//SAVE ANSWER
				//this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = $(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].answers.elem).find('input[type="radio"]:checked').attr('id');
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.my_answer_id = $(elem).attr('id');
				

				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				break;	
			default:
			fCe("qsAnswerQuestion: unknown question type...");
		
		}
		
		fCl("Answer(s) validated!");
		
		//
		//GENERIC (NOT SPECIFIC TO ANYTHING)
		//
		//
		//ANSWER STATUS SPECIFIC
		//qsHide($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback'));
		//SIMPLE FEEDBACK DISPLAY
		if(answerStatus === "right"){
			//GOOD ANSWER
			//
			//DISPLAY FEEDBACK RIGHT AWAY IF NEEDED (HIDE OPPOSITE FEEDBACK)
			qsShow($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-right, .qs-feedback .qs-generic'));
			qsHide($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-wrong'));
			//SETS QUESTION AS COMPLETED + class
			$(elem).closest('.qs-question').attr('data-status','completed');
			this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.status = "completed";
		}else if(answerStatus === "wrong"){
			//WRONG ANSWER
			//
			//IF SECOND CHANCE
			if(secondChanceNeeded){
				qsHide($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-wrong, .qs-feedback .qs-right, .qs-feedback .qs-generic'));
				qsShow($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-second-chance'));
			}else{
				//
				//DISPLAY FEEDBACK RIGHT AWAY IF NEEDED (HIDE OPPOSITE FEEDBACK)
				qsShow($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-wrong, .qs-feedback .qs-generic'));
				qsHide($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-right'));
				//SETS QUESTION AS FAILED + class
				$(elem).closest('.qs-question').attr('data-status','failed');
				this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].dv.status = "failed";
			}
		}
		
		if(!secondChanceNeeded){
			//HIDE SECOND CHANCES
			qsHide($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback .qs-second-chance'));
			//DISABLE SUBMIT BUTTON (UNLESS...)
			//}else if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright")){
			if(this.activities[ancestryIDARR[0]].activity_type==="simple"&&((answerStatus==="right"&&this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never")||(answerStatus==="wrong"&&(this.activities[ancestryIDARR[0]].simple_act_disable_mode==="onright"||this.activities[ancestryIDARR[0]].simple_act_disable_mode==="never")))){
				fCe("Nothing here...normal?");
			}else{
				$(elem).closest('.qs-answers').find('.qs-submit').unbind().attr('disabled',true).addClass('qs-disabled');
			}
			//UPDATE PARENT STATUSES
			this.qsComputeParentStatuses(ancestryIDARR[0]);
			
			//Update Score Display
			this.qsUpdateScoreDisplay(ancestryIDARR[0]);
			
			//GET QUESTION FEEDBACK TYPE
			questionFeedbackType = this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].feedback_type;
			
			if(questionFeedbackType == "deferred" || questionFeedbackType == "none"){
				//KEEP GOING IF FEEDBACK-TYPE == "deferred" || "none"
				//WAS THIS WHOLE FUNCTION CALLED FROM A HUMAN (DEFAULT) OR AUTOMATICALLY (ON ARRIVAL ON A PRE-ANSWERED QUESTION FROM TRACKING)
				if(qMode === "default"){
					this.qsNextQuestion(elem);
					fCl('DEFAULT');
				}else if(qMode === "final-submit"){//final-submit-all-at-once
					//this.qsNextQuestion(elem);//SHOULDNT THAT BE THE LAST ELEMENT ALWAY, NO MATTER WHAT?
					this.qsNextQuestion(elem,123456,'final-submit');//SHOULDNT THAT BE THE LAST ELEMENT, NO MATTER WHAT?
					fCe('*WIP !IMPORTANT! PLEASE FIX FORCED HARDCODED INTEGER "123456"!!!');
					
										
					//this.qsNextQuestion($("#q2"));
					//this.qsNextQuestion(elem,undefined,"final-submit-skip-to-next-unanswered");
					
				}
				//this.qsNextQuestion(elem); //TMP WTF WHY WOULD YOU BREAK THE RECALL FUNCTION
				//fCe('Here is something breaking the recall function... has something to do with changing exercise... (FIND -> "VALIDATE AUTOMATICALLY" for more problems... seriously find the 3 auto-triggers and comment them, it fixes the problem (but nothing is submitted anymore...))');
			}else if(questionFeedbackType == "instant"){
				//ELSE... DISPLAY FEEDBACK + CONTINUE BT IF FEEDBACK-TYPE == "instant"
				
				//CHECK IF LAST QUESTION
				//alert(this.activities[ancestryIDARR[0]].dv.current_exercise_id+"."+this.activities[ancestryIDARR[0]].dv.current_question_id);
				
				
				//CHECK IF QS-CONTINUE BT EXISTS (CREATE IT IF IT DOES NOT EXISTS |OR| IF IT'S ACTIVITY-TYPE=SIMPLE |OR| IF IT'S THE LAST QUESTION WITHOUT ANY QS-FEEDBACK-FINAL OR )

				//alert((this.qsComputeProgression(ancestryIDARR[0],'qat') === this.qsComputeProgression(ancestryIDARR[0],'qtot')));
				//alert($(this.activities[ancestryIDARR[0]].elem).find('.qs-feedback-final').length>0);
				
				//LETS SIMPLIFY...
				A=!$(elem).closest('.qs-question').find('.qs-continue').length; //DOES IT ALREADY EXIST
				B=this.activities[ancestryIDARR[0]].activity_type!="simple"; //IS IT <<SIMPLE>>
				C=$(this.activities[ancestryIDARR[0]].elem).find('.qs-feedback-final').length; //IS THERE A FINAL FEEDBACK PHASE
				D=this.qsComputeProgression(ancestryIDARR[0],'qat') !== this.qsComputeProgression(ancestryIDARR[0],'qtot'); //IS THIS THE LAST QUESTION
				
				//alert(A+" - "+B+" - "+C+" - "+D);
				//TRUE - TRUE - 1 - FALSE = HAVE THE SUBMIT FINAL APPEAR INSTEAD (qs-final-submit-placeholder)
				
				
				//if(!$(elem).closest('.qs-question').find('.qs-continue').length && this.activities[ancestryIDARR[0]].activity_type!="simple"){
				//if(!$(elem).closest('.qs-question').find('.qs-continue').length && this.activities[ancestryIDARR[0]].activity_type!="simple" && ($(this.activities[ancestryIDARR[0]].elem).find('.qs-feedback-final').length>0 && this.qsComputeProgression(ancestryIDARR[0],'qat') === this.qsComputeProgression(ancestryIDARR[0],'qtot'))){
				//if((A&&B)||C){
				if(A&&B){
					//fCl('A&&B');
					if(!C&&!D){
						//fCl('!C&&!D');
					}else if(C&&!D){
						//ADD FINAL CONTINUE BUTTON //G313 EXCEPTION FINAL SUBMIT BUTTON ON NON SUBMIT-ALL-AT-ONCE TYPE ACTIVITY
						//fCl('C&&!D');
						//fCe('TERRIBLE IDEA, FIX THIS!!!! (G313 EXCEPTION) '+this.activities[ancestryIDARR[0]].force_insert_final_submit);
						//$(elem).closest('.qs-question').find('.qs-feedback').append(this.objDefVal.domButtons.qs_submit_activity);
						if(this.activities[ancestryIDARR[0]].force_insert_final_submit){
//alert('LAST QUESTION, INSERT EXCEPTION FINAL SUBMIT IN HERE...'+'#'+this.activities[ancestryIDARR[0]].id);

//console.error("INSIDE CURRENT QUESTION:::"+$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-final-submit-placeholder').length);
//console.error("INSIDE CURRENT ACTIVITY:::"+$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-final-submit-placeholder').length);


							//ADD IT EVERYWHERE
							$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-final-submit-placeholder').html(this.objDefVal.domButtons.qs_submit_activity);
							//ADD IT TO CURRENT QUESTION ONLY
							//$(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-final-submit-placeholder').html(this.objDefVal.domButtons.qs_submit_activity);

							$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-pass-id',this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].id);

//fCl('EX-->'+(this.activities[ancestryIDARR[0]].nb_exercises-1));
//fCl('Q-->'+(this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].nb_questions-1));
//this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].questions[this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].nb_questions-1].id


//TMP PASS LAST QUESTION OF ACTIVITY ID							
//$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').attr('data-pass-id-b',this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].questions[this.activities[ancestryIDARR[0]].exercises[this.activities[ancestryIDARR[0]].nb_exercises-1].nb_questions-1].id);

							
							$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').unbind('click');
							$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-submit-activity').click(function(){
								if(!$(this).hasClass('qs-disabled')){
									fCl('---------------------------- PRESSED CONTINUE FROM FEEDBACK BOX AFTER ANSWERING QUESTION (CREATED VIA qsAnswerQuestion()) ----------------------------');
									//mThis.qsNextQuestion(this);
									
									//GOOD ONE->//mThis.qsNextQuestion($('#'+$(this).attr('data-pass-id')));
									//FORCE FINAL SUBMIT
									mThis.qsNextQuestion($('#'+$(this).attr('data-pass-id')),1,'final-submit');

									//mThis.qsNextQuestion("#"+this.activities[current_activity].exercises[current_exercise_ID].questions[current_question_ID].id,1)
								}
							});
						}
					}else{
						//fCl('ELSE C&&!D');
						//ADD CONTINUE BUTTON
						$(elem).closest('.qs-question').find('.qs-feedback').append(this.objDefVal.domButtons.qs_continue);
						//this.objDefVal.domButtons.qs_continue
					}
					
				}
				
				
				//DISPLAY FEEDBACK
				qsFadeIn($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback'));
				
				//GIVE FOCUS TO FEEDBACK
				fFocus($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback'));
			
				
				//ADD ACTIONS TO THE CONTINUE BUTTON
				$(elem).closest('.qs-question').find('.qs-continue').unbind('click');
				$(elem).closest('.qs-question').find('.qs-continue').click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- PRESSED CONTINUE FROM FEEDBACK BOX AFTER ANSWERING QUESTION (CREATED VIA qsAnswerQuestion()) ----------------------------');
						mThis.qsNextQuestion(this);
					}
				});	
			}
			//DISPATCHER CALL!
			fQsEvDp('question_answered',{activity_dom_id:this.activities[ancestryIDARR[0]].id,answer_status:answerStatus});
		}else{
			//DISPLAY FEEDBACK
			qsFadeIn($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback'));
			
			//GIVE FOCUS TO FEEDBACK
			fFocus($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem).find('.qs-feedback'));
		}
		
		
	}
	
	//CHECK IF EXERCISE IS STATUS COMPLETED BASED ON QUESTION STATUS AND WHIL YOU'RE AT IT WHY DON'T YOU CHECK IF THE ACTIVITY IS DONE TOO
	this.qsMarkExerciseDone = function(activity_id, exercise_id){
		fCl('qsMarkExerciseDone()');
		//"unattempted, incomplete, completed, failed"
		if(this.activities[activity_id].exercises[exercise_id].dv.status == "completed" || this.activities[activity_id].exercises[exercise_id].dv.status == "failed"){
			return false;
		}else{
			allGood = true;
			//CHECK IF ALL QUESTIONS WERE ANSWERED
			for(i=0;i<this.activities[activity_id].exercises[exercise_id].nb_questions;i++){
				if(this.activities[activity_id].exercises[exercise_id].questions[i].dv.status!="completed" && this.activities[activity_id].exercises[exercise_id].questions[i].dv.status!="failed"){
					allGood = false;
					break;
				}
			}
			if(allGood){
				//COMPLETED FOR NOW (EVEN IF FAILED)
				$('#'+this.activities[activity_id].exercises[exercise_id].id+'.qs-question').attr('data-status','completed');
				this.activities[activity_id].exercises[exercise_id].dv.status = "completed";
				
				//NOW CHECK IF THAT ALSO IMPLIES ACTIVITY IS COMPLETED
				allGood_b = true;
				for(i=0;i<this.activities[activity_id].nb_exercises;i++){
					if(this.activities[activity_id].exercises[i].dv.status != "completed"){
						allGood_b = false;
						break;
					}
				}
				if(allGood_b){
					//SEEMS LIKE THIS ACTIVITY IS COMPLETED (FOR NOW COMPLETED MEANS DONE NO MATTER THE SCORE)
					$('#'+this.activities[activity_id].id+'.qs-question').attr('data-status','completed');
					this.activities[activity_id].dv.status = "completed";
				}
			}
		}
		
		//REDUNDANT SET STATUSES TO PARENTS
		this.qsComputeParentStatuses(activity_id);
		
	}
	
	//CALL ME WHEN IM DONE WITH THE ACTIVITY
	this.qsActivityCompleted = function (elem){
		fCl('qsActivityCompleted()');
		ancestryIDARR = this.qsGetAncestryIDS(elem);
		
		//FINAL SUBMIT ALL AT ONCE
		if(this.activities[ancestryIDARR[0]].submit_all_at_once){
			//ENGAGE ACTIVITY FINAL SUBMITER (ALL AT ONCE)
			var i,ii,iii;
			//*WTF: SHOULDN'T THIS CHECK ONLY ONE ACTIVITY? WHY DOES IT CHECK EVERY ACTIVITIES OUT THERE?
			for(i=0;i<this.activities.length;i++){
				for(ii=0;ii<this.activities[i].exercises.length;ii++){
					for(iii=0;iii<this.activities[i].exercises[ii].questions.length;iii++){
						if(this.activities[i].exercises[ii].questions[iii].dv.status !== "failed" || this.activities[i].exercises[ii].questions[iii].dv.status !== "completed"){
							this.qsAnswerQuestion(this.activities[i].exercises[ii].questions[iii].elem,"final-submit-all-at-once"); //DISABLE THE ALERTS
						}
					}
				}
			}
		}
		
		//COURSE COMPLETION
		// trigger_course_completion
		// trigger_completion_score
		if(this.activities[ancestryIDARR[0]].trigger_course_completion){
			//CHECK IF GOT PASSING GRADE
			fCe('COURSE COMPLETION VALIDATION:'+this.qsComputeActivityScore(ancestryIDARR[0],'perc')+"% ("+this.activities[ancestryIDARR[0]].trigger_completion_score+"% OR MORE NEEDED TO GRADUATE)\nCOURSE COMPLETION TRIGGER IS CURRENTLY INCOMPLETE AND WILL NOT SAVE ANYTHING TO THE LMS");
			if(this.qsComputeActivityScore(ancestryIDARR[0],'perc') >= this.activities[ancestryIDARR[0]].trigger_completion_score){
				fCl('TRIGGER COURSE COMPLETION!');
				try {
					scorm.complete();
				}
				catch(err) {
					fCe(err.message);
				}
			}
		}else{
			fCl('ACTIVITY COMPLETED: NO SCORM TRIGGERING');
		}
		
		//CHECK IF .qs-feedback-final exists and is necessary
		if(!$("#"+this.activities[ancestryIDARR[0]].id+".qs-elearning-activity .qs-feedback-final").length && !this.activities[ancestryIDARR[0]].recap_required){
			//
			//SAVE DATA
			this.qsSaveData(ancestryIDARR[0]);
			return true;
			//STOP RIGHT THERE;
		}else{
			fCl('RECREATE MISSING .qs-feedback-final + qs-recap-template + buttons....*WIP');
		}
		
		
		//CHECK IF ALL QUESTIONS ANSWERED, COMPILE LIST
		//*WUT: SHOULDN'T THIS CHECK ONLY ONE ACTIVITY? WHY DOES IT CHECK EVERY ACTIVITIES OUT THERE?
		//*TMP: could be simplified by checking exercise or activity status if only it was reliable (eventually)
		//*WIP: SHOULD GO BEFORE SAVE DONT YOU THINK? (check few lines up)
		//*WIP: SINCE BRANCHING QUIZZES DONT NEED USER TO ANSWER EVERTYHING, MAYBE SKIP THIS STEP?
		if(this.activities[ancestryIDARR[0]].activity_type !== "branching"){
			var i,ii,iii;
			var allQuestionsAnswered = true;
			var unansweredArr = [];
			var masterCounter = 0;
			/*NEW*/
			for(ii=0;ii<this.activities[ancestryIDARR[0]].exercises.length;ii++){
				for(iii=0;iii<this.activities[ancestryIDARR[0]].exercises[ii].questions.length;iii++){
					masterCounter+=1;
					if(this.activities[ancestryIDARR[0]].exercises[ii].questions[iii].dv.status !== "completed" && this.activities[ancestryIDARR[0]].exercises[ii].questions[iii].dv.status !== "failed"){
						unansweredArr.push(masterCounter+","+ii+","+iii);
						allQuestionsAnswered = false;
					}
				}
			}
			//NOT EVERYTHING IS ANSWERED, DO SOMETHING ABOUT IT (SUBMIT-ALL-AT-ONCE)
			if(!allQuestionsAnswered){
				alert(this.msgs.msgActivityNotCompleted);
				//REMOVE LINKS TO UNANSWERED QUESTIONS BEFORE IN CASE THERE ALREADY ONE
				$('#'+this.activities[ancestryIDARR[0]].id+" .qs-finallinkto-unanswered").remove();
				//APPEND LINKS TO UNANSWERED QUESTIONS AFTER FINAL SUBMIT THINGY
				linksBuffer = '<div class="qs-finallinkto-unanswered"><ul>';
				var i;
				for(i=0;i<unansweredArr.length;i++){
					//linksBuffer += '<li><a href="javascript:'+objAcc+'.qsSwitchQuestion(\'#'+$(elem).closest('.qs-question').attr('id')+'\','+unansweredArr[i].split(',')[0]+');">'+this.msgs.msgUnanweredQuestionGotoPrefix+unansweredArr[i].split(',')[0]+this.msgs.msgUnanweredQuestionGotoSuffix+'</a></li>';
					linksBuffer += '<li><a href="javascript:;" onClick="javascript:'+objAcc+'.qsSwitchQuestion(\'#'+$(elem).closest('.qs-question').attr('id')+'\','+unansweredArr[i].split(',')[0]+');return false;">'+this.msgs.msgUnanweredQuestionGotoPrefix+unansweredArr[i].split(',')[0]+this.msgs.msgUnanweredQuestionGotoSuffix+'</a></li>';
				}
				linksBuffer += "</ul></div>";
				//CHECK IF PLACEHOLDER AND APPEND OR ADD AFTER FINAL SUBMIT BUTTON
				if($('#'+this.activities[ancestryIDARR[0]].id+" .qs-finallinkto-unanswered-placeholder").length){
					$('#'+this.activities[ancestryIDARR[0]].id+" .qs-finallinkto-unanswered-placeholder").append(linksBuffer);
				}else{
					$('#'+this.activities[ancestryIDARR[0]].id+" .qs-submit-activity").after(linksBuffer);
				}
				//SHOW LIST
				qsShow('#'+this.activities[ancestryIDARR[0]].id+" .qs-finallinkto-unanswered-placeholder")
				//
				return false;
			}
			
		}
		
		//HIDE LAST QUESTION
		qsHide($("#"+this.activities[ancestryIDARR[0]].id+" .qs-question"));
		
		//HIDE EVERYTHING FROM STEP 2 NOW THAT WE^RE STEPPING INTO STEP 3
		qsHide($("#"+this.activities[ancestryIDARR[0]].id+" .qs-exercise"));
		
		
		//REMOVE qs-finallinkto-unanswered-placeholder AS ITS UNLIKELY TO BE USED SINCE EVERYTHING WAS ANSWERED...RIGHT?
		$("#"+this.activities[ancestryIDARR[0]].id+' .qs-finallinkto-unanswered-placeholder').remove();
		//REMOVE FINAL SUBMIT BUTTON (FINAL-SUBMIT-AAO)
		$("#"+this.activities[ancestryIDARR[0]].id+' .qs-submit-activity').remove();
		
		//DISABLE EVERYTHING INPUT/INTERACTION type-0, type-1, type-2, type-3, type-4
		$("#"+this.activities[ancestryIDARR[0]].id+" .qs-question").find('textarea, input[type="radio"], input[type="checkbox"], input[type="text"]').attr('disabled',true);
		$("#"+this.activities[ancestryIDARR[0]].id+" .qs-question").find('select').prop("disabled","disabled");
		
		//ASSIGN STEP CLASS
		$('#'+this.activities[ancestryIDARR[0]].id+'.qs-elearning-activity').removeClass('qs-step1 qs-step2').addClass('qs-step3');
		
		//
		//POST ACTIVITY RECAP
		//
		//CHECK IF
		// -ACTIVITY REQUIRES POST RECAP
		// -RECAP TEMPLATE EXISTS
		var recapTemplateElem = $("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-recap-template");
		$(recapTemplateElem).find('.qs-recap-item').remove();
		if(this.activities[ancestryIDARR[0]].recap_required && $(recapTemplateElem).length){
			fCl("recap required - add in validation a checker for qs-recap-template");
			
			//SHOW FINAL RECAP HOLDER
			//qsShow(recapTemplateElem);
			
			//GENERATE RECAP (in function perhaps?)
			var i,ii,iii;
			var iCounter = 0;
			fCl('currently not ready for multiple activities on page (loose selectors) *TMP');
			for(i=0;i<this.activities[ancestryIDARR[0]].exercises.length;i++){
				for(ii=0;ii<this.activities[ancestryIDARR[0]].exercises[i].questions.length;ii++){
					iCounter ++;
					appendBuffer = "";
					recapItemID = "qs-recap-item-"+this.activities[ancestryIDARR[0]].exercises[i].questions[ii].id;
					appendBuffer += "<div class='qs-post-question'>"+$(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].elem).find('.qs-text').html()+"</div>";
					//appendBuffer += "<div class='qs-post-answers'>"+$(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].elem).find('.qs-answers').html()+"</div>";
					
					//GENERATE MY ANSWERS RECAP DEPENDING ON QUESTION TYPE
					switch(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].question_type){
						case "type-0":
							appendBuffer += "<div class='qs-post-answers'>"+this.msgs.msgFeedbackRecallAnswerPrefix;
							for(iii=0;iii<(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length;iii++){
								appendBuffer += (this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[1]+(((this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length===iii+1)?"":", ");
							}
							appendBuffer += "</div>";
							break;
						case "type-1":
							appendBuffer += "<div class='qs-post-answers'>"+this.msgs.msgFeedbackRecallAnswerPrefix+$('label[for='+this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id+']').text()+"</div>";
							break;
						case "type-2":
							appendBuffer += "<div class='qs-post-answers'>";
							if(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id !== "" && this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id !== undefined){;
								appendBuffer += this.msgs.msgFeedbackRecallAnswerPrefix;
								for(iii=0;iii<(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(',').length;iii++){
									appendBuffer += $('label[for='+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(',')[iii]+']').text()+(((this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(',').length===iii+1)?"":", ");
								}
							}else{
								appendBuffer += this.msgs.msgFeedbackRecallNoAnswerPrefix;
							}
							appendBuffer += "</div>";
							break;
						case "type-3":
							appendBuffer += "<div class='qs-post-answers'>"+this.msgs.msgFeedbackRecallAnswerPrefix;
							for(iii=0;iii<(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length;iii++){
								appendBuffer += (this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[1]+(((this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length===iii+1)?"":", ");
							}
							appendBuffer += "</div>";
							break;
						case "type-4":
							appendBuffer += "<div class='qs-post-answers'>"+this.msgs.msgFeedbackRecallAnswerPrefix;
							for(iii=0;iii<(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length;iii++){
								appendBuffer += $("#"+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[0]).find('option[value='+((this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[1])+']').text();
								if($("#"+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[0]).attr('data-recap-text')!==undefined){
									appendBuffer += ": "+$("#"+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[0]).attr('data-recap-text');
								}else if($("#"+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[0]).attr('data-recap-label')!==undefined){
									appendBuffer += ": "+$("#"+$("#"+(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1])[iii].split(qSplt[0])[0]).attr('data-recap-label')).text();
								}
								appendBuffer += (((this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id).split(qSplt[1]).length===iii+1)?"":", ");
							}
							appendBuffer += "</div>";
							break;
						case "type-5":
							//**UNTESTED**
							appendBuffer += "<div class='qs-post-answers'>"+this.msgs.msgFeedbackRecallAnswerPrefix+$('label[for='+this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.my_answer_id+']').text()+"</div>";
							break;
						default:
							fCe('Recap feedback generation encountered unknown question type');
					}
					
					//MAKE SURE FEEDBACK IS CORRECTLY DISPLAYED (+-) BEFORE COPYING + //ADD CLASS TO CATEGORIZE COMPLETED AND FAILED QUESTION RECAPS (TO HIDE OR SHOW ONLY THE GOD/BAD ONES)
					var statusClass = "";
					if(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.status === "completed"){
						qsHide($(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].elem).find('.qs-feedback .qs-wrong'));
						statusClass = "qs-item-completed";
					}else if(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].dv.status === "failed"){
						qsHide($(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].elem).find('.qs-feedback .qs-right'));
						statusClass = "qs-item-failed";
					}
					
					//THEN APPEND FEEDBACK
					appendBuffer += "<div class='qs-post-feedback'>"+$(this.activities[ancestryIDARR[0]].exercises[i].questions[ii].elem).find('.qs-feedback').html()+"</div>";
					
					//APPEND BUFFER COPY TO RECAP LIST
					$(recapTemplateElem).append('<div id="'+recapItemID+'" class="qs-recap-item '+statusClass+'">'+appendBuffer+"</div>");
					//
					//MODIFY ACCORDINGLY
					//
					//MAKE .qs-get-current-question STATIC IN RECAP
					$(recapTemplateElem).find('.qs-get-current-question').removeClass('qs-get-current-question').html(iCounter);
					//console.error($(recapTemplateElem).find('.qs-get-current-question'));
					$("#"+recapItemID+" .qs-post-feedback").find('a, input[type=button]').remove();
					
				}
			}
			
			//END GENERATE RECAP
			
		}else{
			//FORCE HIDE RECAP TEMPLATE
			qsHide(recapTemplateElem);
			
		}
		//
		//ADD SEQUENTIALLY *WIP
		qsShowSequentially("#"+this.activities[ancestryIDARR[0]].id+" .qs-post-question");
		
		//qsFadeOut("#"+this.activities[ancestryIDARR[0]].id+" .qs-prevquestion, #"+this.activities[ancestryIDARR[0]].id+" .qs-nextquestion");
		qsTransition($(this.activities[ancestryIDARR[0]].exercises[ancestryIDARR[1]].questions[ancestryIDARR[2]].elem),"#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final");
		
		//DISPATCHER CALL!
		fQsEvDp('activity_completed',{activity_dom_id:this.activities[ancestryIDARR[0]].id});
		
		
		
		//DISPLAY CORRECT FEEDBACK RELATIVE TO SCORE (POSITIVE/NEGATIVE)
		if(this.qsComputeActivityScore(ancestryIDARR[0],'perc')>=this.activities[ancestryIDARR[0]].final_feedback_score_threshold){
			//HIDE BAD
			qsHide("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-negative-feedback");
			//SHOW GOOD
			qsShow("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-positive-feedback");
		}else{
			//HIDE GOOD
			qsHide("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-positive-feedback");
			//SHOW BAD
			qsShow("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-negative-feedback");
		}
		
		//DISPLAY CORRECT FINAL FEEDBACK ON BRANCHING ACTIVITY REDIRECTION
		if(this.activities[ancestryIDARR[0]].activity_type === "branching"){
			//*WIP
			//HIDE POSITIVE AND NEGATIVE FEEDBACK
			qsHide("#"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-negative-feedback, #"+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final .qs-final-positive-feedback");
		}
		
		//RETRY BUTTON ACTIONS
		//qs-retry-activity
		$('#'+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final"+' .qs-retry-activity').unbind('click');
		$('#'+this.activities[ancestryIDARR[0]].id+" .qs-feedback-final"+' .qs-retry-activity').click(function(){
			if(!$(this).hasClass('qs-disabled')){
				fCl('---------------------------- PRESSED RESET ACTIVITY ----------------------------');
				$(this).unbind();
				mThis.qsResetActivity(ancestryIDARR[0]);
			}
		});
		
		//DISABLE qs-prevquestion AND qs-nextquestion
		$('#'+this.activities[ancestryIDARR[0]].id).find('.qs-prevquestion, .qs-nextquestion').addClass('qs-disabled');
		
		//SAVE DATA
		this.qsSaveData(ancestryIDARR[0]);
	}
	
	//ADD CLICK EVENT ON SUBMIT BUTTON FOR QUESTION (qsActivityInitiallyLaunched()/qsSwitchExercise()/qsNextQuestion()) (CENTRALIZED)
	this.qsAddSubmitEvent = function (activity_id,exercise_id,question_id){
		fCl('qsAddSubmitEvent('+activity_id+','+exercise_id+','+question_id+')');
	
		//
		//PREP NEXT QUESTION (TYPE-0 || TYPE-1 || TYPE-2 || TYPE-3 || TYPE-4)
		//
		
		//ARIA
		$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-submit").attr('aria-controls',this.activities[activity_id].exercises[exercise_id].questions[question_id].id);
		
		//SAFETY UNBIND CLICK ON SUBMIT
		$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-submit").unbind('click');
			
		//AUTO VALIDATE IF COMPLETED/FAILED...NOT UNATTEMPTED/INCOMPLETE
		if(this.activities[activity_id].exercises[exercise_id].questions[question_id].dv.status === "failed" || this.activities[activity_id].exercises[exercise_id].questions[question_id].dv.status === "completed"){
			//AUTO-VALIDATE IF NOT SUBMIT-ALL-AT-ONCE (FOR SUBMIT-AAO-DISABLE-RIGHT-ANSWER TO WORK)
			if(this.activities[activity_id].submit_all_at_once){
				this.qsAnswerQuestion($("#"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question"),"final-submit-all-at-once");
			}else{
				this.qsAnswerQuestion($("#"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question"),"auto");
			}
		
			//MAKE SURE SUBMIT GOES TO NEXT IF NO FEEDBACK (AUTO-NEXT QUESTION ON SUBMIT)
			if(this.activities[activity_id].exercises[exercise_id].questions[question_id].feedback_type === "deferred" || this.activities[activity_id].exercises[exercise_id].questions[question_id].feedback_type === "none"){
							
				$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-submit").click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- PRESSED SUBMIT OVERRIDE GO TO NEXT QUESTION ----------------------------');
						mThis.qsNextQuestion($(this));
					}
				});
			}else{
				//DISABLE IT
				$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-submit").prop('disabled',true).addClass('qs-disabled');
			}
		}else{
			//TYPE-5 EXCEPTION::> SELECTION DOUBLES AS SUBMIT
			if(this.activities[activity_id].exercises[exercise_id].questions[question_id].question_type === "type-5"){
				$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-answers input[type=button]").click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- PRESSED SUBMIT BUTTON TYPE-5 ----------------------------');
						mThis.qsAnswerQuestion($(this));
					}
				});
				
			}else{
				//REGULAR AWAITING USER INPUT VALIDATE
				$("#"+this.activities[activity_id].id+".qs-elearning-activity  #"+this.activities[activity_id].exercises[exercise_id].id+".qs-exercise #"+this.activities[activity_id].exercises[exercise_id].questions[question_id].id+".qs-question .qs-submit").click(function(){
					if(!$(this).hasClass('qs-disabled')){
						fCl('---------------------------- PRESSED SUBMIT ----------------------------');
						mThis.qsAnswerQuestion($(this));
					}
				});
			}
		}
	
	
	}
	
	//CALLED BY qsAnswerQuestion() TO DISPLAY SECOND CHANCE(S) IF AVAILABLE
	//RETURN TRUE -> IF SECOND CHANCE POSSIBLE
	//RETURN FALSE -> IF NO CHANCES OR IF NO MORE AVAILABLE CHANCES FOR THAT QUESTION
	this.qsManageSecondChance = function(qStrID){
		fCl('qsManageSecondChance('+qStrID+')');
		//CHECK SECOND CHANCES EVEN EXIST FOR THAT QUESTION
		fCl('Should check for qs-chance-X rather than guessing it has through JQ.length');
		if($('#'+qStrID+' .qs-feedback .qs-second-chance').length){ //SECOND CHANCES HOLDER EXISTS
			//HIDE EVERY DIV INSIDE .qs-second-chance
			qsHide($('#'+qStrID+' .qs-feedback .qs-second-chance > div'));
			//CHECK IF FIRST SECOND CHANCE EXISTS
			if($('#'+qStrID+' .qs-feedback .qs-second-chance').attr('data-chance-count') === undefined){
				//INITIATE EVERYTHING FOR SECOND CHANCES (ASSUMES .qs-chance-1 EXISTS!)
				$('#'+qStrID+' .qs-feedback .qs-second-chance').attr('data-chance-count','1');
				qsShow($('#'+qStrID+' .qs-feedback .qs-second-chance > div.qs-chance-1'))
				return true; //FIRST SECOND CHANCE
				
			}else{	//NOT THE FIRST SECOND CHANCE
			
				
				//CHECK IF LAST SECOND CHANCE
				nxtChanceID = (Number($('#'+qStrID+' .qs-feedback .qs-second-chance').attr('data-chance-count'))+1);
				if($('#'+qStrID+' .qs-feedback .qs-chance-'+nxtChanceID).length){
					$('#'+qStrID+' .qs-feedback .qs-second-chance').attr('data-chance-count',nxtChanceID);
					qsShow($('#'+qStrID+' .qs-feedback .qs-second-chance > div.qs-chance-'+nxtChanceID))
					return true; //ONE MORE CHANCE YET NOT THE FIRST ONE
					//alert('THE NEXT EXISTS');
					
				}else{
					qsHide($('#'+qStrID+' .qs-feedback .qs-second-chance'));
					return false; //NO MORE CHANCES IN .qs-second-chance!
					//alert('DOES NOT EXISTS');
					
				}
				
				//alert('SECOND SECOND CHANCES TIME');
				
			}
		}else{
			//NO SECOND CHANCES EXISTS, RETURN FALSE!
			return false;
		}
		
		
	
	}
	
	//RANDOMIZES .qs-answers ANSWERS POSITION ON DISPLAY
	this.qsScrambleAnswers = function (qStrID,qType){
		fCl('qsScrambleAnswers('+qStrID+','+qType+')');
		//return false;
		//randomize_answers
		var sFor = "";
		//GET ANSWERS SELECTOR
		switch (qType){
			case "type-1":
				sFor = "input[type=radio]";
				break;
			case "type-2":
				sFor = "input[type=checkbox]";
				break;
			case "type-5":
				sFor = "input[type=button]";
				break;
			default:
			//throw "Error: Trying to scramble answers in unsupported question type (qsScrambleAnswers("+qStrID+","+qType+"))";
			fCe('qsScrambleAnswer() says: Can\'t randomize question model -> '+qType);
			return false;
		}
		
		//TRY 3
		
		//FIND THE LAST FIRST COMMON PARENT TO ALL ANSWERS (BASELINE TO SWAP DOM ELEMENTS!)
		var tmpA = []; //TMP Storing array
		var tmpB = []; //TMP Storing array
		var tmpC = []; //TMP Storing array

		//Loop through "answers"
		$("#"+qStrID+" .qs-answers "+sFor).each(function(i,v){
			var kAlive = true; //Keep function alive!
			
			tmpB[i] = [];
			
			//For each parent(recurse), do... 
			$(this).parents().map(function(mi,mii){
				
				//Keep alive unless...
				if(kAlive){
					
					//Store tagnames
					tmpB[i].push(mii);
					
					//STOP function if passed the FORM (they should obviously be common by then, if not there is a problem)
					if($(this).find(sFor).length > 1){
						kAlive=false;
						tmpA.push(tmpB[i][mi-1]);
					}	
				}
			});
		});
		//INSERT "REMINDER TAG" BEFORE FIRST INSTANCE
		$(tmpA[0]).before('<span id="qsscrambleanswerstemp"></span>');
		
		//"DETACH" ELEMENTS
		for(i=0;i<tmpA.length;i++){
			tmpC[i] = $(tmpA[i]).detach();
		}
		
		//SCRAMBLE ARRAY + REINSERT AFTER "REMINDER TAG"
		for(i=0;i<tmpA.length;i++){
			$('#qsscrambleanswerstemp').after(tmpC.splice(Math.floor(Math.random()*tmpC.length),1));
		}
		
		//REMOVE "REMINDER TAG"
		$('#qsscrambleanswerstemp').remove();
		
	}

	//GENERATE ENCODED VALIDATION STRING
	this.qsGenerateEncodedValidationString = function (mode,val,targetSTRID){
		fCl('qsGenerateEncodedValidationString('+mode+','+val+','+targetSTRID+')')
		//masterIntTester
		var encodedData;
		//alert(encodedData);
		switch(mode){
			case "gonogo": //AKA TRUE||FALSE, ONE CODE PASSES WHILE THE REST FAILS BASED ON X%masterIntTester
				encodedData = Math.floor(Math.random()*1000);
				if(val===1){
					//SET RIGHT ANSWER ENCODED DATA
					if((encodedData%this.settings.masterIntTester)!=0){
						encodedData+=this.settings.masterIntTester-(encodedData%this.settings.masterIntTester);
					};
				}else{
					//SET WRONG ANSWER ENCODED DATA
					if((encodedData%this.settings.masterIntTester)==0){
						encodedData+=1;
					};
				}
				break;
			case "encrypt":
				//fCe('----');//atob() -> btoa()
				var bytes=[];
				for(var iEn=0;iEn<val.length;iEn++){
					bytes.push(val.charCodeAt(iEn));
					
				}
				encodedData = bytes.join('O');
				//fCe('-->> '+this.qsTestAgainstEncodedValidationString('encrypt',bytes.join('O')));
				
				break;
			default:
			fCe('WRONG ENCODING MODE');
		}
		
		//fCe('data-encoded-rep '+encodedData+'  = '+encodedData%masterIntTester); //TMP
		
		//SET ANSWER ENCODED DATA
		$('#'+targetSTRID).attr('data-encoded-rep',encodedData);
		//REMOVE WA-RA CLASSES
		//$('#'+targetSTRID).removeClass('wa ra'); //#raware!
	}
	
	//TEST AGAINST ENCODED VALIDATION STRING
	this.qsTestAgainstEncodedValidationString = function (mode,testString){
		fCl('qsTestAgainstEncodedValidationString('+mode+','+testString+')');
		var pass; //Bool||String
		switch(mode){
			case "gonogo":
				pass = false;
				if(Number(testString)%this.settings.masterIntTester===0){
					pass=true;
				}
				break;
			case "encrypt":
				var rebuildStr = "";
				for(var iDe=0;iDe<testString.split('O').length;iDe++){
					rebuildStr += String.fromCharCode(testString.split('O')[iDe]);
				}
				//fCe('::-> '+rebuildStr);
				pass = rebuildStr;
				break;
			default:
			fCe('WRONG DECODE MODE');
		
		}
		//fCe(pass);
		return pass;
	}
	
	
	//RETURN RANDOM STACK FOR QUESTION RANDOMIZATION
	this.qsGetRandomQuestionStack = function(activity_id,exercise_id){
		fCl('qsGetRandomQuestionStack()');
		
		var i,ii;
		var tmpArr = [];
		var tmpArrB = [];
		var tmpArrC = [];
		var recallInstead = false;
		
		//RECALL EXISTING RANDOM INDEX FROM TRACKING IF POSSIBLE
		//fCl('dangerous combination here...dont split-check using only ID, it will backfire! -> '+trackingString.split(this.activities[activity_id].exercises[exercise_id].id).length);
		//if(trackingString != "" || trackingString.split(this.activities[activity_id].exercises[exercise_id].id).length == 2){
		if(trackingString != ""){
			fCl("IN")
			tmpArrC = this.qsRecallData('qorder',[activity_id,exercise_id]);
			if(!tmpArrC instanceof Array || tmpArrC.length == undefined){
				fCe('SHOULD BE AN ARRAY (RANDOM INDEX RECALL)');
			}else{
				recallInstead = true;
			}
		}
		
		if(recallInstead){
			//REORDER USING TRACKING DATA
			fCl('recall '+tmpArrC);
			return tmpArrC;
		}else{
			//RANDOMIZE QUESTIONS
			for(i=0;i<this.activities[activity_id].exercises[exercise_id].nb_questions;i++){
				tmpArr.push(i);
			}
			for(i=0;i<this.activities[activity_id].exercises[exercise_id].nb_questions;i++){
				tmpArrB[i] = tmpArr.splice(Math.floor(Math.random()*tmpArr.length),1);
			}
			return tmpArrB;
		}
	}
	
	//RESET ACTIVITY (OBJ+RETURN TO START)
	this.qsResetActivity = function (activity_id){
		fCl('qsResetActivity('+activity_id+') -> NOTE THAT RESETING AN ACTIVITY WILL NOT RESET THE RANDOM ORDER OF QUESTIONS!');
		var i,ii,iii;
		
		//ORIGINAL
		/*
		for(i in this.activities){
			this.activities[i].dv.status = "unattempted";
			this.activities[i].dv.current_exercise_id = 0;
			this.activities[i].dv.current_question_id = 0;
			for(ii in this.activities[i].exercises){
				this.activities[i].exercises[ii].dv.status = "unattempted";
				for(iii in this.activities[i].exercises[ii].questions){
					this.activities[i].exercises[ii].questions[iii].dv.my_answer_id = "";
					this.activities[i].exercises[ii].questions[iii].dv.status = "unattempted";
				}
			}
		}
		*/
		//RESET OBJ *BUG IN IE8*
		
		this.activities[activity_id].dv.status = "unattempted";
		this.activities[activity_id].dv.current_exercise_id = 0;
		this.activities[activity_id].dv.current_question_id = 0;
		for(i=0;i<this.activities[activity_id].nb_exercises;i++){
			this.activities[activity_id].exercises[i].dv.status = "unattempted";
			for(ii=0;ii<this.activities[activity_id].exercises[i].nb_questions;ii++){
				this.activities[activity_id].exercises[i].questions[ii].dv.my_answer_id = "";
				this.activities[activity_id].exercises[i].questions[ii].dv.status = "unattempted";
			}
		}
		
		
		
		
		//RESET TRACKING IF NECESSARY
		if(this.activities[activity_id].tracking_enabled){
			trackingObj.saveData(this.activities[activity_id].id,"");
		}
		
		//RESET FORMS UNCHECK BOXES, REENABLE SUBMITS... *TMP
		//SUBMIT BT
		//fCe('THIS has to target this activity only, not everything tsss...');
		$('#'+this.activities[activity_id].id+' .qs-submit,#'+this.activities[activity_id].id+' .qs-continue').prop('disabled',false).removeClass('qs-disabled');
		$('#'+this.activities[activity_id].id+' .qs-submit,#'+this.activities[activity_id].id+' .qs-continue').removeAttr('disabled')
		//TYPE-1 & TYPE-2 & TYPE-5
		$('#'+this.activities[activity_id].id+' input[type=checkbox],#'+this.activities[activity_id].id+' input[type=radio],#'+this.activities[activity_id].id+' input[type=button]').prop('disabled',false).prop('checked',false).removeClass('qs-disabled');
		//TYPE-0 & TYPE-3
		$('#'+this.activities[activity_id].id+' input[type=text],#'+this.activities[activity_id].id+' textarea').prop('disabled',false).removeClass('qs-disabled qs_good_answer qs_wrong_answer').val('');
		//TYPE-4
		$('#'+this.activities[activity_id].id+' select').val('0');
		$('#'+this.activities[activity_id].id+' select').prop('disabled',false).removeAttr('disabled');
		
		this.qsPrepActivities(activity_id);
	}
	
	//ASSESS ACTIVITY AND EXERCISE STATUSES RELATIVE TO THEIR QUESTIONS (ESSENTIALLY LOOPS THROUGH CHILDS AND SETS THE STATUS, SHOULD BE THE ONLY PLACE WHERE ACTIVITY AND EXERCISES STATUSES ARE SET EXCEPT WHEN CHANGING FROM UNATTEMPTED)
	//pID = ACTIVITY ID
	this.qsComputeParentStatuses = function (pID){
		fCl('qsComputeParentStatuses('+pID+')');
		
		
		var i,ii;
		activityCompleted = true;
		for(i=0;i<this.activities[pID].exercises.length;i++){
			exerciseCompleted = true;
			for(ii=0;ii<this.activities[pID].exercises[i].questions.length;ii++){
				fCl("Qstatus:"+this.activities[pID].exercises[i].questions[ii].dv.status)
				if(this.activities[pID].exercises[i].questions[ii].dv.status !== "completed" && this.activities[pID].exercises[i].questions[ii].dv.status !== "failed"){
					exerciseCompleted = false;
					activityCompleted = false;
				}
			}
			if(exerciseCompleted){
				//SET STATUS TO COMPLETED IF AL QUESTIONS ARE (NOT A REPRESENTATION OF ANSWERS, JUST THAT ITS COMPLETED)
				this.activities[pID].exercises[i].dv.status = "completed";
				//this.qsSaveData(pID); //Christian's Fix for single question data-tracking=true to save
			}
		}
		if(activityCompleted){
			//SET STATUS TO COMPLETED IF AL QUESTIONS ARE (NOT A REPRESENTATION OF ANSWERS, JUST THAT ITS COMPLETED)
			this.activities[pID].dv.status = "completed";
		}
	
	
		//fCe("A:"+activityCompleted+"    B:"+exerciseCompleted);
	
	
	
	
	
	
	
		/*
		var i,ii;
		if(pType === "activity"){
			for(i=0;i<this.activities[pID].exercises.length;i++){
				activityCompleted = true;
				for(ii=0;ii<this.activities[pID].exercises[i].questions.length;ii++){
					if(this.activities[pID].exercises[i].questions[ii].dv.status !== "completed" && this.activities[pID].exercises[i].questions[ii].dv.status !== "failed"){
						activityCompleted = false;
					}
				}
			}
			if(activityCompleted){
				fCl('force "complete" for now; only means Activity was completed, not ncessarily passed');
				this.activities[pID].dv.status = "completed";
			}else{
				fCl('force "incomplete" for now; only means Activity was not completed, not ncessarily failed');
				this.activities[pID].dv.status = "incomplete";
			}
			return activityCompleted;
		}else if(pType === "exercise"){
			pID = pID.split(',');
			exerciseComplete = true;
			for(i=0;i<this.activities[pID[0]].exercises[pID[1]].questions.length;i++){
				if(this.activities[pID[0]].exercises[pID[1]].questions[i].dv.status !== "completed" && this.activities[pID[0]].exercises[pID[1]].questions[i].dv.status !== "failed"){
					exerciseComplete = false;
				}
			}
			if(exerciseComplete){
				fCl('force "complete" for now; only means Exercise was completed, not ncessarily passed');
				this.activities[pID[0]].exercises[pID[1]].dv.status = "completed";
			}else{
				fCl('force "incomplete" for now; only means Exercise was not completed, not ncessarily failed');
				this.activities[pID[0]].exercises[pID[1]].dv.status = "incomplete";
			}
			return exerciseComplete;
		}else{
			return undefined;
		}
		
		return true;*/
	}
	
	
	//***MIX qsComputeActivityScore &&& qsComputeProgression ***TMP
	
	//COMPUTE SCORE FOR CURRENT ACTIVITY
	//pOption: "cssf" (current score so far), "mxsc" (max possible score), "perc" (current score on 100(%))
	this.qsComputeActivityScore = function(activity_id,pOption){
		var i,
		//fCl('qsComputeActivityScore()');
		score_so_far = 0;
		score_total = 0;
		for(i=0;i<this.activities[activity_id].exercises.length;i++){
			for(ii=0;ii<this.activities[activity_id].exercises[i].questions.length;ii++){
				//Good-working
				//score_so_far += (this.activities[activity_id].exercises[i].questions[ii].dv.status == "completed")?1:0;
				//score_total +=1;
				
				//PONDERATION TRY!
				score_so_far += (this.activities[activity_id].exercises[i].questions[ii].dv.status == "completed")?1*(this.activities[activity_id].exercises[i].questions[ii].score_value):0;
				score_total +=1*(this.activities[activity_id].exercises[i].questions[ii].score_value);
				
				
				
			}
		}
		if(pOption==="cssf"){
			return score_so_far;
		}else if(pOption==="mxsc"){
			return score_total;
		}else if(pOption==="perc"){
			return Math.round((score_so_far/score_total)*100);
		}
		//return "ERROR";
		return ""+score_so_far+"/"+score_total+"";
	}
	
	//COMPUTE PROGRESSION
	//pOption: "qat" (current question at), "qtot" (question nb total)
	this.qsComputeProgression = function (activity_id,pOption){
		var i,
		//fCl('qsComputeProgression()');
		question_answered = 0;
		question_total = 0;
		for(i=0;i<this.activities[activity_id].exercises.length;i++){
			//dv.current_question_id
			question_total += this.activities[activity_id].exercises[i].nb_questions;
			//ADD QUESTIONS FROM PREVIOUS EXERCISES IF POSSIBLE
			if(i<this.activities[activity_id].dv.current_exercise_id){
				question_answered += this.activities[activity_id].exercises[i].nb_questions;
			}
		}
		if(pOption==="qat"){
			return (question_answered+this.activities[activity_id].dv.current_question_id+1); 
		}else if(pOption==="qtot"){
			return question_total;
		}else{
			return ""+(question_answered+this.activities[activity_id].dv.current_question_id+1)+"/"+question_total+"";
		}
	}
	
	//APPLY VISUAL FEEDBACK ON SCORE PROGRESSION
	this.qsUpdateScoreDisplay = function (activity_id){
		//
		//ASSIGN VALUE TO VARIOUS PLACEHOLDERS IN ACTIVITY
		//
		//Get current score
		$('#'+this.activities[activity_id].id+' .qs-get-current-score').text(this.qsComputeActivityScore(activity_id,"cssf"));
		//Get max possible score
		$('#'+this.activities[activity_id].id+' .qs-get-max-score').text(this.qsComputeActivityScore(activity_id,"mxsc"));
		//Get score in %
		$('#'+this.activities[activity_id].id+' .qs-get-score-on100').text(this.qsComputeActivityScore(activity_id,"perc"));
		//Get current question
		$('#'+this.activities[activity_id].id+' .qs-get-current-question').text(this.qsComputeProgression(activity_id,"qat"));
		//Get total question nb
		$('#'+this.activities[activity_id].id+' .qs-get-nb-questions').text(this.qsComputeProgression(activity_id,"qtot"));
	}
	
	
	
	//
	//GETTERS
	//
	this.qsGetActivityIDFromStringID = function (stringID){
		fID = -1;
		for(iga in this.activities){
			if(this.activities[iga].id==stringID){
				fID = iga;
				break;
			}
		}
		return fID;
	};
	
	this.qsGetExerciseIDFromStringID = function (stringID, current_activity_ID){
		fCl("qsGetExerciseIDFromStringID("+stringID+" , "+current_activity_ID+")");
		if(current_activity_ID == -1 || isNaN(current_activity_ID)){
			fCl("ERR in qsGetExerciseIDFromStringID('"+stringID+"' ,"+current_activity_ID+")  <-- Cannot accept param(s)!");
			return false;
		}
		fID = -1;
		for(ige in this.activities[current_activity_ID].exercises){
			if(this.activities[current_activity_ID].exercises[ige].id==stringID){
				fID = ige;
				break;
			}
		}
		fCl(fID);
		return fID;
	};
	
	this.qsGetQuestionIDFromStringID = function (stringID, current_activity_ID, current_exercise_ID){
		if(current_activity_ID == -1 || current_exercise_ID == -1 || isNaN(current_activity_ID) || isNaN(current_exercise_ID)){
			fCl("ERR in qsGetQuestionIDFromStringID('"+stringID+"' ,"+current_activity_ID+", "+current_exercise_ID+")  <-- Cannot accept param(s)!");
			return false;
		}
		fID = -1;
		for(igq in this.activities[current_activity_ID].exercises[current_exercise_ID].questions){
			if(this.activities[current_activity_ID].exercises[current_exercise_ID].questions[igq].id==stringID){
				fID = igq;
				break;
			}
		}
		return fID;
	};
	
	
	//
	//TRAVERSING GETTERS
	// -> retour d'arborescence transversal récursif (only 3 lvl needed)
	
	this.qsGetAncestryStringIDS = function(elem){
		//Accepts elems and returns the StringID for its current question (*if), exercise (*if) and activity
		tArr = new Array();
		
		//GET QUESTION STRINGID
		tArr.splice(0,0,$(elem).closest('.qs-question, .qs-exercise, .qs-elearning-activity').attr('id'));
		//GET EXERCISE STRINGID
		tArr.splice(0,0,$(elem).closest('.qs-exercise, .qs-elearning-activity').attr('id'));
		//GET ACTIVITY STRINGID
		tArr.splice(0,0,$(elem).closest('.qs-elearning-activity').attr('id'));
		
		
		if(tArr[2] == tArr[1]){
			//CANT GET QUESTION
			tArr.splice(2,1);
		}
		if(tArr[1] == tArr[0]){
			//CANT GET EXERCISE
			tArr.splice(1,1);
		}
		//fCl("qsGetAncestryStringIDS -> "+tArr.join(','));
		
		return tArr;
	};
	
	this.qsGetAncestryIDS = function(elem){
		//Accepts elems and returns the id for its current question (*if), exercise (*if) and activity
		tArr = this.qsGetAncestryStringIDS(elem);
		tbArr = new Array();
		
		//GET ACTIVITY ID
		tbArr[0] = parseInt(this.qsGetActivityIDFromStringID(tArr[0]));
		if(tArr.length >= 2){
			//GET EXERCISE ID
			tbArr[1] = parseInt(this.qsGetExerciseIDFromStringID(tArr[1],tbArr[0]));
		}
		if(tArr.length >= 3){
			//GET QUESTION ID
			tbArr[2] = parseInt(this.qsGetQuestionIDFromStringID(tArr[2],tbArr[0],tbArr[1]));
		}
		return tbArr;
	};
	
	//RETURN FARTHEST NON COMMON PARENT RELATIVE TO ORIGIN
	this.qsGetFarthestNonCommonParent = function (origin, common){
		fCl('qsGetFarthestNonCommonParent('+origin+','+common+') *WIP-NOT WORKING RIGHT NOW!');
		//origin = element to start descending from
		//common = selector we should only find one of type in the parent
		fCe(origin);
		
		
		return false;
	};
	
	//RETURN FIRST OCCURENCE OF CLOSEST MATCH
	this.qsGetClosestMatch = function (needle, haystack){
		fCl('qsGetClosestMatch('+needle+','+haystack+') **WIP NEEDS A RESTRICTION SO DOENST GO OUTSIDE OF CURRENT QS-QUESTION!!! ***WIP NEEDS TO CRAWL THROUGH SIBLINGS TOO!')
		//needle = what to find
		//haystack = where to start looking for
		//fCe('A-'+$('#'+haystack).parent().find(needle)[0].nodeName);
		/*$('#'+haystack).parents().find(needle).each(function(i,e){
			fCe(i+' - '+e.nodeName+"#"+e.id);
		});*/
		closestStackArr = [];
		var retVal
		/*
		fCe("1-Sibling-"+$('#'+haystack).siblings(needle).attr('id'));
		fCe("2-Closest-"+$('#'+haystack).closest(needle).attr('id'))
		fCe("3-Parent-"+$('#'+haystack).parent().find(needle).attr('id'));
		fCe("4-2xParent-"+$('#'+haystack).parent().parent().find(needle).attr('id'));
		*/
		//closestStackArr.push($('#'+haystack).siblings(needle).attr('id'),$('#'+haystack).parent().find(needle).attr('id'),$('#'+haystack).parent().parent().find(needle).attr('id'));
		//fCl(closestStackArr.join('\n'))
		
		closestStackArr.push($('#'+haystack).siblings(needle),$('#'+haystack).parent().find(needle),$('#'+haystack).parent().parent().find(needle),$('#'+haystack).parent().parent().parent().find(needle));
		//fCl(closestStackArr.join('\n'))
		//LOOP THROUGH STACK 
		for(gcmi=0;gcmi<closestStackArr.length;gcmi++){
			//alert("1-"+closestStackArr[gcmi]);
			if(closestStackArr[gcmi]!=undefined){
				//alert(closestStackArr[gcmi]);
				retVal = closestStackArr[gcmi];
				break;
			}
		}
		//alert(retVal)
		return retVal;
	}
	
	//GET AND PARSE TRACKING STRING FROM iLMS
	this.qsGetTrackingString = function(activity_STR_ID){
		fCl('qsGetTrackingString() -> MIGHT ONLY WORK FOR ONE ACTIVITY PER PAGE FOR NOW!');
		
		//Get tracking from iLMS...
		
		//var iLMSTrackingString = $("#qs-tracking-debug").val();
		var iLMSTrackingString = trackingObj.getData(activity_STR_ID);
		if(iLMSTrackingString == "" || iLMSTrackingString == undefined){
			fCl("TRACKING STRING EMPTY");
			return false;
		}
		iLMSTrackingString = iLMSTrackingString.trim();
		//QUICKLY VALIDATE TRACKING STRING
		
		//fCl('qsGT Marker A');
		
		var nbQs = (iLMSTrackingString.split(qsMarkerStart).length == iLMSTrackingString.split(qsMarkerEnd).length)?iLMSTrackingString.split(qsMarkerStart).length-1:-1;
		
		if(nbQs>1){
			fCe("CAN ONLY BE ONE ENTRY FOR QUIZSPAWNER... CHECK TRACKING STRING");
			return false;
		}else if(nbQs==-1){
			fCe("NO OR ERRONEOUS ENTRY FOR QUIZSPAWNER... CHECK TRACKING STRING");
			return false;
		}
		//fCl('qsGT Marker B');
		var nbAct = (iLMSTrackingString.split(qsActMarkerStart).length == iLMSTrackingString.split(qsActMarkerEnd).length)?iLMSTrackingString.split(qsActMarkerStart).length-1:-1;
		//fCl('qsGT Marker C');
		var nbEx = (iLMSTrackingString.split(qsExMarkerStart).length == iLMSTrackingString.split(qsExMarkerEnd).length)?iLMSTrackingString.split(qsExMarkerStart).length-1:-1;
		
		if(nbAct==-1||nbEx==-1){
			fCe("NO OR ERRONEOUS ENTRY FOR QUIZSPAWNER's ACTIVITIES OR EXERCISES... CHECK TRACKING STRING (FOR EVERY STARTING MARKER NEED AN ENDING ONE)");
			return false;
		}
		
		//DISCARD STUFF THAT DOESN'T REGARD THE QUIZES/ACTIVITIES/EXERCISES
		
		if(iLMSTrackingString.indexOf(qsMarkerStart) == 0 && iLMSTrackingString.indexOf(qsMarkerEnd) == (iLMSTrackingString.length - qsMarkerEnd.length)){
			iLMSTrackingString = iLMSTrackingString.split(qsMarkerStart)[1].split(qsMarkerEnd)[0];
		}
		
		trackingString = iLMSTrackingString;
		//fCl('qsGT Marker E');
		return true;
	
	}
		
	//DO STUFF WITH THE TRACKING STRING FROM THE iLMS
	//recallMode = "all": full-on repopulate OBJ and DOM
	//recallMode = "qorder": return array with ordered index questions that should be in random order (params=ARRAY, [0]=activity ID,[1]=exercise ID)
	this.qsRecallData = function (recallMode, params){
		fCl('qsRecallData('+recallMode+','+params+')');
		//
		// i = "id" (DOM ID)
		// s = "stat" (Status: u,i,c,f)
		// r = "reorder" (index list for random/pools)
		// p = "position" (where user left off)
		//
		var nbAct = trackingString.split(qsActMarkerStart).length-1;
		var i,ii,iii;
		var tmpArr = [];
		var trackingArr = [];
		var qArr = [];
		var exercise_reorder_list;
		
		var qStatusArr = {u:"unattempted",i:"incomplete",c:"completed",f:"failed"};
		
		//INSERT IN OBJS
		for(i=0;i<nbAct;i++){
			tmpArr[i] = trackingString.split(qsActMarkerStart)[i+1];
			tmpArr[i] = tmpArr[i].split(qsActMarkerEnd)[0];
			
			trackingArr[i] = [];
			
			//GET ACTIVITY IDS
			activity_string_id = tmpArr[i].split(tSplt[3]+'i:')[1].split(tSplt[4])[0];
			//activity_string_id = tmpArr[i].split('[id:')[1].split(']')[0].split(':')[1];
			activity_id = this.qsGetActivityIDFromStringID(activity_string_id);
			
			//RECALL POS (pos:exercise-question) ONLY IF recallMode == "all"
			
			if(recallMode == "all"){
				//RESFRESH OBJECT STATUS
				//this.activities[activity_id].dv.status = qStatusArr[tmpArr[i].split('[id:')[1].split(']')[0].split(':')[0]];
				this.activities[activity_id].dv.status = qStatusArr[tmpArr[i].split(tSplt[3]+'s:')[1].split(tSplt[4])[0]];
				//REFRESH ACTIVITY EX_AT AND Q_AT
				this.activities[activity_id].dv.current_exercise_id = parseInt(tmpArr[i].split(tSplt[3]+'p:')[1].split(tSplt[4])[0].split('-')[0]);
				this.activities[activity_id].dv.current_question_id = parseInt(tmpArr[i].split(tSplt[3]+'p:')[1].split(tSplt[4])[0].split('-')[1]);
				
				
			}
			
			//IGNORE ACTIVITIES NOT ON PAGE
			if($("#"+activity_string_id).length == 1){
				//EXERCISES
				for(ii=0;ii<tmpArr[i].split(qsExMarkerStart).length-1;ii++){
					
					trackingArr[i][ii] = tmpArr[i].split(qsExMarkerStart)[ii+1];
					trackingArr[i][ii] = trackingArr[i][ii].split(qsExMarkerEnd)[0];
					fCl("tracking["+i+"]["+ii+"] = "+trackingArr[i][ii]);
					
					//GET EXERCISE IDS
					exercise_string_id = trackingArr[i][ii].split(tSplt[3]+'i:')[1].split(tSplt[4])[0];
					//exercise_string_id = trackingArr[i][ii].split('[id:')[1].split(']')[0].split(':')[1];
					exercise_id = this.qsGetExerciseIDFromStringID(exercise_string_id,activity_id);
					
					if(recallMode == "all"){
						//RESFRESH OBJECT STATUS
						//this.activities[activity_id].exercises[exercise_id].dv.status = qStatusArr[trackingArr[i][ii].split('[id:')[1].split(']')[0].split(':')[0]];
						this.activities[activity_id].exercises[exercise_id].dv.status = qStatusArr[trackingArr[i][ii].split(tSplt[3]+'s:')[1].split(tSplt[4])[0]];
					}
					//alert(trackingArr[i][ii]);
					
					if(trackingArr[i][ii].split(tSplt[3]+'i:').length<2){
						fCe('TRACKING MISSING IDs [id:xyz]')
					}
					
					//GET RANDOM ORDER ONLY
					if(recallMode == "qorder" && exercise_id == params[1]){
					
						exercise_reorder_list = trackingArr[i][ii].split(tSplt[3]+'r:')[1].split(tSplt[4])[0];
						exercise_reorder_list = exercise_reorder_list.split(',');
						//alert(exercise_reorder_list);
						//alert(this.activities[params[0]].exercises[params[1]].random_order);
					}
					
					
					exercise_params_string = trackingArr[i][ii].split(tSplt[4]+tSplt[1])[0]+tSplt[4];
					question_answers_string = tSplt[1]+trackingArr[i][ii].split(tSplt[4]+tSplt[1])[1];
					//SPLIT QUESTIONS
					qArr = ((question_answers_string.split(tSplt[2],question_answers_string.split(tSplt[2]).length-1).join('|!|')).split(tSplt[1])).join('').split('|!|');
					for(iii=0;iii<qArr.length;iii++){
					
						//DYNAMICALLY LOAD ANSWERS
						fCl(i+"-"+ii+"-"+iii)
						question_id = this.qsGetQuestionIDFromStringID(qArr[iii].split(tSplt[0])[0],activity_id,exercise_id);
						
						//alert(question_id);
						//alert(qArr[iii].split(':')[0]);
						
						if(recallMode == "all"){
							
							//AFFECT OBJECT
							
							this.activities[activity_id].exercises[exercise_id].questions[question_id].dv.my_answer_id = qArr[iii].split(tSplt[0])[2];
							this.activities[activity_id].exercises[exercise_id].questions[question_id].dv.status = qStatusArr[qArr[iii].split(tSplt[0])[1]];
							
							//AFFECT DOM
							switch(this.activities[activity_id].exercises[exercise_id].questions[question_id].question_type){
								case "type-0":
									if(qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length>1){
										for(iv=0;iv<qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length;iv++){
											$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[1]);
										}
									}else{
										$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[0])[1]);
									}
									break;
								case "type-1":
									$("#"+qArr[iii].split(tSplt[0])[2]).prop('checked','checked');
									break;
								case "type-2":
									if(qArr[iii].split(tSplt[0])[2].split(',').length>1){
											$("#"+qArr[iii].split(tSplt[0])[2].split(',').join(', #')).prop('checked','checked');
									}else{
										$("#"+qArr[iii].split(tSplt[0])[2]).prop('checked','checked');
									}
									break;
								case "type-3":
									
									//*TMP  =  ABSOLUTELY TEST AGAINST SPECIAL CHARACTERS THAT COULD BREAK THE STRING
									//TD - did it before saving which then makes it impossible to recall wrongly saved strings tada!
									if(qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length>1){
										for(iv=0;iv<qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length;iv++){
											$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[1]);
										}
									}else{
										$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[0])[1]);
									}
									break;
								case "type-4":
									//That's basically the same the type-3 (like, exactly)
									if(qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length>1){
										for(iv=0;iv<qArr[iii].split(tSplt[0])[2].split(qSplt[1]).length;iv++){
											$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[1])[iv].split(qSplt[0])[1]);
										}
									}else{
										$("#"+qArr[iii].split(tSplt[0])[2].split(qSplt[0])[0]).val(qArr[iii].split(tSplt[0])[2].split(qSplt[0])[1]);
									}
									break;
								case "type-5":
									//**UNTESTED** -> Add .checked to input[type=button]
									$("#"+qArr[iii].split(tSplt[0])[2]).addClass('checked');
									break;
								default:
								fCl("can't recall data on Question ID : "+activity_id+"-"+exercise_id+"-"+question_id);
							}	
						}
					}
				}
			}	
		}
		//ENDING?
		if(recallMode = "qorder"){
			return exercise_reorder_list;
		}
		
	}
	
	//SAVES DATA IN A STRING *TMP +DISPLAYS IT
	this.qsSaveData = function (activity_id){
		fCl('qsSaveData('+activity_id+')');
		
		//CANCEL ANY SAVING IF NOT NECESSARY
		if(!this.activities[activity_id].tracking_enabled){
			fCl('No tracking required for activity: return false;');
			return false;
		}
		
		//FORCE SAVE NOTHING (RESET QUIZ)
		
		var i, ii;
		//Set data in iLMS||tracking string //cmi.comments
		//ACTIVITY START
		//saveBuff = qsActMarkerStart+"[id:"+this.activities[activity_id].dv.status.charAt(0)+":"+this.activities[activity_id].id+"]";
		saveBuff = qsActMarkerStart+tSplt[3]+"i:"+this.activities[activity_id].id+tSplt[4];
		//SAVE STATUS
		saveBuff += tSplt[3]+"s:"+this.activities[activity_id].dv.status.charAt(0)+tSplt[4]
		//SAVE POSITION
		saveBuff += tSplt[3]+"p:"+this.activities[activity_id].dv.current_exercise_id+"-"+this.activities[activity_id].dv.current_question_id+tSplt[4];
		for(i=0;i<this.activities[activity_id].nb_exercises;i++){
			//EXERCISE START
			//saveBuff += qsExMarkerStart+"[id:"+this.activities[activity_id].exercises[i].dv.status.charAt(0)+":"+this.activities[activity_id].exercises[i].id+"][reorder:"+this.activities[activity_id].exercises[i].random_order+"]";
			saveBuff += qsExMarkerStart+tSplt[3]+"i:"+this.activities[activity_id].exercises[i].id+tSplt[4];
			//SAVE STATUS
			saveBuff += tSplt[3]+"s:"+this.activities[activity_id].exercises[i].dv.status.charAt(0)+tSplt[4];
			//SAVE REORDER
			saveBuff += tSplt[3]+"r:"+this.activities[activity_id].exercises[i].random_order+tSplt[4];
			for(ii=0;ii<this.activities[activity_id].exercises[i].nb_questions;ii++){
				//QUESTIONS
				//( QUESTION ID , COMPLETION STATUS ((U)nattempted, (I)ncomplete, (C)ompleted, (F)ailed), ANSWER ID(s))
				
				saveBuff += tSplt[1]+this.activities[activity_id].exercises[i].questions[ii].id+tSplt[0]+this.activities[activity_id].exercises[i].questions[ii].dv.status.charAt(0)+tSplt[0]+this.activities[activity_id].exercises[i].questions[ii].dv.my_answer_id+tSplt[2]
			}
			saveBuff += qsExMarkerEnd;
		}
		saveBuff += qsActMarkerEnd;
		
		fCl(saveBuff);
		
		if(this.settings.debugMode){
			
			$("#qs-tracking-debug").val(qsMarkerStart+saveBuff+qsMarkerEnd);
			//$("#qs-tracking-debug").val("WTF");
		}
		//SAVE VIA SAVEOBJ/TRACKINGOBJ
		trackingObj.saveData(this.activities[activity_id].id,saveBuff);
	}
	
	//TEST AGAINST CHARACTERS AND REPLACE IF NECESSARY
	this.qsValidateChars = function (checkStr,checkAgainst){
		fCl('qsValidateChars('+checkStr+')');
		if(checkAgainst===undefined || checkAgainst==="" || typeof this.settings.illegalCharsList !== "string"){
			checkAgainst = this.settings.illegalCharsList;
		}
		//LOOP THROUGH ILLEGAL CHARS LIST
		var i;
		var tmpCheckStr;
		for(i=0;i<checkAgainst.length;i++){
			if(checkStr.indexOf(checkAgainst.charAt(i))!==-1){
				checkStr = checkStr.split(checkAgainst.charAt(i)).join(replaceIllegalCharWith);
				fCe("illegal char found: "+checkAgainst.charAt(i));
			}
		}
		//CHECK FOR NON UNICODE CHARS
		fCl("CHANGE JS.substr by JS.substring (thx a lot IE8)");
		for(i=0;i<checkStr.length;i++){
			if(checkStr.charCodeAt(i) > 255){
				checkStr = checkStr.substr(0,i)+replaceIllegalCharWith+checkStr.substr(i+replaceIllegalCharWith.length);
				//checkStr = tmpCheckStr;
				fCe('illegal char found: '+checkStr.charAt(i));
				
			}
		}
		//
		fCl(checkStr);
		return checkStr;
	}
	
	//VALIDATE SEMANTIC THROUGH DOM TO CATCH POTENTIAL PROBLEMS BEFORE ITS TOO LATE!
	this.qsValidateSemantic = function (){
		//ÜBER IMPORTANT, NO IDs CAN BE THE SAME, NOWHERE ON THE SAME PAGE, NEVER EVER PEU IMPORTE L'EXCUSE, LOOP THROUGH ALL AND MAKE SURE THERE IS NO DUPLICATE ID IN THE DOM
		fCl('qsValidateSemantic()');
		allgood = false;
		
		all_ids_unique = true;
		all_elements_accounted_for = true;
		all_data_params_valid = true;
		all_logic_appear_ok = true;
		
		
		//CHECK FOR DOUBLED IDs
		idcheckArr = new Array();
		$('.qs-elearning-activity *[id], .qs-elearning-activity[id]').each(function(i,e){
			idcheckArr.push($(e).attr('id'));
		});
		idcheckArr.sort();
		for(var i in idcheckArr){
			if(idcheckArr[i]==idcheckArr[i-1]){
				all_ids_unique = false;
				//fCe("CAN'T HAVE IDENTICAL IDs ON THE SAME PAGE...");
				throw new Error("All IDs must be unique, found duplicate: "+'"'+idcheckArr[i]);
				break;
			}
		}
		
		
		var errStack = [];
		//----
		//CHECK FOR MISSING ELEMENTS (LEVEL 1 PRIORITY)
		//----
		//CHECK IF MAIN ELEMENT EXISTS!
		if($('.qs-elearning-activity').length<=0){
			all_elements_accounted_for = false;
			//throw new Error('Missing main .qs-elearning-activity element.');
			errStack.push('Missing main .qs-elearning-activity element.');
		}
		//CHECK IF ALL MAIN ELEMENT HAVE EXERCISES
		$('.qs-elearning-activity').each(function(){
			if($(this).find('.qs-exercise').length<=0){
				all_elements_accounted_for = false;
				//throw new Error('Missing .qs-exercise in .qs-elearning-activity');
				errStack.push('Missing .qs-exercise in .qs-elearning-activity');
			}
			//CHECK IF ALL MAIN ELEMENT > EXERCISES HAVE QUESTIONS
			$(this).find('.qs-exercise').each(function(){
				if($(this).find('.qs-question').length<=0){
					all_elements_accounted_for = false;
					//throw new Error('Missing .qs-question in ".qs-elearning-activity .qs-exercise"');
					errStack.push('Missing .qs-question in ".qs-elearning-activity .qs-exercise"');
				}
				//CHECK IF ALL MAIN ELEMENT > EXERCISES > QUESTIONS HAVE ANSWERS/FEEDBACK HOLDERS
				$(this).find('.qs-question').each(function(){
					if($(this).find('.qs-answers').length<=0){
						all_elements_accounted_for = false;
						//throw new Error('Missing .qs-answers in .qs-question');
						errStack.push('Missing .qs-answers in .qs-question');
					}
					//NEEDS TO PROPERLY IDENTIFY [data-feedback-type] INCLUDING DEPENDANCIES BEFORE ASSUMING .qs-feedback IS REQUIRED - TURN OFF FOR NOW
					//CHECK QUESTION($(this).attr('data-feedback-type')), THEN EXERCISE($(this).closest('.qs-exercise').attr('data-feedback-type')), THEN SETTING (NO NEED SINCE NOT PARSED YET), THEN DEFAULT (mThis.objDefVal.exercise.feedback_type)
					//
					//TURN OFF FOR NOW
					/*
					console.dir('1--> '+$(this).attr('data-feedback-type'));
					console.dir('2--> '+$(this).closest('.qs-exercise').attr('data-feedback-type'));
					console.dir('3--> '+mThis.objDefVal.exercise.feedback_type);
					console.log((!$(this).is('[data-feedback-type]'))?(!$(this).closest('.qs-exercise').is('[data-feedback-type]'))?mThis.objDefVal.exercise.feedback_type:$(this).closest('.qs-exercise').attr('data-feedback-type'):$(this).attr('data-feedback-type'));


					
					if($(this).find('.qs-feedback').length<=0 && (!$(this).is('[data-feedback-type]'))?(!$(this).closest('.qs-exercise').is('[data-feedback-type]'))?mThis.objDefVal.exercise.feedback_type:$(this).closest('.qs-exercise').attr('data-feedback-type'):$(this).attr('data-feedback-type')!=="none"){
						all_elements_accounted_for = false;
						//throw new Error('Missing .qs-feedback in .qs-question');
						errStack.push('Missing .qs-feedback in .qs-question');
					}*/
				});
			});
		});
		//----
		//CHECK FOR MISSING DATA-PARAMS (LEVEL 2 PRIORITY)
		//----
		//
		//CHECK FOR ALL NECESSARY ID
		$('.qs-elearning-activity, .qs-exercise, .qs-question, .qs-answers input:not(.qs-submit):not(.qs-prevquestion):not(.qs-nextquestion)').each(function(){
			if($(this).attr('id')===undefined){
				all_data_params_valid = false;
				//throw new Error('Missing ID for .qs-elearning-activity/.qs-exercise/.qs-question');
				errStack.push('Missing ID for .qs-elearning-activity/.qs-exercise/.qs-question/.qs-answers input:not(.qs-submit):not(.qs-prevquestion):not(.qs-nextquestion)');
			};
		});

		//CHECK IF CORRECT INPUT USED IN RELATED QUESTION (ACCORDING TO CLOSEST data-question-type OR setting objDefVal.question.question_type)
		//NEEDS *OPTIMIZING*
		$('.qs-question').each(function(){
			switch(($(this).closest('*[data-question-type]').attr('data-question-type')===undefined)?mThis.objDefVal.question.question_type:$(this).closest('*[data-question-type]').attr('data-question-type')){
				case 'type-0':
					if($(this).find('.qs-answers textarea').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing textarea in ".qs-question .qs-answers" with [data-question-type=type-0]');
						errStack.push('Missing textarea in ".qs-question .qs-answers" with [data-question-type=type-0]');
					}
					break;
				case 'type-1':
					if($(this).find('.qs-answers input[type=radio]').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing input[type=radio] in ".qs-question .qs-answers" with [data-question-type=type-1]');
						errStack.push('Missing input[type=radio] in ".qs-question .qs-answers" with [data-question-type=type-1]');
					}
					break;
				case 'type-2':
					if($(this).find('.qs-answers input[type=checkbox]').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing input[type=checkbox] in ".qs-question .qs-answers" with [data-question-type=type-2]');
						errStack.push('Missing input[type=checkbox] in ".qs-question .qs-answers" with [data-question-type=type-2]');
					}
					break;
				case 'type-3':
					if($(this).find('.qs-answers input[type=text]').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing input[type=text] in ".qs-question .qs-answers" with [data-question-type=type-3]');
						errStack.push('Missing input[type=text] in ".qs-question .qs-answers" with [data-question-type=type-3]');
					}
					break;
				case 'type-4':
					if($(this).find('.qs-answers select').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing select in ".qs-question .qs-answers" with [data-question-type=type-4]');
						errStack.push('Missing select in ".qs-question .qs-answers" with [data-question-type=type-4]');
					}
					break;
				case 'type-5':
					if($(this).find('.qs-answers input[type=button]:not(.qs-submit)').length<=0){
						all_data_params_valid = false;
						//throw new Error('Missing select in ".qs-question .qs-answers" with [data-question-type=type-5]');
						errStack.push('Missing select in ".qs-question .qs-answers" with [data-question-type=type-5]');
					}
					break;
				default:
					console.log('Unknown data-question-type, skipping validation.');
				}
		});
		
		
		
		//----
		//CHECK FOR ILLOGICAL OR MISSING DEPENDANT ELEMENTS (LEVEL 3 PRIORITY)
		//----
		//TBD -> all_logic_appear_ok
		/*
		-Number of question in random pool exceeding pool picks
		-.qs-right, .qs-wrong, .qs-generic, .qs-second-chance, .qs-final-positive-feedback, .qs-final-negative-feedback .... not empty
		-.qs-start-activity needs a .qs-start
		-confirm all [data-*] are valid, test against common list and warn if unknown are found
		-DEBUG MODE: LIST ALL NON VALID [data-*]
		HTML
		data-rep,data-tracking,data-activity type,data-exercise-type,data-question-type,data-feedback-type,data-question-skipping,data-force-final-recap,data-trigger-scorm-completion,data-trigger-completion-score,data-submit-all-at-once,data-submit-aao-disable-right-answers,data-simple-act-disable-mode,data-random-questions,data-pool-picks,data-random-answers,data-score-value,data-branching-type,data-branching-passing-grade,data-branching-pass-redirection,data-branching-fail-redirection,data-selective-redirection,data-question-ignore-case,data-allow-duplicate-answer,data-randomize-options,data-passthrough,data-specific-negative-feedback,data-specific-positive-feedback,data-specific-feedback-target,data-recap-text,data-recap-label,data-chance-count
		
		GENERATED
		data-encoded-rep,data-status,data-pass-id
		*/
		
		
		//TOTALLY TMP...
		//PROGRAM OVERRIDE (!DEBUGMODE)
		//PROGRAM HIDDING STUFF IF ERRORS
		
		//TRACE ERRORS
		if(errStack.length>0){
			throw new Error(errStack.join('\n'));
		}
		
		//RETURN...
		if(all_ids_unique && all_elements_accounted_for && all_data_params_valid && all_logic_appear_ok){
			return true;
		}else{
			return false;
		}

	}
	//RETURN RANDOM ARRAY FROM SCOPE NUMBER
	this.qsReturnRandomArr = function(iNb){
		//iNb = SCOPE, HOW MANY INDEXES TO RANDOMIZE
		if(isNaN(iNb)){
			fCe('qsReturnRandomArr(NaN)');
			return false;
		}
		tmpMatrixArr = [];
		randMatrixArr = [];
		//CREATE SEQUENCE
		for(rRi=0;rRi<iNb;rRi++){
			tmpMatrixArr[rRi] = rRi;
		}
		//CANIBALIZE FIRST ARRAY TO GENERATE 2ND RANDOM ONE
		for(rRi=0;rRi<iNb;rRi++){
			randMatrixArr[rRi] = tmpMatrixArr.splice(Math.floor(Math.random()*tmpMatrixArr.length),1);
		}
		return randMatrixArr;
	}
	//FIND REGEX: RETURN IF NEEDLE FOUND IN HAYSTACK
	qsFindRGX = function(ndl,hstck){
		var replace = ndl;
		var re = new RegExp(replace,"g");
		return hstck.match(re);;
	}
	
	//ANIMATOR
	qsHide = function (elem){
		//fCl('HIDE ----------->  '+elem);
		$(elem).hide();
		$(elem).attr('aria-hidden',true);
	}
	qsShow = function (elem){
		//fCl('SHOW ----------->  '+elem);
		$(elem).show();
		$(elem).attr('aria-hidden',false);
	}
	qsFadeOut = function(elem) {
		//fCl('FADEOUT ----------->  '+elem);
		$(elem).fadeOut(mThis.settings.animBaseDuration);
		$(elem).attr('aria-hidden',true);
	};
	qsFadeIn = function(elem) {
		//fCl('FADEIN ----------->  '+elem);
		
		$(elem).fadeIn(mThis.settings.animBaseDuration);
		$(elem).attr('aria-hidden',false);
	};
	qsTransition = function(elem1, elem2) {
		//fCe('NO TRANSITION *OVERRIDE FIX----------->  '+elem1+'   ->   '+elem2);
		$(elem1).attr('aria-hidden',true);
		
		//$(elem1).hide();
		//$(elem2).show();
		
		// $(elem1).fadeOut();
		// $(elem2).fadeIn();
		
		$(elem1).fadeOut(mThis.settings.animBaseDuration,function(){
			$(elem2).fadeIn(mThis.settings.animBaseDuration);
			$(elem2).attr('aria-hidden',false);
		});
		
		/* $(elem1).slideUp(animBaseDuration,function(){
			$(elem2).slideDown(animBaseDuration);
			$(elem2).attr('aria-hidden',false);
		}); */
		
	};
	qsShowSequentially = function (selStr){
		fCl('qsShowSequentially() is inactive *WIP');
		/*$(selStr).hide()
		$(selStr).each(function(i) {
			$(this).delay((i++) * 5000).fadeTo(10000, 1);
		})*/
	}

	qsTFRestrictOnKey = function(obj,evt){
		//fCl('qsTFRestrictOnKey('+obj+','+evt+')');
		//NO ENTER KEY!
		if(evt.keyCode==13){
			return false
		};
		//CHECK FOR ILLEGALCHARS
		/*if(illegalCharsList.indexOf(obj.value[(obj.value).length-1])!==-1){
			obj.value = obj.value.substr(0,(obj.value).length-1);
			return false;
		};*/
		return true;
	}
	
	//EVENT DISPATCHER INTERCEPTOR (REDIRECT) FUNCTION
	function fQsEvDp(evt,pars){
		fCl('fQsEvDp('+evt+')');
		if (typeof fQsEventDispatcher !== 'undefined' && typeof fQsEventDispatcher === 'function') {
			fQsEventDispatcher(evt,pars);
		}else{
			return false;
		}
	}
	//ACCESSIBILITY FEATURES & FUNCTION
	function fFocus(elem){
		fCl('fFocus('+elem+')');
		if(!mThis.settings.autoTabbing){
			return false;
		}
		
		//SET TAB INDEX:0, GIVE FOCUS
		$(elem).attr('tabindex',0).focus();//.removeAttr('tabindex');
		/*setTimeout(function(){
			$(elem).attr('tabindex',0).focus();//.removeAttr('tabindex');
		}, 0);*/
	}
	
	//TMP DEBUG

	$('#qs-load-tracking').click(function(){
		mThis.qsRecallData('all');
	});

	$('#qs-save-tracking').click(function(){
		mThis.qsSaveData(0);
	});
	//CONSOLE ALIASES
	function fCl(msg){
		if(typeof mThis.settings !== "undefined" && mThis.settings.debugMode){
			console.log(msg);
		}
	}
	function fCe(msg){
			console.error(msg);
	}
	//*WIP* TEST AGAINST NON EXPLICIT PROPERTIES IN OBJECTS FROM @#%^ WET POLYFILL
	//IE8 -> forEach,map,filter,every,some,reduce,reduceRight,indexOf,lastIndexOf
	function arrayHasOwnIndex(array, prop) {
		return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; // 2^32 - 2
	}
	//DETECT IE AND ADAPT
	function detectIE() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}
		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}
		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
		   // IE 12 => return version number
		   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}
		// other browser
		return false;
	}
	
	//FINALLY...LAUNCH!!!
	//var jData
	if(this.settings.autoStart){
		this.qsInit();
		$('.qs-elearning-activity').show();
		//LOAD DATA THEN INIT
		/*$.getJSON("qsdata_en.json",function(jsondata){
			fCl("JSONDATA:"+JSON.stringify(jsondata));
			jData = JSON.parse(JSON.stringify(jsondata));
			mThis.qsInit();
			$('.qs-elearning-activity').show();
		})*/
		
	}else{
		//DEBUG MODE STILL NEED THE JSON FILES...WIP
	}
	
	
	
	//TEST!
	/*for(asd=0;asd<999;asd++){
		fCl(this.qsTestAgainstEncodedValidationString('gonogo',asd));
	}*/
	


	//CHECK IF IN FRAMEWORK *WIP* check with 1.6.2

	if($(window).triggerHandler("Framework:systemInfo") === undefined && typeof(masterStructure) === 'undefined'){
		//WITHOUT FRAMEWORK
		fCl('CSPSELF not detected.');
		//CHECK IF PRE/POST 1.6.2
		if(typeof(masterStructure) !== 'undefined'){
			//VERSION >= 1.6.2
			fCl('CSPSELF V >= 1.6.2');
		}else if($(window).triggerHandler("Framework:systemInfo") !== undefined){
			//VERSION < 1.6.2
			fCl('CSPSELF V < 1.6.2');
		}
	}else{
		//WITH FRAMEWORK
		fCl('CSPSELF detected.');
	}

}




//CHECK IF JQUERY EXISTS
if (typeof jQuery == 'undefined') {  
	//console.error('JQUERY IS NOT LOADED CORRECTLY');
	throw new Error('JQUERY IS NOT LOADED CORRECTLY');
}



//
//Activation
//

$(document).ready(function() {
	
	/*qsObjParams = {
		"debugMode":true, //true|false: Displays logs
		"cheatMode":false, //true|false: Attempts to help you cheat for testing purposes
		"autoStart":true, //true|false: Automatically attempts to initialize any QS Activities on the page
		"encodeAnswers":true, //true|false: enables answer protection and ecryption in code (low level security)
		"animBaseDuration":200, //Number: Base animation duration in ms for fades, swipes, slides and similar transitions
		"masterIntTester":33, //Number[3-100]: used to encode answers and similar obfuscation meethods based on an integer. DO NOT CHANGE THIS NUMBER if activity was secured using server-side mechanisms or pre-encoded/encrypted. This number is the key basis of the protection.
		"illegalCharsList":"¼½¾Ð¶¢®©ª¤£¦§±þ§Þß¥º·¹²³¨÷|",
		"settingsPath":"settings/", //*WIP
		"settingsFilename":"qssettings", //*WIP
		"settingsLabelsFilename":"qslabels_", //*WIP TO THIS WILL BE ADDED A SUFFIX FR||EN AND .json (lowercase!)
		"autoTabbing":true,
		"language":"en"
	}*/
	
	
	//qsBeta(OBJNAME) WHERE OBJNAME = OBJECT NAME:string !important: X = new qsBeta(X[,extra params]);
	//Check if custom qsObjParams exist in page before loading defaults
	/*if(qsObjParams !== undefined){
		console.log('Custom qsObjParams loaded!');
	}else{
		qsObjParams = {
			"debugMode":true, //true|false: Displays logs
			"cheatMode":false, //true|false: Attempts to help you cheat for testing purposes
			"autoStart":true, //true|false: Automatically attempts to initialize any QS Activities on the page
			"encodeAnswers":true, //true|false: enables answer protection and ecryption in code (low level security)
			"animBaseDuration":200, //Number: Base animation duration in ms for fades, swipes, slides and similar transitions
			"masterIntTester":33, //Number[3-100]: used to encode answers and similar obfuscation meethods based on an integer. DO NOT CHANGE THIS NUMBER if activity was secured using server-side mechanisms or pre-encoded/encrypted. This number is the key basis of the protection.
			"illegalCharsList":"¼½¾Ð¶¢®©ª¤£¦§±þ§Þß¥º·¹²³¨÷|",
			"qsLabelsOverride":"myqsdata_", //*WIP TO THIS WILL BE ADDED A SUFFIX FR||EN AND .json (lowercase!)
			"qsLabelsOverride":"myqssettings" //*WIP
		}
	}*/
	
	
	
	//DELAY INIT IF ANY .qs-elearning-activity IN WET(4.X) COMPONENT
	var i,j,k;
	isWETDelayNecessary = false;
	wetComponentRequiredToLoad = 0;
	wetComponentLookupArr = [
		//INSERT EXCEPTIONS TO WATCH FOR HERE, [x][0] = component class, [x][1] = initialised class
		['.wb-tabs','.wb-inited']
	]; 
	for(i=0;i<$('.qs-elearning-activity').length;i++){
		for(j=0;j<wetComponentLookupArr.length;j++){
			if($('.qs-elearning-activity').eq(i).parents(wetComponentLookupArr[j][0]).length>0){
				isWETDelayNecessary = true;
				wetComponentRequiredToLoad++;
			}
		}
	}
	if(isWETDelayNecessary){
		for(i=0;i<$('.qs-elearning-activity').length;i++){
			for(k=0;k<wetComponentLookupArr.length;k++){
				switch(wetComponentLookupArr[k][0]){
					case ".wb-tabs":
						$(".wb-tabs").on("wb-ready.wb-tabs",function(evt) {

							wetComponentRequiredToLoad--;
							if(typeof qsObj === 'undefined' && wetComponentRequiredToLoad===0){
								qsObj = new qsBeta('qsObj',(typeof qsObjParams!=='undefined')?qsObjParams:{}); //*WIP NEEDS OPTIMIZING
							}
							/*else{if(wetComponentRequiredToLoad>0){console.error('Waiting for all WET component to be loaded');}else{console.error('Only one instance of qsBeta allowed');}}*/
						});
						break;
					//INSERT OTHER EXCEPTIONS HERE...
					default:
						//NO CONTROL ON COMPONENT
				}
			}
		}
	}else{
		//NON-DELAYED INIT
		qsObj = new qsBeta('qsObj',(typeof qsObjParams!=='undefined')?qsObjParams:{}); //*WIP NEEDS OPTIMIZING
	}
	//qsObj.qsInit(); //FORCE ON DEBUG
});
