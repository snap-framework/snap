define([
   'underscore',
   'jquery',
   'logger',
   "settings-core",
   '../BaseModule',
	'modules/diagnosis/diagnosis'
], function(_, $, Logger, CoreSettings, BaseModule, Diagnosis) {
	'use strict';
	
	return BaseModule.extend({
		templateUrl: 'templates/admin-mode/admin-mode',

		el: "#admin_window",

		ui: {
			locksAdmin: '.locks-admin'
		},

		initialize: function(options) {
			Logger.log("INIT: Admin Mode");
			
			this.options = options;
			this.navigation = this.options.navigation;
			this.scorm = this.options.scorm;
			this.lockingSystem = this.options.lockingSystem;

			$("body").append("<div id='admin_window'></div>");
			//reset jquery wrap of the element, since it has been added dynamically
			this.resetElement();

			this.render();
		},
		setListeners: function() {
			var that = this;
			$(document).keydown(function(e) {
				//CTRL+SHIFT+F12
				if (e.ctrlKey && e.shiftKey && e.keyCode == 123) {
					that.toggleAdminMode();
				}
			});

			var $adminMode = this.$el.find("#adminMode");
			//remove scorm section if offline
			if (this.scorm.getStatus() !== "online") {
				this.$el.find(".scorm-admin").remove();
			}

			$adminMode.find('.debug-btn').on('click', function() {
				that.toggleDebug();
				return false;
			})
			.end().find('.scorm-btn').on('click', function() {
				that.activateScorm();
				return false;
			})
			.end().find('.scormreset-btn').on('click', function() {
				that.resetScorm();
				return false;
			})
			.end().find('.comment-btn').on('click', function() {
				that.addComment();
				return false;
			})
			.end().find('.headings-btn').on('click', function() {
				that.highlightHeadings();
				return false;
			});

			$(this).on('Diagnosis:addMissingPage', function(e, sub, xhr) {
				$(that.diagnosis).trigger('Diagnosis:addMissingPage', [sub, xhr]);
			});
			$(this.lockingSystem).on('AdminMode:addUnlocks', _.bind(this.addUnlocks, this));
		},

		serializeData: function() {
			return {
				version: masterStructure.version,
				WETversion: masterStructure.WETversion,
				debugMode: CoreSettings.debugMode,
				isScormOnline: this.scorm.getStatus() === "online",
				connectionMode: CoreSettings.connectionMode,
				labels: labels
			};
		},

		render: function() {
			this.template = this.template(this.serializeData());
			
			this.$el.html(this.template);	
			this.setListeners();

			this.initDiagnosis();
			this.resetUI();
			this.addUnlocks();
		},

		initDiagnosis: function() {
			//CSPS-KR: Add to global namespace for now since it is used in non-related functionalities
			masterStructure.diagnosis = this.diagnosis = new Diagnosis({
				navigation: this.navigation
			});
		},

		toggleAdminMode: function() {
			Logger.log("---activating admin mode---");
			this.$el.toggle();
		},
		
		//TODO: This should be handled by the template itself
		toggleDebug: function() {
			var btn = this.$el.find(".debug-btn");
			if (!CoreSettings.debugMode) {
				CoreSettings.debugMode = true;
				btn.html("Deactivate Debug");
				$("html").addClass("debug");
				this.$el.find("#debug-status").removeClass('wb-inv');
				if (this.scorm.getStatus() != "online") {
					this.$el.find('#scorm-status').html(labels.err.offline);
				} else {
					this.$el.find('#scorm-status').html(labels.err.online);
				}
			} else {
				CoreSettings.debugMode = false;
				btn.html("Activate Debug");
				$("html").removeClass("debug");
				this.$el.find("#debug-status").addClass('wb-inv');
			}
		},

		/**
		 * iterates through the items in the menu marked as locked, 
		 * and populates a list of links to unlock them.
		 * This will append links in the locks list in the Admin mode panel.
		 */
		addUnlocks: function() {
			var that = this;
			this.ui.locksAdmin.find("ul").html("");
			var lockSubs = _.where(masterStructure.flatList, {isLocked: true});//this only finds pages
			Array.prototype.push.apply(lockSubs,_.where(masterStructure.subs, {isLocked: true, isPage:false})); //this adds modules			
			if (lockSubs.length > 0) {
				var itemTarget;
				var addItem;
				var $this;
				var target;
				for (var i = 0; i < lockSubs.length; i++) {
					itemTarget = lockSubs[i].$el.attr("data-target");
					addItem = "<li><a href='#' title='Unlock this page' data-target='"+itemTarget+"'>" + itemTarget + "</a></li>";
					this.ui.locksAdmin.find("ul").append(addItem);
					this.ui.locksAdmin.find("a[data-target='"+itemTarget+"']").off("click").on('click', function() {
						$this = $(this);
						target = $this.attr("data-target");
						$(that.lockingSystem).trigger('LockingSystem:unlockPage', target);
						return false;
					});
				}
			}else{
				this.ui.locksAdmin.find("ul").append("<li>No locks</li>");
			}
		},
		
		////TODO: Theses should go in their own modules
		/*------------------------------------------
		           scorm
		------------------------------------------*/
		activateScorm: function() {
			$(this.scorm).trigger("ScormController:activateScorm");
		},
		updateScorm: function() {
			$(this.scorm).trigger("ScormController:updateScorm");
		},
		resetScorm: function() {
			$(this.scorm).trigger("ScormController:resetScorm");
		},
		
		////TODO: Theses should go in their own modules
		/*------------------------------------------
		           AQA
		------------------------------------------*/
		highlightHeadings: function() {
			//$(this.scorm).trigger("ScormController:activateScorm");
			$("body").toggleClass("highlight-headings");
			var hiddenHeadings=$("h1:hidden,h2:hidden,h3:hidden,h4:hidden,h5:hidden,h6:hidden");

			$(".headings-btn").html("headings Toggle"+"(hidden:"+hiddenHeadings.length)
			/*for (var h=1;h<7;h++){
				$("h"+h).addClass("highlight")
				.before("<span class='heading-highlight'>Heading"+h+"</span>")
				.css("background-color", "coral");
			}*/
		},

		/*------------------------------------------
		           diagnosis
		------------------------------------------*/
		addComment: function() {
			$(this.diagnosis).trigger("Diagnosis:addComment");
		},
		toggleDiagnosis: function() {
			$(this.diagnosis).trigger("Diagnosis:toggleDiagnosis");
		},
		diagnoseImages: function() {
			$(this.diagnosis).trigger("Diagnosis:diagnoseImages");
		}
	});
});