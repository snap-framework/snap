define([
   'underscore',
   'jquery',
   'modules/BaseModule',
   'logger',
   'utils',
   'labels',
   'settings-core',
   'hbs!templates/tutorials/tutorial-mouse',
], function(_, $, BaseModule, Logger, Utils, labels, CoreSettings, TutorialMouseTmpl) {
   
   var TRANSITION_TIMEOUT = 500;

   return BaseModule.extend({
      el: '.tutorials',

      initialize: function(options) {
         Logger.log("INIT: Tutorial Controller");

         this.options = options;
         /*options: {
            tutorials: {
               showCanScroll: {
                  condition: value
               }
            },
            afterTutorial: func()
         }*/
         this.tutorials = this.options.tutorials;
         
         this.checkConditions();
      },

      checkConditions: function() {
         if (this.validateConditions()) {
            this.numTotalDismissed = 0;
            this.numTutorials = _.keys(this.tutorials).length;

            this.render();
            this.setEvents();
         } else {
            Logger.warn("Tutorial-Controller: No truthy condition has been found. Tutorial will not be shown.");
         }
      },

      /**
       * this checks that at least one condition is truthy
       * to launch the tutorial
       */
      validateConditions: function() {
         var conditions = _.pluck(this.options.tutorials, 'condition');
         return _.some(conditions);
      },

      buildHTML: function() {
         var tutorialHTML = '<div class="tutorials">';

         tutorialHTML += this.showCanScrollHTML();
         
         if (this.numTutorials > 1) {
            tutorialHTML += '<button class="skip-tutorial">' + labels.modal.skip + '</button>';
         }
         tutorialHTML += '</div>';

         return tutorialHTML;
      },

      showCanScrollHTML: function() {
         var html = "";
         if (this.tutorials.showCanScroll.condition) {
            html += TutorialMouseTmpl({
               labels: labels
            });
         }
         return html;
      },

      render: function() {
         $(this.buildHTML()).hide().appendTo('body').fadeIn();
         this.resetElement();
         this.showNext();
      },

      setEvents: function() {
         var that = this;

         this.$el.find('.confirm').on('click', function(e) {
            that.onConfirm();
         });
         this.$el.find('.skip-tutorial').on('click', function(e) {
            that.onDismiss();
         });
      },

      showNext: function() {
         var that = this;
         //slide out the last tutorial shown and transition the next one
         this.hideCurrent();
         //give it a little bit time to transition between the 2
         setTimeout(function() {
            that.$el.find('> div').eq(that.numTotalDismissed).addClass('slide-in');
         }, TRANSITION_TIMEOUT);
      },

      hideCurrent: function() {
         var that = this;
         this.$el.find('> div.slide-in').toggleClass('slide-in slide-out');
         //give it a little bit time to transition between the 2
         setTimeout(function() {
            that.$el.find('> div.slide-out').removeClass('slide-out');
         }, TRANSITION_TIMEOUT);
      },

      onConfirm: function() {
         this.numTotalDismissed++;
         
         //if we've reached the end of the tutorial
         if (this.numTotalDismissed === this.numTutorials) {
            this.close();
            if (_.isFunction(this.options.afterTutorial)) {
               this.options.afterTutorial();
            }
         } else {
            //transition the next tutorial
            this.showNext();
         }
      },

      onDismiss: function() {
         this.close();
         //TODO: we might want to reset the counter
         //this.numTotalDismissed = 0;
         //and then prepare the field to be launched again from the start
         //this.render();
         //asssuming we would want to restart the tutorial
         //as many times as desired
         //
         //This should be in its own function though,
         //and wait to be called by something external
         //like the help-controller.
      },

      close: function() {
         this.hideCurrent();
         this.cleanUp();
      },

      cleanUp: function() {
         var that = this;
         //clean up the classes so that if we need to show the tutorial again,
         //the state will be as it was when starting.
         this.$el.fadeOut(function() {
            //wait until the fadeout is done before removing the classes
            //as it will hide the elements inside
            that.$el.find('> div.slide-out').removeClass('slide-out');
            that.$el.remove();
         });
      }
   });
});