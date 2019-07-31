define([
	'modules/BaseModule'
], function( BaseModule) {
	'use strict';

	/*
	 * Un frame est un objet cadre dans Skrollr

	*/
	return BaseModule.extend({
		initialize: function(options) {
			//CONSTANTES

			
			//VARIABLES
			this.obj=options.el;
			//frames
			this.offset=0;
			this.startFrame=null;
			this.freezeFrame=null;
			this.outFrame=null;
			this.endFrame=null;
			
			this.currentFrameStatus=null;
			this.scrollingDirection=null;
			
			this.onScreen=null;

			
			//content type
			this.isContent=$(this.obj).hasClass("skrollr-content");
			this.isImage=$(this.obj).hasClass("skrollr-img");
			this.isTransition=$(this.obj).hasClass("transition");
			
			//lines
			this.isLines=$(this.obj).hasClass("lines");
			this.lineAnim=this.getLinesAnim();
			this.lineDelay=50;
			this.lineDuration=2000;
			
			//hierarchy
			this.isFirst=options.isFirst;
			this.isLast=options.isLast;
			this.index=options.index;
			this.parent=options.parent;
			this.prevFrame=(this.isFirst)?null:this.parent.frames[this.index-1];
			this.nextFrame=null; 
			
			//animation types
			this.in=(this.isFirst)?null:this.getTransition("in");
			this.out=(this.isLast)?null:this.getTransition("out");

			//------- 
			this.duration=this.getDuration();
			this.delay=this.getDelay();
			this.transitionSpeed=500;
			this.freezeDuration=this.getFreeze();
			
			this.isAbsolute=$(this.obj).hasClass("skrollr-absolute");
			this.isLocked=$(this.obj).hasClass("skrollr-locked");
			//initialize defaults
			this.setDefault();

		},

		
		setDefault:function(){

			
			this.startFrame=(this.isFirst)?0:this.prevFrame.outFrame;
			this.freezeFrame=(this.isFirst)?0:this.startFrame+this.transitionSpeed;
			this.outFrame=(this.isFirst)?0:this.freezeFrame+this.freezeDuration;
			this.endFrame=(this.isLast)?null:this.outFrame+this.transitionSpeed;

			this.onScreen=(typeof $(this.obj).attr("data-onscreen") !== "undefined")?$(this.obj).attr("data-onscreen"):null;

			
			//set the next item hierarchy
			if(!this.isFirst){
				this.prevFrame.nextFrame=this;
			}
			
			//add classes
			
		},


		getDuration:function(){
			var duration=1;
			
			if (typeof $(this.obj).attr("data-skrollr-duration") !== "undefined"){
				duration=parseInt($(this.obj).attr("data-skrollr-duration"), 10);
			}
			
			
			return duration;
			
		},

		getDelay:function(){
			var delay=0;
			
			if (typeof $(this.obj).attr("data-skrollr-delay") !== "undefined"){
				delay=parseInt($(this.obj).attr("data-skrollr-delay"), 10);
			}
			
			
			return delay;
			
		},		
		
		getTransition:function(inOut){
			
			
			if (typeof $(this.obj).attr("data-skrollr-"+inOut) !== "undefined"){
				inOut=(this.obj).attr("data-skrollr-"+inOut);
			}else{
				inOut="scroll-up";
			}
			
			
			return inOut;
			
		},		
		getLinesAnim:function(){
			
			var anim;
			if (typeof $(this.obj).attr("data-skrollr-lines-anim") !== "undefined"){
				anim=(this.obj).attr("data-skrollr-lines-anim");
			}else{
				anim=null;
			}
			
			
			return anim;
			
		},
		adjust:function(){
			
			//Set the ID on the object
			$(this.obj).attr("data-skrollr-index", this.index);
			
			if (this.isLines){
				this.adjustLines();
			}
			
			if(this.duration>1){
				//this.showFrames();
				var extend=(this.duration-1)*(this.transitionSpeed+this.freezeDuration);
				
				this.outFrame+=extend;
				this.endFrame+=extend;
				
				
			}
			if(this.delay>0){
				this.move(this.delay*(this.freezeDuration+this.transitionSpeed));
			}
			//if this is an image, of course the next frame will be closer
			//but first, lets try different animations
			if(this.isImage){
				this.adjustImage();
			}
			
			//if this is absolute, move up the thingie
			if (this.isAbsolute){
				var offset=this.nextFrame.startFrame-this.startFrame;
				this.nextFrame.move(-offset);
				
			}


		},
		//Treat images
		adjustImage:function(){
				
				//first of all, images should be fullscreen, right?
				if(!this.obj.hasClass("container")){
				   $(this.obj).css('left', '0px');
				}
				//alert(this.nextFrame.in)
				//so lets say an image is moving on up between two up-moving frames.
				if (
					this.in==="scroll-up" && 
					this.out==="scroll-up" &&
					this.prevFrame.out==="scroll-up" && 
					this.nextFrame.in ==="scroll-up" &&
					this.isTransition
					
				   ){
					
					$(this.obj).css("z-index", "99");
					
					this.startFrame=this.startFrame-this.freezeDuration-100;
					this.removeFreeze();

					this.nextFrame.move(-(this.freezeDuration+100));
					//this image needs to start its animation ...
				}			
		},
		//Treat linbes (starwars)
		adjustLines:function(){
		 	var endFrame=0;
			var $lines=($(this.obj).find(".line").length>0)?$(this.obj).find(".line"):$(this.obj).find("p,h2,h3");

			for (var i=0;i<$lines.length;i++){
				var lnID="ln"+this.index+"_"+i;
				$lines.eq(i).attr("id", lnID);
				
				
				endFrame=this.animateLine($lines.eq(i),i);
				
				
				
			}

			this.outFrame+=endFrame;
			this.endFrame+=endFrame;
			this.nextFrame.move(endFrame);
			return endFrame;
		},
		getFreeze:function(){
			var freeze=200;
			
				freeze+=($(this.obj).hasClass("freeze"))?300:0;
				freeze=($(this.obj).hasClass("no-freeze"))?0:freeze;
			
			return freeze;
		},
		//
		removeFreeze:function(){
					this.freezeFrame=null;
					this.outFrame=null;
					this.nextFrame.move(-this.freezeDuration);
			
			
			
		},
		move:function(offset){

			this.startFrame+=offset;
			this.freezeFrame+=offset;
			this.outFrame+=offset;
			this.endFrame+=offset;
			
			if (!this.isLast){
				this.nextFrame.move(offset);
			}
			
		},
		
		/*------------------------------------------------------------
		 * start gathering
		 ------------------------------------------------------------*/
		

	
		
		showFrames:function(){
			console.log("- "+this.startFrame);
			console.log("- "+this.freezeFrame);
			console.log("- "+this.outFrame);
			console.log("- "+this.endFrame);
		},
		
		/*------------------------------------------------------------
		 * INJECTING DATA
		 ------------------------------------------------------------*/		
		injectDataAttributes: function() {
			//this.setStart();
			//this.setFreeze();


			this.setIn();
			this.setOut();
			
			
			
		},
		//setup attributes for IN animation
		setIn:function(){

			//this.showFrames();
			
			switch(this.in) {
				case "scroll-up":
					if(this.isFirst){
						$(this.obj).attr("data-0", "top:100%;");
					}else{
						$(this.obj).attr("data-"+this.startFrame, "top:100%;");
						if(this.freezeFrame!==null){$(this.obj).attr("data-"+this.freezeFrame, "top:0%;");}
					}
					
					break;
				case "slide-left":
					if(this.isFirst){
						$(this.obj).attr("data-0", "margin-left:100%;");
					}else{
						$(this.obj).attr("data-"+this.startFrame, "margin-left:100%;");
						if(this.freezeFrame!==null){$(this.obj).attr("data-"+this.freezeFrame, "margin-left:0%;");}
					}
					
					break;
				case "slide-right":

					if(this.isFirst){
						$(this.obj).attr("data-0", "margin-left:-100%;");
					}else{
						$(this.obj).attr("data-"+this.startFrame, "margin-left:-100%;");
						if(this.freezeFrame!==null){$(this.obj).attr("data-"+this.freezeFrame, "margin-left:0%;");}
					}
					
					break;
				case "fade-in":

					//code block
					$(this.obj).attr("data-"+this.startFrame, "opacity:0;top:0%;");
					$(this.obj).attr("data-"+this.freezeFrame, "opacity:1;");	
					break;
				case "no-transition":
					//code block
					//$(this.obj).attr("data-"+(this.startFrame-100), "opacity:1;top:0%;");
					$(this.obj).attr("data-0", "display:none;z-index:99;");
					$(this.obj).attr("data-"+this.startFrame, "display:block;opacity:1;top:0%;");

					break;
				default:
					//code block
			}			
			

					
			
		},
		//setup attributes for OUT animation
		setOut:function(){
			switch(this.out) {
				case "scroll-up":
					//code block

					if(this.outFrame!==null){$(this.obj).attr("data-"+this.outFrame, "top:0%;");}
					$(this.obj).attr("data-"+this.endFrame, "top:-100%;");
					
					
					break;
				case "slide-right":
					//code block

					if(this.outFrame!==null){$(this.obj).attr("data-"+this.outFrame, "margin-left:0%;");}
					$(this.obj).attr("data-"+this.endFrame, "margin-left:100%;");
					
					
					break;
				case "slide-left":
					//code block

					if(this.outFrame!==null){$(this.obj).attr("data-"+this.outFrame, "margin-left:0%;");}
					$(this.obj).attr("data-"+this.endFrame, "margin-left:-100%;");
					
					
					break;
				case "fade-out":
					//code block
					$(this.obj).attr("data-"+this.outFrame, "opacity:1;");
					$(this.obj).attr("data-"+this.endFrame, "opacity:0;");	
					break;
				case "no-transition":
					//code block


					$(this.obj).attr("data-"+this.endFrame, "display:block;");

					break;
				default:
					//code block
			}	
			//onscreen
			 if (this.onScreen!==null){
				 $(this.obj).attr("tabindex","0");
				 if(this.onScreen===""){
					 
					 this.onScreen=this.outFrame;
					 $(this.obj).attr("data-onscreen", this.onScreen);
				 }
				 
				 
			 }
			
			if($(this.obj).find("h2").length>0){

				
				var $title=$(this.obj).find("h2,h3").eq(0).text();
				$(this.obj).attr("data-title", $title);
			}
		},

		animateLine: function($line, index) {
			var addFreeze=0;//(this.isFirst)?0:this.freezeFrame;
			var offset=(addFreeze)+(index*this.lineDelay);


			var frameStart,frameStartAttr, frameStartValue;
			var frameTransIn, frameTransInAttr, frameTransInValue;
			var frameTransOut, frameTransOutAttr, frameTransOutValue;
			var frameTop, frameTopAttr, frameTopValue;
			var frameEnd, frameEndAttr, frameEndValue;
		
			frameStart=this.freezeFrame+0+offset;
			frameStartAttr="data-"+frameStart;

			frameTransIn=this.freezeFrame+400+offset;
			frameTransInAttr="data-"+frameTransIn;

			frameTransOut=this.freezeFrame+800+offset;
			frameTransOutAttr="data-"+frameTransOut;

			frameTop=this.freezeFrame+1000+offset;
			frameTopAttr="data-"+frameTop;

			frameEnd=this.freezeFrame+2000+offset;
			frameEndAttr="data-"+frameEnd;			
			
			
			
			
			switch(this.lineAnim) {
				//-------------------------
				case "starwars":
				//-------------------------
					//-----------------------------------------
					frameStartValue="position:fixed;top:100%;opacity:0;font-size:3em;";
					frameTransInValue="top:60%;opacity:1;font-size:1.8em;";
					frameTransOutValue="top:20%;opacity:1;font-size:1.2em;";
					frameTopValue="top:5%;opacity:0;font-size:0.3em;";
					frameEndValue="top:-100%;";
					
					
					break;
				//-------------------------
				case "slide-left":
				//-------------------------
					//-----------------------------------------
					frameTransIn-=200;
					frameTransInAttr="data-"+frameTransIn;
					
					frameStartValue="position:fixed;top:100%;opacity:0;margin-left:100%;";
					frameTransInValue="top:80%;opacity:1;margin-left:0%;";
					frameTransOutValue="top:20%;opacity:1;margin-left:0%;";
					frameTopValue="top:5%;opacity:0;margin-left:0%;";
					frameEndValue="top:-100%;";
					
					
					break;		
				//-------------------------
				case "line-by-line":
				//-------------------------
					//-----------------------------------------
					frameStartValue="position:relative;margin-top:100%;opacity:0;";
					frameTransInValue="margin-top:30%;opacity:0;";
					frameTransOutValue="margin-top:0%;opacity:1;";
					frameTopValue="margin-top:0%;opacity:1;";
					frameEndValue="margin-top:-100%;opacity:1;";
					
					
					break;			
				default:
					//code block
			}				
			
			//inject attributes
			$line.attr(frameStartAttr, frameStartValue);
			$line.attr(frameTransInAttr, frameTransInValue);
			$line.attr(frameTransOutAttr, frameTransOutValue);
			$line.attr(frameTopAttr, frameTopValue);
			$line.attr(frameEndAttr, frameEndValue);			
			return 1000+offset;
			
		},		
		/*------------------------------------------------------------
		 * tracking and admin
		 ------------------------------------------------------------*/			

		updateStatus: function(frame) {

			var id="frame"+this.index;
			this.status=this.getStatus(frame);
			
			if($("#"+id).length<1){
				$("#skrollr_status").append("<div id='"+id+"'><span class='skrollrstatus'>loading</span> (<span class='title'>F"+this.index+"</span>)</div>");
			}else{

				switch(this.status) {
					case "inactive":
						$("#"+id+">.skrollrstatus").attr("class", "skrollrstatus inactive");
						break;
					case "transition":
						$("#"+id+">.skrollrstatus").attr("class", "skrollrstatus transition");
						break;
					case "active":
						$("#"+id+">.skrollrstatus").attr("class", "skrollrstatus active");

						break;
				}
				
				$("#"+id+">.skrollrstatus").text(this.status);
				$(this.obj).attr("data-skrollr-status", this.status);
				$(this.obj).prev(".linked").attr("data-skrollr-status", this.status);
				
			}
		},
		getStatus: function(frame) {
			var status;
			//if frame is before or after
			if(frame <= this.startFrame || frame >= this.endFrame){

				// if this is the FIRST frame and it's active. it's an exception
				if(this.startFrame === this.freezeFrame &&  this.startFrame===frame){

					status="active";
				}else{
					status="inactive";
				}
			}else{
				if (
					//if we're outside the safe zone
					frame>this.startFrame && frame<this.freezeFrame ||
					frame>this.outFrame && frame<this.endFrame
				){
					//inside the transition zone
					status="transition";
				}else{
					//active
					status="active";
					
				}
			}
			
			

			
			
			return status;
		},	
	
		
		/*------------------------------------------------------------
		 * MODIFY FRAMES
		 ------------------------------------------------------------*/		
		setClasses: function() {
			if(this.isContent){
				$(this.obj).addClass("blank");
			}
		}	
	});
});