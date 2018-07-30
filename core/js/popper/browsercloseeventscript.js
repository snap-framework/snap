define(['jquery', 'history', 'labels','settings-general'], function ($, History, labels,settings) {
    'use strict';    
    var isLocal = settings.scormOff;

    if(!window.opener && !isLocal)  self.close(); // added for users who reload with right mouse click or CTRL-R
    var amINavigating = false;       
    
    History.options.disableSuid = true;  // avoid IE problems with suid in History   
    
    function checkRefresh(e) { // to check if F5 refresh
        e = e || window.event;
        var keyCode = e.which || e.keyCode;
        if (keyCode && keyCode == 116) {
             window.amINavigating = true;
        }       
    }
    window.addEventListener('beforeunload',closeWindow);
    window.addEventListener('keydown',checkRefresh)    

    function closeWindow() {
        if ((!window.amINavigating && window.opener)) {
           window.opener.closeCourse();
        }       
    }   
    window.amINavigating = amINavigating;

});