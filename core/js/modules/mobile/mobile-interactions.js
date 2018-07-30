define([
    'jquery',
    'logger',
    "settings-core",
    '../BaseModule'
], function($, Logger, CoreSettings, BaseModule) {
	'use strict';

	return BaseModule.extend({

		events: {
			"touchstart #dynamic_content": "touchStart",
			"touchend #dynamic_content": "touchEnd",
			"touchmove #dynamic_content": "touchmove",
			"touchcancel #dynamic_content": "touchCancel"
		},

		initialize: function(options) {
			Logger.log("INIT: Mobile interactions");
			
			this.options = options;
			this.navigation = this.options.navigation;

			// this variable is used to identity the triggering element
			this.triggerElement = null;

			this.fingerCount = 0;
			this.startX = 0;
			this.startY = 0;
			this.curX = 0;
			this.curY = 0;
			this.deltaX = 0;
			this.deltaY = 0;
			this.horzDiff = 0;
			this.vertDiff = 0;

			// the shortest distance the user may swipe
			this.minLength = 72;

			this.swipeLength = 0;
		},

		touchStart: function(event) {
			if (event.originalEvent.touches) {
				// disable the standard ability to select the touched object
				//event.preventDefault();
				// get the total number of fingers touching the screen
				this.fingerCount = event.originalEvent.touches.length;
				// since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
				// check that only one finger was used
				if (this.fingerCount == 1) {
					// get the coordinates of the touch
					this.startX = event.originalEvent.touches[0].pageX;
					this.startY = event.originalEvent.touches[0].pageY;
					// store the triggering element ID
					this.triggerElement = CoreSettings.contentContaier;
				} else {
					// more than one finger touched so cancel
					this.touchCancel(event);
				}
			}
		},

		touchMove: function(event) {
			if (event.originalEvent.touches) {
				//event.preventDefault();
				if (event.originalEvent.touches.length == 1) {
					this.curX = event.originalEvent.touches[0].pageX;
					this.curY = event.originalEvent.touches[0].pageY;
				} else {
					this.touchCancel(event);
				}
			}
		},

		touchEnd: function(event) {
			//event.preventDefault();
			// check to see if more than one finger was used and that there is an ending coordinate
			if (this.fingerCount == 1 && this.curX != 0) {
				// use the Distance Formula to determine the length of the swipe
				this.swipeLength = Math.round(Math.sqrt(Math.pow(this.curX - this.startX, 2) + Math.pow(this.curY - this.startY, 2)));
				// if the user swiped more than the minimum length, perform the appropriate action
				if (this.swipeLength >= this.minLength) {
					//caluculateAngle();
					//determineSwipeDirection();
					processingRoutine();
					this.touchCancel(event); // reset the variables
				} else {
					this.touchCancel(event);
				}
			} else {
				this.touchCancel(event);
			}
		},

		touchCancel: function(event) {
			// reset the variables back to default values
			this.fingerCount = 0;
			this.startX = 0;
			this.startY = 0;
			this.curX = 0;
			this.curY = 0;
			this.deltaX = 0;
			this.deltaY = 0;
			this.horzDiff = 0;
			this.vertDiff = 0;
			this.swipeLength = 0;
			this.triggerElement = null;
		},

		caluculateAngle: function() {
			var X = this.startX - this.curX;
			var Y = this.curY - this.startY;
			var Z = Math.round(Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2))); //the distance - rounded - in pixels
			var r = Math.atan2(Y, X); //angle in radians (Cartesian system)
			var swipeAngle = Math.round(r * 180 / Math.PI); //angle in degrees
			if (swipeAngle < 0) {
				swipeAngle = 360 - Math.abs(swipeAngle);
			}
			return swipeAngle;
		},

		determineSwipeDirection: function() {
			var swipeDirection;
			var swipeAngle = caluculateAngle();
			if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
				swipeDirection = 'left';
			} else if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
				swipeDirection = 'left';
			} else if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
				swipeDirection = 'right';
			} else if ((swipeAngle > 45) && (swipeAngle < 135)) {
				swipeDirection = 'down';
			} else {
				swipeDirection = 'up';
			}
			return swipeDirection;
		},

		processingRoutine: function() {
			var swipedElement = $(this.triggerElement);
			var swipeDirection = determineSwipeDirection();
			if (swipeDirection == 'left') {
				event.preventDefault();
				// REPLACE WITH YOUR ROUTINES
				//swipedElement.style.backgroundColor = 'orange';
				$(this.navigation).trigger("Navigation:goToNextPage");
			} else if (swipeDirection == 'right') {
				event.preventDefault();
				// REPLACE WITH YOUR ROUTINES
				//swipedElement.style.backgroundColor = 'green';
				$(this.navigation).trigger("Navigation:goToPrevPage");
			}
		}
	});
});