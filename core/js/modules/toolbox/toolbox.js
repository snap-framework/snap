define([
	'jquery',
	'modules/BaseModule',
	'logger',
	'./tool-item',
   "settings-core",
   'utils',
], function($, BaseModule, Logger, ToolItem, CoreSettings,Utils) {
	'use strict';

	return BaseModule.extend({
		events: {
			"keydown a.toolbox": "onToolboxKeyDown",
			"keydown .tb-container a": "onToolboxItemKeyDown"
		},

		initialize: function(options) {
			Logger.log("INIT: Toolbox");

			this.options = options;
			
			this.$toolboxLink = $('a.toolbox');
			//TODO: make mobile check dynamic instead of dupplicating code for both desktop and mobile
			this.$toolboxLinkMobile = $("#mb-pnl").find("a.toolbox");
			this.isOpen = false;
			this.items = [];
			this.current;
			this.target;

			//fix the mobile version (put first for next mobile affectations)
			$("section.lng-ofr").find(".tb-item").parent('li').remove();
			$("section.lng-ofr").find(".tb-item").remove(); // fix ie8 version sc
			$("section.lng-ofr").find("ul.tb-container").detach();

			$("section.lng-ofr").after("<ul id='mb-tb' class='list-unstyled open tb-container' role='menu' aria-hidden='true'></ul>");
			$("#mb-tb").append($("ul.tb-container").html());
			$("#mb-tb").hide();
			this.$toolboxLink.append("<span class='wb-inv'>"+labels.nav.toolboxInstr+"</span>")
			this.menuAddCustom();
			this.initializeItems();

			this.setListeners();
		},

		initializeItems: function() {
			//initialize items
			//exceptions : dont init disabled items
			var notList="";
				notList+=((CoreSettings.showFavorites)?"":":not('.favorites')");
				notList+=((CoreSettings.showGlossary)?"":":not('.glossary')");
				notList+=((CoreSettings.showResources)?"":":not('.resources')");
			var kids = this.$toolboxLink.next("ul").children("li").children("a"+notList).parent();
			var mbKids = this.$toolboxLinkMobile.closest('section').next("ul#mb-tb").children("li").children("a"+notList).parent();; // fix mobile toolbox problem sc
			for (var i = 0; i < kids.length; i++) {
				this.items[i] = new ToolItem({
					el: kids.eq(i)[0],
					index: i,
					setsize: kids.length,
					mbObj: mbKids.eq(i)
				});
			}
		},

		setListeners: function() {
			var that = this;
			//add aria-expanded and aria-hidden
			//add attribute open		
			//add role="menuitem"	

			$(document).on("click", _.bind(this.onToolboxClick, this));
			this.$toolboxLink.on("click", function(e) {
				//do not interfere with other components that are listening on the click event for links
				e.preventDefault();
			});
		},

		onToolboxItemKeyDown: function(e) {
			//do not interfere with other components that are listening on the key down event
			e.stopPropagation();

			var tabKey = 9;
			var upKey = 38;
			var downKey = 40;
			var escapeKey = 27;

			if (e.which == downKey || e.which == upKey) {
				e.preventDefault();
				var offset = (e.which === downKey) ? 1 : -1;
				this.scrollItems(offset);
			} else if (e.which === tabKey || e.which === escapeKey) {
				this.menuClose();
				//TODO: should focus on the element based on the device
				//FIXME: Broken mobile.
				this.$toolboxLink.focus();
			}
		},
		onToolboxKeyDown: function(e) {
			//do not interfere with other components that are listening on the key down event
			e.stopPropagation();

			var container = $('ul.tb-container');
			var tabKey = 9;
			var upKey = 38;
			var downKey = 40;

			if (container.is(":visible") && !this.$toolboxLink.is(":focus")) {
				if (e.which === tabKey) {
					this.menuClose();
				} else if (e.which === downKey || e.which === upKey) {
					e.preventDefault();
					var offset = (e.which === downKey) ? 1 : -1;
					this.scrollItems(offset);
				}
			}
			// if inside toolbox menu
			if (this.$toolboxLink.is(":focus") && e.which === downKey) {
				//get inside downarrow
				e.preventDefault();
				// added for ie8 to work sc
				if (!this.isOpen) {
					this.menuToggle();
				}

				this.target = 0;
				$(container).find('a').first().focus(); // fix for mobile sc
				this.current = 0;
				this.setFocus();
			}
		},

		onToolboxClick: function(e) {
			var container = this.$toolboxLink.next("ul");
			if (!container.is(e.target) // if the target of the click isn't the container...
				&& container.has(e.target).length === 0 // ... nor a descendant of the container
				&& this.isOpen != false // ... and the toolbox is open
				&& !this.$toolboxLink.is(e.target) && !this.$toolboxLink.children().is(e.target) // ... anything inside the toolbox link really...(SVG, SPAN etc...)
			) {
				this.menuClose(); //clickoutside
				this.isOpen = false;
			}
			if (this.$toolboxLink.is(e.target) || this.$toolboxLink.children().is(e.target)) {
				this.menuToggle();
			}
		},

		menuClose: function() {
			this.isOpen = false;
			$("#mb-tb").slideToggle();
			this.$toolboxLink.next("ul").slideToggle();
		},
		menuAddCustom: function() {
			var pageName,itemFilename,itemTitle, lang,aCustomItem,itemClass,
				itemID,itemExt, htmlCode,mbHtmlCode, flagLbx, flagSpot,textComp;
			var aItems, aMbItems;//=$("#wb-lng>ul>li>ul>li");
			aCustomItem=CoreSettings.addToolboxPage;
			lang=Utils.lang;
			//populate the list so we can
			flagLbx=false;
			if (aCustomItem){
				for(var i=0;i<aCustomItem.length;i++){
					aItems=$("#wb-lng>ul>li>ul>li");
					aMbItems=$("#mb-tb>li");
					//initialize some vars
					itemFilename=(lang=="en")?aCustomItem[i].filename_en:aCustomItem[i].filename_fr;
					itemTitle=(lang=="en")?aCustomItem[i].name_en:aCustomItem[i].name_fr;
					itemExt=itemFilename.substr(itemFilename.lastIndexOf('.'));
					itemExt=(itemExt.split(".").length - 1 <=1)?itemExt:".ext";
					itemExt=(itemExt.replace(/\s/g, '').slice(-1)==";")?".exe":itemExt;
					// write the html depending on the item type
					switch(itemExt) {
					    case ".ext":
					    case ".ca":
					    case ".com":
					    case ".net":
					    	itemID="external_"+i
							itemClass="tb-item external tb-"+itemID;
							itemFilename=(itemFilename.indexOf("http://")>0)?itemFilename:"http://"+itemFilename;
							htmlCode="<li><a class='"+itemClass+"' id='"+itemID+"' href='"+itemFilename+"' role='menuitem' target=_blank>"+itemTitle+"</a></li>";
							//$(".tb-container").prepend(htmlCode);
							flagLbx=true;
							mbHtmlCode=htmlCode.replace("id='","id='mb-");							
					        break;
					    case ".pdf":
					    case ".doc":
					    case ".docx":
					    	itemID="pdf_"+itemFilename.substr(0, itemFilename.indexOf('.'))+i; 
							itemClass="tb-item tb-"+itemID;
							htmlCode="<li><a class='"+itemClass+"' id='"+itemID+"' href='content/tools/"+itemFilename+"' role='menuitem' target=_blank>"+itemTitle+"</a></li>";
							mbHtmlCode=htmlCode.replace("id='","id='mb-");
					        break;
					    case ".exe":
					    case ".js":
					    	itemID="exec_"+i
							itemClass="tb-item tb-"+itemID;
							htmlCode="<li><a class='"+itemClass+"' id='"+itemID+"' href='#' role='menuitem' onclick=\""+itemFilename.substr(0, itemFilename.lastIndexOf('.'))+"\">"+itemTitle+"</a></li>";
							mbHtmlCode=htmlCode.replace("id='","id='mb-");
					        break;
					    default:
					        //not specified , aka a local lightbox
					        itemID="ajax_"+itemFilename+i;
					        itemFilename=(itemFilename.indexOf(".html")>0)?itemFilename:itemFilename+".html";
							itemClass="wb-lbx tb-item tb-"+itemID;
							htmlCode="<li><a class='"+itemClass+"' id='"+itemID+"' href='content/tools/"+itemFilename+"' role='menuitem'>"+itemTitle+"</a></li>";
							mbHtmlCode=htmlCode.replace("id='","id='mb-");
							flagLbx=true;
					}
					/*----- INSERT ELEMENT sorting
					possibilities: 
						-smaller than the first
						-bigger than an elment and smaller than another
						-bigger than last element
					*/
					flagSpot=false;
					//console.log("--------------"+itemTitle)
					for (var j=0;j<aItems.length;j++){
						textComp=itemTitle.localeCompare( $(aItems[j]).children().text());
						if (textComp==-1 && !flagSpot){
							//term comes before, lock this and insert code
							flagSpot=true;
							$(aItems[j]).before(htmlCode);
							$(aMbItems[j]).before(mbHtmlCode);
						}
						if (textComp==0 && !flagSpot){
							//terms are equal. making a copy afterwards in case we wanna do something funny
							flagSpot=true;
							$(aItems[j]).after(htmlCode);
							$(aMbItems[j]).after(mbHtmlCode);
						}
						if (textComp==1 && !flagSpot){
							//console.log("keep going");
						}
						if (j==(aItems.length-1) && !flagSpot){
							//if last of loop
							$(aItems[j]).parent().append(htmlCode);
							$(aMbItems[j]).parent().append(mbHtmlCode);
							flagSpot=true;
						}
					}
				}
				//if there was any lightboxes, lets hit it!
			}
if (flagLbx){initWbAdd(".wb-lbx", $("#wb-lng"));}
		},
		menuDisplay: function() {
			this.$toolboxLink.next("ul").slideToggle();
			$("#mb-tb").slideToggle();
			this.isOpen = true;
		},
		menuToggle: function() {
			if (this.isOpen) {
				this.menuClose();
			} else {
				this.menuDisplay();
			}
		},
		setFocus: function() {
			this.current = this.target;
			this.items[this.target].setFocus();
		},
		scrollItems: function(offset) {
			if (this.current == 0 && offset < 0) {
				this.target = this.items.length - 1;
			} else if (this.current == (this.items.length - 1) && offset > 0) {
				this.target = 0;
			} else {
				this.target = this.current + offset;
			}
			this.setFocus();
		}
	});
});