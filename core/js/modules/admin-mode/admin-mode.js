define([
	'underscore',
	'jquery',
	'logger',
	"settings-core",
	'../BaseModule'
], function (_, $, Logger, CoreSettings, BaseModule) {
	'use strict';

	return BaseModule.extend({
		templateUrl: 'templates/admin-mode/admin-mode',

		el: "#admin_window",

		ui: {
			locksAdmin: '.locks-admin'
		},

		initialize: function (options) {
			Logger.log("INIT: Admin Mode");
			this.parent = options.masterStructure;
			this.options = options;
			this.navigation = this.options.navigation;
			this.scorm = this.options.scorm;
			this.lockingSystem = this.options.lockingSystem;

			$("body").append("<div id='admin_window'></div>");
			//reset jquery wrap of the element, since it has been added dynamically
			this.resetElement();

			this.render();
		},
		setListeners: function () {
			var that = this;
			$(document).keydown(function (e) {
				//CTRL+SHIFT+F12
				if (e.ctrlKey && e.shiftKey && e.keyCode === 123) {
					that.toggleAdminMode();
				}
			});

			var $adminMode = this.$el.find("#adminMode");
			//remove scorm section if offline
			if (CoreSettings.connectionMode !== "scorm") {
				this.$el.find(".scorm-admin").remove();
			}

			$adminMode.find('.debug-btn').on('click', function () {
					that.toggleDebug();
					return false;
				})
				.end().find('.scorm-btn').on('click', function () {
					that.activateScorm();
					return false;
				})
				.end().find('.scormreset-btn').on('click', function () {
					that.resetScorm();
					return false;
				})
				.end().find('.comment-btn').on('click', function () {
					that.addComment();
					return false;
				})
				.end().find('.headings-btn').on('click', function () {
					that.highlightHeadings();
					return false;
				});
			$('.Copy-Structure').click(function () {
				that.copyStructure($(this));
				return false;
			})

			$(this.lockingSystem).on('AdminMode:addUnlocks', _.bind(this.addUnlocks, this));
		},

		serializeData: function () {
			var that = this;
			return {
				version: that.parent.version,
				WETversion: that.parent.WETversion,
				debugMode: CoreSettings.debugMode,
				environment: CoreSettings.environment,
				localmode: (CoreSettings.environment === "local") ? true : false,
				connectionMode: (CoreSettings.connectionMode === "scorm") ? "Scorm " + CoreSettings.scormversion : "offline",
				labels: labels
			};
		},

		render: function () {
			this.template = this.template(this.serializeData());

			this.$el.html(this.template);
			this.setListeners();

			this.resetUI();
			this.addUnlocks();
		},



		toggleAdminMode: function () {
			Logger.log("---activating admin mode---");
			this.$el.toggle();
		},

		//TODO: This should be handled by the template itself
		toggleDebug: function () {
			var btn = this.$el.find(".debug-btn");
			if (!CoreSettings.debugMode) {
				CoreSettings.debugMode = true;
				btn.html("Deactivate Debug");
				$("html").addClass("debug");
				this.$el.find("#debug-status").removeClass('wb-inv');
				if (this.scorm.getStatus() !== "online") {
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

		//TODO: 
		copyStructure: function ($btn) {
			$btn.after("<textarea id=\"clipboard_paste\"></textarea>");
			var mf, mfa, htmlPadder = ['<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Static links for SiteImprove crawling feature</title>\n</head>\n<body>\n\t<div>\n\t\t<ul>\n', "\t\t</ul>\n\t</div>\n</body>\n</html>"],
				langs = ["en", "fr"],
				buildBuffer = "",
				folderLookout = "",
				fileLookout = "";
			for (var i in masterStructure.flatList)
				for (var ii in mfa = (mf = masterStructure.flatList[i]).aPosition, langs) {
					buildBuffer += '\t\t\t<li><a href="index_' + langs[ii] + ".html?state=" + masterStructure.flatList[i].sPosition + '">' + mf.title + (1 == ii ? " (Translation)" : "") + "</a></li>\n";
				}

			$("#clipboard_paste").html(htmlPadder[0] + buildBuffer + htmlPadder[1]);
			let copier = document.getElementById("clipboard_paste");
			copier.select();
			copier.setSelectionRange(0, 99999);
			document.execCommand("copy");

			$("#clipboard_paste").remove();
			$btn.after("<div id='copy_msg'>Structure Copied to ClipBoard</div>")
			$("#copy_msg").fadeOut(1600, function () {
				$(this).remove();
			});
		},

		/**
		 * iterates through the items in the menu marked as locked, 
		 * and populates a list of links to unlock them.
		 * This will append links in the locks list in the Admin mode panel.
		 */
		addUnlocks: function () {
			var that = this;
			this.ui.locksAdmin.find("ul").html("");
			var lockSubs = _.where(that.parent.flatList, {
				isLocked: true
			}); //this only finds pages
			Array.prototype.push.apply(lockSubs, _.where(that.parent.subs, {
				isLocked: true,
				isPage: false
			})); //this adds modules			
			if (lockSubs.length > 0) {
				var itemTarget;
				var addItem;
				var $this;
				var target;
				for (var i = 0; i < lockSubs.length; i++) {
					itemTarget = lockSubs[i].$el.attr("data-target");
					addItem = "<li><a href='#' title='Unlock this page' data-target='" + itemTarget + "'>" + itemTarget + "</a></li>";
					this.ui.locksAdmin.find("ul").append(addItem);
					this.ui.locksAdmin.find("a[data-target='" + itemTarget + "']").off("click").on('click', function () {
						$this = $(this);
						target = $this.attr("data-target");
						$(that.lockingSystem).trigger('LockingSystem:unlockPage', target);
						return false;
					});
				}
			} else {
				this.ui.locksAdmin.find("ul").append("<li>No locks</li>");
			}
		},

		////TODO: Theses should go in their own modules
		/*------------------------------------------
				   scorm
		------------------------------------------*/
		activateScorm: function () {
			$(this.scorm).trigger("ScormController:activateScorm");
		},
		updateScorm: function () {
			$(this.scorm).trigger("ScormController:updateScorm");
		},
		resetScorm: function () {
			$(this.scorm).trigger("ScormController:resetScorm");
		},

		////TODO: Theses should go in their own modules
		/*------------------------------------------
				   AQA
		------------------------------------------*/
		highlightHeadings: function () {
			//$(this.scorm).trigger("ScormController:activateScorm");
			$("body").toggleClass("highlight-headings");
			var hiddenHeadings = $("h1:hidden,h2:hidden,h3:hidden,h4:hidden,h5:hidden,h6:hidden");

			$(".headings-btn").html("headings Toggle" + "(hidden:" + hiddenHeadings.length);
			/*for (var h=1;h<7;h++){
				$("h"+h).addClass("highlight")
				.before("<span class='heading-highlight'>Heading"+h+"</span>")
				.css("background-color", "coral");
			}*/
		}
	});
});