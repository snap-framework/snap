define([
	'jquery',
	'modules/BaseModule',
	'./scorm-constants',
	'labels',
	'settings-core'
], function ($, BaseModule, CONSTANTS, labels, CoreSettings) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.aScorm = []; //array of all possible scorm values

			this.setListeners();

			this.status = this.getStatus();
			this.api = CoreSettings.api;

			if (this.status !== "online" || this.isFakeScorm() === false) {
				if (CoreSettings.debugMode) {
					$("#wb-sttl").children("a").append("<div id='status'>- " + labels.err.offline + "</div>");
				}
			} else {
				//check if initialized already

				if (!this.api.LMSIsInitialized()) {
					this.api.doLMSInitialize();
					CoreSettings.scormversion = (CoreSettings.connectionMode === "scorm") ? this.api.getAPIHandle().scormVersion : null;
				} else {
					//alredy initialized
				}
			}
			this.initScormDefaults();
		},

		setListeners: function () {
			$(this).on("ScormController:updateScorm", this.updateScorm);
			$(this).on("ScormController:activateScorm", this.activateScorm);
			$(this).on("ScormController:resetScorm", this.resetScorm);
		},
		getLessonStatus: function () {
			if (this.getStatus() === "online") {
				return this.api.doLMSGetValue(CONSTANTS.CMI.CORE.LESSON_STATUS);
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		getBookmark: function () {
			if (this.getStatus() === "online") {
				return this.api.doLMSGetValue(CONSTANTS.CMI.CORE.LESSON_LOCATION);
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		getSuspendData: function () {
			if (this.getStatus() === "online") {
				return this.api.doLMSGetValue(CONSTANTS.CMI.SUSPEND_DATA);
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		saveBookmark: function () {
			if (this.getStatus() === "online") {
				this.api.doLMSSetValue(CONSTANTS.CMI.CORE.LESSON_LOCATION, masterStructure.currentSub.sPosition);
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		saveSuspendData: function (data) {
			if (this.getStatus() === "online") {
				this.api.doLMSSetValue(CONSTANTS.CMI.SUSPEND_DATA, data);
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		saveCommentsData: function (data) {
			if (this.getStatus() === "online") {
				this.api.doLMSSetValue(CONSTANTS.CMI.COMMENTS, data);
			} else {
				this.checkStatusChange();
				return "";
			}
		},


		/*CSPS-TD-AJOUT G313*/
		saveScoreData: function (data) {
			if (this.getStatus() === "online") {
				this.api.doLMSSetValue(CONSTANTS.CMI.CORE.SCORE_MIN, 0);
				this.api.doLMSSetValue(CONSTANTS.CMI.CORE.SCORE_MAX, 100);
				this.api.doLMSSetValue(CONSTANTS.CMI.CORE.SCORE_RAW, data);
				this.api.doLMSCommit();
			} else {
				this.checkStatusChange();
				return "";
			}
		},
		//this detects the localhost scorm wrapper
		isFakeScorm: function () {
			if (window.frameElement !== null) {
				if (window.frameElement.name === "wndSTAGEFRAME") {
					console.log("FAKE PLAYER")
					return true;
				}
			} else {
				return false;
			}

		},

		isOnline: function () {

			if (CoreSettings.isPopped === true) {
				if (window.opener.getAPIHandle() !== null) {
					this.api = window.opener;
					return true;
				}
			} else {
				if (getAPIHandle() !== null) {
					this.api = window;
					return true;
				}
			}
		},

		getStatus: function () {

			if (CoreSettings.connectionMode === "scorm" || this.isFakeScorm()) { //if this window has access to poppup
				//check for ILMS
				if (this.isOnline()) {
					return "online"; //labels.err.online.toLowerCase();
				} else {
					return labels.err.noScorm.toLowerCase();
				}
			} else {
				//do some sort of warning that the window is closed
				return labels.err.offline.toLowerCase();
			}
		},

		checkStatusChange: function () {
			//do SOMETHING if previous status hasn't been updated
			if (this.status !== this.getStatus()) {
				//SOMETHING CHANGED
				//manage error
				alert(labels.err.statusChange);
			}
		},
		initScormDefaults: function (resetVars) {
			resetVars = (typeof resetVars !== "undefined") ? resetVars : null;
			this.aScorm = [
				[CONSTANTS.CMI.CORE.STUDENT_ID, ""],
				[CONSTANTS.CMI.CORE.STUDENT_NAME, ""],
				//[CONSTANTS.CMI.CORE.CREDIT, ""],
				//[CONSTANTS.CMI.CORE.ENTRY, ""],
				[CONSTANTS.CMI.CORE.LESSON_MODE, "normal"],
				//[CONSTANTS.CMI.CORE", "",
				[CONSTANTS.CMI.SUSPEND_DATA, ""],
				[CONSTANTS.CMI.CORE.LESSON_LOCATION, ""],
				[CONSTANTS.CMI.CORE.LESSON_STATUS, ""],
				[CONSTANTS.CMI.CORE.SCORE_RAW, 0],
				//[CONSTANTS.CMI.CORE.SCORE_MIN, 0],
				//[CONSTANTS.CMI.CORE.SCORE_MAX, 0],
				//[CONSTANTS.CMI.CORE.TOTAL_TIME, 0],
				[CONSTANTS.CMI.COMMENTS, ""],
				//[CONSTANTS.CMI.CORE, "",
				[CONSTANTS.CMI.CORE.MASTERY_SCORE, 0],
				//[CONSTANTS.CMI.CORE.MAX_TIME_ALLOWED,0],
				//[CONSTANTS.CMI.CORE.TIME_LIMIT_ACTION,0],
				//[CONSTANTS.CMI.CORE.AUDIO,0],
				//[CONSTANTS.CMI.CORE.TEXT,0],
				//[CONSTANTS.CMI.CORE.LANGUAGE,0],
				//[CONSTANTS.CMI.CORE.SPEED,0]
			];
		},
		pullScormVars: function () {
			var scormName;
			for (var sLoop = 0; sLoop < this.aScorm.length; sLoop++) {
				scormName = this.aScorm[sLoop][0];
				this.aScorm[sLoop][1] = this.api.doLMSGetValue(scormName);
			}
			return "done";
		},
		resetScormVars: function () {
			var scormName;
			var scormValue;
			for (var sLoop = 2; sLoop < this.aScorm.length; sLoop++) {
				scormName = this.aScorm[sLoop][0];
				scormValue = this.aScorm[sLoop][1];
				this.aScorm[sLoop][1] = this.api.doLMSSetValue(scormName, scormValue);
			}
			this.api.doLMSCommit();
			return "done";
		},
		incomplete: function () {
			if (this.getStatus() === "online") {
				this.api.doLMSSetValue(CONSTANTS.CMI.CORE.LESSON_STATUS, "incomplete");
				this.api.doLMSCommit();
				return "done";
			} else {
				this.checkStatusChange();
			}
		},
		complete: function () {
			if (this.getStatus() === "online") {
				if (this.getLessonStatus() !== 'completed') {
					this.api.doLMSSetValue(CONSTANTS.CMI.CORE.LESSON_STATUS, "completed");
					this.api.doLMSCommit();
				}
				return "done";
			} else {
				this.checkStatusChange();
			}
		},

		updateScorm: function () {
			var scormName;
			var scormValue;
			$("#scorm-tracker").children("dl").html("");
			var scormList = $("#scorm-tracker").children();
			this.pullScormVars();
			for (var sLoop = 0; sLoop < this.aScorm.length; sLoop++) {
				scormName = this.aScorm[sLoop][0];

				scormValue = this.aScorm[sLoop][1];
				scormList.append("<dt>" + scormName + "</dt><dd>" + scormValue + "</dd>");
			}
		},
		activateScorm: function () {
			var btn = $(".scorm-btn");
			if (this.status === "online") {
				if (btn.hasClass("disabled")) {
					btn.html("Disable Scorm Tracking");
					$("html").addClass("debug");
					this.updateScorm();
					this.refreshScorm = window.setInterval(function () {
						this.updateScorm();
					}, 4000);
				} else {
					$("#scorm-tracker").children("dl").html("");
					clearInterval(this.refreshScorm);
					btn.html("Activate Scorm Tracking");

				}
				btn.toggleClass("disabled");
			} else {
				alert("scorm status: " + this.status);
			}
		},
		resetScorm: function () {
			this.api.doLMSSetValue(CONSTANTS.CMI.SUSPEND_DATA, "");
			this.api.doLMSSetValue(CONSTANTS.CMI.CORE.LESSON_LOCATION, "");
			this.api.doLMSSetValue(CONSTANTS.CMI.CORE.LESSON_STATUS, "incomplete");
			this.api.doLMSSetValue(CONSTANTS.CMI.CORE.SCORE.RAW, 0);
			this.api.doLMSCommit();
		},
		forceCommit: function () {
			this.api.doLMSCommit();
		}
	});
});