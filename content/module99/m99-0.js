 $(masterStructure).on("Framework:pageLoaded#m99-0", function(){	
	console.log('loaded!');
	var module=masterStructure.subs[masterStructure.subs.length-1];

	//-------------------------OBJECTIVE section---------------------------------	

	$(".mod-list").append("<li class='mod-progress'></li>");

	//generate progress(target)
	module.generateProgress(".mod-progress");


	//---------------------------the other progressbar
	var proportionViewedPages=40/100;
	var proportionSucess=60/100;
	var nbModules=masterStructure.modCount;
	var totalPercent=0;
	for(var allModules=0;allModules<masterStructure.subs.length;allModules++){
		var thisMod=masterStructure.subs[allModules];
		if(!thisMod.isPage){
			var modPercent=thisMod.viewCount/thisMod.totalPages*100;
			modPercent=modPercent/nbModules*proportionViewedPages;
			totalPercent+=modPercent;
			if(thisMod.moduleStatus=="completed"){
				totalPercent+=100/nbModules*proportionSucess;
			}
		}
	}




	
	var percentMod=Math.round(module.viewCount/module.totalPages*100);
	$(".mod-progress").append("<p>Module 2 : "+percentMod+" % completed</p>");
 });