//DO NOT MODIFY ↓
define([
    'jquery','plugins/skrollr/skrollr-frame-csps'
], function($,SkrollrFrame) {
//DO NOT MODIFY ↑
	'use strict';


	var skrollrcsps = {
/*----------------------------------------------------------------------------		
		
		INITIALIZE and SYSTEM READY
----------------------------------------------------------------------------		*/
		//initialize();
		initialize: function() {

			//this section hijacks the page loaded function
			masterStructure.scrollObj=this;

			$(masterStructure).on("Framework:pageLoaded", function() {
				this.scrollObj.pageLoaded();
			});
			//prepare header and footer 
			this.setHeaderFooter();

		},
		
		setHeaderFooter: function(){
			// modify the navigation (header and footer) to follow skrollr
			$("body>header")
				.attr("data-0", "position:fixed;top:0;")
				.attr("data-edge-strategy", "set");
			$("body>footer")
				.attr("data-0", "bottom:0px;");
		},		
		
/*----------------------------------------------------------------------------		
		
		PAGE LOAD AND SKROLLR CALL
----------------------------------------------------------------------------		*/		
		

		//everytime the page loads
		pageLoaded: function() {
			// is there a skrollr element in the page?
			if($("main").find(".skrollr").length){
				this.pageLoadAutomation();
				//change headerfooter to scrolling mode
				this.refreshHeaderFooter(true);
				//Set Blank Backgrounds
				this.setBlanks();
				//check for items on the page
				this.setItems();
				
				
				
				if ( this.items.length>0){ 
					this.initAltNav();
				}
				// load the skrollr plugin
				this.loadSkrollr();
			}else{
				//switch to standard mode
				this.refreshHeaderFooter(false);

			}

			
		},
		//require call to skrollr plugin
		loadSkrollr: function() {
			require(['plugins/skrollr/skrollr'], function(skrollr){
				var s = skrollr.init({
					render: function(data) {
						masterStructure.scrollObj.refreshScrolling(data);
					
					}
				});

				s.refresh();

				masterStructure.scrollObj.skrollr=s;
				masterStructure.scrollObj.bottom=masterStructure.scrollObj.skrollr.getMaxScrollTop();
			});		
			
		},
		//add and remove classes for header and footer
		refreshHeaderFooter: function(hasSkrollr){
			// modify the navigation (header and footer) to follow skrollr
			
			if(hasSkrollr){
				//remove the "disable skrollr" class
				if (!$("html").hasClass("skrollr-active")){$("html").addClass("skrollr-active").removeClass("skrollr-disabled");}
			}else{
				//remove the skrollr class
				$("html").removeClass("skrollr-active").addClass("skrollr-disabled");
			}

		},			
		//add blank backgrounds where needed
		setBlanks: function(){
			//make a copy of every blank-bg
			$(".blank:not([data-color])").attr("data-color", "nothing");
			var $container=$(".blank:not([data-color='nothing']),.skrollr-img.container");
			for(var i=0;i<$container.length;i++){
				
				if(!$container.eq(i).hasClass("skrollr-img")){
					//if it's a straight content page
					$container.eq(i).before("<div class='blank-bg linked' id='blankbg_"+i+"'></div>");
					if (typeof $container.eq(i).attr("data-color") !== undefined){
						
						$("#blankbg_"+i).css("background-color", $container.eq(i).attr("data-color"));
					}
				}else{
					//if it's content over an image
					$container.eq(i).before("<div class='skrollr-img' id='blankbg_"+i+"' ></div>");
					$("#blankbg_"+i)
						.css("background-image", $container.eq(i).css("background-image"))
						.css("left", "0");
					$container.eq(i).children().wrapAll("<div class='container'></div>");
					$container.eq(i)
						.removeClass("container")
						.removeClass("skrollr-img")
						.addClass("blanktext")
						.css("background-image", "none");

				}
				
				
				var dataAttr=$container.eq(i).data();

				for (var attr=0;attr<Object.keys(dataAttr).length;attr++){
					var attrName=Object.keys(dataAttr)[attr];
					var attrValue=Object.values(dataAttr)[attr];
					if(attrName.charAt(0)>='0' && attrName.charAt(0)<='9'){

						$("#blankbg_"+i).attr("data-"+attrName,attrValue);
					}
				}
				
			}

		
			

		},	
		
		
		
/*----------------------------------------------------------------------------		
		
		SKROLLR MOVED!
----------------------------------------------------------------------------		*/		
		//continuously send out page numbers
		refreshScrolling: function(data) {
			//Admin mode skrollr position
			$(".skrollr-offset>div:first-of-type").html(data.curTop);
			//set current item
			this.findCurrentItem(data.curTop);
			//refresh the alt nav
			this.refreshAltNav();
			
			if (typeof this.currentScroll === "undefined" || this.currentScroll=== 0){
				this.currentScroll=data.curTop;
				
			}else{
				if (this.currentScroll<data.curTop){
					//going DOWN
					this.direction="down";
				}else{
					this.direction="up";
				}
				
			}
			
			this.currentScroll=data.curTop;
			
			//pause videos

			this.checkVideo(data.curTop);
			
			
			
				
			
			if (this.automated){
				
				for(var i=0;i<this.frames.length;i++){
					//STATUSES
					this.frames[i].updateStatus(data.curTop);
					//check locks
					if(this.frames[i].isLocked && this.frames[i].status==="active"){
						window.scrollTo(0, this.frames[i].freezeFrame); 
						this.isLocked=true;
						this.lockFrame=this.frames[i].freezeFrame;

					}
				}
				if(this.isLocked){

					window.scrollTo(0, this.lockFrame); 
				}
				
				
			}
		},		
		
	/*----------------------------------------------------------------------------		
		
		PAGE ITEMS
----------------------------------------------------------------------------		*/	
		// "pages" are dividided into "items"
		setItems:function(){
			this.items = []; //array of objects
			var $el=$("[data-onscreen]");
			var iArray=[];
			for (var list=0; list<$el.length;list++){
				iArray[list]=parseInt($el.eq(list).attr("data-onscreen"), 10);
				
			}

			iArray = iArray.sort(function (a, b) {  return a - b;  });			
			for (var i=0;i< iArray.length ;i++){
				$el=$("[data-onscreen='"+iArray[i]+"']");
				
				this.items[this.items.length]={
					title:$el.attr("data-title"),
					parent:this,
					obj:$el,
					index:i,
					objID:"skrollrnav_"+i,
					isLast:(i===(iArray.length-1))?true:false,
					onscreen:parseInt($el.attr("data-onscreen"),10),
					endPosition:(i===(iArray.length-1))?9999:parseInt($("[data-onscreen='"+iArray[i+1]+"']").attr("data-onscreen"), 10),
					flag:false,
					loadItem:function(){
						scrollTo(0,this.onscreen);
					},
					onLoad:function(){

						if(this.firstLoad!==true){
							this.firstLoad=true;
							if($(this.obj).hasClass("lock")){
								
								this.parent.isLocked=true;

								window.onscroll = function () { 
									var sckrollr=masterStructure.scrollObj;
									if(sckrollr.isLocked){
										window.scrollTo(0, sckrollr.currentItem.onscreen); 
									}
								};
							}
						}
					}
				};
				
			}

		},

		findCurrentItem:function(offset){
			for (var i=0;i<this.items.length;i++){
				if (offset>=this.items[i].onscreen && offset<this.items[i].endPosition){
					if (this.currentItem!==this.items[i]){
						this.currentItem=this.items[i];
						this.currentItem.onLoad();
					}
					return this.items[i];
				}
			
			}
			this.currentItem=null;
			return null;
			
			
		},
		loadNext:function(){
			if(this.currentItem === null){
				this.items[0].loadItem();
				return true;
			}
			

			if ( !this.currentItem.isLast){
				var index=this.currentItem.index+1;
				this.items[index].loadItem();
				return true;
			}else{
				return false;
			}
		},
		loadPrev:function(){
			if (this.currentItem===null){return false;}
			if (this.currentItem.index!==0){
				var index=this.currentItem.index-1;
				this.items[index].loadItem();
			}else{return false;}
		},
		
/*----------------------------------------------------------------------------		
		
		ALT NAV
----------------------------------------------------------------------------		*/
		initAltNav:function(){
			

		    // tabbing index navigation
			$("div.skrollr").find("[tabindex='0']").focus(
				function(/*obj*/) {
			  		var onscreen=$(this).attr("data-onscreen");
			  		scrollTo(0, parseInt(onscreen, 10));
			});
			
			// skrollr sidenav
			
			if($(".skrollr-nav").length>0){
			$("#dynamic_content").prepend("<nav id='skrollnav'></nav>");
			$("#skrollnav")
				.addClass("col-md-1")
				.css("margin-top", $("header").height()+"px")
				//.css("width", $("main").css("margin-left"))
				.append("<h2>SkrollNav</h2>")
				.append("<a href='#' class='itemnav back' onclick='masterStructure.scrollObj.loadPrev(); return false;'>Previous</a>");
			$("#skrollnav").append("<a href='#' class='itemnav next' onclick='masterStructure.scrollObj.loadNext(); return false;'>Next</a>");
			for (var i=0;i<this.items.length;i++){
			
				var onclick="window.scrollTo(0,"+this.items[i].onscreen+");";

				$("#skrollnav").append("<a href='#' ID="+this.items[i].objID+" class='btn' onclick='"+onclick+"return false;'>"+this.items[i].title+"</a>");

			}
			$("#skrollnav").append("<a href='#' class='itemnav back' onclick='masterStructure.scrollObj.loadPrev(); return false;'>Previous</a>");
			$("#skrollnav").append("<a href='#' class='itemnav next' onclick='masterStructure.scrollObj.loadNext(); return false;'>Next</a>");
			
			}
			
		},
		
		refreshAltNav:function(){
			$("#skrollnav").find("a").removeClass("selected");
			if (typeof this.items !== "undefined" && typeof this.currentItem !== "undefined"){ 
				if (this.currentItem !==null) {$("#"+this.currentItem.objID).addClass("selected");}
			}

		},
		
/*----------------------------------------------------------------------------		
		
		Automated skrollr mode
----------------------------------------------------------------------------		*/		

		pageLoadAutomation:function(){		
			if($(".skrollr.automated-skrollr").length){
				this.automated=true;
				this.frames=[];
			   this.seekFrames();
			   
			   
			}
		},
		seekFrames:function(){		


			for (var i=0;i<$(".skrollr.automated-skrollr").children().length;i++){

				//var frame=this.frames[i];3

				
				//INITIALIZE
				var frame=new SkrollrFrame({
					el: $(".skrollr.automated-skrollr").children().eq(i),
					index:i,
					parent:this,
					isFirst:(i===0)?true:false,
					isLast:(i===$(".skrollr.automated-skrollr").children().length-1)?true:false
				});
				this.frames[i]=frame;

			}
			
			
			for (i=0; i<this.frames.length;i++){
				
				//var frame=this.frames[i];
				this.frames[i].adjust();
				this.frames[i].injectDataAttributes();
				
			}
			
		},		
		unlockFrame:function(){
			this.isLocked=false;
			//find which frame is locked
			if (this.automated){
				
				for(var i=0;i<this.frames.length;i++){
					if(this.frames[i].isLocked){
						this.frames[i].isLocked=false;
						//window.scrollTo(0, this.frames[i].nextFrame.freezeFrame); 
						
					}
					
				}
			}


			
			
		},
		
/*----------------------------------------------------------------------------		
		
		check if videos are off-screen
----------------------------------------------------------------------------		*/		
		checkVideo:function(){
			//$(".playing").find("video").trigger('pause');
			for(var i=0;i<$(".playing").length;i++){
				if($(".playing").eq(i).parents(".skrollable").hasClass("skrollable-after")){
					$(".playing").eq(i).find("video").trigger('pause');
				}
			}			
			
		},		
		
/*----------------------------------------------------------------------------		
		
		Movie Mode
----------------------------------------------------------------------------		*/
		startMovieMode:function(speed){
			
			speed=20;
			this.movie = setInterval(this.intervalScroll, speed);


			return false;
			
		},
		intervalScroll:function(){
			// interval for animating the scrolling
			var scrollObj=masterStructure.scrollObj;
			var offset=scrollObj.skrollr.getScrollTop();
			//var currentID=(scrollObj.currentItem===null)?"null":scrollObj.currentItem.objID;
			
			//IF YOU REACH AN ITEM
			if( offset >=scrollObj.currentItem.endPosition-20){
				//PAUSE
				scrollObj.loadNext();
				scrollObj.stopScroll();
			}else{
				//OTHERWISE, SCROLL ON
				scrollObj.skrollr.setScrollTop(offset+10);
			}
			//if you reach the bottom
			if (offset>=3100){
				scrollObj.stopScroll();
				
			}
			
		},
		stopScroll:function(){
				clearInterval(masterStructure.scrollObj.movie);
		}		
		
		
	};
	//skrollrcsps.initialize();
	return skrollrcsps;

});
