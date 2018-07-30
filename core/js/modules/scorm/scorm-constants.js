'use strict';

//Reference: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
//Scorm 2004
define({
	CMI: {
		SUSPEND_DATA: "cmi.suspend_data",
		COMMENTS: "cmi.comments",
		COMMENTS_FROM_LMS: "cmi.comments_from_lms",
		STUDENT_DATA: {
			MASTERY_SCORE: "cmi.student_data.mastery_score",
			MAX_TIME_ALLOWED: "cmi.student_data.max_time_allowed",
			TIME_LIMIT_ACTION: "cmi.student_data.time_limit_action",
		},
		STUDENT_PREFERENCE: {
			AUDIO: "cmi.student_preference.audio",
			TEXT: "cmi.student_preference.text",
			LANGUAGE: "cmi.student_preference.language",
			SPEED: "cmi.student_preference.speed",
		},
		CORE: {
			STUDENT_ID: "cmi.core.student_id",
			STUDENT_NAME: "cmi.core.student_name",
			LESSON_MODE: "cmi.core.lesson_mode",
			LESSON_LOCATION: "cmi.core.lesson_location",
			LESSON_STATUS: "cmi.core.lesson_status",
			SCORE_RAW: "cmi.core.score.raw",
			SCORE_MIN: "cmi.core.score.min",
			SCORE_MAX: "cmi.core.score.max",
			TOTAL_TIME: "cmi.core.total_time",
			CREDIT: "cmi.core.credit",
			ENTRY: "cmi.core.entry",
			EXIT: "cmi.core.exit"
		},
		LAUNCH_DATA: "cmi.launch_data"
	}
});