define(['jquery','settings-core'], function ($,  CoreSettings) {
    'use strict';
	var isPopped=(window.opener && window.opener.open && !window.opener.closed)?true:false;
	if(!isPopped){
		CoreSettings.isPopped=false;
	}else{
		CoreSettings.isPopped=true;
	}

});